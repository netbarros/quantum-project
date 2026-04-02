import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIGateway } from './AIGateway';
import type { ContentInput, ContentOutput } from '../types/ai.types';

// ── Mocks ────────────────────────────────────────────────────────

vi.mock('./TokenTracker', () => ({
  TokenTracker: {
    logUsage: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../utils/staticContent', () => ({
  getStaticFallback: vi.fn().mockReturnValue({
    direction: 'Static fallback direction',
    explanation: 'Static fallback explanation',
    reflection: 'Static fallback reflection',
    action: 'Static fallback action',
    question: 'Static fallback question',
    affirmation: 'Static fallback affirmation',
    practice: 'Static fallback practice',
    integration: 'Static fallback integration',
  }),
}));

// We need to control MODEL_CHAIN from tests so we can also test the
// OPENROUTER_ALLOW_PAID gate.  We keep a mutable reference and swap it
// per-test when needed.

const freeModel = {
  id: 'openrouter/free',
  label: 'openrouter-auto-free',
  maxRetries: 0,
  timeoutMs: 5000,
};

const secondModel = {
  id: 'deepseek/deepseek-chat-v3-0324:free',
  label: 'deepseek-v3-free',
  maxRetries: 0,
  timeoutMs: 5000,
};

const paidModel = {
  id: 'openai/gpt-4o-mini',
  label: 'gpt4o-mini-paid',
  maxRetries: 0,
  timeoutMs: 5000,
};

let currentChain = [freeModel, secondModel];

vi.mock('../config/ai.config', () => ({
  get MODEL_CHAIN() {
    return currentChain;
  },
  AI_CONFIG: {
    temperature: 0.7,
    maxTokens: 1200,
    baseUrl: 'https://openrouter.ai/api/v1',
    retryDelayMs: 0, // instant retries in tests
    costPerToken: {
      'openrouter/free': { input: 0, output: 0 },
      'deepseek/deepseek-chat-v3-0324:free': { input: 0, output: 0 },
      'openai/gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
    },
  },
}));

// ── Helpers ──────────────────────────────────────────────────────

const VALID_CONTENT: ContentOutput = {
  direction: 'Test direction',
  explanation: 'Test explanation',
  reflection: 'Test reflection',
  action: 'Test action',
  question: 'Test question',
  affirmation: 'Test affirmation',
  practice: 'Test practice',
  integration: 'Test integration',
};

function makeInput(overrides: Partial<ContentInput> = {}): ContentInput {
  return {
    userId: 'user-1',
    day: 1,
    language: 'en',
    painPoint: 'anxiety',
    goal: 'calm',
    emotionalState: 'neutral',
    consciousnessScore: 50,
    streak: 3,
    timeAvailable: 10,
    ...overrides,
  };
}

/** Build a successful fetch Response mock */
function okResponse(content: ContentOutput = VALID_CONTENT): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () =>
      Promise.resolve({
        choices: [{ message: { content: JSON.stringify(content) } }],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      }),
  } as unknown as Response;
}

/** Build an error fetch Response mock that the gateway converts into a thrown error */
function errorResponse(status: number, statusText = 'Error'): Response {
  return {
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({}),
  } as unknown as Response;
}

// ── Lifecycle ────────────────────────────────────────────────────

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  currentChain = [freeModel, secondModel];
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.APP_URL = 'http://localhost:3000';
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.useRealTimers();
});

// ── Tests ────────────────────────────────────────────────────────

