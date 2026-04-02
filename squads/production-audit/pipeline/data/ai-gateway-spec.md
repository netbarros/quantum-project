# AI Gateway Spec — Free Model Chain

## ModelConfig Interface

```typescript
interface ModelConfig {
  id: string;       // OpenRouter model ID
  label: string;    // Human-readable label for logs
  maxRetries: number;
  timeoutMs: number;
}
```

## MODEL_CHAIN

```typescript
const MODEL_CHAIN: ModelConfig[] = [
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
  // Paid fallback — only if OPENROUTER_ALLOW_PAID=true
  ...(process.env.OPENROUTER_ALLOW_PAID === 'true' ? [{
    id: 'openai/gpt-4o-mini',
    label: 'gpt4o-mini-paid',
    maxRetries: 1,
    timeoutMs: 30000,
  }] : []),
];
```

## Health Tracker

```typescript
const modelHealth = new Map<string, {
  failures: number;
  lastFailure: number;
  skipUntil: number;
}>();

const SKIP_DURATION_MS = 10 * 60 * 1000; // 10 min skip
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
  }
  modelHealth.set(modelId, health);
}

function recordSuccess(modelId: string): void {
  modelHealth.delete(modelId);
}
```

## generateContent Flow

```
FOR each model in MODEL_CHAIN:
  IF !isModelHealthy(model.id): SKIP, log, continue
  TRY callOpenRouter(model.id, input, model.timeoutMs):
    recordSuccess(model.id)
    log success with model.label
    RETURN { content, modelUsed: model.label, isFree: true/false }
  CATCH:
    IF 429 (rate limit): recordFailure(isRateLimit=true), continue
    IF 502/503 (unavailable): recordFailure(isRateLimit=false), continue
    ELSE: recordFailure(isRateLimit=false), continue

RETURN getStaticFallback(input.day) // all models failed
```

## AIResponse Extended

```typescript
export interface AIResponse {
  content: ContentOutput | null;
  isFallback: boolean;
  modelUsed?: string;  // NEW: label do modelo que gerou
  isFree?: boolean;    // NEW: se é modelo gratuito
}
```

## .env.example Addition

```env
# AI Models — Free chain (default)
OPENROUTER_ALLOW_PAID=false  # true = enables GPT-4o-mini as paid fallback
```

## costPerToken Expansion (ai.config.ts)

```typescript
costPerToken: {
  'openrouter/free': { input: 0, output: 0 },
  'deepseek/deepseek-chat-v3-0324:free': { input: 0, output: 0 },
  'meta-llama/llama-4-maverick:free': { input: 0, output: 0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0, output: 0 },
  'openai/gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
}
```

## Key Behaviors
1. Rate limit (429) → skip modelo IMEDIATAMENTE (não retry)
2. 3 falhas consecutivas → skip por 10 min
3. Sucesso → reseta health (volta ao pool)
4. Modelos free custam $0 — TokenTracker loga 0 cost
5. GPT-4o-mini só entra no chain se OPENROUTER_ALLOW_PAID=true
6. Static content como último recurso (isFallback: true)
