import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getSettings, updateNotificationTime, updateLanguage } from '../controllers/settings.controller';

const router = Router();

router.get('/settings', authMiddleware, getSettings);
router.put('/settings/notification-time', authMiddleware, updateNotificationTime);
router.put('/settings/language', authMiddleware, updateLanguage);

export default router;
