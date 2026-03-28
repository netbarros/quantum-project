import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate, upgradeSubscriptionSchema } from '../middleware/validation.middleware';

const router = Router();

// POST /api/subscription/upgrade
router.post(
  '/subscription/upgrade',
  authMiddleware,
  validate(upgradeSubscriptionSchema),
  subscriptionController.upgrade
);

// GET /api/subscription/status
router.get('/subscription/status', authMiddleware, subscriptionController.getStatus);

export default router;
