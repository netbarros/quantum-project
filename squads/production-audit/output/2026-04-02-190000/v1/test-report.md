# Test Report — Tiago Testes

## Test Suites Criadas

| Suite | Arquivo | Linhas | Test Cases |
|-------|---------|--------|------------|
| NotificationAgent | agents/NotificationAgent.test.ts | 390 | 28 |
| ProgressAgent | agents/ProgressAgent.test.ts | 523 | 18 |
| AIGateway | services/AIGateway.test.ts | 326 | ~10 |
| PushNotificationService | services/PushNotification.test.ts | 211 | ~7 |
| **TOTAL** | **4 arquivos** | **1,450** | **~63** |

## Cobertura por Área

### NotificationAgent (28 TCs)
- getNotificationType: 6 cenários (thresholds 0/1/2/3/5/7+ days)
- getNotificationCopy: 15 combos (5 levels × 3 types) — copy verification + name substitution
- execute dispatch: 5 cenários (DB create + event + push send)
- Edge cases: 6 (0 days, null subscription, missing user, unsupported type, tone, name fallback)

### ProgressAgent (18 TCs)
- Score: base +10, streak bonus +5, exercise bonus +5, full stack = 20
- Streak: continuation, first session, gap penalty
- Levels: BEGINNER→AWARE→CONSISTENT→ALIGNED→INTEGRATED transitions
- Idempotency: same-day returns alreadyCompleted
- Score caps: 0 and 1000
- Freeze: success + duplicate prevention
- Errors: unknown type, user not found

### AIGateway (~10 TCs)
- Chain: first success, first fail → second, all fail → static
- Health tracker: 429 skip, 3 failures skip 10min, success reset
- Timeout: AbortController
- OPENROUTER_ALLOW_PAID flag

### PushNotificationService (~7 TCs)
- send: success, 410 expired cleanup, 429 retry, generic error graceful
- generateVapidKeys: key pair generation
