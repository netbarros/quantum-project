import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateAiCallGate, RATE_LIMITS } from './rateLimiterGate';
import { prisma } from '../config/database';

vi.mock('../config/database', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    usage: { aggregate: vi.fn() },
  },
}));

describe('evaluateAiCallGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia usuário free no limite diário de IA', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isPremium: false,
      premiumUntil: null,
    } as never);
    vi.mocked(prisma.usage.aggregate).mockResolvedValue({
      _sum: { requestsCount: RATE_LIMITS.free.aiCallsPerDay },
    } as never);

    const r = await evaluateAiCallGate('user-1');
    expect(r.allowed).toBe(false);
    if (!r.allowed) {
      expect(r.reason).toBe('RATE_LIMIT');
      expect(r.upgradeRequired).toBe(true);
    }
  });

  it('permite free abaixo do limite', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isPremium: false,
      premiumUntil: null,
    } as never);
    vi.mocked(prisma.usage.aggregate).mockResolvedValue({
      _sum: { requestsCount: 1 },
    } as never);

    const r = await evaluateAiCallGate('user-2');
    expect(r.allowed).toBe(true);
    if (r.allowed) expect(r.isPremiumActive).toBe(false);
  });

  it('premium no soft cap retorna allowed com aiLimitWarning', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isPremium: true,
      premiumUntil: null,
    } as never);
    vi.mocked(prisma.usage.aggregate).mockResolvedValue({
      _sum: { requestsCount: RATE_LIMITS.premium.aiCallsPerDay },
    } as never);

    const r = await evaluateAiCallGate('user-3');
    expect(r.allowed).toBe(true);
    if (r.allowed) {
      expect(r.aiLimitWarning).toBe(true);
      expect(r.isPremiumActive).toBe(true);
    }
  });
});
