import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateTts, getTtsStatus } from '../controllers/tts.controller';

const router = Router();

router.use(authMiddleware);

router.post('/tts/generate', generateTts);
router.get('/tts/status', getTtsStatus);

export default router;
