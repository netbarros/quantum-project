---
execution: inline
agent: igor-inteligencia
outputFile: squads/production-audit/output/ai-gateway-report.md
---

# Step 01: AI Gateway — Free Model Chain + Health Tracker

## Context Loading
- `squads/production-audit/pipeline/data/ai-gateway-spec.md` — especificação completa
- `squads/production-audit/pipeline/data/research-brief.md` — estado atual
- `backend/src/services/AIGateway.ts` (130 linhas) — código atual a substituir
- `backend/src/config/ai.config.ts` (13 linhas) — config atual
- `backend/src/services/TokenTracker.ts` (45 linhas) — tracker de custos
- `backend/src/types/ai.types.ts` — tipos

## Instructions

### Process
1. Ler ai-gateway-spec.md completamente — é a fonte de verdade para esta implementação
2. Reescrever ai.config.ts com MODEL_CHAIN, costPerToken expandido (4 free + 1 paid)
3. Reescrever AIGateway.ts: ModelConfig interface, health tracker (Map), isModelHealthy/recordFailure/recordSuccess, generateContent com chain iteration, AbortController per-model timeout
4. Estender AIResponse em ai.types.ts com modelUsed e isFree
5. Atualizar .env.example com OPENROUTER_ALLOW_PAID=false
6. Manter getSystemPrompt() e buildUserPrompt() inalterados (funcionam com qualquer modelo)
7. Verificar que TokenTracker funciona com novos model IDs

## Veto Conditions
1. TypeScript não compila
2. Static fallback não funciona quando todos os modelos falham

## Quality Criteria
- [ ] MODEL_CHAIN com 4 free + 1 paid opcional
- [ ] Health tracker implementado
- [ ] 429 → skip imediato
- [ ] Static fallback como último recurso
- [ ] AIResponse com modelUsed e isFree
- [ ] AbortController per-model timeout
