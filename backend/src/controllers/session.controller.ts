import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { ContentAgent } from '../agents/ContentAgent';
import { AgentRegistry } from '../agents/AgentRegistry';
import { AgentMessage } from '../types/agent.types';

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

      // ── Monetization gate: block free users past day 7 ───────────────────────
      const accessResult = await AgentRegistry.getInstance().dispatch({
        type: 'check_access',
        payload: {},
        userId,
        timestamp: new Date(),
        sourceAgent: 'SessionController',
        targetAgent: 'MonetizationAgent',
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

      // If missing (Cache Miss), invoke ContentAgent
      if (!sessionContent) {
        const contentAgent = new ContentAgent();
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
          },
          userId: user.id,
          timestamp: new Date(),
          sourceAgent: 'SessionController',
        };

        const result = await contentAgent.execute(msg);

        // Store new session Content
        sessionContent = await prisma.content.create({
          data: {
            userId: user.id,
            day: currentDay,
            language: user.language,
            contentJSON: result.payload.contentJSON,
            isStatic: result.payload.isStatic,
            isCompleted: false,
          },
          include: { favorites: true },
        });
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
      });
    } catch (error) {
      console.error('[SessionController] error getting daily session:', error);
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
      });

      res.status(200).json({ newProgress: result.payload });
    } catch (error) {
      console.error('[SessionController] error completing session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const records = await prisma.content.findMany({
        where: { userId: req.userId! },
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
