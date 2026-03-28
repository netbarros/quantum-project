import { Router } from 'express';
import { usageController } from '../controllers/usage.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/usage/summary
router.get('/usage/summary', authMiddleware, usageController.getSummary);

export default router;
