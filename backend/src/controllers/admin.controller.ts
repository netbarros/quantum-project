import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AgentRegistry } from '../agents/AgentRegistry';
import { PersonalizationAgent } from '../agents/PersonalizationAgent';
import { AuthRequest } from '../types/api.types';

// GET /api/admin/users
export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '20'), 10);
    const searchRaw = req.query.search;
    const search = Array.isArray(searchRaw) ? String(searchRaw[0]) : String(searchRaw ?? '');
    const isPremiumRaw = req.query.isPremium;
    const isPremiumStr: string | undefined = Array.isArray(isPremiumRaw) ? String(isPremiumRaw[0]) : (typeof isPremiumRaw === 'string' ? isPremiumRaw : undefined);
    const isPremium = isPremiumStr !== undefined ? isPremiumStr === 'true' : undefined;
    const levelRaw = req.query.level;
    const level: string | undefined = Array.isArray(levelRaw) ? String(levelRaw[0]) : (typeof levelRaw === 'string' ? levelRaw : undefined);

    const where = {
      ...(search ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] } : {}),
      ...(isPremium !== undefined ? { isPremium } : {}),
      ...(level ? { level: level as never } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, level: true, isPremium: true,
          streak: true, consciousnessScore: true, currentDay: true, createdAt: true, lastSessionDate: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users/:id
export async function getUserDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = req.params['id'] as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        contents: { orderBy: { generatedAt: 'desc' }, take: 5 },
        usages: { orderBy: { date: 'desc' }, take: 10 },
        notifications: { orderBy: { sentAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/premium
const PremiumSchema = z.object({
  isPremium: z.boolean(),
  premiumUntil: z.string().datetime().optional(),
});

export async function updatePremium(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id: string = req.params['id'] as string;
    const parsed = PremiumSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { isPremium, premiumUntil } = parsed.data;
    const user = await prisma.user.update({
      where: { id },
      data: {
        isPremium,
        premiumSince: isPremium ? new Date() : undefined,
        premiumUntil: premiumUntil ? new Date(premiumUntil) : undefined,
      },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/analytics
export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [dau, mau, totalUsers, premiumUsers, completedToday, totalSessions] = await Promise.all([
      prisma.user.count({ where: { lastSessionDate: { gte: todayStart } } }),
      prisma.user.count({ where: { lastSessionDate: { gte: thirtyDaysAgo } } }),
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.content.count({ where: { isCompleted: true, completedAt: { gte: todayStart } } }),
      prisma.content.count({ where: { isCompleted: true } }),
    ]);

    // Retention rate: users who had session in day 7
    const day7Users = await prisma.user.count({
      where: { currentDay: { gte: 7 }, lastSessionDate: { gte: sevenDaysAgo } },
    });
    const totalDay7Eligible = await prisma.user.count({ where: { currentDay: { gte: 7 } } });

    // Streak distribution
    const streakRanges = [
      { range: '0', where: { streak: 0 } },
      { range: '1-7', where: { streak: { gte: 1, lte: 7 } } },
      { range: '8-30', where: { streak: { gte: 8, lte: 30 } } },
      { range: '31-90', where: { streak: { gte: 31, lte: 90 } } },
      { range: '91+', where: { streak: { gte: 91 } } },
    ];

    const streakDistribution = await Promise.all(
      streakRanges.map(async ({ range, where }) => ({
        range,
        count: await prisma.user.count({ where }),
      }))
    );

    const usageAgg = await prisma.usage.aggregate({ _sum: { costEstimate: true } });
    const totalAICost = usageAgg._sum.costEstimate ?? 0;
    const avgStreakAgg = await prisma.user.aggregate({ _avg: { streak: true } });

    res.json({
      dau,
      mau,
      retentionRate: totalDay7Eligible > 0
        ? Math.round((day7Users / totalDay7Eligible) * 100) / 100
        : 0,
      completionRate: totalUsers > 0 ? Math.round((completedToday / Math.max(dau, 1)) * 100) / 100 : 0,
      avgStreak: Math.round(avgStreakAgg._avg.streak ?? 0),
      premiumConversion: totalUsers > 0
        ? Math.round((premiumUsers / totalUsers) * 100) / 100
        : 0,
      streakDistribution,
      totalAICost: Math.round(totalAICost * 10000) / 10000,
      avgCostPerUser: totalUsers > 0
        ? Math.round((totalAICost / totalUsers) * 10000) / 10000
        : 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/costs
export async function getCosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const fromRaw = req.query.from;
    const toRaw = req.query.to;
    const fromStr: string | undefined = Array.isArray(fromRaw) ? String(fromRaw[0]) : (typeof fromRaw === 'string' ? fromRaw : undefined);
    const toStr: string | undefined = Array.isArray(toRaw) ? String(toRaw[0]) : (typeof toRaw === 'string' ? toRaw : undefined);
    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = toStr ? new Date(toStr) : new Date();

    const usages = await prisma.usage.findMany({
      where: { date: { gte: from, lte: to } },
      include: { user: { select: { email: true } } },
    });

    // By model
    const byModelMap: Record<string, { cost: number; requests: number }> = {};
    for (const u of usages) {
      if (!byModelMap[u.modelUsed]) byModelMap[u.modelUsed] = { cost: 0, requests: 0 };
      byModelMap[u.modelUsed].cost += u.costEstimate;
      byModelMap[u.modelUsed].requests += u.requestsCount;
    }
    const byModel = Object.entries(byModelMap).map(([model, data]) => ({
      model,
      cost: Math.round(data.cost * 10000) / 10000,
      requests: data.requests,
    }));

    // By day
    const byDayMap: Record<string, number> = {};
    for (const u of usages) {
      const day = u.date.toISOString().split('T')[0];
      byDayMap[day] = (byDayMap[day] || 0) + u.costEstimate;
    }
    const byDay = Object.entries(byDayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost]) => ({ date, cost: Math.round(cost * 10000) / 10000 }));

    // Top users
    const userCostMap: Record<string, { email: string; cost: number }> = {};
    for (const u of usages) {
      if (!userCostMap[u.userId]) userCostMap[u.userId] = { email: u.user.email, cost: 0 };
      userCostMap[u.userId].cost += u.costEstimate;
    }
    const topUsers = Object.entries(userCostMap)
      .sort(([, a], [, b]) => b.cost - a.cost)
      .slice(0, 10)
      .map(([userId, data]) => ({ userId, email: data.email, cost: Math.round(data.cost * 10000) / 10000 }));

    const totalCost = usages.reduce((acc, u) => acc + u.costEstimate, 0);
    const uniqueUsers = new Set(usages.map((u) => u.userId)).size;

    res.json({
      totalCost: Math.round(totalCost * 10000) / 10000,
      byModel,
      byDay,
      topUsers,
      avgCostPerUser: uniqueUsers > 0 ? Math.round((totalCost / uniqueUsers) * 10000) / 10000 : 0,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/insights
export async function getInsights(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } });
      return;
    }
    const agent = AgentRegistry.getInstance().getAgent('PersonalizationAgent') as PersonalizationAgent | undefined;

    if (!agent) {
      res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'PersonalizationAgent not registered' } });
      return;
    }

    const patterns = await agent.analyzePatterns(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const adjustments = user ? await agent.generateAdjustments(patterns, user) : null;

    const suggestions = [
      patterns.completionRate >= 0.8
        ? `Você completa ${Math.round(patterns.completionRate * 100)}% das sessões — consistência extraordinária.`
        : `Sua taxa de conclusão é de ${Math.round(patterns.completionRate * 100)}% — cada sessão conta.`,
      patterns.journalEngagement
        ? 'Suas reflexões escritas aprofundam o processo de transformação.'
        : 'Experimente escrever nas reflexões — aprofunda a integração.',
      `Você é mais ativo entre ${patterns.peakHour}h–${patterns.peakHour + 1}h.`,
    ];

    res.json({ patterns, adjustments, suggestions });
  } catch (err) {
    next(err);
  }
}
