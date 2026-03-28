import { BaseAgent } from './BaseAgent';
import { AgentMessage } from '../types/agent.types';
import { prisma } from '../config/database';
import { User } from '@prisma/client';

interface BehaviorPatterns {
  completionRate: number;       // % sessions completed in last 14 days
  averageSessionTime: number;   // average minutes (not tracked yet, default 10)
  peakHour: number;            // hour with most completions (0–23)
  journalEngagement: boolean;  // had JournalEntry in last 5 sessions
  streakBreakPattern: string;  // 'weekends' | 'monday' | 'irregular' | 'none'
  favoriteThemes: string[];    // most favorited content themes
}

interface ContentAdjustments {
  depthLevel: 'surface' | 'moderate' | 'deep' | 'profound';
  tone: 'gentle' | 'direct' | 'challenging' | 'provocative';
  contentLength: 'brief' | 'standard' | 'extended';
  focusArea: string;
}

export class PersonalizationAgent extends BaseAgent {
  readonly name = 'PersonalizationAgent';
  readonly description = 'Analyzes user behavior patterns and generates content adjustments.';

  async execute(message: AgentMessage): Promise<AgentMessage> {
    switch (message.type) {
      case 'get_user_context':
        return this.handleGetUserContext(message);
      default:
        throw new Error(`[PersonalizationAgent] Unsupported message type: ${message.type}`);
    }
  }

  private async handleGetUserContext(message: AgentMessage): Promise<AgentMessage> {
    const user = await prisma.user.findUnique({
      where: { id: message.userId },
    });

    if (!user) {
      // Graceful degradation — return default adjustments
      return this.createResponse(message, {
        adjustments: this.defaultAdjustments(),
        patterns: null,
      });
    }

    const patterns = await this.analyzePatterns(message.userId);
    const adjustments = await this.generateAdjustments(patterns, user);

    return this.createResponse(message, {
      adjustments,
      patterns,
      suggestions: this.buildSuggestions(patterns),
    });
  }

  async analyzePatterns(userId: string): Promise<BehaviorPatterns> {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const events = await prisma.userEvent.findMany({
      where: {
        userId,
        createdAt: { gte: fourteenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Completion rate
    const sessionStarts = events.filter((e) => e.eventType === 'SESSION_STARTED').length;
    const sessionCompletes = events.filter((e) => e.eventType === 'SESSION_COMPLETED').length;
    const completionRate =
      sessionStarts > 0 ? Math.round((sessionCompletes / sessionStarts) * 100) / 100 : 0;

    // Peak hour from completed sessions
    const completedEvents = events.filter((e) => e.eventType === 'SESSION_COMPLETED');
    const hourCounts: Record<number, number> = {};
    for (const ev of completedEvents) {
      const hour = new Date(ev.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const peakHour =
      Object.keys(hourCounts).length > 0
        ? parseInt(
            Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]
          )
        : 8;

    // Journal engagement: any journal in last 5 sessions
    const recentJournals = await prisma.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: fourteenDaysAgo },
      },
    });
    const journalEngagement = recentJournals > 0;

    // Streak break pattern (from STREAK_BROKEN events)
    const streakBreaks = events.filter((e) => e.eventType === 'STREAK_BROKEN');
    const streakBreakPattern = this.detectBreakPattern(streakBreaks);

    // Favorite themes (from favorited content)
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { content: { select: { contentJSON: true } } },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    const favoriteThemes = favorites
      .map((f) => {
        const c = f.content.contentJSON as Record<string, unknown>;
        return typeof c?.direction === 'string' ? c.direction.split(' ').slice(0, 3).join(' ') : '';
      })
      .filter(Boolean);

    return {
      completionRate,
      averageSessionTime: 10, // default until we track session time
      peakHour,
      journalEngagement,
      streakBreakPattern,
      favoriteThemes,
    };
  }

  async generateAdjustments(
    patterns: BehaviorPatterns,
    user: User
  ): Promise<ContentAdjustments> {
    // Depth level
    let depthLevel: ContentAdjustments['depthLevel'] = 'surface';
    if (
      user.currentDay > 180 &&
      (user.level === 'ALIGNED' || user.level === 'INTEGRATED')
    ) {
      depthLevel = 'profound';
    } else if (user.currentDay > 60 && user.level !== 'BEGINNER') {
      depthLevel = 'deep';
    } else if (user.currentDay > 30) {
      depthLevel = 'moderate';
    }

    // Tone based on level
    const toneMap: Record<string, ContentAdjustments['tone']> = {
      BEGINNER:   'gentle',
      AWARE:      'direct',
      CONSISTENT: 'challenging',
      ALIGNED:    'provocative',
      INTEGRATED: 'provocative',
    };
    const tone = toneMap[user.level] ?? 'gentle';

    // Content length
    let contentLength: ContentAdjustments['contentLength'] = 'standard';
    if ((user.timeAvailable ?? 10) <= 5) contentLength = 'brief';
    else if (
      (user.timeAvailable ?? 10) >= 20 &&
      patterns.completionRate > 0.8
    ) {
      contentLength = 'extended';
    }

    // Focus area
    const focusArea =
      patterns.journalEngagement
        ? 'reflexão profunda e integração'
        : patterns.completionRate < 0.5
        ? 'motivação e consistência'
        : 'aprofundamento e expansão';

    return { depthLevel, tone, contentLength, focusArea };
  }

  private buildSuggestions(patterns: BehaviorPatterns): string[] {
    const suggestions: string[] = [];

    if (patterns.completionRate >= 0.8) {
      suggestions.push(`Você completa ${Math.round(patterns.completionRate * 100)}% das suas sessões — consistência extraordinária.`);
    } else if (patterns.completionRate < 0.5) {
      suggestions.push('Sessions mais curtas podem ajudar a manter a consistência.');
    }

    if (patterns.journalEngagement) {
      suggestions.push('Suas reflexões escritas mostram engajamento profundo com o processo.');
    }

    const hourLabel =
      patterns.peakHour < 12
        ? 'manhãs'
        : patterns.peakHour < 18
        ? 'tardes'
        : 'noites';
    suggestions.push(`Você é mais ativo nas ${hourLabel} — considere fixar esse horário.`);

    return suggestions;
  }

  private detectBreakPattern(
    breakEvents: { createdAt: Date }[]
  ): string {
    if (breakEvents.length === 0) return 'none';

    const weekendBreaks = breakEvents.filter((e) => {
      const day = new Date(e.createdAt).getDay();
      return day === 0 || day === 6;
    }).length;

    const mondayBreaks = breakEvents.filter(
      (e) => new Date(e.createdAt).getDay() === 1
    ).length;

    if (weekendBreaks / breakEvents.length > 0.6) return 'weekends';
    if (mondayBreaks / breakEvents.length > 0.5) return 'monday';
    return 'irregular';
  }

  private defaultAdjustments(): ContentAdjustments {
    return {
      depthLevel: 'surface',
      tone: 'gentle',
      contentLength: 'standard',
      focusArea: 'autoconsciência e presença',
    };
  }
}
