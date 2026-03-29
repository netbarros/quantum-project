import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../types/api.types';

const CreateJournalSchema = z.object({
  contentId: z.string().min(1),
  reflection: z.string().min(10, 'Reflection must be at least 10 characters').max(2000),
});

export async function createJournalEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId!;
    const parsed = CreateJournalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { contentId, reflection } = parsed.data;

    const entry = await prisma.journalEntry.create({
      data: { userId, contentId, reflection },
    });

    // Track journal event
    await prisma.userEvent.create({
      data: {
        userId,
        eventType: 'JOURNAL_WRITTEN',
        eventData: { contentId },
      },
    });

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

export async function getJournalEntries(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId!;
    const contentId = req.query.contentId as string | undefined;

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        ...(contentId ? { contentId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ entries });
  } catch (err) {
    next(err);
  }
}
