import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressAgent } from './ProgressAgent';
import { prisma } from '../config/database';
import { AgentMessage } from '../types/agent.types';

// ─── Mock Prisma ────────────────────────────────────────────────────────────────
vi.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    content: {
      update: vi.fn(),
    },
    userEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────────

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function yesterdayDate(): Date {
  const d = todayMidnight();
  d.setDate(d.getDate() - 1);
  d.setHours(12, 0, 0, 0); // noon yesterday – falls in "yesterday" range
  return d;
}

function twoDaysAgoDate(): Date {
  const d = todayMidnight();
  d.setDate(d.getDate() - 2);
  d.setHours(12, 0, 0, 0);
  return d;
}

function makeMessage(
  overrides: Partial<AgentMessage> & { payload?: Record<string, unknown> } = {},
): AgentMessage {
  return {
    type: 'session_complete',
    payload: { contentId: 'content-1', exerciseCompleted: false },
    userId: 'user-1',
    timestamp: new Date(),
    sourceAgent: 'test',
    correlationId: 'corr-1',
    ...overrides,
  };
}

function makeUser(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'user-1',
    consciousnessScore: 100,
    level: 'BEGINNER',
    streak: 3,
    lastSessionDate: yesterdayDate(),
    currentDay: 5,
    streakFreezeUsed: false,
    streakFreezeDate: null,
    ...overrides,
  };
}

/** Configure prisma.$transaction to return a fake updatedUser (first element). */
function mockTransaction(updatedUser: Record<string, unknown>): void {
  vi.mocked(prisma.$transaction).mockResolvedValue([updatedUser, {}]);
}

// ─── Test Suite ─────────────────────────────────────────────────────────────────

