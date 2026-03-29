import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AgentRegistry } from '../agents/AgentRegistry';
import { AuthRequest } from '../types/api.types';

const SubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      auth: z.string().min(1),
      p256dh: z.string().min(1),
    }),
  }),
});

const SendSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['DAILY_REMINDER', 'MOTIVATIONAL_RESET', 'RECOVERY_FLOW']),
  broadcast: z.boolean().optional().default(false),
});

export async function subscribe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = SubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { subscription } = parsed.data;
    const userId = (req as AuthRequest).userId!;

    await prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: subscription as unknown as object },
    });

    await prisma.userEvent.create({
      data: { userId, eventType: 'PUSH_SUBSCRIBED' },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function sendNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = SendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
      return;
    }

    const { userId, type, broadcast } = parsed.data;
    let sentCount = 0;
    let failedCount = 0;

    if (broadcast) {
      const premiumUsers = await prisma.user.findMany({
        where: { isPremium: true },
        select: { id: true, name: true, level: true },
      });

      for (const u of premiumUsers) {
        try {
          await AgentRegistry.getInstance().dispatch({
            type: 'send_notification',
            userId: u.id,
            payload: {
              userId: u.id,
              daysMissed: type === 'DAILY_REMINDER' ? 1 : type === 'MOTIVATIONAL_RESET' ? 3 : 7,
              level: u.level,
              name: u.name ?? 'você',
            },
            timestamp: new Date(),
            sourceAgent: 'NotificationController',
            targetAgent: 'NotificationAgent',
          });
          sentCount++;
        } catch {
          failedCount++;
        }
      }
    } else if (userId) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, level: true } });
      if (u) {
        await AgentRegistry.getInstance().dispatch({
          type: 'send_notification',
          userId,
          payload: { userId, daysMissed: 1, level: u.level, name: u.name ?? 'você' },
          timestamp: new Date(),
          sourceAgent: 'NotificationController',
          targetAgent: 'NotificationAgent',
        });
        sentCount = 1;
      }
    }

    res.json({ sent: sentCount, failed: failedCount });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId!;
    const limit = parseInt(String(req.query.limit ?? '20'), 10);
    const offset = parseInt(String(req.query.offset ?? '0'), 10);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    res.json({ notifications, total });
  } catch (err) {
    next(err);
  }
}
