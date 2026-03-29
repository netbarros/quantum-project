# Matriz de rastreabilidade PR-00 / PR-COMPLEMENT ↔ código

Legenda: **ok** implementado e testável | **gap** em aberto | **N/A** escopo explícito diferente

| ID | Requisito (doc) | Evidência no repo | Status | Como validar |
|----|-----------------|-------------------|--------|--------------|
| AUTH-1 | POST register/login/refresh | `backend/src/routes/auth.routes.ts` prefix `/api/auth` | ok | Teste Vitest auth / manual |
| AUTH-2 | Refresh httpOnly (PR-00) | Tokens em localStorage | N/A | Ver [docs/AUTH-REFRESH-DECISION.md](AUTH-REFRESH-DECISION.md) |
| SESS-1 | GET `/api/session/daily` + complete | `session.routes.ts`, `session.controller.ts` | ok | Teste API + Playwright |
| SESS-2 | Limite IA free 3/dia | `evaluateAiCallGate` + controller cache miss | ok | Vitest `rateLimiter.gate` |
| SESS-3 | Gate dia 8 free | `MonetizationAgent` | ok | Vitest monetização |
| SESS-4 | Stream daily | Não implementado | N/A* | Fora do MVP; reativar sob demanda |
| HIST-1 | Histórico free 7 “dias de jornada” | `getHistory` filtro `day` | ok | Vitest histórico |
| FAV-1 | Favoritos limitados free (PR-00 7.7) | `toggleFavorite` max 5 | ok | Vitest / manual |
| ADM-1 | Rotas admin só ADMIN | `admin.middleware.ts` | ok | Vitest + 403 sem role |
| ADM-2 | Analytics/costs | `admin.controller.ts` | ok | Manual com admin |
| INS-1 | GET `/api/analytics/insights` | `getInsights` + `AuthRequest` | ok | Manual / API |
| AGT-1 | ContentAgent via Registry | `app.ts` register + `session.controller` dispatch | ok | Código + logs `correlationId` |
| INF-1 | Redis compose | `docker-compose.yml` serviço redis | ok | Opcional em runtime |
| INF-2 | Traefik | Não no compose dev | N/A | Produção / compose separado |
| PWA | SW + manifest | `frontend/public/sw.js`, `manifest.json` | ok | Manual instalação |

\* Registrar no backlog se o contrato PR-00 exigir SSE/stream obrigatório.
