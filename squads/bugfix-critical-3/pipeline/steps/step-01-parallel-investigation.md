---
execution: subagent
agent: all-parallel
model_tier: powerful
outputFile: squads/bugfix-critical-3/output/investigation-reports.md
---

# Step 01: Investigação Paralela (6 Agentes)

## Context Loading

Cada agente carrega antes de executar:
- `squads/bugfix-critical-3/pipeline/data/research-brief.md` — Estado completo do codebase
- `squads/bugfix-critical-3/pipeline/data/quality-criteria.md` — Convenções do projeto
- `squads/bugfix-critical-3/pipeline/data/anti-patterns.md` — Erros comuns
- `squads/bugfix-critical-3/pipeline/data/design-system-spec.md` — System 6 completo (apenas Teo)
- Código fonte relevante ao escopo de cada agente

## Instructions

### Process

1. **Despachar 6 agentes em paralelo** como subagents:
   - 🎨 Lia Layout → analisa data flow frontend (hooks → stores → components)
   - ⚙️ Artur Arquitetura → analisa contratos backend → frontend (types, shapes, Prisma)
   - 😈 Dante Dúvida → levanta hipóteses alternativas e edge cases
   - 💎 Pietra Premium → verifica gates freemium e monetização
   - 🎯 Teo Tokens → audita design system e propõe specs para componentes novos
   - 🧪 Eva Extremo → define test cases E2E e verifica fluxos

2. **Cada agente deve**:
   - Ler seu agent.md para instruções completas
   - Ler research-brief.md para contexto do codebase
   - Ler os arquivos de código relevantes ao seu escopo
   - Produzir relatório no formato definido em seu Output Examples
   - Salvar em `squads/bugfix-critical-3/output/{agent-id}-report.md`

3. **Foco de cada agente por bug**:

   **Bug 1 — Score 0 pts no perfil:**
   - Lia: traçar pipeline de dados completo (useProgress → profile/page)
   - Artur: verificar response shapes e contratos de tipo
   - Dante: hipóteses alternativas (primeiro acesso? cache? store não atualizado?)
   - Pietra: score é gated por tier? free users têm limitação?
   - Teo: spec para score delta animation e display
   - Eva: test cases para score persistence

   **Bug 2 — History placeholder:**
   - Lia: o que o hook deveria retornar e como o componente consome
   - Artur: response shape do endpoint history, paginação, filtros
   - Dante: e se zero sessões? e se 100 sessões? e se free tier?
   - Pietra: history soft paywall, limite de dias para free
   - Teo: spec completa para history cards, empty state, loading, skeleton
   - Eva: test cases para history rendering

   **Bug 3 — Session verification:**
   - Lia: fluxo de dados da sessão (useSession → SessionBlockReader)
   - Artur: endpoint daily session, content generation
   - Dante: e se sessão já completada? e se conteúdo vazio?
   - Teo: tipografia por bloco, affirmation fullscreen, micro-interações
   - Eva: test cases para 8 blocos progressivos

4. **Informar o usuário**: "6 agentes estão investigando em paralelo..."

## Output Format

Cada agente produz um relatório individual em:
`squads/bugfix-critical-3/output/{agent-id}-report.md`

Formato de cada relatório:
```markdown
# Relatório — {Agent Name}

## Bug 1 — Score 0 pts
{achados específicos com arquivo:linha}

## Bug 2 — History Placeholder
{achados específicos com arquivo:linha}

## Bug 3 — Session Verification
{achados específicos com arquivo:linha}

## Recomendações
{ações sugeridas priorizadas}
```

O output consolidado referencia os 6 relatórios individuais:
```markdown
# Investigation Reports — Consolidado

## Relatórios Gerados
1. output/lia-layout-report.md
2. output/artur-arquitetura-report.md
3. output/dante-duvida-report.md
4. output/pietra-premium-report.md
5. output/teo-tokens-report.md
6. output/eva-extremo-report.md

## Status: COMPLETO
```

## Output Example

```markdown
# Investigation Reports — Consolidado

## Relatórios Gerados
1. output/lia-layout-report.md — UX & Data Flow (28 achados)
2. output/artur-arquitetura-report.md — Contratos & Tipos (15 achados)
3. output/dante-duvida-report.md — Hipóteses Alternativas (18 hipóteses)
4. output/pietra-premium-report.md — Freemium Gates (8 achados)
5. output/teo-tokens-report.md — Design Specs (12 specs)
6. output/eva-extremo-report.md — Test Cases (13 TCs)

## Status: COMPLETO — pronto para síntese
```

## Veto Conditions

Rejeitar e refazer se:
1. Algum agente não produziu relatório (arquivo ausente)
2. Algum relatório não cobre os 3 bugs

## Quality Criteria

- [ ] 6 relatórios individuais gerados
- [ ] Cada relatório cobre os 3 bugs
- [ ] Achados citam arquivo:linha do código fonte
- [ ] Teo inclui design specs completas para componentes novos
- [ ] Eva inclui test cases com Given/When/Then
- [ ] Dante inclui mínimo 5 hipóteses alternativas por bug
