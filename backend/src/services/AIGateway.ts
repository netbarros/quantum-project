import { ContentInput, AIResponse, ContentOutput } from '../types/ai.types';
import { AI_CONFIG } from '../config/ai.config';
import { TokenTracker } from './TokenTracker';
import { getStaticFallback } from '../utils/staticContent';

export class AIGateway {
  static async generateContent(input: ContentInput): Promise<AIResponse> {
    try {
      // 1. Primary Model
      const primaryResult = await AIGateway.callWithRetry(AI_CONFIG.primaryModel, input, AI_CONFIG.retryAttempts);
      if (primaryResult) return primaryResult;
      console.warn(`[AIGateway] Primary model (${AI_CONFIG.primaryModel}) exhausted retries. Failing back.`);

      // 2. Fallback Model
      const fallbackResult = await AIGateway.callWithRetry(AI_CONFIG.fallbackModel, input, AI_CONFIG.retryAttempts);
      if (fallbackResult) return fallbackResult;
      console.error(`[AIGateway] Fallback model (${AI_CONFIG.fallbackModel}) also failed. Using static fallback.`);
    } catch (e) {
      console.error(`[AIGateway] Terminal error during AI generation. Using static fallback.`, e);
    }

    // 3. Static Content
    return {
      content: getStaticFallback(input.day),
      isFallback: true,
    };
  }

  private static async callWithRetry(model: string, input: ContentInput, retries: number): Promise<AIResponse | null> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const start = Date.now();
        const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Quantum Project',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: AIGateway.getSystemPrompt() },
              { role: 'user', content: AIGateway.buildUserPrompt(input) },
            ],
            temperature: AI_CONFIG.temperature,
            max_tokens: AI_CONFIG.maxTokens,
            response_format: { type: 'json_object' },
            // Important for some models via OpenRouter to strictly enforce JSON
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const duration = Date.now() - start;

        // Ensure token usage is tracked asynchronously
        if (data.usage) {
          TokenTracker.logUsage({
            userId: input.userId,
            modelUsed: model,
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            responseTimeMs: duration,
          }).catch(console.error);
        }

        const contentRaw = data.choices?.[0]?.message?.content;
        if (!contentRaw) throw new Error('Empty response from model');

        const parsedContent = JSON.parse(contentRaw) as ContentOutput;
        return {
          content: parsedContent,
          isFallback: false,
        };
      } catch (err) {
        console.warn(`[AIGateway] Attempt ${attempt + 1} failed for ${model}:`, err);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, AI_CONFIG.retryDelayMs));
        }
      }
    }
    return null;
  }

  private static getSystemPrompt(): string {
    return `You are the Quantum Project AI — a consciousness transformation engine.

Generate a daily transformation session.

Rules:
- Human, calm, grounded tone
- No mystical exaggeration
- Combine spirituality, psychology, behavior
- Practical and applicable
- Adaptive depth based on consciousness score

Structure (return JSON only):
{
  "direction": "Opening guidance for the day",
  "explanation": "Theoretical context blending psychology + spirituality",
  "reflection": "Deep reflective question",
  "action": "One concrete action step",
  "question": "Consciousness-expanding question",
  "affirmation": "Daily affirmation aligned with user's journey",
  "practice": "Specific exercise or meditation (adapted to timeAvailable)",
  "integration": "How to carry this through the rest of the day"
}

Return JSON only. No markdown. No extra text.`;
  }

  private static buildUserPrompt(input: ContentInput): string {
    return `Language: ${input.language}

User Context:
- Pain: ${input.painPoint || 'Unknown'}
- Goal: ${input.goal || 'General improvement'}
- Emotional State: ${input.emotionalState || 'Neutral'}
- Consciousness Score: ${input.consciousnessScore}
- Streak: ${input.streak}
- Time Available: ${input.timeAvailable} minutes

Create today's session appropriately.`;
  }
}
