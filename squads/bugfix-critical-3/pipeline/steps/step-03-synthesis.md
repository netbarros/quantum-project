---
execution: inline
agent: sofia-sintese
inputFile: squads/bugfix-critical-3/output/investigation-reports.md
outputFile: squads/bugfix-critical-3/output/action-plan.md
---

# Step 03: Síntese & Plano de Ação

## Context Loading

Carregar antes de executar:
- `squads/bugfix-critical-3/output/lia-layout-report.md` — Relatório UX
- `squads/bugfix-critical-3/output/artur-arquitetura-report.md` — Relatório Arquitetura
- `squads/bugfix-critical-3/output/dante-duvida-report.md` — Relatório Devil's Advocate
- `squads/bugfix-critical-3/output/pietra-premium-report.md` — Relatório Freemium
- `squads/bugfix-critical-3/output/teo-tokens-report.md` — Relatório Design
- `squads/bugfix-critical-3/output/eva-extremo-report.md` — Relatório E2E
- `squads/bugfix-critical-3/pipeline/data/design-system-spec.md` — Referência de design

## Instructions

### Process

1. **Ler todos os 6 relatórios** em sequência. Anotar cada achado único.
2. **Deduplicar**: Se Lia e Artur encontraram o mesmo bug (ex: cache não invalidado), manter a versão com evidência mais forte. Citar ambos agentes como fonte.
3. **Resolver contradições**: Se Dante questiona algo que outro agente confirmou, verificar evidência. Se inconclusivo, apresentar ambos.
4. **Classificar cada achado**:
   - 🔴 BUG — causa direta de mau funcionamento
   - 🟡 IMPROVEMENT — melhoria que agrega valor
   - 🔵 INVESTIGATION — precisa mais dados
   - 🟢 OK — confirmado funcionando
5. **Criar matriz de prioridade**: impacto (Alto/Médio/Baixo) × esforço (5min/30min/1h+)
6. **Agrupar ações por arquivo**: para cada arquivo a modificar, listar todas as ações com linha e código
7. **Incluir design specs**: Para componentes novos (history cards, empty states, score delta), incluir a spec completa do Teo
8. **Gerar plano de ação final**: Checklist ordenada por prioridade

## Output Format

```markdown
# Plano de Ação — Bugfix Critical 3

## Sumário Executivo
{2-3 frases sobre o diagnóstico geral}

## Matriz de Prioridade

| # | Ação | Bug | Tipo | Impacto | Esforço | Prioridade | Fonte |
|---|------|-----|------|---------|---------|------------|-------|
| 1 | ... | 1 | BUG | Alto | 5min | P1 | Lia + Artur |

## Ações por Arquivo

### {arquivo 1}
- [ ] Linha {N}: {ação} — {motivo} (fonte: {agente})

### {arquivo 2} (CRIAR)
- [ ] {ação completa} — {motivo} (fonte: {agente})

## Design Specs (Teo Tokens)

### History Card
{spec completa}

### Empty State
{spec completa}

### Score Delta Animation
{spec completa}

## Test Cases Prioritários (Eva Extremo)

| TC | Cenário | Status Esperado |
|----|---------|-----------------|
| TC1 | ... | ... |

## Hipóteses Pendentes (Dante Dúvida)

| Hipótese | Classificação | Como Verificar |
|----------|---------------|----------------|
| H1 | CRITICAL | ... |
```

## Output Example

```markdown
# Plano de Ação — Bugfix Critical 3

## Sumário Executivo
O Bug 1 (score 0 pts) é causado por falta de invalidação do cache React Query
após session complete — o perfil mostra dados stale. O Bug 2 requer implementação
do frontend (hook + page) usando o endpoint backend existente. O Bug 3 está funcional.

## Matriz de Prioridade

| # | Ação | Bug | Tipo | Impacto | Esforço | Prioridade | Fonte |
|---|------|-----|------|---------|---------|------------|-------|
| 1 | Invalidar cache ["progress"] no onSuccess | 1 | 🔴 BUG | Alto | 5min | P1 | Lia+Artur |
| 2 | Criar useSessionHistory hook | 2 | 🔴 BUG | Alto | 30min | P1 | Lia |
| 3 | Reescrever history/page.tsx com cards | 2 | 🔴 BUG | Alto | 1h | P1 | Teo+Lia |
| 4 | Tipar CompleteSessionResponse | 1 | 🟡 IMP | Médio | 10min | P2 | Artur |
| 5 | Empty state motivacional /history | 2 | 🟡 IMP | Médio | 15min | P2 | Teo+Pietra |
| 6 | Score delta animation | UX | 🟡 IMP | Médio | 30min | P3 | Teo |
| 7 | Soft paywall no /history | UX | 🟡 IMP | Médio | 45min | P3 | Pietra |

## Ações por Arquivo

### `frontend/src/hooks/useSession.ts`
- [ ] Linha 52: Adicionar `queryClient.invalidateQueries({ queryKey: ["progress"] })`
  no onSuccess de useCompleteSession (fonte: Lia + Artur)

### `frontend/src/hooks/useSessionHistory.ts` (CRIAR)
- [ ] Novo hook com useQuery, queryKey ["sessions", "history"]
  Tipar response como SessionHistoryItem[] (fonte: Lia + Artur)

### `frontend/src/app/(protected)/history/page.tsx` (REESCREVER)
- [ ] Substituir placeholder por implementação com 3 estados
  Design spec do Teo: cardReveal + stagger + empty motivacional (fonte: Teo + Lia)
```

## Veto Conditions

Rejeitar e refazer se:
1. O plano não cobre os 3 bugs
2. Ações sem arquivo:linha específico (genéricas demais)

## Quality Criteria

- [ ] Todos os 6 relatórios incorporados
- [ ] Achados deduplicados com atribuição de fonte
- [ ] Matriz de prioridade completa
- [ ] Ações agrupadas por arquivo com linha exata
- [ ] Design specs do Teo incluídas
- [ ] Test cases da Eva listados
- [ ] Hipóteses do Dante documentadas
