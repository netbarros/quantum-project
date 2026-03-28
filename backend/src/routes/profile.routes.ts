import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { onboardingController } from '../controllers/onboarding.controller';

const router = Router();

router.get('/', authMiddleware, onboardingController.getProfile);
router.put('/', authMiddleware, onboardingController.updateProfile);

export default router;