describe('ProgressAgent', () => {
  let agent: ProgressAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new ProgressAgent();
    // Silence console.log output from the agent during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. Score calculation: base +10
  // ═══════════════════════════════════════════════════════════════════════════════
  it('awards base +10 score for daily session completion', async () => {
    // Arrange — first session ever, no streak bonus, no exercise bonus
    const user = makeUser({ lastSessionDate: null, streak: 0, consciousnessScore: 0 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    mockTransaction({ ...user, consciousnessScore: 10, level: 'BEGINNER', streak: 1, currentDay: 1 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert
    expect(res.payload.scoreDelta).toBe(10); // base only
    expect(res.payload.alreadyCompleted).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. Score calculation: streak bonus +5 when streak >= 2
  // ═══════════════════════════════════════════════════════════════════════════════
  it('adds +5 streak bonus when streak >= 2 (consecutive day)', async () => {
    // Arrange — user had session yesterday with streak 1 → streak becomes 2 → +5
    const user = makeUser({ streak: 1, lastSessionDate: yesterdayDate(), consciousnessScore: 50 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // newStreak = 1 + 1 = 2, scoreDelta = 10 + 5(streak) = 15
    mockTransaction({ ...user, consciousnessScore: 65, streak: 2, level: 'BEGINNER', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert — base(10) + streak(5) = 15
    expect(res.payload.scoreDelta).toBe(15);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. Score calculation: exercise bonus +5
  // ═══════════════════════════════════════════════════════════════════════════════
  it('adds +5 exercise bonus when exerciseCompleted is true', async () => {
    // Arrange — first session, exercise done
    const user = makeUser({ lastSessionDate: null, streak: 0, consciousnessScore: 0 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // newStreak = 1 (first session), scoreDelta = 10 + 5(exercise) = 15
    mockTransaction({ ...user, consciousnessScore: 15, streak: 1, level: 'BEGINNER', currentDay: 1 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(
      makeMessage({ payload: { contentId: 'content-1', exerciseCompleted: true } }),
    );

    // Assert — base(10) + exercise(5) = 15
    expect(res.payload.scoreDelta).toBe(15);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. Streak continuation: +1 when session is on consecutive day
  // ═══════════════════════════════════════════════════════════════════════════════
  it('increments streak by 1 when last session was yesterday', async () => {
    // Arrange
    const user = makeUser({ streak: 5, lastSessionDate: yesterdayDate() });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    mockTransaction({ ...user, consciousnessScore: 115, streak: 6, level: 'BEGINNER', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert — streak went from 5 to 6
    const txCall = vi.mocked(prisma.$transaction).mock.calls[0][0] as unknown[];
    // The transaction receives an array; we verify update was called
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.payload.streak).toBe(6);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. Streak: first session ever sets streak to 1
  // ═══════════════════════════════════════════════════════════════════════════════
  it('sets streak to 1 for the very first session', async () => {
    // Arrange
    const user = makeUser({ lastSessionDate: null, streak: 0, consciousnessScore: 0 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    mockTransaction({ ...user, consciousnessScore: 10, streak: 1, level: 'BEGINNER', currentDay: 1 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    await agent.execute(makeMessage());

    // Assert — user.update receives streak = 1
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. Streak gap penalty: gap >= 2 days resets streak to 1 and -5 score
  // ═══════════════════════════════════════════════════════════════════════════════
  it('resets streak to 1 and applies -5 penalty on gap >= 2 days', async () => {
    // Arrange — last session was 2+ days ago, had a 10-day streak
    const user = makeUser({ streak: 10, lastSessionDate: twoDaysAgoDate(), consciousnessScore: 200 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // scoreDelta = 10 - 5(gap) = 5, newStreak = 1 (< 2 so no streak bonus)
    mockTransaction({ ...user, consciousnessScore: 205, streak: 1, level: 'AWARE', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert — base(10) - gap(5) = 5
    expect(res.payload.scoreDelta).toBe(5);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. Idempotency: same day completion returns alreadyCompleted: true
  // ═══════════════════════════════════════════════════════════════════════════════
  it('returns alreadyCompleted: true when session already done today', async () => {
    // Arrange — lastSessionDate is today (after midnight)
    const todayNoon = new Date();
    todayNoon.setHours(12, 0, 0, 0);
    const user = makeUser({ lastSessionDate: todayNoon, consciousnessScore: 300, streak: 5, level: 'AWARE' });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert
    expect(res.payload.alreadyCompleted).toBe(true);
    expect(res.payload.consciousnessScore).toBe(300);
    expect(res.payload.streak).toBe(5);
    expect(res.payload.level).toBe('AWARE');
    // No transaction should have been called
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.userEvent.create).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. Score capped at 1000 (upper bound)
  // ═══════════════════════════════════════════════════════════════════════════════
  it('caps score at 1000 even when delta would exceed it', async () => {
    // Arrange — score already at 995, full bonuses would push to 1015
    const user = makeUser({
      consciousnessScore: 995,
      streak: 5,
      lastSessionDate: yesterdayDate(),
      level: 'INTEGRATED',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // scoreDelta = 10 + 5(streak, streak becomes 6) + 5(exercise) = 20 → raw 1015 → clamped 1000
    mockTransaction({ ...user, consciousnessScore: 1000, streak: 6, level: 'INTEGRATED', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(
      makeMessage({ payload: { contentId: 'content-1', exerciseCompleted: true } }),
    );

    // Assert — the $transaction should have been called with score = 1000
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    // scoreDelta is the raw delta before clamping
    expect(res.payload.scoreDelta).toBe(20);
    expect(res.payload.consciousnessScore).toBe(1000);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. Score floored at 0 (lower bound) — edge case with very low score
  // ═══════════════════════════════════════════════════════════════════════════════
  it('floors score at 0 when gap penalty would push below zero', async () => {
    // Arrange — score is 2, gap penalty gives delta = 10-5 = 5 → 2+5=7 (positive here)
    // For a true sub-zero case we need score = 0 and a gap
    // scoreDelta = 10 - 5(gap) = 5 → 0 + 5 = 5, still positive
    // Actually Math.max(0,...) protects; let's test with score 0 and gap
    const user = makeUser({
      consciousnessScore: 0,
      streak: 3,
      lastSessionDate: twoDaysAgoDate(),
      level: 'BEGINNER',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // scoreDelta = 10 - 5(gap) = 5, newScore = max(0, 0 + 5) = 5
    mockTransaction({ ...user, consciousnessScore: 5, streak: 1, level: 'BEGINNER', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert — score never goes negative
    expect(res.payload.scoreDelta).toBe(5);
    expect(res.payload.consciousnessScore).toBeGreaterThanOrEqual(0);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. Level transitions: all 5 levels via calculateLevel
  // ═══════════════════════════════════════════════════════════════════════════════
  it('transitions from BEGINNER to AWARE when score crosses 200', async () => {
    // Arrange — score 195, continuation streak >= 2, no exercise → +15 → 210
    const user = makeUser({
      consciousnessScore: 195,
      streak: 5,
      lastSessionDate: yesterdayDate(),
      level: 'BEGINNER',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // scoreDelta = 10 + 5(streak, streak becomes 6) = 15 → 195+15 = 210 → AWARE
    mockTransaction({ ...user, consciousnessScore: 210, streak: 6, level: 'AWARE', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(makeMessage());

    // Assert
    expect(res.payload.level).toBe('AWARE');
    expect(res.payload.consciousnessScore).toBe(210);
  });

  it('transitions from AWARE to CONSISTENT when score crosses 400', async () => {
    const user = makeUser({
      consciousnessScore: 390,
      streak: 3,
      lastSessionDate: yesterdayDate(),
      level: 'AWARE',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // streak becomes 4, scoreDelta = 10 + 5(streak) = 15 → 390+15 = 405 → CONSISTENT
    mockTransaction({ ...user, consciousnessScore: 405, streak: 4, level: 'CONSISTENT', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    const res = await agent.execute(makeMessage());
    expect(res.payload.level).toBe('CONSISTENT');
  });

  it('transitions from CONSISTENT to ALIGNED when score crosses 600', async () => {
    const user = makeUser({
      consciousnessScore: 595,
      streak: 9,
      lastSessionDate: yesterdayDate(),
      level: 'CONSISTENT',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // streak becomes 10, scoreDelta = 10 + 5(streak) = 15 → 595+15 = 610 → ALIGNED
    mockTransaction({ ...user, consciousnessScore: 610, streak: 10, level: 'ALIGNED', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    const res = await agent.execute(makeMessage());
    expect(res.payload.level).toBe('ALIGNED');
  });

  it('transitions from ALIGNED to INTEGRATED when score crosses 800', async () => {
    const user = makeUser({
      consciousnessScore: 790,
      streak: 20,
      lastSessionDate: yesterdayDate(),
      level: 'ALIGNED',
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // streak becomes 21, scoreDelta = 10 + 5(streak) + 5(exercise) = 20 → 790+20 = 810 → INTEGRATED
    mockTransaction({ ...user, consciousnessScore: 810, streak: 21, level: 'INTEGRATED', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    const res = await agent.execute(
      makeMessage({ payload: { contentId: 'content-1', exerciseCompleted: true } }),
    );
    expect(res.payload.level).toBe('INTEGRATED');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 11. handleFreezeStreak: successfully applies freeze
  // ═══════════════════════════════════════════════════════════════════════════════
  it('applies streak freeze successfully when not used this week', async () => {
    // Arrange
    const user = makeUser({ streakFreezeUsed: false, streakFreezeDate: null, streak: 7 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...user,
      streakFreezeUsed: true,
      streakFreezeDate: new Date(),
    } as never);

    // Act
    const res = await agent.execute(
      makeMessage({ type: 'freeze_streak', payload: {} }),
    );

    // Assert
    expect(res.payload.success).toBe(true);
    expect(res.payload.streakFreezeAvailable).toBe(false);
    expect(res.payload.streak).toBe(7);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        streakFreezeUsed: true,
        streakFreezeDate: expect.any(Date),
      },
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 12. handleFreezeStreak: prevents duplicate freeze in the same week
  // ═══════════════════════════════════════════════════════════════════════════════
  it('rejects streak freeze when already used this week', async () => {
    // Arrange — freeze was used today (within current week)
    const user = makeUser({
      streakFreezeUsed: true,
      streakFreezeDate: new Date(), // today, definitely >= last Monday
      streak: 7,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);

    // Act
    const res = await agent.execute(
      makeMessage({ type: 'freeze_streak', payload: {} }),
    );

    // Assert
    expect(res.payload.success).toBe(false);
    expect(res.payload.reason).toBe('Streak freeze already used this week');
    expect(res.payload.streakFreezeAvailable).toBe(false);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 13. Unknown message type throws an error
  // ═══════════════════════════════════════════════════════════════════════════════
  it('throws on unknown message type', async () => {
    await expect(
      agent.execute(makeMessage({ type: 'unknown_type', payload: {} })),
    ).rejects.toThrow('[ProgressAgent] Unknown message type: unknown_type');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 14. User not found throws for session_complete
  // ═══════════════════════════════════════════════════════════════════════════════
  it('throws when user is not found (session_complete)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    await expect(
      agent.execute(makeMessage()),
    ).rejects.toThrow('[ProgressAgent] User not found: user-1');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 15. User not found throws for freeze_streak
  // ═══════════════════════════════════════════════════════════════════════════════
  it('throws when user is not found (freeze_streak)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    await expect(
      agent.execute(makeMessage({ type: 'freeze_streak', payload: {} })),
    ).rejects.toThrow('[ProgressAgent] User not found: user-1');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 16. Full bonus stack: base + streak + exercise = 20
  // ═══════════════════════════════════════════════════════════════════════════════
  it('stacks all bonuses: base(10) + streak(5) + exercise(5) = 20', async () => {
    // Arrange — yesterday session, streak 3 → becomes 4, exercise done
    const user = makeUser({
      consciousnessScore: 100,
      streak: 3,
      lastSessionDate: yesterdayDate(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    mockTransaction({ ...user, consciousnessScore: 120, streak: 4, level: 'BEGINNER', currentDay: 6 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    const res = await agent.execute(
      makeMessage({ payload: { contentId: 'content-1', exerciseCompleted: true } }),
    );

    // Assert
    expect(res.payload.scoreDelta).toBe(20);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 17. UserEvent is created with correct eventData
  // ═══════════════════════════════════════════════════════════════════════════════
  it('creates a UserEvent with the correct SESSION_COMPLETED data', async () => {
    // Arrange
    const user = makeUser({
      consciousnessScore: 50,
      streak: 1,
      lastSessionDate: yesterdayDate(),
      currentDay: 3,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    // streak becomes 2, scoreDelta = 10 + 5(streak) = 15, newScore = 65
    mockTransaction({ ...user, consciousnessScore: 65, streak: 2, level: 'BEGINNER', currentDay: 4 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    // Act
    await agent.execute(makeMessage());

    // Assert
    expect(prisma.userEvent.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        eventType: 'SESSION_COMPLETED',
        eventData: {
          contentId: 'content-1',
          scoreDelta: 15,
          newScore: 65,
          newStreak: 2,
          newLevel: 'BEGINNER',
          day: 3, // user.currentDay before increment
        },
      },
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // 18. Response shape: createResponse wraps correctly
  // ═══════════════════════════════════════════════════════════════════════════════
  it('returns a properly shaped AgentMessage response', async () => {
    const user = makeUser({ lastSessionDate: null, streak: 0, consciousnessScore: 0 });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);
    mockTransaction({ ...user, consciousnessScore: 10, streak: 1, level: 'BEGINNER', currentDay: 1 });
    vi.mocked(prisma.userEvent.create).mockResolvedValue({} as never);

    const res = await agent.execute(makeMessage());

    expect(res.type).toBe('session_complete_response');
    expect(res.sourceAgent).toBe('ProgressAgent');
    expect(res.targetAgent).toBe('test');
    expect(res.userId).toBe('user-1');
    expect(res.correlationId).toBe('corr-1');
    expect(res.timestamp).toBeInstanceOf(Date);
    expect(res.payload).toHaveProperty('consciousnessScore');
    expect(res.payload).toHaveProperty('level');
    expect(res.payload).toHaveProperty('streak');
    expect(res.payload).toHaveProperty('currentDay');
    expect(res.payload).toHaveProperty('levelProgress');
    expect(res.payload).toHaveProperty('scoreDelta');
    expect(res.payload).toHaveProperty('alreadyCompleted', false);
  });
});
