import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';

export const subscriptionController = {
  /**
   * POST /api/subscription/upgrade
   * Activates premium for 365 days.
   * In production this would integrate with a payment provider (Stripe, etc.).
   * For now it is a direct toggle for testing/demo purposes.
   */
  async upgrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.isPremium && user.premiumUntil && user.premiumUntil > new Date()) {
        // Already active — extend by 365 more days from current expiry
        const newUntil = new Date(user.premiumUntil);
        newUntil.setFullYear(newUntil.getFullYear() + 1);

        const updated = await prisma.user.update({
          where: { id: userId },
          data: { premiumUntil: newUntil },
        });

        res.status(200).json({
          isPremium: updated.isPremium,
          premiumSince: updated.premiumSince,
          premiumUntil: updated.premiumUntil,
          message: 'Premium estendido por mais 365 dias',
        });
        return;
      }

      const now = new Date();
      const premiumUntil = new Date(now);
      premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumSince: now,
          premiumUntil,
        },
      });

      console.log(`[SubscriptionController] Upgraded userId=${userId} premium until ${premiumUntil.toISOString()}`);

      res.status(200).json({
        user: updated,
        message: 'Upgrade para Premium realizado com sucesso! Acesso liberado por 365 dias.',
      });
    } catch (error) {
      console.error('[SubscriptionController] upgrade error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/subscription/status
   * Returns the user's current subscription state.
   */
  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPremium: true,
          premiumSince: true,
          premiumUntil: true,
          currentDay: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const now = new Date();
      const premiumActive =
        user.isPremium &&
        (user.premiumUntil === null || user.premiumUntil > now);

      let daysRemaining: number | null = null;
      if (premiumActive && user.premiumUntil) {
        daysRemaining = Math.ceil(
          (user.premiumUntil.getTime() - now.getTime()) / 86_400_000
        );
      }

      const FREE_DAY_LIMIT = 7;

      res.status(200).json({
        isPremium: premiumActive,
        premiumSince: user.premiumSince,
        premiumUntil: user.premiumUntil,
        daysRemaining,
        currentDay: user.currentDay,
        freeLimit: FREE_DAY_LIMIT,
        paywallApproaching: !premiumActive && user.currentDay >= FREE_DAY_LIMIT - 1,
        paywallReached: !premiumActive && user.currentDay > FREE_DAY_LIMIT,
      });
    } catch (error) {
      console.error('[SubscriptionController] getStatus error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
