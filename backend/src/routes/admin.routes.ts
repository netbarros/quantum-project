import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listUsers,
  getUserDetail,
  updatePremium,
  getAnalytics,
  getCosts,
} from '../controllers/admin.controller';
import { sendNotification } from '../controllers/notification.controller';

const router = Router();

// All admin routes require auth (role check done in controllers for now)
router.use(authMiddleware);

router.get('/admin/users', listUsers);
router.get('/admin/users/:id', getUserDetail);
router.put('/admin/users/:id/premium', updatePremium);
router.get('/admin/analytics', getAnalytics);
router.get('/admin/costs', getCosts);
router.post('/admin/broadcast', sendNotification);

export default router;
