import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────

const mockSendNotification = vi.fn();
const mockGenerateVAPIDKeys = vi.fn();
const mockSetVapidDetails = vi.fn();

vi.mock('web-push', () => ({
  default: {
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
    generateVAPIDKeys: (...args: unknown[]) => mockGenerateVAPIDKeys(...args),
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
  },
}));

const mockPrismaUserUpdate = vi.fn();

vi.mock('../config/database', () => ({
  prisma: {
    user: {
      update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
    },
  },
}));

// ── Helpers ──────────────────────────────────────────────────────

function makeSubscription() {
  return {
    endpoint: 'https://fcm.googleapis.com/fcm/send/some-token',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8REfWPE',
      auth: 'tBHItJI5svbpC7htM8Bcbw',
    },
  };
}

function makePayload(overrides: Record<string, string> = {}) {
  return {
    title: 'Test Notification',
    body: 'This is a test push notification.',
    ...overrides,
  };
}

// ── Lifecycle ────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Set up VAPID env vars so the constructor initializes web-push
  process.env.VAPID_EMAIL = 'mailto:test@example.com';
  process.env.VAPID_PUBLIC_KEY = 'BPublicKeyTest';
  process.env.VAPID_PRIVATE_KEY = 'PrivateKeyTest';
});

// ── Tests ────────────────────────────────────────────────────────

describe('PushNotificationService', () => {
  // We re-import the module for each test to get a fresh constructor call
  async function createService() {
    // Clear module cache so the constructor runs again with current env vars
    vi.resetModules();
    // Re-apply mocks after resetModules
    vi.doMock('web-push', () => ({
      default: {
        sendNotification: (...args: unknown[]) => mockSendNotification(...args),
        generateVAPIDKeys: (...args: unknown[]) => mockGenerateVAPIDKeys(...args),
        setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
      },
    }));
    vi.doMock('../config/database', () => ({
      prisma: {
        user: {
          update: (...args: unknown[]) => mockPrismaUserUpdate(...args),
        },
      },
    }));

    const mod = await import('./PushNotification');
    return new mod.PushNotificationService();
  }

  describe('send()', () => {
    it('calls web-push sendNotification with correct subscription and payload', async () => {
      mockSendNotification.mockResolvedValueOnce({ statusCode: 201 });

      const service = await createService();
      const sub = makeSubscription();
      const payload = makePayload();

      await service.send(sub, payload, 'user-1');

      expect(mockSendNotification).toHaveBeenCalledTimes(1);

      const [passedSub, passedPayload] = mockSendNotification.mock.calls[0];
      expect(passedSub).toEqual(sub);

      // Verify the serialized payload includes defaults
      const parsed = JSON.parse(passedPayload as string);
      expect(parsed.title).toBe('Test Notification');
      expect(parsed.body).toBe('This is a test push notification.');
      expect(parsed.icon).toBe('/icons/icon-192.png');
      expect(parsed.badge).toBe('/icons/badge-72.png');
      expect(parsed.url).toBe('/session');
    });

    it('clears expired subscription on 410 Gone error', async () => {
      const gonError = { statusCode: 410, message: 'Gone' };
      mockSendNotification.mockRejectedValueOnce(gonError);
      mockPrismaUserUpdate.mockResolvedValueOnce({});

      const service = await createService();

      // Should not throw
      await service.send(makeSubscription(), makePayload(), 'user-42');

      expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-42' },
        data: { pushSubscription: null },
      });
    });

    it('retries once after 429 rate limit error', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const rateLimitError = { statusCode: 429, message: 'Too Many Requests' };
      mockSendNotification
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ statusCode: 201 });

      const service = await createService();

      await service.send(makeSubscription(), makePayload(), 'user-1');

      // Should have been called twice: original + retry
      expect(mockSendNotification).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('does not throw on generic send errors (graceful failure)', async () => {
      const genericError = new Error('Network failure');
      mockSendNotification.mockRejectedValueOnce(genericError);

      const service = await createService();

      // Must not throw — the service swallows errors gracefully
      await expect(
        service.send(makeSubscription(), makePayload(), 'user-1'),
      ).resolves.toBeUndefined();

      // Prisma should NOT be called (not a 410)
      expect(mockPrismaUserUpdate).not.toHaveBeenCalled();
    });

    it('does not clear subscription on 410 when userId is not provided', async () => {
      const gonError = { statusCode: 410, message: 'Gone' };
      mockSendNotification.mockRejectedValueOnce(gonError);

      const service = await createService();

      // No userId passed — should fall through to generic error logging
      await service.send(makeSubscription(), makePayload());

      expect(mockPrismaUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe('generateVapidKeys()', () => {
    it('returns public and private keys from web-push', async () => {
      const fakeKeys = {
        publicKey: 'BGenPublicKey123',
        privateKey: 'GenPrivateKey456',
      };
      mockGenerateVAPIDKeys.mockReturnValueOnce(fakeKeys);

      const service = await createService();
      const keys = service.generateVapidKeys();

      expect(keys).toEqual(fakeKeys);
      expect(keys.publicKey).toBe('BGenPublicKey123');
      expect(keys.privateKey).toBe('GenPrivateKey456');
      expect(mockGenerateVAPIDKeys).toHaveBeenCalledTimes(1);
    });
  });

  describe('constructor', () => {
    it('calls setVapidDetails with mailto prefix when VAPID_EMAIL lacks it', async () => {
      process.env.VAPID_EMAIL = 'test@example.com'; // no mailto: prefix

      await createService();

      expect(mockSetVapidDetails).toHaveBeenCalledWith(
        'mailto:test@example.com',
        'BPublicKeyTest',
        'PrivateKeyTest',
      );
    });

    it('does not call setVapidDetails when VAPID env vars are missing', async () => {
      delete process.env.VAPID_EMAIL;
      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;

      await createService();

      expect(mockSetVapidDetails).not.toHaveBeenCalled();
    });
  });
});
