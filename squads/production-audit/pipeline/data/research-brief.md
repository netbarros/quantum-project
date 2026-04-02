# Research Brief — Production Audit v2

## Task 1: AI Gateway Free Model Chain

### Estado Atual (AIGateway.ts — 130 linhas)
- Classe estática com `generateContent()` e `callWithRetry()`
- 2 modelos hardcoded: claude-3.5-sonnet (primary) + gpt-4o-mini (fallback)
- Sem health tracking por modelo
- Sem handling de 429 (rate limit) — trata como erro genérico
- Sem logging de qual modelo foi usado (apenas no TokenTracker)
- Retry: 2 tentativas com delay fixo de 1000ms
- Static fallback: getStaticFallback(day) — 7 sessões + genérica

### ai.config.ts (13 linhas)
- primaryModel, fallbackModel, temperature 0.7, maxTokens 1200
- costPerToken para 2 modelos

### TokenTracker.ts (45 linhas)
- Loga: userId, modelUsed, tokens, cost na tabela Usage
- Calcula custo baseado em costPerToken

### Nova Arquitetura (especificada pelo usuário)
```
MODEL_CHAIN (ordem de prioridade):
1. openrouter/free — auto-selector OpenRouter
2. deepseek/deepseek-chat-v3-0324:free — melhor para agentes/código
3. meta-llama/llama-4-maverick:free — forte all-around
4. meta-llama/llama-3.3-70b-instruct:free — workhorse confiável
5. [OPCIONAL] openai/gpt-4o-mini — só se OPENROUTER_ALLOW_PAID=true

Health Tracker:
- Map<modelId, { failures, lastFailure, skipUntil }>
- Skip por 10 min após 3 falhas consecutivas (ou 1x 429)
- recordSuccess() reseta o contador
- isModelHealthy() checa skipUntil

Rate Limit (429):
- Detecta response.status === 429
- recordFailure com isRateLimit = true → skip imediato
- Loga e passa para próximo modelo

Logging:
- Cada request loga modelUsed na tabela Usage (já existe via TokenTracker)
- Logger.info com label do modelo em sucesso
- Logger.warn em skip/rate-limit
```

### Arquivos a Modificar
- `backend/src/services/AIGateway.ts` — rewrite completo
- `backend/src/config/ai.config.ts` — MODEL_CHAIN + costPerToken expandido
- `backend/.env.example` — OPENROUTER_ALLOW_PAID

## Task 2: Security (igual ao brief anterior)
- JWT httpOnly cookie: MISSING
- Zod: 6/10 controllers
- Helmet CSP: disabled
- CORS: hardcoded localhost
- Rate limiter: in-memory

## Task 3: Redis
- docker-compose: EXISTS (redis:7-alpine)
- ioredis: NOT INSTALLED
- Client: NOT CREATED
- Rate limiter: IN-MEMORY

## Task 4: Tests
- MISSING: NotificationAgent, ProgressAgent, PushNotificationService
- NEW: AI Gateway fallback chain (com mock dos 4 modelos free)
- Framework: vitest, pattern de mock existente em MonetizationAgent.test.ts

## Task 5: PWA
- PNG icons: 68-byte placeholders
- Manifest: OK mas PNGs inválidos
- Meta tags: verificar
- SW: manual, funcional
