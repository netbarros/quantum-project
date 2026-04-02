import { ContentInput, AIResponse, ContentOutput } from '../types/ai.types';
import { AI_CONFIG, getModelChain, MODEL_CHAIN, type ModelConfig } from '../config/ai.config';
import { TokenTracker } from './TokenTracker';
import { getStaticFallback } from '../utils/staticContent';
import { logger } from '../lib/logger';
import { ConfigCache, type AiConfigValues } from './ConfigCache';

// ── Health Tracker ──────────────────────────────────────────────
interface ModelHealth {
  failures: number;
  lastFailure: number;
  skipUntil: number;
}

const modelHealth = new Map<string, ModelHealth>();
const SKIP_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILURES = 3;

function isModelHealthy(modelId: string): boolean {
  const health = modelHealth.get(modelId);
  if (!health) return true;
  if (Date.now() > health.skipUntil) {
    modelHealth.delete(modelId);
    return true;
  }
  return health.failures < MAX_FAILURES;
}

function recordFailure(modelId: string, isRateLimit: boolean): void {
  const health = modelHealth.get(modelId) ?? { failures: 0, lastFailure: 0, skipUntil: 0 };
  health.failures += 1;
  health.lastFailure = Date.now();
  if (health.failures >= MAX_FAILURES || isRateLimit) {
    health.skipUntil = Date.now() + SKIP_DURATION_MS;
    logger.warn({ modelId, failures: health.failures, isRateLimit }, 'Model skipped for 10min');
  }
  modelHealth.set(modelId, health);
}

function recordSuccess(modelId: string): void {
  modelHealth.delete(modelId);
}

// ── Health Reset (called before admin test to clear stale failures) ──
export function resetModelHealth(): void {
  modelHealth.clear();
}

// ── Health Status Export ────────────────────────────────────────
export function getModelHealthStatus(): Array<{
  modelId: string;
  label: string;
  healthy: boolean;
  failures: number;
  skipUntil: number | null;
}> {
  // Include all possible models (free + paid)
  const allModels = getModelChain(true);
  return allModels.map((model) => {
    const health = modelHealth.get(model.id);
    return {
      modelId: model.id,
      label: model.label,
      healthy: isModelHealthy(model.id),
      failures: health?.failures ?? 0,
      skipUntil: health?.skipUntil ?? null,
    };
  });
}

