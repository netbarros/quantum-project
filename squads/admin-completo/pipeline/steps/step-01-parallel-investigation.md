---
execution: subagent
agent: all-parallel
model_tier: powerful
outputFile: squads/admin-completo/output/investigation-reports.md
---

# Step 01: Investigação Paralela (4 Agentes)

## Context Loading

Cada agente carrega antes de executar:
- `squads/admin-completo/pipeline/data/research-brief.md` — Estado do admin system
- `squads/admin-completo/pipeline/data/quality-criteria.md` — Convenções do projeto
- Código fonte relevante ao escopo de cada agente

## Instructions

### Process

1. **Despachar 4 agentes em paralelo**:
   - 🎨 Ana Admin → mapear cobertura funcional (endpoints vs telas, botões vs handlers)
   - ⚙️ Bruno Backend → auditar schemas Zod, response shapes, error handling
   - 📋 Carla Contracts → verificar alinhamento FE↔BE em todos os payloads
   - 🔐 Diego Guard → verificar guards de segurança em todas as camadas

2. **Cada agente deve**:
   - Ler seu agent.md para instruções
   - Ler research-brief.md para contexto
   - Produzir relatório com achados + recomendações
   - Salvar em `squads/admin-completo/output/{agent-id}-report.md`

3. **Foco por área**:
   - Admin dashboard completeness (5 páginas + user detail)
   - Broadcast endpoint schema alignment
   - AdminRoute guard coverage
   - Role management (novo endpoint + UI)
   - JWT role propagation (login/register)

## Quality Criteria

- [ ] 4 relatórios individuais gerados
- [ ] Achados citam arquivo:linha
- [ ] Recomendações com prioridade (P1/P2/P3)
