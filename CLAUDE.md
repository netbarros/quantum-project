# CLAUDE.md — Quantum Project

## Behavioral Transformation SaaS · System 6 · Antigravity Edition

> **Leia este arquivo completo antes de qualquer ação no repositório.**

---

## Visão Geral

**Quantum Project** é uma plataforma SaaS de transformação comportamental movida por IA.
Guia usuários em uma jornada de 365 dias de evolução de identidade.

- **Repositório local**: C:/lotus/devocional
- **GitHub**: https://github.com/netbarros/quantum-project
- **Frontend**: Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Framer Motion
- **Backend**: Express + TypeScript · Prisma ORM · PostgreSQL · Redis
- **IA**: OpenRouter → Claude 3.5 Sonnet (primary) → GPT-4o-mini (fallback) → Static
- **Arquitetura**: 5-Agent Mesh (ContentAgent · PersonalizationAgent · ProgressAgent · NotificationAgent · MonetizationAgent)

---

## Documentação obrigatória (ler antes de mudanças arquiteturais)

```
docs/BLUEPRINT_V2.md          → design system, tokens --q-*, animações, padrões de componente
docs/BLUEPRINT.md             → blueprint original (referência histórica)
docs/AGENTS.md                → convenções TypeScript, React, Tailwind, Framer Motion, backend
docs/PREMIUM_SKILLS.md        → implementações de referência com código completo
docs/SDD.md                   → schema Prisma, contratos de API, tipos
docs/PHASES.md                → roadmap e status atual de cada fase
docs/QUANTUM_DESIGN_SYSTEM.md → design system completo extraído das telas reais
docs/PR-00.md                 → pull request principal
docs/PR-COMPLETE-COMPLEMENT-PR00.md → complemento do PR
.cursor/rules/quantum.mdc     → regras automáticas do Cursor
```

---

## Estado Atual do Projeto

### ✅ Funciona (confirmado pelas screenshots)

- Auth JWT completo (login/register/refresh)
- Onboarding 6 steps com cards visuais + progress bar
- Profile Reveal com cosmic orb fotográfico
- Paywall narrativo (orb com score, timeline Dia 7→365)
- Checkout com order bump (UI implementada)
- Design system visual (paleta, fontes, componentes)

### 🔴 Bugs Críticos P1 (corrigir ANTES de qualquer nova feature)

1. **Score = 0 pts** → ProgressAgent não conectado ao `POST /api/session/:id/complete`
2. **History vazia** → `GET /api/sessions/history` não retorna dados ou não implementado
3. **Navbar no onboarding** → adicionar guard `if (pathname.startsWith('/onboarding')) return null`

### 🟡 Fases Pendentes

- **Fase 7**: NotificationAgent + PWA Push Notifications + Settings page + Streak Freeze
- **Fase 8**: PersonalizationAgent (análise comportamental) + Journal + Admin Panel
- **Fase 9**: Redis rate limiting + auditoria segurança + testes + Lighthouse PWA ≥ 90

---

## Comandos

### Desenvolvimento (Full Stack)

```bash
# Todos os serviços (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# Backend apenas
cd backend && npm run dev          # tsx watch mode na porta 3001

# Frontend apenas
cd frontend && npm run dev          # Next.js dev server na porta 3000
```

### Banco de Dados

```bash
cd backend
npx prisma migrate dev             # Rodar migrations em dev
npx prisma migrate deploy          # Rodar migrations em produção
npx prisma generate                # Gerar Prisma client
npx prisma studio                  # Abrir Prisma Studio GUI
npm run prisma:seed                # Seed com dados iniciais
```

### Testes

```bash
# Backend
cd backend && npm test             # Vitest once
cd backend && npm run test:watch   # Vitest watch mode

# Frontend E2E
cd frontend && npm run test:e2e    # Playwright
```

### Build & Deploy

