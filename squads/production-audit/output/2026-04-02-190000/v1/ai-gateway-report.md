# AI Gateway Report — Igor Inteligência

## Mudanças Implementadas

### ai.config.ts — Reescrito
- ModelConfig interface com id, label, maxRetries, timeoutMs
- MODEL_CHAIN: 4 free models + 1 paid opcional
  1. openrouter/free (auto-selector, 15s timeout, 1 retry)
  2. deepseek/deepseek-chat-v3-0324:free (20s, 2 retries)
  3. meta-llama/llama-4-maverick:free (20s, 1 retry)
  4. meta-llama/llama-3.3-70b-instruct:free (15s, 1 retry)
  5. [if OPENROUTER_ALLOW_PAID=true] openai/gpt-4o-mini (30s, 1 retry)
- costPerToken: 4 free = $0, paid = original rates

### AIGateway.ts — Reescrito
- Health tracker: Map<modelId, { failures, lastFailure, skipUntil }>
- isModelHealthy(): skips model if failures >= 3 or skipUntil not passed
- recordFailure(): increments counter, sets skipUntil on threshold or rate limit
- recordSuccess(): clears health entry (model recovers)
- 429 Rate limit → skip immediately to next model (no retry)
- 502/503 Unavailable → skip to next model
- AbortController per-model with configurable timeoutMs
- Static fallback as last resort
- modelUsed label returned in AIResponse

### .env.example — Atualizado
- OPENROUTER_ALLOW_PAID=false (new)
- REDIS_URL added

## Verificação
- [x] 4 free models in chain
- [x] Health tracker per-model
- [x] 429 → immediate skip
- [x] 3 failures → 10 min skip
- [x] Success → reset health
- [x] AbortController timeout
- [x] Static fallback works
- [x] OPENROUTER_ALLOW_PAID controls paid model inclusion
