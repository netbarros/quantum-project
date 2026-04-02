# Relatório — Carla Contracts 📋

## Contract Alignment Audit (2026-04-02)

### 1. Auth Contract — Login/Register

| Field | Backend | Frontend | Alinhado? |
|-------|---------|----------|-----------|
| user.id | ✅ login + register | ✅ User.id | ✅ |
| user.email | ✅ login + register | ✅ User.email | ✅ |
| user.name | ✅ login + register | ✅ User.name | ✅ |
| user.role | ✅ login + register | ✅ User.role | ✅ |
| user.onboardingComplete | ✅ login | ✅ User.onboardingComplete | ✅ |
| user.isPremium | ✅ login | ✅ User.isPremium | ✅ |
| user.level | ✅ login | ✅ User.level | ✅ |
| accessToken | ✅ | ✅ AuthResponse | ✅ |
| refreshToken | ✅ | ✅ AuthResponse | ✅ |

**Status:** ✅ TOTALMENTE ALINHADO

### 2. Broadcast Contract

| Field | Backend (esperado) | Frontend (enviado) | Alinhado? |
|-------|-------------------|-------------------|-----------|
| type | Enum 4 opções | string | ⚠️ Funcional |
| title | min 3, max 100 | Validado client-side | ✅ |
| body | min 10, max 500 | Validado client-side | ✅ |
| broadcast | boolean opcional | Sempre true | ✅ |
| userFilter | enum opcional | string ou undefined | ✅ |

**Status:** ✅ FUNCIONALMENTE ALINHADO

### 3. User Detail Contract

Todos os 16 campos (user + contents + usages + notifications) perfeitamente alinhados entre backend Prisma response e frontend UserDetail interface.

**Status:** ✅ TOTALMENTE ALINHADO

### 4. Role Update Contract

| Field | Backend | Frontend | Alinhado? |
|-------|---------|----------|-----------|
| role | Enum USER/ADMIN | Toggle string | ✅ |
| Self-demotion error | 400 + "próprio" | Catch + display | ✅ |

**Status:** ✅ TOTALMENTE ALINHADO

### 5. Premium Update Contract

| Field | Backend | Frontend | Alinhado? |
|-------|---------|----------|-----------|
| isPremium | boolean required | boolean toggle | ✅ |
| premiumUntil | datetime optional | Não enviado | ✅ (opcional) |

**Status:** ✅ TOTALMENTE ALINHADO

## Resumo

| Contrato | Status |
|----------|--------|
| Auth | ✅ ALINHADO |
| Broadcast | ✅ ALINHADO |
| User Detail | ✅ ALINHADO |
| Role Update | ✅ ALINHADO |
| Premium Update | ✅ ALINHADO |

**Achados críticos:** Nenhum blocker. Todos os contratos production-ready.
**Melhoria opcional:** Usar enum TypeScript no broadcast type para type-safety.
