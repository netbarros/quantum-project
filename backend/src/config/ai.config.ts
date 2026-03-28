export const AI_CONFIG = {
  primaryModel: 'anthropic/claude-3.5-sonnet',
  fallbackModel: 'openai/gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1200,
  baseUrl: 'https://openrouter.ai/api/v1',
  retryAttempts: 2,
  retryDelayMs: 1000,
  costPerToken: {
    'anthropic/claude-3.5-sonnet': { input: 0.000003, output: 0.000015 },
    'openai/gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  },
} as const;
