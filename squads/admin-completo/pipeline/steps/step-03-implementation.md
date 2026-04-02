---
execution: inline
agent: sofia-sintese
model_tier: powerful
outputFile: squads/admin-completo/output/action-plan.md
---

# Step 03: Síntese & Implementação

## Context Loading

- Todos os relatórios de agentes em `squads/admin-completo/output/`
- `squads/admin-completo/pipeline/data/research-brief.md`
- `squads/admin-completo/pipeline/data/quality-criteria.md`

## Instructions

### Process

1. **Sofia Síntese** cruza os 4 relatórios
2. Deduplica achados, resolve contradições
3. Cria plano de ação priorizado por impacto x esforço
4. Agrupa ações por arquivo
5. Executa implementação seguindo o plano

### Áreas de Implementação

1. Backend: `role` no login/register, endpoint updateRole, broadcast schema fix
2. Frontend: AdminRoute guard, admin layout, user detail page, wire onUserClick, broadcast payload
3. Documentação: CLAUDE.md com credenciais de teste

## Quality Criteria

- [ ] Plano de ação com priorização
- [ ] Ações agrupadas por arquivo
- [ ] Implementação completa
- [ ] `tsc --noEmit` sem erros
- [ ] `npm test` passando
