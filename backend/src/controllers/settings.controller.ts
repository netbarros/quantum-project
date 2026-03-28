import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

const NotificationTimeSchema = z.object({
  notificationTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
});

const LanguageSchema = z.object({
  language: z.enum(['pt-BR', 'en-US', 'es-ES']),
});

export async function getSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationTime: true, pushSubscription: true, language: true },
    });

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({
      notificationTime: user.notificationTime,
      pushSubscriptionActive: Boolean(user.pushSubscription),
      language: user.language,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationTime(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user!.userId;
    const parsed = NotificationTimeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { notificationTime } = parsed.data;
    await prisma.user.update({ where: { id: userId }, data: { notificationTime } });

    res.json({ notificationTime });
  } catch (err) {
    next(err);
  }
}

export async function updateLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user?: { userId: string } }).user!.userId;
    const parsed = LanguageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { language } = parsed.data;
    await prisma.user.update({ where: { id: userId }, data: { language } });

    res.json({ language });
  } catch (err) {
    next(err);
  }
}
