import { Router, raw } from 'express';
import { subscriptionController, handleStripeWebhook } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/subscription/checkout', authMiddleware, subscriptionController.checkout);
router.post('/subscription/upgrade', authMiddleware, subscriptionController.upgrade);
router.get('/subscription/status', authMiddleware, subscriptionController.getStatus);
router.get('/subscription/prices', subscriptionController.getPricing);

// Stripe webhook — needs raw body, no JSON parsing
router.post('/webhook/stripe', raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
