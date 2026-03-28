import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getInsights } from '../controllers/admin.controller';

const router = Router();

router.get('/analytics/insights', authMiddleware, getInsights);

export default router;
