import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MonetizationAgent } from './MonetizationAgent';
import { prisma } from '../config/database';

vi.mock('../config/database', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

describe('MonetizationAgent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('nega free com currentDay > 7', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isPremium: false,
      currentDay: 8,
      premiumUntil: null,
    } as never);

    const agent = new MonetizationAgent();
    const res = await agent.execute({
      type: 'check_access',
      payload: {},
      userId: 'u1',
      timestamp: new Date(),
      sourceAgent: 'test',
      correlationId: 'c1',
    });

    expect(res.payload.accessGranted).toBe(false);
    expect(res.payload.reason).toBe('FREE_LIMIT_REACHED');
  });

  it('permite premium além do dia 7', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      isPremium: true,
      currentDay: 99,
      premiumUntil: null,
    } as never);

    const agent = new MonetizationAgent();
    const res = await agent.execute({
      type: 'check_access',
      payload: {},
      userId: 'u2',
      timestamp: new Date(),
      sourceAgent: 'test',
      correlationId: 'c2',
    });

    expect(res.payload.accessGranted).toBe(true);
  });
});
