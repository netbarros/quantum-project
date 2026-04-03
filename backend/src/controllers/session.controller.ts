import { randomUUID } from 'crypto';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { AgentRegistry } from '../agents/AgentRegistry';
import { AgentMessage } from '../types/agent.types';
import {
  evaluateAiCallGate,
  FREE_TIER_FAVORITES_MAX,
} from '../middleware/rateLimiterGate';
import { minHistoryDayForFreeTier } from '../utils/historyWindow';
import { logger } from '../lib/logger';

export const sessionController = {
  async getDailySession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (!user.onboardingComplete) {
        res.status(403).json({ error: 'Onboarding incomplete' });
        return;
      }

      const correlationId =
        (typeof req.headers['x-correlation-id'] === 'string'
          ? req.headers['x-correlation-id'].trim()
          : Array.isArray(req.headers['x-correlation-id'])
            ? req.headers['x-correlation-id'][0]?.trim()
            : '') || randomUUID();

      // ── Monetization gate: block free users past day 7 ───────────────────────
      const accessResult = await AgentRegistry.getInstance().dispatch({
        type: 'check_access',
        payload: {},
        userId,
        timestamp: new Date(),
        sourceAgent: 'SessionController',
        targetAgent: 'MonetizationAgent',
        correlationId,
      });

      if (!accessResult.payload.accessGranted) {
        res.status(402).json({
          error: 'Acesso gratuito encerrado. Faça upgrade para continuar sua jornada.',
          paywallRequired: true,
          reason: accessResult.payload.reason,
          currentDay: accessResult.payload.currentDay,
          freeLimit: accessResult.payload.freeLimit,
        });
        return;
      }

      const currentDay = user.currentDay;

      // Check if session for currentDay already exists (Cache Hit)
      let sessionContent = await prisma.content.findUnique({
        where: {
          userId_day: {
            userId: user.id,
            day: currentDay,
          },
        },
        include: { favorites: true },
      });

      let aiLimitWarning = false;

      // If missing (Cache Miss), enforce IA daily quota then invoke ContentAgent via Registry
      if (!sessionContent) {
        const aiGate = await evaluateAiCallGate(user.id);
        if (!aiGate.allowed) {
          res.status(429).json({
            error: `Limite diário de chamadas IA atingido (${aiGate.limit}/dia no plano gratuito).`,
            todayCalls: aiGate.todayCalls,
            limit: aiGate.limit,
            upgradeRequired: true,
            reason: aiGate.reason,
            correlationId,
          });
          return;
        }

        if (aiGate.aiLimitWarning) {
          aiLimitWarning = true;
        }

        // Query PersonalizationAgent for content adjustments (graceful degradation)
        let adjustments: Record<string, unknown> | undefined;
        try {
          const personalizationMsg: AgentMessage = {
            type: 'get_user_context',
            payload: { userId: user.id },
            userId: user.id,
            timestamp: new Date(),
            sourceAgent: 'SessionController',
            targetAgent: 'PersonalizationAgent',
            correlationId,
          };
          const pResult = await AgentRegistry.getInstance().dispatch(personalizationMsg);
          adjustments = pResult.payload?.adjustments as Record<string, unknown> | undefined;
        } catch (err) {
          logger.warn({ err, correlationId }, 'PersonalizationAgent failed, continuing without adjustments');
        }

        const msg: AgentMessage = {
          type: 'generate_content',
          payload: {
            userId: user.id,
            day: currentDay,
            language: user.language,
            painPoint: user.painPoint || 'general',
            goal: user.goal || 'growth',
            emotionalState: user.emotionalState || 'neutral',
            consciousnessScore: user.consciousnessScore,
            streak: user.streak,
            timeAvailable: user.timeAvailable || 10,
            adjustments,
          },
          userId: user.id,
          timestamp: new Date(),
          sourceAgent: 'SessionController',
          targetAgent: 'ContentAgent',
          correlationId,
        };

        const result = await AgentRegistry.getInstance().dispatch(msg);

        // Store new session Content
        sessionContent = await prisma.content.create({
          data: {
            userId: user.id,
            day: currentDay,
            language: user.language,
            contentJSON: result.payload.contentJSON as Prisma.InputJsonValue,
            isStatic: Boolean(result.payload.isStatic),
            isCompleted: false,
          },
          include: { favorites: true },
        });
      }

      if (!sessionContent) {
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      const progress = {
        currentDay: user.currentDay,
        consciousnessScore: user.consciousnessScore,
        level: user.level,
        streak: user.streak,
      };

      res.status(200).json({
        session: {
          id: sessionContent.id,
          day: sessionContent.day,
          isStatic: sessionContent.isStatic,
          isCompleted: sessionContent.isCompleted,
          content: sessionContent.contentJSON,
          generatedAt: sessionContent.generatedAt,
          isFavorite: sessionContent.favorites.length > 0,
        },
        progress,
        correlationId,
        ...(aiLimitWarning ? { aiLimitWarning: true as const } : {}),
      });
    } catch (error) {
      logger.error({ err: error }, 'SessionController error getting daily session');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async completeSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.userId!;

      // Validate the content belongs to this user
      const content = await prisma.content.findUnique({ where: { id } });
      if (!content || content.userId !== userId) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      if (content.isCompleted) {
        res.status(400).json({ error: 'Session already completed' });
        return;
      }

      // Delegate all progression logic (score, streak, level, content mark) to ProgressAgent
      const correlationId =
        (typeof req.headers['x-correlation-id'] === 'string'
          ? req.headers['x-correlation-id'].trim()
          : Array.isArray(req.headers['x-correlation-id'])
            ? req.headers['x-correlation-id'][0]?.trim()
            : '') || randomUUID();

      const result = await AgentRegistry.getInstance().dispatch({
        type: 'session_complete',
        payload: {
          contentId: id,
          exerciseCompleted: Boolean(req.body?.exerciseCompleted),
        },
        userId,
        timestamp: new Date(),
        sourceAgent: 'SessionController',
        targetAgent: 'ProgressAgent',
        correlationId,
      });

      res.status(200).json({ newProgress: result.payload });
    } catch (error) {
      logger.error({ err: error }, 'SessionController error completing session');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const self = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { currentDay: true, isPremium: true, premiumUntil: true },
      });
      const now = new Date();
      const premiumActive =
        self?.isPremium === true &&
        (self.premiumUntil === null || self.premiumUntil > now);

      const where: Prisma.ContentWhereInput = { userId: req.userId!, isCompleted: true };
      if (!premiumActive && self) {
        where.day = { gte: minHistoryDayForFreeTier(self.currentDay) };
      }

      const records = await prisma.content.findMany({
        where,
        orderBy: { day: 'desc' },
        include: { favorites: true },
      });

      const history = records.map((r) => ({
        id: r.id,
        day: r.day,
        isCompleted: r.isCompleted,
        completedAt: r.completedAt,
        isFavorite: r.favorites.length > 0,
        content: r.contentJSON,
      }));

      res.status(200).json({ history });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId: req.userId! },
        include: { content: true },
        orderBy: { createdAt: 'desc' },
      });

      const mapped = favorites.map((f) => ({
        id: f.content.id,
        day: f.content.day,
        content: f.content.contentJSON,
        favoritedAt: f.createdAt,
      }));

      res.status(200).json({ favorites: mapped });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async toggleFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.userId!;

      const content = await prisma.content.findUnique({ where: { id } });
      if (!content || content.userId !== userId) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      const existingFav = await prisma.favorite.findUnique({
        where: {
          userId_contentId: { userId, contentId: id },
        },
      });

      if (existingFav) {
        await prisma.favorite.delete({
          where: { userId_contentId: { userId, contentId: id } },
        });
        res.status(200).json({ isFavorite: false });
      } else {
        const account = await prisma.user.findUnique({
          where: { id: userId },
          select: { isPremium: true, premiumUntil: true },
        });
        const now = new Date();
        const premiumActive =
          account?.isPremium === true &&
          (account.premiumUntil === null || account.premiumUntil > now);

        if (!premiumActive) {
          const count = await prisma.favorite.count({ where: { userId } });
          if (count >= FREE_TIER_FAVORITES_MAX) {
            res.status(403).json({
              error:
                `Limite de favoritos no plano gratuito (${FREE_TIER_FAVORITES_MAX}). Faça upgrade para favoritos ilimitados.`,
              code: 'FAVORITES_LIMIT',
            });
            return;
          }
        }

        await prisma.favorite.create({
          data: { userId, contentId: id },
        });
        res.status(201).json({ isFavorite: true });
      }
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