```bash
# Backend
cd backend && npm run build        # TypeScript → dist/
cd backend && npm start            # Rodar código compilado

# Frontend
cd frontend && npm run build       # Next.js production build
cd frontend && npm run lint        # ESLint check
```

---

## Arquitetura

### Estrutura do Monorepo

```
quantum-project/
├── frontend/              # Next.js 16 PWA
│   ├── src/app/           # App Router — route groups (auth), (protected)
│   ├── src/components/    # Componentes organizados por domínio
│   ├── src/hooks/         # React Query hooks para data fetching
│   ├── src/lib/           # Utilities (animations.ts, api.ts)
│   └── src/stores/        # Zustand global state
├── backend/               # Express API
│   ├── src/agents/        # Sistema de agentes (BaseAgent, AgentRegistry)
│   ├── src/controllers/   # Route handlers
│   ├── src/middleware/    # Auth, rate limiting, validation
│   ├── src/routes/        # Definições de rotas da API
│   ├── src/services/      # AIGateway, TokenTracker, PushNotification
│   └── prisma/            # Schema, migrations, seed.ts
└── docs/                  # Toda a documentação do projeto
```

### Sistema de Agentes (PicoClaw v2)

Todos os agentes estendem `BaseAgent` e se comunicam via `AgentRegistry`.
**NUNCA chamar agentes diretamente — sempre usar o registry.**

```typescript
// BaseAgent.ts
abstract class BaseAgent {
  abstract execute(message: AgentMessage): Promise<AgentMessage>;
  async communicate(
    targetAgent: string,
    message: Omit<AgentMessage, "sourceAgent" | "timestamp">,
  );
}

// AgentRegistry.ts — Singleton orchestrator
AgentRegistry.getInstance().dispatch(message); // Rotear mensagens entre agentes
AgentRegistry.getInstance().register(agent); // Registrar novo agente
```

**Agentes**: ContentAgent (geração de sessão) · PersonalizationAgent (análise comportamental) · ProgressAgent (consciousnessScore/levels/streak) · NotificationAgent (PWA push) · MonetizationAgent (enforcement de subscription).

### AI Gateway

```typescript
// AIGateway.ts — Sempre usar este serviço, nunca chamar OpenRouter diretamente
AIGateway.generateContent(input); // Retorna AIResponse com fallback automático

// Cadeia de fallback: Claude 3.5 Sonnet → GPT-4o-mini → Conteúdo Estático
```

### Frontend Data Flow

```
Components → Hooks (React Query) → API Client → Backend API
                ↓
            Zustand (auth, session state)
```

### Route Groups

**Frontend** (Next.js route groups):

- `(auth)/` — Login, register (sem navbar)
- `(protected)/` — Todas as páginas autenticadas (com Navbar)
  - `dashboard/` · `session/` · `profile/` · `settings/` · `admin/`

**Backend** (prefixos de rota):

- `/api/auth/*` — Autenticação
- `/api/session/*` — Sessões diárias
- `/api/progress/*` — Progresso do usuário
- `/api/notifications/*` — Push notifications
- `/api/settings/*` — Preferências do usuário
- `/api/admin/*` — Operações admin (requer role ADMIN)

---

## Regras Absolutas — Design System (System 6)

### Fontes (OBRIGATÓRIO)

```
Instrument Serif (italic) → direction, reflection, affirmation, preços, headlines de conteúdo
DM Sans                   → UI, labels, botões, body text, metadata
Pacifico                  → logo "Quantum" + título "Seu Espaço"
NUNCA                     → Inter, Roboto, Arial, system-ui em textos visíveis
```

### Cores (NUNCA hex hardcoded — sempre tokens)

