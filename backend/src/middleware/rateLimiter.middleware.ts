import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';

/**
 * Rate limits per SDD §8.2:
 *   FREE    : 3  AI calls/day  |  20 req/min
 *   PREMIUM : 50 AI calls/day  |  60 req/min
 */
const RATE_LIMITS = {
  free: {
    aiCallsPerDay: 3,
    requestsPerMinute: 20,
  },
  premium: {
    aiCallsPerDay: 50, // soft limit
    requestsPerMinute: 60,
  },
};

// ─── Static limiters ─────────────────────────────────────────────────────────

export const freeTierLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMITS.free.requestsPerMinute,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as AuthRequest).userId ?? req.ip ?? 'unknown',
  message: {
    error: 'Too many requests. Free tier allows 20 requests/minute.',
    retryAfter: 60,
  },
});

export const premiumTierLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMITS.premium.requestsPerMinute,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as AuthRequest).userId ?? req.ip ?? 'unknown',
  message: {
    error: 'Too many requests. Premium tier allows 60 requests/minute.',
    retryAfter: 60,
  },
});

// ─── Adaptive limiter ────────────────────────────────────────────────────────

/**
 * Selects free or premium rate limiter based on isPremium from DB.
 * Applied after authMiddleware so req.userId is available.
 */
export const adaptiveLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    freeTierLimiter(req, res, next);
    return;
  }

  prisma.user
    .findUnique({ where: { id: userId }, select: { isPremium: true, premiumUntil: true } })
    .then((user) => {
      const now = new Date();
      const isPremiumActive =
        user?.isPremium === true &&
        (user.premiumUntil === null || user.premiumUntil > now);
      const limiter = isPremiumActive ? premiumTierLimiter : freeTierLimiter;
      limiter(req, res, next);
    })
    .catch(() => {
      freeTierLimiter(req, res, next);
    });
};

// ─── AI Call daily limiter ────────────────────────────────────────────────────

/**
 * Enforces daily AI call quota via Usage table.
 * FREE: hard block at 3. PREMIUM: soft warn at 50.
 */
export const aiCallLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    next();
    return;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumUntil: true },
    }),
    prisma.usage.aggregate({
      where: { userId, date: { gte: todayStart } },
      _sum: { requestsCount: true },
    }),
  ])
    .then(([user, todayUsage]) => {
      const now = new Date();
      const isPremiumActive =
        user?.isPremium === true &&
        (user.premiumUntil === null || user.premiumUntil > now);

      const todayCalls = todayUsage._sum.requestsCount ?? 0;
      const limit = isPremiumActive
        ? RATE_LIMITS.premium.aiCallsPerDay
        : RATE_LIMITS.free.aiCallsPerDay;

      if (!isPremiumActive && todayCalls >= limit) {
        res.status(429).json({
          error: `Limite diário de chamadas IA atingido (${limit}/dia no plano gratuito).`,
          todayCalls,
          limit,
          upgradeRequired: true,
        });
        return;
      }

      if (isPremiumActive && todayCalls >= RATE_LIMITS.premium.aiCallsPerDay) {
        console.warn(
          `[RateLimiter] Premium soft limit reached for userId=${userId} (${todayCalls} calls today)`
        );
      }

      next();
    })
    .catch(() => next());
};

export { RATE_LIMITS };
