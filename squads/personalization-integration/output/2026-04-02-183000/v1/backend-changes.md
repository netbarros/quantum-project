# Backend Changes — Gabi Gateway

## Arquivos Modificados

### 1. backend/src/types/ai.types.ts
- Adicionada `ContentAdjustments` interface (depthLevel, tone, contentLength, focusArea)
- `ContentInput` estendido com `adjustments?: ContentAdjustments`
- `AIResponse` estendido com `modelUsed?: string`

### 2. backend/src/controllers/session.controller.ts
- Adicionado bloco PersonalizationAgent dispatch ANTES do ContentAgent (try/catch)
- adjustments extraídos de `pResult.payload.adjustments`
- Passados no payload do ContentAgent
- Graceful degradation: log warn + continua sem adjustments se falhar

### 3. backend/src/agents/ContentAgent.ts
- Passa `modelUsed` do AIGateway response no createResponse

### 4. backend/src/services/AIGateway.ts
- `buildUserPrompt()` agora inclui bloco condicional "Personalization Adjustments"
- Se adjustments presente: depthLevel, tone, contentLength, focusArea no prompt
- Se ausente: prompt inalterado
