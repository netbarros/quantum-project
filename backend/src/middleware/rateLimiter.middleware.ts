import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { RATE_LIMITS, evaluateAiCallGate } from './rateLimiterGate';

export type { AiCallGateResult } from './rateLimiterGate';
export { evaluateAiCallGate, RATE_LIMITS, FREE_TIER_FAVORITES_MAX } from './rateLimiterGate';

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

// ─── AI Call daily limiter (middleware opcional) ─────────────────────────────

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

  evaluateAiCallGate(userId)
    .then((gate) => {
      if (!gate.allowed) {
        res.status(429).json({
          error: `Limite diário de chamadas IA atingido (${gate.limit}/dia no plano gratuito).`,
          todayCalls: gate.todayCalls,
          limit: gate.limit,
          upgradeRequired: true,
        });
        return;
      }
      next();
    })
    .catch(() => next());
};
