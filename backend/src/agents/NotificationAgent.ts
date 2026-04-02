import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';
import { prisma } from '../config/database';
import { pushService } from '../services/PushNotification';
import type webpush from 'web-push';
import { logger } from '../lib/logger';

type NotificationType = 'DAILY_REMINDER' | 'MOTIVATIONAL_RESET' | 'RECOVERY_FLOW';
type Level = 'BEGINNER' | 'AWARE' | 'CONSISTENT' | 'ALIGNED' | 'INTEGRATED';

/**
 * Copy matrix: 3 types × 5 levels = 15 unique messages.
 * Sourced from PREMIUM_SKILLS.md SKILL 6.
 */
const NOTIFICATION_COPY: Record<
  NotificationType,
  Record<Level, { title: string; body: string }>
> = {
  DAILY_REMINDER: {
    BEGINNER:   { title: 'Tudo bem, {name} 🌱', body: 'Seu dia foi incrível. Sua jornada continua aqui.' },
    AWARE:      { title: '{name}, sua consciência te chama', body: 'Cada sessão é um tijolo na sua nova identidade.' },
    CONSISTENT: { title: 'Hora da prática, {name}', body: 'Você já provou que consegue. Continue.' },
    ALIGNED:    { title: '{name} →', body: 'O que acontece quando você interrompe um processo em curso?' },
    INTEGRATED: { title: 'A prática te espera', body: 'Você já sabe o caminho. Seu eu futuro também.' },
  },
  MOTIVATIONAL_RESET: {
    BEGINNER:   { title: '3 dias. Não é o fim.', body: 'Recomeçar faz parte. Sem julgamento. Sem pressão.' },
    AWARE:      { title: 'Sua evolução não parou', body: 'A consciência que você desenvolveu ainda está aqui.' },
    CONSISTENT: { title: 'Uma pausa não te define', body: 'Sua consistência histórica é maior que 3 dias.' },
    ALIGNED:    { title: 'O padrão te chama de volta', body: 'Você sabe a diferença que faz. Volte hoje.' },
    INTEGRATED: { title: 'A semente ainda está plantada', body: 'Pause não é abandono. Volte quando estiver pronto.' },
  },
  RECOVERY_FLOW: {
    BEGINNER:   { title: 'Sentimos sua falta, {name} 🌱', body: 'Criamos uma sessão especial de boas-vindas de volta.' },
    AWARE:      { title: 'Uma semana. Sem julgamentos.', body: 'Preparamos algo especial para sua reconexão.' },
    CONSISTENT: { title: '{name}, a jornada continua', body: '7 dias de pausa, 100 dias de prática. O saldo ainda é seu.' },
    ALIGNED:    { title: 'O que te trouxe até aqui ainda existe', body: 'Sessão especial de reconexão preparada para você.' },
    INTEGRATED: { title: 'Sem palavras necessárias.', body: 'Sua sessão de retorno está aqui quando você estiver.' },
  },
};

export class NotificationAgent extends BaseAgent {
  readonly name = 'NotificationAgent';
  readonly description = 'Handles user re-engagement push notifications with adaptive tone per level.';

  async execute(message: AgentMessage): Promise<AgentMessage> {
    switch (message.type) {
      case 'send_notification':
        return this.handleSendNotification(message);
      default:
        throw new Error(`[NotificationAgent] Unsupported message type: ${message.type}`);
    }
  }

  private async handleSendNotification(message: AgentMessage): Promise<AgentMessage> {
    const { userId, daysMissed, level, name } = message.payload as {
      userId: string;
      daysMissed: number;
      level: Level;
      name: string;
    };

    const type = this.getNotificationType(daysMissed);
    await this.send(userId, type, level, name);

    return this.createResponse(message, { sent: true, type });
  }

  private getNotificationType(daysMissed: number): NotificationType {
    if (daysMissed >= 7) return 'RECOVERY_FLOW';
    if (daysMissed >= 3) return 'MOTIVATIONAL_RESET';
    return 'DAILY_REMINDER';
  }

  async send(
    userId: string,
    type: NotificationType,
    level: Level,
    name: string
  ): Promise<void> {
    const copy = this.getNotificationCopy(type, level, name);

    // 1. Save to DB
    await prisma.notification.create({
      data: {
        userId,
        type,
        title: copy.title,
        body: copy.body,
        tone: level.toLowerCase(),
      },
    });

    // 2. Register UserEvent
    await prisma.userEvent.create({
      data: {
        userId,
        eventType: 'NOTIFICATION_SENT',
        eventData: { type, level },
      },
    });

    // 3. Fetch push subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushSubscription: true },
    });

    if (!user?.pushSubscription) return;

    // 4. Send push notification
    await pushService.send(
      user.pushSubscription as unknown as webpush.PushSubscription,
      { title: copy.title, body: copy.body },
      userId
    );

    logger.info({ type, userId, level }, 'NotificationAgent sent push notification');
  }

  private getNotificationCopy(
    type: NotificationType,
    level: Level,
    name: string
  ): { title: string; body: string } {
    const template = NOTIFICATION_COPY[type][level];
    return {
      title: template.title.replace(/\{name\}/g, name ?? 'você'),
      body: template.body.replace(/\{name\}/g, name ?? 'você'),
    };
  }
}
