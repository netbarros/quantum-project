import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createJournalEntry, getJournalEntries } from '../controllers/journal.controller';

const router = Router();

router.post('/journal', authMiddleware, createJournalEntry);
router.get('/journal', authMiddleware, getJournalEntries);

export default router;
