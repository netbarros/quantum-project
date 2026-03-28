import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sessionController } from '../controllers/session.controller';

const router = Router();

// Order matters to prevent :id catching deterministic paths
router.get('/session/daily', authMiddleware, sessionController.getDailySession);
router.post('/session/:id/complete', authMiddleware, sessionController.completeSession);

router.get('/sessions/history', authMiddleware, sessionController.getHistory);
router.get('/sessions/favorites', authMiddleware, sessionController.getFavorites);
router.post('/sessions/:id/favorite', authMiddleware, sessionController.toggleFavorite);

export default router;
