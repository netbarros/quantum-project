import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';
import { createCheckoutSession, verifyWebhookSignature, getPrices, getStripe } from '../services/StripeService';
import { logger } from '../lib/logger';

const CheckoutSchema = z.object({
  plan: z.enum(['yearly', 'monthly']),
  orderBump: z.boolean().optional().default(false),
});

export const subscriptionController = {
  /**
   * POST /api/subscription/checkout
   * Creates a Stripe Checkout session OR activates demo mode if no Stripe key.
   */
  async checkout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const parsed = CheckoutSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
        return;
      }

      const userId = req.userId!;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, isPremium: true } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }

      const { plan, orderBump } = parsed.data;
      const prices = getPrices();
      const amount = (plan === 'yearly' ? prices.yearly.amount : prices.monthly.amount) + (orderBump ? prices.orderBump.amount : 0);

      // Try Stripe first
      const stripe = await getStripe();
      if (stripe) {
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const session = await createCheckoutSession({
          userId,
          email: user.email,
          plan,
          orderBump,
          successUrl: `${appUrl}/home?payment=success`,
          cancelUrl: `${appUrl}/plans?payment=cancelled`,
        });

        if (session) {
          // Record pending payment
          await prisma.payment.create({
            data: { userId, amount, plan, orderBump, stripeSessionId: session.sessionId, status: 'pending' },
          });

          res.json({ mode: 'stripe', url: session.url, sessionId: session.sessionId });
          return;
        }
      }

      // Demo mode — no Stripe key configured, activate directly
      logger.info({ userId, plan, amount }, 'Demo mode: activating premium without payment');

      const premiumUntil = new Date();
      premiumUntil.setFullYear(premiumUntil.getFullYear() + (plan === 'yearly' ? 1 : 0));
      if (plan === 'monthly') premiumUntil.setDate(premiumUntil.getDate() + 30);

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumSince: new Date(), premiumUntil },
      });

      await prisma.payment.create({
        data: { userId, amount, plan, orderBump, status: 'completed', completedAt: new Date() },
      });

      res.json({ mode: 'demo', user: updated, message: 'Premium ativado (modo demo — sem cobrança real)' });
    } catch (err) {
      logger.error({ err }, 'Checkout error');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * POST /api/subscription/upgrade (legacy — redirects to checkout)
   */
  async upgrade(req: AuthRequest, res: Response): Promise<void> {
    return subscriptionController.checkout(req, res);
  },

  /**
   * GET /api/subscription/status
   */
  async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { isPremium: true, premiumSince: true, premiumUntil: true, currentDay: true },
      });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }

      const now = new Date();
      const premiumActive = user.isPremium && (user.premiumUntil === null || user.premiumUntil > now);
      const daysRemaining = premiumActive && user.premiumUntil
        ? Math.ceil((user.premiumUntil.getTime() - now.getTime()) / 86_400_000)
        : null;

      const hasStripe = !!(await getStripe());

      res.json({
        isPremium: premiumActive,
        premiumSince: user.premiumSince,
        premiumUntil: user.premiumUntil,
        daysRemaining,
        currentDay: user.currentDay,
        freeLimit: 7,
        paywallReached: !premiumActive && user.currentDay > 7,
        paymentMode: hasStripe ? 'stripe' : 'demo',
      });
    } catch (err) {
      logger.error({ err }, 'getStatus error');
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * GET /api/subscription/prices
   */
  async getPricing(_req: Request, res: Response): Promise<void> {
    res.json(getPrices());
  },
};

/**
 * POST /api/webhook/stripe — Stripe webhook handler
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  try {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) { res.status(400).json({ error: 'Missing signature' }); return; }

    const event = await verifyWebhookSignature(req.body, sig);
    if (!event) { res.status(400).json({ error: 'Invalid signature' }); return; }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || 'yearly';

      if (!userId) { res.status(400).json({ error: 'Missing userId in metadata' }); return; }

      // Update payment record
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'completed', completedAt: new Date(), stripePaymentIntentId: session.payment_intent },
      });

      // Activate premium
      const premiumUntil = new Date();
      premiumUntil.setFullYear(premiumUntil.getFullYear() + (plan === 'yearly' ? 1 : 0));
      if (plan === 'monthly') premiumUntil.setDate(premiumUntil.getDate() + 30);

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumSince: new Date(), premiumUntil },
      });

      logger.info({ userId, plan, sessionId: session.id }, 'Stripe payment completed — premium activated');
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Stripe webhook error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
