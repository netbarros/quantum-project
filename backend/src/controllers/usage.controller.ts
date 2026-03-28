import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';

export const usageController = {
  /**
   * GET /api/usage/summary
   * Aggregates token usage and cost data for the authenticated user.
   */
  async getSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      // All-time totals
      const totals = await prisma.usage.aggregate({
        where: { userId },
        _sum: {
          tokensUsed: true,
          promptTokens: true,
          completionTokens: true,
          requestsCount: true,
          costEstimate: true,
        },
        _count: { id: true },
      });

      // Today's totals (for rate limit awareness)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayTotals = await prisma.usage.aggregate({
        where: { userId, date: { gte: todayStart } },
        _sum: {
          requestsCount: true,
          tokensUsed: true,
          costEstimate: true,
        },
      });

      // Last 30 days breakdown
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRecords = await prisma.usage.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        select: {
          date: true,
          tokensUsed: true,
          requestsCount: true,
          costEstimate: true,
          modelUsed: true,
        },
      });

      // Get user tier for limit context
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true, premiumUntil: true },
      });

      const now = new Date();
      const isPremiumActive =
        user?.isPremium === true &&
        (user.premiumUntil === null || user.premiumUntil > now);

      res.status(200).json({
        // All-time
        tokensUsed: totals._sum.tokensUsed ?? 0,
        promptTokens: totals._sum.promptTokens ?? 0,
        completionTokens: totals._sum.completionTokens ?? 0,
        requestsCount: totals._sum.requestsCount ?? 0,
        costEstimate: Number((totals._sum.costEstimate ?? 0).toFixed(6)),
        totalSessions: totals._count.id,
        // Today
        todayAiCalls: todayTotals._sum.requestsCount ?? 0,
        todayTokens: todayTotals._sum.tokensUsed ?? 0,
        todayCost: Number((todayTotals._sum.costEstimate ?? 0).toFixed(6)),
        // Rate limit context
        dailyAiLimit: isPremiumActive ? 50 : 3,
        isPremium: isPremiumActive,
        // Recent history
        recentDays: recentRecords,
      });
    } catch (error) {
      console.error('[UsageController] getSummary error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
