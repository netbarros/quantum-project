---
execution: inline
agent: hugo-hardening
outputFile: squads/production-audit/output/security-report.md
---

# Step 02: Security Hardening + Redis Integration

## Context Loading
- `squads/production-audit/pipeline/data/research-brief.md`
- `backend/src/middleware/auth.middleware.ts`, `backend/src/controllers/auth.controller.ts`
- `backend/src/middleware/validation.middleware.ts`, `backend/src/middleware/rateLimiter.middleware.ts`
- `backend/src/app.ts`, `backend/src/config/index.ts`, `backend/package.json`

## Instructions
1. npm install ioredis rate-limit-redis cookie-parser + types
2. Redis client singleton (services/redis.ts)
3. JWT httpOnly cookie (auth.controller.ts)
4. cookie-parser in app.ts
5. Zod validate() nos 4 controllers faltantes
6. Helmet CSP habilitado
7. CORS APP_URL dinâmico
8. Rate limiter → Redis store with in-memory fallback

## Veto Conditions
1. Auth flow quebra
2. Rate limiter não funciona sem Redis

## Quality Criteria
- [ ] httpOnly cookie, Zod 100%, CSP, CORS, Redis, rate limiter
