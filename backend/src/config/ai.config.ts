export interface ModelConfig {
  id: string;
  label: string;
  maxRetries: number;
  timeoutMs: number;
}

const BASE_CHAIN: ModelConfig[] = [
  {
    id: 'openrouter/free',
    label: 'openrouter-auto-free',
    maxRetries: 1,
    timeoutMs: 15000,
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    label: 'deepseek-v3-free',
    maxRetries: 2,
    timeoutMs: 20000,
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    label: 'llama4-maverick-free',
    maxRetries: 1,
    timeoutMs: 20000,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    label: 'llama33-70b-free',
    maxRetries: 1,
    timeoutMs: 15000,
  },
];

const PAID_FALLBACK: ModelConfig = {
  id: 'openai/gpt-4o-mini',
  label: 'gpt4o-mini-paid',
  maxRetries: 1,
  timeoutMs: 30000,
};

export const MODEL_CHAIN: ModelConfig[] = [
  ...BASE_CHAIN,
  ...(process.env.OPENROUTER_ALLOW_PAID === 'true' ? [PAID_FALLBACK] : []),
];

export const AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 1200,
  baseUrl: 'https://openrouter.ai/api/v1',
  retryDelayMs: 1000,
  costPerToken: {
    'openrouter/free': { input: 0, output: 0 },
    'deepseek/deepseek-chat-v3-0324:free': { input: 0, output: 0 },
    'meta-llama/llama-4-maverick:free': { input: 0, output: 0 },
    'meta-llama/llama-3.3-70b-instruct:free': { input: 0, output: 0 },
    'openai/gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
  } as Record<string, { input: number; output: number }>,
} as const;
