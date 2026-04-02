import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import {
  listUsers,
  getUserDetail,
  updatePremium,
  updateRole,
  getAnalytics,
  getCosts,
} from '../controllers/admin.controller';
import { sendNotification } from '../controllers/notification.controller';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/admin/users', listUsers);
router.get('/admin/users/:id', getUserDetail);
router.put('/admin/users/:id/premium', updatePremium);
router.put('/admin/users/:id/role', updateRole);
router.get('/admin/analytics', getAnalytics);
router.get('/admin/costs', getCosts);
router.post('/admin/broadcast', sendNotification);

export default router;
