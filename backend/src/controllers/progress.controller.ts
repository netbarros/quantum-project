import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { AgentRegistry } from '../agents/AgentRegistry';
import { getLevelProgress } from '../utils/levelCalculator';

export const progressController = {
  /**
   * GET /api/progress
   * Returns full progress state for the authenticated user.
   * Shape aligns with SDD §4.5
   */
  async getProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // History: last 40 completed sessions
      const history = await prisma.content.findMany({
        where: { userId },
        orderBy: { day: 'desc' },
        take: 40,
        select: {
          day: true,
          isCompleted: true,
          completedAt: true,
          generatedAt: true,
        },
      });

      const totalCompleted = history.filter((h) => h.isCompleted).length;
      const totalSessions = Math.max(user.currentDay - 1, 1);
      const completionRate = Math.round((totalCompleted / totalSessions) * 100);

      // Streak freeze availability (resets each Monday)
      const lastMonday = getLastMondayMidnight();
      const freezeAvailable = !(
        user.streakFreezeUsed &&
        user.streakFreezeDate !== null &&
        user.streakFreezeDate >= lastMonday
      );

      res.status(200).json({
        consciousnessScore: user.consciousnessScore,
        level: user.level,
        levelProgress: getLevelProgress(user.consciousnessScore),
        streak: user.streak,
        currentDay: user.currentDay,
        totalCompleted,
        completionRate,
        streakFreezeAvailable: freezeAvailable,
        lastSessionDate: user.lastSessionDate,
        history: history.map((h) => ({
          day: h.day,
          isCompleted: h.isCompleted,
          completedAt: h.completedAt,
          date: h.generatedAt,
        })),
      });
    } catch (error) {
      console.error('[ProgressController] getProgress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/streak/freeze
   * Uses the weekly streak freeze (max once per Mon–Sun week).
   */
  async freezeStreak(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const registry = AgentRegistry.getInstance();

      const result = await registry.dispatch({
        type: 'freeze_streak',
        payload: {},
        userId,
        timestamp: new Date(),
        sourceAgent: 'ProgressController',
        targetAgent: 'ProgressAgent',
      });

      if (!result.payload.success) {
        res.status(400).json({
          error: result.payload.reason ?? 'Streak freeze unavailable',
          streakFreezeAvailable: false,
          streak: result.payload.streak,
        });
        return;
      }

      res.status(200).json({
        success: true,
        streakFreezeAvailable: false,
        streak: result.payload.streak,
      });
    } catch (error) {
      console.error('[ProgressController] freezeStreak error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function getLastMondayMidnight(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const daysToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