```css
/* Backgrounds */
--q-bg-void: #080810 /* Pure space black */ --q-bg-depth: #0a0a14
  /* App shell */ --q-bg-surface: #111120 /* Cards base */
  --q-bg-raised: #181828 /* Elevated */ /* Accent — Consciousness Purple */
  --q-accent-7: #7c3aed /* CTAs, botões */ --q-accent-8: #8b5cf6
  /* Primary accent */ --q-accent-9: #a78bfa /* Hover states */ /* Text */
  --q-text-primary: #f0f0fa --q-text-secondary: #8b8ba8
  --q-text-tertiary: #5a5a6e --q-text-accent: #a78bfa /* Labels de input */
  /* Borders */ --q-border-default: rgba(255, 255, 255, 0.08)
  --q-border-accent: rgba(124, 58, 237, 0.65);
```

### Animações (sempre via `/lib/animations.ts`, nunca inline)

```typescript
import { VARIANTS, TRANSITIONS } from '@/lib/animations';

// Page enter
<motion.div
  variants={VARIANTS.page}
  initial="initial"
  animate="animate"
  exit="exit"
/>

// Cards com stagger
<motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} />
```

### Padrão de Botão (SEMPRE incluir whileTap)

```typescript
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
  className="h-12 rounded-full bg-[var(--q-accent-8)] text-white font-medium"
>
```

---

## Regras Absolutas — TypeScript

```
✅ strict mode SEMPRE (tsconfig: "strict": true)
✅ Sem any — usar unknown + type guards
✅ Sem @ts-ignore — usar proper type guards
✅ Return types explícitos em funções públicas
✅ Todos os API responses tipados via src/types/
❌ NUNCA console.log em produção — usar logger estruturado (pino/winston)
```

---

## Regras Absolutas — React / Next.js

```
✅ Server Components por padrão (App Router)
✅ 'use client' apenas onde necessário (interatividade, hooks)
✅ React Query para TODO server state
✅ Zustand apenas para client state (auth, UI preferences)
✅ AnimatePresence em TODAS as trocas de tela
✅ Suspense boundaries com skeletons específicos (nunca spinner genérico)
❌ NUNCA useEffect + fetch — usar useQuery
❌ NUNCA fetch direto em componentes — sempre via hooks em src/hooks/
```

---

## Regras Absolutas — Backend

```
✅ Zod validation em 100% dos endpoints (via middleware)
✅ Try/catch em todos os async handlers
✅ Erros estruturados: { error: { code, message, details? } }
✅ Prisma transactions para operações multi-tabela
✅ Rate limiting via Redis em endpoints sensíveis
❌ NUNCA queries Prisma em middleware — apenas em controllers/services
❌ NUNCA expor stack traces em produção
❌ NUNCA OpenRouter API key no frontend bundle
```

---

## API Client

```typescript
// src/lib/api.ts — Instância Axios centralizada com interceptors
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Interceptor de response: refresh token automático em 401
```

---

## Environment Setup

```bash
# backend/.env
DATABASE_URL="postgresql://quantum:password@localhost:5432/quantum_project"
REDIS_URL="redis://:redispass@localhost:6379"
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
OPENROUTER_API_KEY="your-openrouter-key"
VAPID_PUBLIC_KEY="web-push-public"
VAPID_PRIVATE_KEY="web-push-private"
VAPID_EMAIL="mailto:admin@quantumproject.app"
PORT=3001
NODE_ENV=development

# frontend/.env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="web-push-public"
```

---

## OpenSquad — Squads Configurados

Este projeto usa [OpenSquad](https://github.com/renatoasse/opensquad) para orquestração de agentes de IA.

```bash
# Executar em ordem:
/opensquad run squad-correcoes-criticas    # P1 bugs
/opensquad run squad-fase-7-retention      # Fase 7
/opensquad run squad-fase-8-admin          # Fase 8
/opensquad run squad-fase-9-producao       # Fase 9
```

---

## Diretiva Final

**awareness → reflection → action → reinforcement → identity shift**

Este não é um app de conteúdo. É um motor de transformação comportamental adaptativo.
Cada linha de código serve à missão: mudar quem o usuário é.
