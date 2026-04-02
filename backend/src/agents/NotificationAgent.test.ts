import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationAgent } from './NotificationAgent';
import { prisma } from '../config/database';
import { pushService } from '../services/PushNotification';
import type { AgentMessage } from '../types/agent.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../config/database', () => ({
  prisma: {
    notification: { create: vi.fn() },
    userEvent: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock('../services/PushNotification', () => ({
  pushService: { send: vi.fn() },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVELS = ['BEGINNER', 'AWARE', 'CONSISTENT', 'ALIGNED', 'INTEGRATED'] as const;
type Level = (typeof LEVELS)[number];

const TYPES = ['DAILY_REMINDER', 'MOTIVATIONAL_RESET', 'RECOVERY_FLOW'] as const;
type NotificationType = (typeof TYPES)[number];

function buildMessage(overrides: Partial<AgentMessage> & { payload: Record<string, unknown> }): AgentMessage {
  return {
    type: 'send_notification',
    userId: 'user-1',
    timestamp: new Date(),
    sourceAgent: 'test',
    correlationId: 'corr-1',
    ...overrides,
  };
}

const FAKE_SUBSCRIPTION = {
  endpoint: 'https://push.example.com/sub/abc',
  keys: { p256dh: 'key-p256dh', auth: 'key-auth' },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NotificationAgent', () => {
  let agent: NotificationAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new NotificationAgent();

    // Default: user has a push subscription
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      pushSubscription: FAKE_SUBSCRIPTION,
    } as never);
    vi.mocked(pushService.send).mockResolvedValue(undefined);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. getNotificationType — threshold logic
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getNotificationType (via execute)', () => {
    it('returns DAILY_REMINDER when daysMissed = 1', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 1, level: 'BEGINNER', name: 'Ana' },
      });

      // Act
      const res = await agent.execute(msg);

      // Assert
      expect(res.payload.type).toBe('DAILY_REMINDER');
      expect(res.payload.sent).toBe(true);
    });

    it('returns DAILY_REMINDER when daysMissed = 2', async () => {
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 2, level: 'AWARE', name: 'Bruno' },
      });

      const res = await agent.execute(msg);

      expect(res.payload.type).toBe('DAILY_REMINDER');
    });

    it('returns MOTIVATIONAL_RESET when daysMissed = 3', async () => {
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 3, level: 'CONSISTENT', name: 'Clara' },
      });

      const res = await agent.execute(msg);

      expect(res.payload.type).toBe('MOTIVATIONAL_RESET');
    });

    it('returns MOTIVATIONAL_RESET when daysMissed = 5', async () => {
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 5, level: 'ALIGNED', name: 'Diego' },
      });

      const res = await agent.execute(msg);

      expect(res.payload.type).toBe('MOTIVATIONAL_RESET');
    });

    it('returns RECOVERY_FLOW when daysMissed = 7', async () => {
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 7, level: 'INTEGRATED', name: 'Eva' },
      });

      const res = await agent.execute(msg);

      expect(res.payload.type).toBe('RECOVERY_FLOW');
    });

    it('returns RECOVERY_FLOW when daysMissed = 30', async () => {
      const msg = buildMessage({
        payload: { userId: 'u1', daysMissed: 30, level: 'BEGINNER', name: 'Fábio' },
      });

      const res = await agent.execute(msg);

      expect(res.payload.type).toBe('RECOVERY_FLOW');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. getNotificationCopy — 15 combinations (5 levels × 3 types)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getNotificationCopy — all 15 level × type combinations', () => {
    // daysMissed values that deterministically map to each type
    const daysMissedForType: Record<NotificationType, number> = {
      DAILY_REMINDER: 1,
      MOTIVATIONAL_RESET: 3,
      RECOVERY_FLOW: 7,
    };

    // Expected title snippets for quick validation (after {name} → 'Luna' substitution)
    const EXPECTED: Record<NotificationType, Record<Level, { titleSnippet: string; bodySnippet: string }>> = {
      DAILY_REMINDER: {
        BEGINNER:   { titleSnippet: 'Tudo bem, Luna', bodySnippet: 'Seu dia foi incrível' },
        AWARE:      { titleSnippet: 'Luna, sua consciência', bodySnippet: 'tijolo' },
        CONSISTENT: { titleSnippet: 'Hora da prática, Luna', bodySnippet: 'provou que consegue' },
        ALIGNED:    { titleSnippet: 'Luna →', bodySnippet: 'interrompe um processo' },
        INTEGRATED: { titleSnippet: 'A prática te espera', bodySnippet: 'eu futuro' },
      },
      MOTIVATIONAL_RESET: {
        BEGINNER:   { titleSnippet: '3 dias', bodySnippet: 'Recomeçar' },
        AWARE:      { titleSnippet: 'evolução não parou', bodySnippet: 'consciência' },
        CONSISTENT: { titleSnippet: 'pausa não te define', bodySnippet: 'consistência' },
        ALIGNED:    { titleSnippet: 'padrão te chama', bodySnippet: 'Volte hoje' },
        INTEGRATED: { titleSnippet: 'semente ainda está', bodySnippet: 'Pause não é abandono' },
      },
      RECOVERY_FLOW: {
        BEGINNER:   { titleSnippet: 'Sentimos sua falta, Luna', bodySnippet: 'boas-vindas' },
        AWARE:      { titleSnippet: 'Uma semana', bodySnippet: 'reconexão' },
        CONSISTENT: { titleSnippet: 'Luna, a jornada', bodySnippet: '7 dias de pausa' },
        ALIGNED:    { titleSnippet: 'trouxe até aqui', bodySnippet: 'reconexão' },
        INTEGRATED: { titleSnippet: 'Sem palavras', bodySnippet: 'retorno' },
      },
    };

    for (const type of TYPES) {
      for (const level of LEVELS) {
        it(`${type} × ${level} — returns correct title and body with name substitution`, async () => {
          // Arrange
          const msg = buildMessage({
            payload: {
              userId: 'u-copy',
              daysMissed: daysMissedForType[type],
              level,
              name: 'Luna',
            },
          });

          // Act
          await agent.execute(msg);

          // Assert — notification.create receives resolved copy
          const createCall = vi.mocked(prisma.notification.create).mock.calls[0][0];
          const { title, body } = createCall.data as { title: string; body: string };

          expect(title).toContain(EXPECTED[type][level].titleSnippet);
          expect(body).toContain(EXPECTED[type][level].bodySnippet);

          // Ensure {name} placeholders have been replaced (no raw template tokens)
          expect(title).not.toContain('{name}');
          expect(body).not.toContain('{name}');
        });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. execute — successful dispatch (full integration of send path)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('execute — successful dispatch', () => {
    it('creates a notification record in the database', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-db', daysMissed: 1, level: 'BEGINNER', name: 'Raquel' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      expect(prisma.notification.create).toHaveBeenCalledOnce();
      const callArg = vi.mocked(prisma.notification.create).mock.calls[0][0];
      expect(callArg.data).toMatchObject({
        userId: 'u-db',
        type: 'DAILY_REMINDER',
        tone: 'beginner',
      });
    });

    it('creates a userEvent record with NOTIFICATION_SENT type', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-ev', daysMissed: 4, level: 'AWARE', name: 'Sol' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      expect(prisma.userEvent.create).toHaveBeenCalledOnce();
      const callArg = vi.mocked(prisma.userEvent.create).mock.calls[0][0];
      expect(callArg.data).toMatchObject({
        userId: 'u-ev',
        eventType: 'NOTIFICATION_SENT',
        eventData: { type: 'MOTIVATIONAL_RESET', level: 'AWARE' },
      });
    });

    it('fetches the user push subscription', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-push', daysMissed: 10, level: 'INTEGRATED', name: 'Kai' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u-push' },
        select: { pushSubscription: true },
      });
    });

    it('sends a push notification with correct payload', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-push2', daysMissed: 7, level: 'CONSISTENT', name: 'Mia' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      expect(pushService.send).toHaveBeenCalledOnce();
      const [subscription, payload, userId] = vi.mocked(pushService.send).mock.calls[0];
      expect(subscription).toEqual(FAKE_SUBSCRIPTION);
      expect(payload.title).toBeDefined();
      expect(payload.body).toBeDefined();
      expect(userId).toBe('u-push2');
    });

    it('returns response with sent=true and resolved type', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-resp', daysMissed: 3, level: 'ALIGNED', name: 'Leo' },
      });

      // Act
      const res = await agent.execute(msg);

      // Assert
      expect(res.type).toBe('send_notification_response');
      expect(res.sourceAgent).toBe('NotificationAgent');
      expect(res.targetAgent).toBe('test');
      expect(res.payload).toEqual({ sent: true, type: 'MOTIVATIONAL_RESET' });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Edge cases
  // ═══════════════════════════════════════════════════════════════════════════

  describe('edge cases', () => {
    it('daysMissed = 0 maps to DAILY_REMINDER', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-zero', daysMissed: 0, level: 'BEGINNER', name: 'Zoe' },
      });

      // Act
      const res = await agent.execute(msg);

      // Assert
      expect(res.payload.type).toBe('DAILY_REMINDER');
    });

    it('skips push when user has no pushSubscription', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        pushSubscription: null,
      } as never);

      const msg = buildMessage({
        payload: { userId: 'u-nosub', daysMissed: 1, level: 'AWARE', name: 'Noa' },
      });

      // Act
      await agent.execute(msg);

      // Assert — notification and event are still created, but push is skipped
      expect(prisma.notification.create).toHaveBeenCalledOnce();
      expect(prisma.userEvent.create).toHaveBeenCalledOnce();
      expect(pushService.send).not.toHaveBeenCalled();
    });

    it('skips push when user is not found', async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const msg = buildMessage({
        payload: { userId: 'u-ghost', daysMissed: 7, level: 'CONSISTENT', name: 'Rio' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      expect(pushService.send).not.toHaveBeenCalled();
    });

    it('throws on unsupported message type', async () => {
      // Arrange
      const msg = buildMessage({
        type: 'unknown_action',
        payload: { userId: 'u-bad', daysMissed: 1, level: 'BEGINNER', name: 'X' },
      });

      // Act & Assert
      await expect(agent.execute(msg)).rejects.toThrow(
        '[NotificationAgent] Unsupported message type: unknown_action'
      );
    });

    it('stores tone as lowercase version of level', async () => {
      // Arrange
      const msg = buildMessage({
        payload: { userId: 'u-tone', daysMissed: 1, level: 'INTEGRATED', name: 'Ivy' },
      });

      // Act
      await agent.execute(msg);

      // Assert
      const callArg = vi.mocked(prisma.notification.create).mock.calls[0][0];
      expect((callArg.data as Record<string, unknown>).tone).toBe('integrated');
    });

    it('substitutes {name} with "você" when name is undefined', async () => {
      // Arrange — name is explicitly undefined
      const msg = buildMessage({
        payload: { userId: 'u-noname', daysMissed: 1, level: 'BEGINNER', name: undefined as unknown as string },
      });

      // Act
      await agent.execute(msg);

      // Assert
      const callArg = vi.mocked(prisma.notification.create).mock.calls[0][0];
      const title = (callArg.data as Record<string, unknown>).title as string;
      expect(title).toContain('você');
      expect(title).not.toContain('{name}');
    });
  });
});
