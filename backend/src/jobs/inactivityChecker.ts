import cron from 'node-cron';
import { prisma } from '../config/database';
import { AgentRegistry } from '../agents/AgentRegistry';
import { Level } from '@prisma/client';

/**
 * Inactivity Checker — runs every hour.
 * Detects users inactive for 1, 3, or 7 days and dispatches
 * NotificationAgent to send adaptive re-engagement messages.
 *
 * Guards:
 *  - Respects user.notificationTime (only sends if current hour >= pref)
 *  - Deduplication: can't send same type twice in same day
 */
export function startInactivityChecker(): void {
  cron.schedule('0 * * * *', async () => {
    console.log('[InactivityChecker] Running inactivity check...');
    let processed = 0;
    let sent = 0;
    let errors = 0;

    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // Fetch users with onboarding complete and lastSessionDate set
      const users = await prisma.user.findMany({
        where: {
          onboardingComplete: true,
          lastSessionDate: { not: null },
        },
        select: {
          id: true,
          name: true,
          level: true,
          lastSessionDate: true,
          notificationTime: true,
          notifications: {
            where: { sentAt: { gte: todayStart } },
            select: { type: true },
          },
        },
      });

      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();

      for (const user of users) {
        try {
          processed++;

          // Check notificationTime preference
          if (user.notificationTime) {
            const [prefHour, prefMin] = user.notificationTime.split(':').map(Number);
            const prefTotalMin = prefHour * 60 + prefMin;
            const currentTotalMin = currentHour * 60 + currentMinutes;
            if (currentTotalMin < prefTotalMin) continue;
          }

          // Calculate days missed
          const lastSession = user.lastSessionDate!;
          const diffMs = now.getTime() - lastSession.getTime();
          const daysMissed = Math.floor(diffMs / (24 * 60 * 60 * 1000));

          if (![1, 3, 7].includes(daysMissed)) continue;

          // Determine notification type for deduplication
          const notifType =
            daysMissed >= 7
              ? 'RECOVERY_FLOW'
              : daysMissed >= 3
              ? 'MOTIVATIONAL_RESET'
              : 'DAILY_REMINDER';

          // Deduplication: already sent today?
          const alreadySent = user.notifications.some((n) => n.type === notifType);
          if (alreadySent) continue;

          // Dispatch NotificationAgent
          await AgentRegistry.getInstance().dispatch({
            type: 'send_notification',
            userId: user.id,
            payload: {
              userId: user.id,
              daysMissed,
              level: user.level as Level,
              name: user.name ?? 'você',
            },
            timestamp: new Date(),
            sourceAgent: 'InactivityChecker',
            targetAgent: 'NotificationAgent',
          });

          sent++;
        } catch (err) {
          errors++;
          console.error(`[InactivityChecker] Error processing userId=${user.id}:`, err);
        }
      }

      console.log(
        `[InactivityChecker] Done: processed=${processed}, sent=${sent}, errors=${errors}`
      );
    } catch (err) {
      console.error('[InactivityChecker] Critical error:', err);
    }
  });

  console.log('[InactivityChecker] Cron job scheduled (every hour)');
}
