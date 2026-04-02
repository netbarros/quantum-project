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
  type: z.enum(['DAILY_REMINDER', 'MOTIVATIONAL_RESET', 'RECOVERY_FLOW', 'SYSTEM']),
  broadcast: z.boolean().optional().default(false),
  title: z.string().min(3).max(100).optional(),
  body: z.string().min(10).max(500).optional(),
  userFilter: z.enum(['all', 'premium', 'free']).optional(),
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

    const { userId, type, broadcast, title, body, userFilter } = parsed.data;
    let sentCount = 0;
    let failedCount = 0;

    if (broadcast) {
      // Build user filter based on userFilter param
      const where: Record<string, unknown> = {};
      if (userFilter === 'premium') where.isPremium = true;
      else if (userFilter === 'free') where.isPremium = false;
      // 'all' or undefined = no filter

      const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, level: true, pushSubscription: true },
      });

      for (const u of users) {
        try {
          if (type === 'SYSTEM' && title && body) {
            // SYSTEM notifications bypass NotificationAgent — save directly with custom content
            await prisma.notification.create({
              data: { userId: u.id, type: 'SYSTEM', title, body },
            });
          } else {
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
          }
          sentCount++;
        } catch {
          failedCount++;
        }
      }
    } else if (userId) {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, level: true } });
      if (u) {
        if (type === 'SYSTEM' && title && body) {
          await prisma.notification.create({
            data: { userId, type: 'SYSTEM', title, body },
          });
        } else {
          await AgentRegistry.getInstance().dispatch({
            type: 'send_notification',
            userId,
            payload: { userId, daysMissed: 1, level: u.level, name: u.name ?? 'você' },
            timestamp: new Date(),
            sourceAgent: 'NotificationController',
            targetAgent: 'NotificationAgent',
          });
        }
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
