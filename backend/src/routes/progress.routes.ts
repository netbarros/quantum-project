import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/progress
router.get('/progress', authMiddleware, progressController.getProgress);

// POST /api/streak/freeze
router.post('/streak/freeze', authMiddleware, progressController.freezeStreak);

export default router;
