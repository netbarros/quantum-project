import webpush from 'web-push';
import { prisma } from '../config/database';

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export class PushNotificationService {
  constructor() {
    const { VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
    if (VAPID_EMAIL && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        VAPID_EMAIL.startsWith('mailto:') ? VAPID_EMAIL : `mailto:${VAPID_EMAIL}`,
        VAPID_PUBLIC_KEY.trim(),
        VAPID_PRIVATE_KEY.trim()
      );
    }
  }

  async send(
    subscription: webpush.PushSubscription,
    payload: PushPayload,
    userId?: string
  ): Promise<void> {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      url: payload.url || '/session',
    });

    try {
      await webpush.sendNotification(subscription, notificationPayload);
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number }).statusCode;

      if (statusCode === 410 && userId) {
        // Subscription expired — clear it
        await this.clearExpiredSubscription(userId);
        return;
      }

      if (statusCode === 429) {
        // Rate limited — retry once after 2s
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          await webpush.sendNotification(subscription, notificationPayload);
        } catch (retryError) {
          // Best-effort: log but do not throw
          console.error('[PushNotification] Retry failed after 429:', retryError);
        }
        return;
      }

      // General error — log but never throw
      console.error('[PushNotification] Send failed:', error);
    }
  }

  private async clearExpiredSubscription(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { pushSubscription: null as any },
      });
      console.log(`[PushNotification] Cleared expired subscription for userId=${userId}`);
    } catch (err) {
      console.error('[PushNotification] Failed to clear subscription:', err);
    }
  }

  generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}

export const pushService = new PushNotificationService();
