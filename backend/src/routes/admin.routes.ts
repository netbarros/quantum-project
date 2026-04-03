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
  getAiConfig,
  updateAiConfig,
  testAiGeneration,
  getRevenue,
  getPayments,
  testStripeConnection,
  getAdminPricing,
  updateAdminPricing,
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
router.get('/admin/ai-config', getAiConfig);
router.put('/admin/ai-config', updateAiConfig);
router.post('/admin/ai-config/test', testAiGeneration);
router.post('/admin/ai-config/test-stripe', testStripeConnection);
router.get('/admin/revenue', getRevenue);
router.get('/admin/payments', getPayments);
router.get('/admin/pricing', getAdminPricing);
router.put('/admin/pricing', updateAdminPricing);

export default router;
