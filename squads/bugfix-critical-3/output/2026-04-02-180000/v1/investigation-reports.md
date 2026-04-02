# Investigation Reports — Consolidado

## Relatórios Gerados
1. output/lia-layout-report.md — UX & Data Flow (3 achados principais)
2. output/artur-arquitetura-report.md — Contratos & Tipos (3 achados, tabela comparativa)
3. output/dante-duvida-report.md — Pendente (agente ainda processando)
4. output/pietra-premium-report.md — Freemium Gates (3 achados, PaywallModal não usado)
5. output/teo-tokens-report.md — Design Specs (specs completas para history cards, score animation)
6. output/eva-extremo-report.md — Test Cases (15 TCs, 4 bugs confirmados)

## Convergência dos Agentes

### Bug 1 — Score 0 pts no Perfil
**Root Cause confirmada por 3 agentes (Lia + Artur + Eva):**
- `useSession.completeSession()` retorna `void` — payload do ProgressAgent descartado
- `session/page.tsx:handleComplete()` hardcoda `scoreDelta: 10`, `leveledUp: false`
- Profile busca score via GET /api/profile no mount mas NUNCA refaz fetch após completion
- CompletionScreen mostra dados fake mesmo em erro de rede (Eva TC13 P0)
- Pietra confirma: freemium NÃO é a causa

### Bug 2 — History Placeholder
**Confirmado por todos os 5 agentes:**
- `history/page.tsx` = 23 linhas de placeholder, zero data fetching
- `useSessionHistory` hook NÃO existe
- Backend GET /api/sessions/history FUNCIONA (com gate freemium de 7 dias para free)
- Teo entregou specs completas para HistoryCard, empty state, skeleton
- Pietra encontrou inconsistência: /api/progress retorna 40 dias sem filtro

### Bug 3 — Session Verification
**Funcional com issues menores:**
- 8 blocos progressivos OK, tipografia System 6 compliant (Teo confirma)
- Issues: whileHover faltando em CTAs (Teo), useState sem persistência no refresh (Eva TC12 P2)
- Dashboard font-family errada: var(--font-instrument) como base em vez de var(--font-dm-sans) (Teo bonus)

## Status: 5/6 COMPLETO (Dante pendente — achados suficientes para síntese)
