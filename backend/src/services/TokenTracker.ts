import { prisma } from '../config/database';
import { AI_CONFIG } from '../config/ai.config';
import { logger } from '../lib/logger';

export class TokenTracker {
  static async logUsage({
    userId,
    modelUsed,
    promptTokens,
    completionTokens,
    responseTimeMs,
  }: {
    userId: string;
    modelUsed: string;
    promptTokens: number;
    completionTokens: number;
    responseTimeMs?: number;
  }) {
    const tokensUsed = promptTokens + completionTokens;

    // Calculate cost based on ai.config.ts mapping
    let costEstimate = 0;
    const rates = AI_CONFIG.costPerToken[modelUsed as keyof typeof AI_CONFIG.costPerToken];
    if (rates) {
      costEstimate = promptTokens * rates.input + completionTokens * rates.output;
    }

    try {
      await prisma.usage.create({
        data: {
          userId,
          date: new Date(),
          tokensUsed,
          promptTokens,
          completionTokens,
          modelUsed,
          requestsCount: 1,
          costEstimate,
          responseTimeMs,
        },
      });
    } catch (err) {
      logger.error({ err }, 'TokenTracker failed to log AI usage');
    }
  }
}
