---
execution: inline
agent: fabio-frontend
outputFile: squads/personalization-integration/output/frontend-changes.md
---

# Step 03: Frontend — Broadcast Page + Recharts Migration

## Context Loading

Carregar antes de executar:
- `squads/personalization-integration/pipeline/data/research-brief.md` — gaps de frontend
- `frontend/src/app/(protected)/admin/page.tsx` — referência de padrão visual (167 linhas)
- `frontend/src/app/(protected)/admin/costs/page.tsx` — chart manual a migrar (153 linhas)
- `frontend/src/components/admin/AdminStatCard.tsx` — componente reutilizável (72 linhas)
- `frontend/src/lib/animations.ts` — variants e transitions
- `backend/src/routes/admin.routes.ts` — endpoint POST /admin/broadcast (confirmação)
- `backend/src/controllers/admin.controller.ts` — sendNotification shape (linhas 251+)

## Instructions

### Process

1. **Criar admin/broadcast/page.tsx**:
   - Layout: pageEnter variant, título "Broadcast" em DM Sans
   - Form com 4 seções:
     a. Select tipo de notificação (4 opções NotificationType)
     b. Input título (text, max 100 chars)
     c. Textarea corpo (max 500 chars)
     d. Select filtro de destinatários (all/premium/free/por level)
   - Preview card mostrando como a notificação aparece (design de notification card)
   - Botão "Enviar Notificação" com confirmação antes de enviar
   - Estados: idle, sending (loading), success, error
   - Animações: cardReveal para seções, whileTap em botão

2. **Criar hook useBroadcast**:
   - Em hooks/useAdmin.ts (criar se não existir)
   - useMutation para POST /api/admin/broadcast
   - Payload: { type, title, body, userFilter }

3. **Migrar costs chart para Recharts**:
   - Em admin/costs/page.tsx, substituir barras motion.div
   - Usar AreaChart com gradient fill usando --q-accent-8
   - XAxis com dates, YAxis com valores em dólar
   - Tooltip estilizado com --q-bg-surface + --q-border-default

4. **Migrar streak chart para Recharts**:
   - Em admin/page.tsx, substituir streak bars
   - Usar BarChart com 5 barras (ranges)
   - Cores accent, border radius nas barras

5. **Documentar mudanças**: Salvar relatório com arquivos criados/modificados.

## Output Format

```markdown
# Frontend Changes — Relatório

## Arquivos Criados
- frontend/src/app/(protected)/admin/broadcast/page.tsx — Página de broadcast
- frontend/src/hooks/useAdmin.ts — Hook useBroadcast

## Arquivos Modificados
- frontend/src/app/(protected)/admin/costs/page.tsx — Recharts AreaChart
- frontend/src/app/(protected)/admin/page.tsx — Recharts BarChart

## Design System Compliance
- [ ] Tokens --q-* em todas as cores
- [ ] Instrument Serif para títulos
- [ ] DM Sans para UI
- [ ] whileTap em botões
- [ ] pageEnter na página nova
```

## Output Example

```markdown
# Frontend Changes — Relatório

## Arquivos Criados

### admin/broadcast/page.tsx (185 linhas)
- Form completo com select tipo, input título, textarea body, filtro destinatários
- Preview card com design de notificação
- Confirmação antes de envio via window.confirm ou modal
- Estados: idle/sending/success/error com feedback visual
- Animações: pageEnter, cardReveal, whileTap

### hooks/useAdmin.ts (28 linhas)
- useBroadcast: mutation para POST /api/admin/broadcast

## Arquivos Modificados

### admin/costs/page.tsx
- Barras motion.div → Recharts AreaChart
- Gradient fill com --q-accent-8
- Tooltip com --q-bg-surface

### admin/page.tsx
- Streak bars → Recharts BarChart
- 5 barras com cores accent

## Design System: ✅ Compliant
```

## Veto Conditions

Rejeitar e refazer se:
1. Broadcast page não segue padrão visual das outras páginas admin
2. Charts Recharts não usam tokens do design system

## Quality Criteria

- [ ] Broadcast page funcional com form completo
- [ ] useBroadcast hook com React Query mutation
- [ ] AreaChart no costs com gradient e tooltip estilizado
- [ ] BarChart no dashboard para streak distribution
- [ ] Tokens --q-* em todos os novos componentes
- [ ] whileTap em todos os botões
- [ ] pageEnter na página broadcast
- [ ] Mobile-first layout
