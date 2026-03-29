import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';
import { prisma } from '../config/database';

/**
 * MonetizationAgent — enforces access tiers.
 *
 * check_access:
 *   - FREE user with currentDay > 7 → accessDenied (402)
 *   - Premium user OR day ≤ 7 → accessGranted
 */
export class MonetizationAgent extends BaseAgent {
  readonly name = 'MonetizationAgent';
  readonly description =
    'Validates user access rights based on subscription tier (free vs premium).';

  async execute(message: AgentMessage): Promise<AgentMessage> {
    switch (message.type) {
      case 'check_access':
        return this.handleCheckAccess(message);
      default:
        throw new Error(`[MonetizationAgent] Unknown message type: ${message.type}`);
    }
  }

  private async handleCheckAccess(message: AgentMessage): Promise<AgentMessage> {
    const user = await prisma.user.findUnique({
      where: { id: message.userId },
      select: {
        isPremium: true,
        currentDay: true,
        premiumUntil: true,
      },
    });

    if (!user) {
      return this.createResponse(message, {
        accessGranted: false,
        accessStatus: 'ACCESS_DENIED',
        reason: 'USER_NOT_FOUND',
      });
    }

    // Check premium expiry
    const now = new Date();
    const premiumActive =
      user.isPremium &&
      (user.premiumUntil === null || user.premiumUntil > now);

    // Free tier: allow up to 7 days of content
    const FREE_DAY_LIMIT = 7;
    if (!premiumActive && user.currentDay > FREE_DAY_LIMIT) {
      console.log(
        `[MonetizationAgent] Access denied — userId=${message.userId} day=${user.currentDay} isPremium=${user.isPremium}`
      );
      return this.createResponse(message, {
        accessGranted: false,
        accessStatus: 'ACCESS_DENIED_PAYWALL',
        reason: 'FREE_LIMIT_REACHED',
        currentDay: user.currentDay,
        freeLimit: FREE_DAY_LIMIT,
      });
    }

    return this.createResponse(message, {
      accessGranted: true,
      accessStatus: 'ACCESS_GRANTED',
      isPremium: premiumActive,
      currentDay: user.currentDay,
    });
  }
}
