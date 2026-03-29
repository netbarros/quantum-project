# Runbook manual pós-implementação (validação E2E)

## Pré-requisitos

- Node 20+
- Docker (opcional: Postgres + Redis via Compose)

## 1. Subir infra

```bash
docker compose up -d postgres redis
```

Defina `DATABASE_URL` em `backend/.env` apontando para o Postgres local (porta publicada no compose, ex.: `5432`).

Opcional: `REDIS_URL=redis://:redispass@localhost:6379` se for testar integração futura (o backend inicia sem Redis).

## 2. Migrações e seed

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

Admin seed: `system@quantumproject.app` / `quantum123` (bcrypt rounds 12).

## 3. API

```bash
npm run dev
```

- Health: `GET http://localhost:3001/health`
- Registrar usuário comum; completar onboarding via `POST /api/onboarding`.
- `GET /api/session/daily` com Bearer: cache miss após 3 usos IA no mesmo dia (free) deve retornar **429** com `upgradeRequired`.
- Usuário com `currentDay > 7` e não premium: **402** com `paywallRequired`.
- `GET /api/sessions/history`: free vê no máximo janela de 7 dias de jornada (`day >= currentDay - 6`).
- `POST /api/sessions/:id/favorite`: free limitado a 5 favoritos (**403** `FAVORITES_LIMIT`).
- Rotas `/api/admin/*` e `POST /api/notifications/send`: apenas **403** se JWT não for role `ADMIN`.

## 4. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL=http://localhost:3001/api` (ou rewrites no Docker).

Fluxo sugerido: registro → onboarding → sessão → dashboard → `/plans` upgrade demo.

## 5. Testes automatizados

```bash
cd ../backend && npm test
cd ../frontend && npx playwright install chromium   # primeira vez
# Com backend (API) e frontend em execução:
cd ../frontend && npm run test:e2e
```

Na CI (GitHub Actions), o workflow `.github/workflows/ci.yml` roda `npm test` (backend) e `npm run build` (frontend). Os testes Playwright exigem stack local ou job dedicado com Postgres + servidores.

Ver scripts em `package.json` de cada pacote.
