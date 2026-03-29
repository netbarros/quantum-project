import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { subscribe, sendNotification, getHistory } from '../controllers/notification.controller';

const router = Router();

router.post('/notifications/subscribe', authMiddleware, subscribe);
router.get('/notifications/history', authMiddleware, getHistory);
router.post('/notifications/send', authMiddleware, adminMiddleware, sendNotification);

export default router;