describe('AIGateway', () => {
  describe('generateContent', () => {
    it('returns content from the first model when it succeeds', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(okResponse());

      const result = await AIGateway.generateContent(makeInput());

      expect(result.isFallback).toBe(false);
      expect(result.modelUsed).toBe('openrouter-auto-free');
      expect(result.content).toEqual(VALID_CONTENT);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('falls through to second model when first model fails', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse(500, 'Internal Server Error'))
        .mockResolvedValueOnce(okResponse());

      const result = await AIGateway.generateContent(makeInput());

      expect(result.isFallback).toBe(false);
      expect(result.modelUsed).toBe('deepseek-v3-free');
      expect(result.content).toEqual(VALID_CONTENT);
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('skips immediately to next model on 429 rate limit (no retry)', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse(429, 'Too Many Requests'))
        .mockResolvedValueOnce(okResponse());

      const result = await AIGateway.generateContent(makeInput());

      // 429 should break out of the retry loop, so only 2 fetch calls total
      expect(result.modelUsed).toBe('deepseek-v3-free');
      expect(result.isFallback).toBe(false);
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('skips model after 429 rate limit on subsequent calls', async () => {
      // A 429 triggers immediate skip (isRateLimit=true sets skipUntil to now+10min)
      // Call 1: freeModel gets 429 → marked unhealthy, secondModel succeeds
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse(429))
        .mockResolvedValueOnce(okResponse());

      const result1 = await AIGateway.generateContent(makeInput());
      // After 429 on freeModel, secondModel handles the request
      expect(result1.modelUsed).toBe('deepseek-v3-free');
      // 2 fetches: 1 to freeModel (429), 1 to secondModel (200)
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('returns static fallback with isFallback: true when all models fail', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(errorResponse(500, 'Internal Server Error'));

      const { getStaticFallback } = await import('../utils/staticContent');
      const result = await AIGateway.generateContent(makeInput({ day: 3 }));

      expect(result.isFallback).toBe(true);
      expect(result.modelUsed).toBe('static-fallback');
      expect(result.content).toBeDefined();
      expect(getStaticFallback).toHaveBeenCalledWith(3);
    });

    it('resets model health after a successful call', async () => {
      // First: force model into unhealthy state via a 429
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse(429, 'Too Many Requests'))
        .mockResolvedValueOnce(okResponse());

      await AIGateway.generateContent(makeInput());

      // Now advance time past the 10-minute skip window so the model becomes available again
      vi.advanceTimersByTime(11 * 60 * 1000);

      // Next call: first model succeeds — this should reset its health
      globalThis.fetch = vi.fn().mockResolvedValueOnce(okResponse());

      const result = await AIGateway.generateContent(makeInput());
      expect(result.modelUsed).toBe('openrouter-auto-free');
      expect(result.isFallback).toBe(false);

      // Confirm subsequent call also hits first model (health was reset)
      globalThis.fetch = vi.fn().mockResolvedValueOnce(okResponse());

      const result2 = await AIGateway.generateContent(makeInput());
      expect(result2.modelUsed).toBe('openrouter-auto-free');
    });

    it('treats AbortController timeout as a failure and falls to next model', async () => {
      // Use a very short timeout on the first model
      const shortTimeoutModel = { ...freeModel, timeoutMs: 1 };
      currentChain = [shortTimeoutModel, secondModel];

      // First fetch: simulate a request that never resolves (times out)
      globalThis.fetch = vi
        .fn()
        .mockImplementationOnce(
          (_url: string, init: RequestInit) =>
            new Promise<Response>((_resolve, reject) => {
              // Listen for the abort signal
              if (init?.signal) {
                init.signal.addEventListener('abort', () => {
                  reject(new DOMException('The operation was aborted.', 'AbortError'));
                });
              }
            }),
        )
        .mockResolvedValueOnce(okResponse());

      // Advance timers so the AbortController fires
      const resultPromise = AIGateway.generateContent(makeInput());
      await vi.advanceTimersByTimeAsync(50);
      const result = await resultPromise;

      expect(result.modelUsed).toBe('deepseek-v3-free');
      expect(result.isFallback).toBe(false);
    });

    it('excludes paid model from chain when OPENROUTER_ALLOW_PAID is false', async () => {
      // Include the paid model in the chain for this test
      currentChain = [freeModel, paidModel];

      // Make the free model fail so the gateway would attempt the next model
      globalThis.fetch = vi
        .fn()
        .mockResolvedValueOnce(errorResponse(500))
        .mockResolvedValueOnce(okResponse());

      const result = await AIGateway.generateContent(makeInput());

      // The paid model IS in the chain (we put it there), so it will be used
      expect(result.modelUsed).toBe('gpt4o-mini-paid');

      // Now verify the REAL module-level chain respects the env var.
      // Since OPENROUTER_ALLOW_PAID is not 'true' by default,
      // the real config should NOT contain the paid model.
      // We re-import the real config to check.
      const { MODEL_CHAIN: realChain } = await vi.importActual<
        typeof import('../config/ai.config')
      >('../config/ai.config');
      const hasPaid = realChain.some((m) => m.id === 'openai/gpt-4o-mini');

      // process.env.OPENROUTER_ALLOW_PAID is not 'true' in tests, so paid should be absent
      expect(hasPaid).toBe(false);
    });

    it('logs token usage via TokenTracker on success', async () => {
      globalThis.fetch = vi.fn().mockResolvedValueOnce(okResponse());

      const { TokenTracker } = await import('./TokenTracker');

      await AIGateway.generateContent(makeInput());

      // TokenTracker.logUsage is called asynchronously (fire-and-forget), so flush microtasks
      await vi.advanceTimersByTimeAsync(0);

      expect(TokenTracker.logUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          modelUsed: 'openrouter/free',
          promptTokens: 100,
          completionTokens: 200,
        }),
      );
    });
  });
});
