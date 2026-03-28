import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';
import { prisma } from '../config/database';
import { calculateLevel, getLevelProgress } from '../utils/levelCalculator';

/**
 * ProgressAgent — manages consciousness score, level, streak.
 * Registered in AgentRegistry and dispatched from SessionController
 * after a session is completed.
 *
 * Supported message types:
 *   - session_complete  : { contentId, exerciseCompleted }
 *   - freeze_streak     : {} (no extra payload needed beyond userId)
 */
export class ProgressAgent extends BaseAgent {
  readonly name = 'ProgressAgent';
  readonly description =
    'Manages user progression: consciousness score, level, and streak tracking.';

  async execute(message: AgentMessage): Promise<AgentMessage> {
    switch (message.type) {
      case 'session_complete':
        return this.handleSessionComplete(message);
      case 'freeze_streak':
        return this.handleFreezeStreak(message);
      default:
        throw new Error(`[ProgressAgent] Unknown message type: ${message.type}`);
    }
  }

  // ─── session_complete ────────────────────────────────────────────────────────

  private async handleSessionComplete(message: AgentMessage): Promise<AgentMessage> {
    const { contentId, exerciseCompleted } = message.payload as {
      contentId: string;
      exerciseCompleted: boolean;
    };
    const userId = message.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`[ProgressAgent] User not found: ${userId}`);

    // ── Idempotency: skip if already completed today ──────────────────────────
    const todayStart = this.todayMidnight();
    if (user.lastSessionDate && user.lastSessionDate >= todayStart) {
      return this.createResponse(message, {
        consciousnessScore: user.consciousnessScore,
        level: user.level,
        streak: user.streak,
        levelProgress: getLevelProgress(user.consciousnessScore),
        alreadyCompleted: true,
      });
    }

    // ── Streak calculation ─────────────────────────────────────────────────────
    const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
    let newStreak = user.streak;
    let scoreDelta = 10; // always +10 for daily completion

    if (user.lastSessionDate && user.lastSessionDate >= yesterdayStart) {
      // Last session was yesterday → continuation
      newStreak += 1;
    } else if (!user.lastSessionDate) {
      // First ever session
      newStreak = 1;
    } else {
      // Gap ≥ 2 days → broken streak, apply missed-day penalty
      newStreak = 1;
      scoreDelta -= 5;
    }

    // +5 streak bonus when streak ≥ 2 (consecutive days)
    if (newStreak >= 2) {
      scoreDelta += 5;
    }

    // +5 exercise completion bonus
    if (exerciseCompleted) {
      scoreDelta += 5;
    }

    // ── Score + level ──────────────────────────────────────────────────────────
    const rawScore = user.consciousnessScore + scoreDelta;
    const newScore = Math.max(0, Math.min(1000, rawScore));
    const newLevel = calculateLevel(newScore);

    // ── Persist atomically ────────────────────────────────────────────────────
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          consciousnessScore: newScore,
          level: newLevel,
          streak: newStreak,
          lastSessionDate: new Date(),
          currentDay: user.currentDay + 1,
        },
      }),
      prisma.content.update({
        where: { id: contentId },
        data: { isCompleted: true, completedAt: new Date() },
      }),
    ]);

    // ── Track UserEvent ────────────────────────────────────────────────────────
    await prisma.userEvent.create({
      data: {
        userId,
        eventType: 'SESSION_COMPLETED',
        eventData: {
          contentId,
          scoreDelta,
          newScore,
          newStreak,
          newLevel,
          day: user.currentDay,
        },
      },
    });

    console.log(
      `[ProgressAgent] userId=${userId} score=${newScore} (+${scoreDelta}) streak=${newStreak} level=${newLevel}`
    );

    return this.createResponse(message, {
      consciousnessScore: updatedUser.consciousnessScore,
      level: updatedUser.level,
      streak: updatedUser.streak,
      currentDay: updatedUser.currentDay,
      levelProgress: getLevelProgress(updatedUser.consciousnessScore),
      scoreDelta,
      alreadyCompleted: false,
    });
  }


  // ─── freeze_streak ───────────────────────────────────────────────────────────

  private async handleFreezeStreak(message: AgentMessage): Promise<AgentMessage> {
    const userId = message.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`[ProgressAgent] User not found: ${userId}`);

    // Check if freeze was already used this week (resets each Monday)
    const lastMonday = this.lastMondayMidnight();
    const freezeUsed =
      user.streakFreezeUsed &&
      user.streakFreezeDate !== null &&
      user.streakFreezeDate >= lastMonday;

    if (freezeUsed) {
      return this.createResponse(message, {
        success: false,
        reason: 'Streak freeze already used this week',
        streakFreezeAvailable: false,
        streak: user.streak,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        streakFreezeUsed: true,
        streakFreezeDate: new Date(),
      },
    });

    console.log(`[ProgressAgent] Streak freeze applied for userId=${userId}`);

    return this.createResponse(message, {
      success: true,
      streakFreezeAvailable: false,
      streak: updatedUser.streak,
    });
  }

  // ─── Date helpers ─────────────────────────────────────────────────────────────

  private todayMidnight(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private lastMondayMidnight(): Date {
    const now = new Date();
    const day = now.getDay(); // 0=Sun … 6=Sat
    const daysToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
