import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { onboardingController } from '../controllers/onboarding.controller';

const router = Router();

router.post('/', authMiddleware, onboardingController.submitOnboarding);

export default router;
