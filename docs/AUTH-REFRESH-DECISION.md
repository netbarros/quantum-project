# Decisão: modelo de refresh token (PR-00 vs implementação)

## Situação atual (repositório)

- `accessToken` e `refreshToken` são devolvidos no JSON em registro/login.
- O cliente ([frontend/src/lib/api.ts](frontend/src/lib/api.ts)) guarda ambos em `localStorage` e renova via `POST /api/auth/refresh` com `refreshToken` no corpo.

## PR-00 — autenticação (seção 7.1)

- Refresh em cookie **httpOnly** + rotação de refresh.

## Decisão registrada

**Mantemos o modelo atual (localStorage + body)** neste ciclo de entrega E2E, pelos motivos:

1. O frontend já implementa interceptor de 401 com refresh; migrar para cookies exige `credentials: 'include'`, CORS `Access-Control-Allow-Credentials`, CSRF ou SameSite rigoroso, e alteração do `auth.controller` — escopo separado de “fechar gaps P0 de produto”.
2. A matriz [E2E-MATRIX.md](E2E-MATRIX.md) marca o item como **N/A** com remissão a este documento.

## Próximo passo (quando hardening for prioridade)

- Endpoint refresh que seta `Set-Cookie` httpOnly para refresh; rotação com invalidação de token anterior (idealmente com armazenamento Redis se `REDIS_URL` estiver configurado, alinhado ao [docker-compose.yml](../docker-compose.yml)).
