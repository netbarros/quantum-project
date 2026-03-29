import { prisma } from '../config/database';

/**
 * Rate limits per SDD (doc): free/premium AI calls e req/min.
 *   FREE    : 3  AI calls/day  |  20 req/min
 *   PREMIUM : 50 AI calls/day  |  60 req/min
 */
export const RATE_LIMITS = {
  free: {
    aiCallsPerDay: 3,
    requestsPerMinute: 20,
  },
  premium: {
    aiCallsPerDay: 50,
    requestsPerMinute: 60,
  },
} as const;

export type AiCallGateResult =
  | {
      allowed: true;
      todayCalls: number;
      limit: number;
      isPremiumActive: boolean;
      aiLimitWarning?: boolean;
    }
  | {
      allowed: false;
      todayCalls: number;
      limit: number;
      upgradeRequired: boolean;
      reason: 'RATE_LIMIT';
    };

/**
 * Avalia cota diária de geração IA via tabela Usage.
 */
export async function evaluateAiCallGate(userId: string): Promise<AiCallGateResult> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [user, todayUsage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumUntil: true },
    }),
    prisma.usage.aggregate({
      where: { userId, date: { gte: todayStart } },
      _sum: { requestsCount: true },
    }),
  ]);

  const now = new Date();
  const isPremiumActive =
    user?.isPremium === true &&
    (user.premiumUntil === null || user.premiumUntil > now);

  const todayCalls = todayUsage._sum.requestsCount ?? 0;
  const limit = isPremiumActive
    ? RATE_LIMITS.premium.aiCallsPerDay
    : RATE_LIMITS.free.aiCallsPerDay;

  if (!isPremiumActive && todayCalls >= limit) {
    return {
      allowed: false,
      todayCalls,
      limit,
      upgradeRequired: true,
      reason: 'RATE_LIMIT',
    };
  }

  if (isPremiumActive && todayCalls >= RATE_LIMITS.premium.aiCallsPerDay) {
    console.warn(
      `[RateLimiter] Premium soft limit reached for userId=${userId} (${todayCalls} calls today)`
    );
    return {
      allowed: true,
      todayCalls,
      limit,
      isPremiumActive: true,
      aiLimitWarning: true,
    };
  }

  return {
    allowed: true,
    todayCalls,
    limit,
    isPremiumActive,
  };
}

/** Máximo de favoritos para usuário free (PR-00, favoritos/histórico). */
export const FREE_TIER_FAVORITES_MAX = 5;
