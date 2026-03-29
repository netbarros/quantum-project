# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quantum Project** is a behavioral transformation SaaS platform powered by AI. It's a mobile-first PWA guiding users through a 365-day identity evolution journey.

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Express + TypeScript, Prisma ORM, PostgreSQL, Redis
- **AI Layer**: OpenRouter gateway with Claude/GPT fallback chain
- **Architecture**: 5-Agent Mesh (ContentAgent, PersonalizationAgent, ProgressAgent, NotificationAgent, MonetizationAgent)

---

## Commands

### Development (Full Stack)

```bash
# Start all services (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# Backend only
cd backend && npm run dev          # tsx watch mode on port 3001

# Frontend only
cd frontend && npm run dev       # Next.js dev server on port 3000
```

### Database

```bash
cd backend
npx prisma migrate dev             # Run migrations in dev mode
npx prisma migrate deploy           # Run migrations in production
npx prisma generate                 # Generate Prisma client
npx prisma studio                   # Open Prisma Studio GUI
npm run prisma:seed                 # Seed database with initial data
```

### Testing

```bash
# Backend tests
cd backend && npm test              # Run Vitest once
cd backend && npm run test:watch   # Run Vitest in watch mode

# Frontend E2E
cd frontend && npm run test:e2e    # Playwright tests
```

### Build & Deploy

```bash
# Backend
cd backend && npm run build        # TypeScript compilation to dist/
cd backend && npm start            # Run compiled code

# Frontend
cd frontend && npm run build       # Next.js production build
cd frontend && npm run lint        # ESLint check
```

---

## Architecture

### Monorepo Structure

```
quantum-project/
├── frontend/              # Next.js 16 PWA
│   ├── src/app/           # App Router - route groups (auth), (protected)
│   ├── src/components/    # UI components organized by domain
│   ├── src/hooks/         # React Query hooks for data fetching
│   ├── src/lib/           # Utilities (animations.ts, api.ts)
│   └── src/stores/        # Zustand global state
├── backend/               # Express API
│   ├── src/agents/        # Agent system (BaseAgent, AgentRegistry)
│   ├── src/controllers/   # Route handlers
│   ├── src/middleware/    # Auth, rate limiting, validation
│   ├── src/routes/        # API route definitions
│   ├── src/services/      # AIGateway, TokenTracker, PushNotification
│   └── prisma/            # Schema, migrations, seed.ts
└── docs/                  # BLUEPRINT.md, SDD.md, architecture diagrams
```

### Agent System (PicoClaw v2)

All agents extend `BaseAgent` and communicate via `AgentRegistry`:

```typescript
// BaseAgent.ts - Never call agents directly, always use registry
abstract class BaseAgent {
  abstract execute(message: AgentMessage): Promise<AgentMessage>;
  async communicate(
    targetAgent: string,
    message: Omit<AgentMessage, "sourceAgent" | "timestamp">,
  );
}

// AgentRegistry.ts - Singleton orchestrator
AgentRegistry.getInstance().dispatch(message); // Route messages between agents
AgentRegistry.getInstance().register(agent); // Register new agents
```

**Agents**: ContentAgent (session generation), PersonalizationAgent (behavior analysis), ProgressAgent (consciousnessScore/levels), NotificationAgent (PWA push), MonetizationAgent (subscription enforcement).

### AI Gateway

OpenRouter integration with automatic fallback chain:

```typescript
// AIGateway.ts - Always use this, never call OpenRouter directly
AIGateway.generateContent(input); // Returns AIResponse with fallback to static content

// Fallback chain: Claude 3.5 Sonnet → GPT-4o-mini → Static Content
```

### Frontend Data Flow

```
Components → Hooks (React Query) → API Client → Backend API
                ↓
            Zustand (auth, session state)
```

- **React Query** for all server state - never `useEffect` + fetch
- **Zustand** only for client state (auth, UI preferences)
- Custom hooks in `src/hooks/` wrap all API calls

---

## Key Conventions

### System 6 Design System

**Colors**: Use CSS variables, never hardcoded hex

- Background: `--q-bg-depth` (#080810), `--q-bg-surface`, `--q-bg-raised`
- Accent: `--q-accent-8` (primary), `--q-accent-9` (hover)
- Text: `--q-text-primary`, `--q-text-secondary`, `--q-text-tertiary`

**Typography**:

- `font-[family-name:var(--font-instrument)]` - Content (headlines, affirmations, reflections)
- `font-[family-name:var(--font-dm-sans)]` - UI elements, labels

**Animations**: Import from `lib/animations.ts`, never inline

```typescript
import { VARIANTS, TRANSITIONS } from '@/lib/animations';

<motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} />
```

**Button Pattern**: Always include `whileTap` and specific styling

```typescript
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
  className="h-12 rounded-full bg-[var(--q-accent-8)] text-white"
>
```

### TypeScript Strict Rules

- No `any` type - ever
- No `@ts-ignore` - use proper type guards
- Explicit return types on all functions
- All API responses typed via `src/types/`

### Backend Patterns

**Zod Validation**: All routes use Zod schemas via middleware
**No Prisma in Middleware**: Controllers only
**Error Handling**: Structured logger (no `console.log` in production)
**JWT Auth**: Stateless tokens, validated in `auth.middleware.ts`

### API Client

```typescript
// src/lib/api.ts - Centralized Axios instance with interceptors
const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Environment Setup

Copy and configure both `.env` files:

```bash
# backend/.env
DATABASE_URL="postgresql://quantum:password@localhost:5432/quantum_project"
REDIS_URL="redis://:redispass@localhost:6379"
JWT_SECRET="your-jwt-secret-min-32-chars"
OPENROUTER_API_KEY="your-openrouter-key"
VAPID_PUBLIC_KEY="web-push-public"
VAPID_PRIVATE_KEY="web-push-private"

# frontend/.env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## Route Groups

Frontend uses Next.js route groups for layout organization:

- `(auth)/` - Login, register (no navbar)
- `(protected)/` - All authenticated pages (with Navbar)
  - `dashboard/`, `session/`, `profile/`, `settings/`, `admin/`

Backend route prefixes:

- `/api/auth/*` - Authentication
- `/api/session/*` - Daily sessions
- `/api/progress/*` - User progress/stats
- `/api/admin/*` - Admin operations (requires ADMIN role)

---

## Documentation

Key docs in `docs/`:

- `BLUEPRINT.md` - Design system, tokens, animations
- `SDD.md` - API contracts, types, architecture diagrams
- `PHASES.md` - Roadmap and current status
- `AGENTS.md` - Agent conventions
- `QUANTUM_DESIGN_SYSTEM.md` - Complete design reference
- `docs\PR-COMPLETE-COMPLEMENT-PR00.md`
- `docs\PR-00.md`

Read these before making architectural changes.
