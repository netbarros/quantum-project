# Research Brief — Bugfix Critical 3

## Estado do Codebase (explorado 2026-04-02)

### Bug 1 — Perfil mostra 0 pts

**Backend: COMPLETO E CONECTADO**
- `backend/src/agents/ProgressAgent.ts` (194 linhas)
  - Handles `session_complete` message type
  - `handleSessionComplete()` lines 33-134:
    - Idempotency via `user.lastSessionDate`
    - Streak: continuation (+1), first session, gap penalty
    - Streak bonus +5 when streak >= 2
    - Exercise bonus +5
    - Score capped 0-1000
    - Level via `calculateLevel()`
    - Atomic transaction: User + Content + UserEvent
    - Returns: consciousnessScore, level, streak, currentDay, levelProgress, scoreDelta

- `backend/src/controllers/session.controller.ts` (324 linhas)
  - `completeSession()` lines 168-211
  - Dispatches `session_complete` via AgentRegistry (line 193)
  - Returns ProgressAgent payload to frontend (line 206)

- `backend/src/agents/AgentRegistry.ts` (31 linhas) — singleton orchestrator
- `backend/src/app.ts` line 27: `registry.register(new ProgressAgent())` — REGISTERED

**Frontend: SUSPEITO PRINCIPAL**
- `frontend/src/hooks/useProgress.ts` (60 linhas) — hook de progresso
- `frontend/src/app/(protected)/profile/page.tsx` — página de perfil
- `frontend/src/stores/progressStore.ts` — Zustand store
- Possível: hook não consome resposta do complete, ou store não atualiza

### Bug 2 — History é placeholder

**Backend: COMPLETO**
- `GET /api/sessions/history` em `session.routes.ts:12`
- Controller lines 213-248:
  - Fetches completed sessions
  - Returns: id, day, isCompleted, completedAt, isFavorite, content
  - Respects freemium tier (minHistoryDayForFreeTier)

**Frontend: PLACEHOLDER**
- `frontend/src/app/(protected)/history/page.tsx` (23 linhas)
  - Mostra spinning + texto "preparando..."
  - NÃO faz fetch de dados
- `useSessionHistory` hook: NÃO EXISTE
- Hooks disponíveis: useAuth, useJournal, useNotifications, useProgress, useSession, useSettings, useSubscription

### Bug 3 — Session page

**COMPLETO E FUNCIONAL**
- `frontend/src/app/(protected)/session/page.tsx` (122 linhas)
  - Uses useSession hook
  - Handles: loading, error, paywall, onboarding states
  - CompletionScreen on success
  - SessionBlockReader rendering

- `frontend/src/components/session/SessionBlockReader.tsx` (188 linhas)
  - 8 blocos: direction, explanation, reflection, action, question, affirmation, practice, integration
  - Progress bar, slide animations, fullscreen affirmation, reflection input
  - Navigation: back/advance/complete

### Arquivos Chave

| Arquivo | Linhas | Status |
|---------|--------|--------|
| `backend/src/agents/ProgressAgent.ts` | 194 | Completo |
| `backend/src/agents/BaseAgent.ts` | 38 | Completo |
| `backend/src/agents/AgentRegistry.ts` | 31 | Completo |
| `backend/src/controllers/session.controller.ts` | 324 | Completo |
| `backend/prisma/schema.prisma` | 175 | Completo |
| `frontend/src/hooks/useProgress.ts` | 60 | Existe |
| `frontend/src/hooks/useSession.ts` | 134 | Existe |
| `frontend/src/app/(protected)/history/page.tsx` | 23 | Placeholder |
| `frontend/src/app/(protected)/session/page.tsx` | 122 | Completo |
| `frontend/src/components/session/SessionBlockReader.tsx` | 188 | Completo |
| `frontend/src/lib/api.ts` | 83 | Completo |
| `frontend/src/lib/animations.ts` | 93 | Completo |

### Prisma Schema (campos relevantes)

**User**: consciousnessScore (Int, default 0), level (Level enum, default BEGINNER), streak (Int, default 0), lastSessionDate (DateTime?), currentDay (Int, default 1)

**Content**: userId_day unique index, isCompleted (Boolean), completedAt (DateTime?)

**UserEvent**: eventType (String), eventData (Json?) — stores scoreDelta, newScore, newStreak, newLevel
