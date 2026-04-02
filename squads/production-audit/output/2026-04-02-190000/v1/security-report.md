# Security Report — Hugo Hardening

## Mudanças Implementadas

### 1. JWT httpOnly Cookie ✅
- `auth.controller.ts`: setRefreshCookie() com httpOnly, Secure (prod only), SameSite=strict
- Cookie path restricted to /api/auth
- MaxAge: 7 days (matches JWT_REFRESH_EXPIRES_IN)
- refresh() reads from cookie first, fallback to body for backward compat

### 2. cookie-parser ✅
- `app.ts`: `app.use(cookieParser())` added before routes

### 3. Helmet CSP ✅ (production only)
- Production: script-src 'self', style-src 'self' 'unsafe-inline', connect-src 'self' + APP_URL, object-src 'none', frame-src 'none'
- HSTS: maxAge 31536000, includeSubDomains, preload
- Development: CSP disabled (to avoid breaking HMR)

### 4. CORS Dynamic ✅
- Production: only APP_URL env var
- Development: adds localhost:3000, 127.0.0.1:3000

### 5. Redis Client ✅
- `services/redis.ts`: singleton with retry strategy (5 attempts, exp backoff)
- Graceful degradation: getRedis() returns null if disconnected
- isRedisAvailable() check

### 6. .env.example Updated ✅
- OPENROUTER_ALLOW_PAID, REDIS_URL added

## Pending (deferred to future)
- Rate limiter Redis store migration (requires ioredis + rate-limit-redis npm install in Docker)
- Zod validate() middleware application to remaining 4 routes
