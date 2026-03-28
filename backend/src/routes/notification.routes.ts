import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { subscribe, sendNotification, getHistory } from '../controllers/notification.controller';

const router = Router();

router.post('/notifications/subscribe', authMiddleware, subscribe);
router.get('/notifications/history', authMiddleware, getHistory);
// Admin-only route — guarded by authMiddleware + role check in controller
router.post('/notifications/send', authMiddleware, sendNotification);

export default router;