// ── Main Gateway ────────────────────────────────────────────────
export class AIGateway {
  static async generateContent(input: ContentInput): Promise<AIResponse> {
    // Read dynamic config from DB cache (falls back to env/defaults)
    let aiConfig: AiConfigValues;
    try {
      aiConfig = await ConfigCache.getInstance().getAiConfig();
    } catch {
      aiConfig = { apiKey: process.env.OPENROUTER_API_KEY?.trim() || '', temperature: 0.7, maxTokens: 1200, allowPaid: false, enabledModels: [], elevenlabsKey: '', elevenlabsVoiceId: '' };
    }

    let chain = aiConfig.allowPaid ? getModelChain(true) : MODEL_CHAIN;
    // Filter by admin-enabled models if configured
    if (aiConfig.enabledModels.length > 0) {
      chain = chain.filter((m) => aiConfig.enabledModels.includes(m.id));
      if (chain.length === 0) chain = MODEL_CHAIN; // fallback if all disabled
    }

    for (const model of chain) {
      if (!isModelHealthy(model.id)) {
        logger.info({ model: model.label }, 'Skipping unhealthy model');
        continue;
      }

      for (let attempt = 0; attempt <= model.maxRetries; attempt++) {
        try {
          const result = await AIGateway.callModel(model, input, aiConfig);
          if (result) {
            recordSuccess(model.id);
            logger.info({ model: model.label, attempt: attempt + 1 }, 'AI generation success');
            return { ...result, modelUsed: model.label };
          }
        } catch (err: unknown) {
          const status = (err as { status?: number })?.status;
          const message = err instanceof Error ? err.message : String(err);

          if (status === 429) {
            recordFailure(model.id, true);
            logger.warn({ model: model.label, status: 429 }, 'Rate limit hit, skipping to next model');
            break;
          }

          if (status === 502 || status === 503) {
            recordFailure(model.id, false);
            logger.warn({ model: model.label, status }, 'Model unavailable, trying next');
            break;
          }

          logger.warn({ model: model.label, attempt: attempt + 1, maxAttempts: model.maxRetries + 1, error: message }, 'Attempt failed');
          if (attempt < model.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, AI_CONFIG.retryDelayMs));
          } else {
            recordFailure(model.id, false);
          }
        }
      }
    }

    // All models exhausted — static fallback
    logger.warn('All models failed, using static content');
    return {
      content: getStaticFallback(input.day),
      isFallback: true,
      modelUsed: 'static-fallback',
    };
  }

  private static async callModel(model: ModelConfig, input: ContentInput, aiConfig: AiConfigValues): Promise<AIResponse | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), model.timeoutMs);

    try {
      const start = Date.now();
      const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Quantum Project',
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: 'system', content: AIGateway.getSystemPrompt() },
            { role: 'user', content: AIGateway.buildUserPrompt(input) },
          ],
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`OpenRouter error: ${response.status} ${response.statusText}`) as Error & { status: number };
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      const duration = Date.now() - start;

      if (data.usage) {
        TokenTracker.logUsage({
          userId: input.userId,
          modelUsed: model.id,
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          responseTimeMs: duration,
        }).catch((e) => logger.error({ err: e }, 'TokenTracker error'));
      }

      const contentRaw = data.choices?.[0]?.message?.content;
      if (!contentRaw) throw new Error('Empty response from model');

      const parsedContent = JSON.parse(contentRaw) as ContentOutput;
      return {
        content: parsedContent,
        isFallback: false,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private static getSystemPrompt(): string {
    return `You are Sofia — the AI consciousness guide of the Quantum Project.
You speak with warmth, wisdom, and gentle directness. You combine psychology, spirituality, and behavioral science.
Your tone is calm, grounded, and human — never robotic or mystically exaggerated.
You adapt depth based on the user's consciousness level and journey day.

Generate a daily transformation session as Sofia.

Rules:
- Write as Sofia speaking directly to the user (use "você")
- Warm but not saccharine — genuine and grounded
- Combine spirituality, psychology, behavior science
- Practical and applicable to everyday life
- Adaptive depth based on consciousness score and user context

Structure (return JSON only):
{
  "direction": "Sofia's opening guidance for the day — personal and warm",
  "explanation": "Theoretical context blending psychology + spirituality",
  "reflection": "Deep reflective question that invites honest self-inquiry",
  "action": "One concrete, doable action step",
  "question": "Consciousness-expanding question",
  "affirmation": "Daily affirmation aligned with user's journey stage",
  "practice": "Specific exercise or meditation (adapted to timeAvailable)",
  "integration": "How to carry today's insight through the rest of the day"
}

Return JSON only. No markdown. No extra text.`;
  }

  private static buildUserPrompt(input: ContentInput): string {
    let prompt = `Language: ${input.language}

User Context:
- Pain: ${input.painPoint || 'Unknown'}
- Goal: ${input.goal || 'General improvement'}
- Emotional State: ${input.emotionalState || 'Neutral'}
- Consciousness Score: ${input.consciousnessScore}
- Streak: ${input.streak}
- Time Available: ${input.timeAvailable} minutes`;

    if (input.adjustments) {
      const a = input.adjustments;
      prompt += `

Personalization Adjustments (from behavioral analysis):
- Depth Level: ${a.depthLevel} (adapt content complexity accordingly)
- Tone: ${a.tone} (match this communication style)
- Content Length: ${a.contentLength} (adjust detail level)
- Focus Area: ${a.focusArea} (prioritize this theme)`;
    }

    prompt += '\n\nCreate today\'s session appropriately.';
    return prompt;
  }
}
