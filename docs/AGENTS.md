# AGENTS.md — Quantum Project

## Instruções para Agentes de IA (Cursor + Codex)

**Versão:** 2.0 · System 6 · Antigravity Edition

---

## 1. IDENTIDADE DO PROJETO

Você está trabalhando no **Quantum Project**, uma plataforma SaaS de transformação comportamental movida por IA.

**Stack:**

- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind + Framer Motion + Zustand + React Query
- Backend: Express + TypeScript + Prisma + PostgreSQL + Redis
- IA: OpenRouter (Claude 3.5 Sonnet → GPT-4o-mini fallback)
- PWA: next-pwa com service worker

**Documentos de referência (consultar SEMPRE):**

- `BLUEPRINT_V2.md` — arquitetura, design system, tokens, animações
- `SDD.md` — schema Prisma, API contracts, tipos
- `PHASES.md` — escopo de cada fase
- `PREMIUM_SKILLS.md` — referências premium de UI/UX

---

## 2. REGRAS ABSOLUTAS DE CÓDIGO

### 2.1 TypeScript

```
✅ Strict mode SEMPRE (tsconfig: "strict": true)
✅ Nenhum `any` explícito — use `unknown` + type guards
✅ Todos os parâmetros de função tipados
✅ Return types explícitos em funções públicas
✅ Zod para validação em runtime no backend
✅ Types compartilhados em /types/index.ts
❌ NUNCA use `// @ts-ignore` ou `// @ts-expect-error`
❌ NUNCA deixe `console.log` em produção — use logger estruturado
```

### 2.2 React / Next.js

```
✅ Server Components por padrão (App Router)
✅ 'use client' apenas onde necessário (interatividade, hooks)
✅ Zustand para estado global do cliente
✅ React Query para estado do servidor (fetching, caching)
✅ Nenhum fetch direto em componentes — sempre via hooks
✅ Error boundaries em todas as rotas
✅ Suspense boundaries com fallbacks elegantes (não spinners genéricos)
✅ Dynamic imports para componentes pesados (Recharts, Lottie)
❌ NUNCA use `useEffect` para fetch — use React Query
❌ NUNCA hardcode URLs — use /lib/api.ts
```

### 2.3 Tailwind + Estilos

```
✅ CSS variables do design system (--q-*) para cores e tipografia
✅ Tailwind apenas para layout, spacing, responsividade
✅ Instrument Serif para TODOS os textos de conteúdo (direction, reflection, affirmation, etc.)
✅ DM Sans para UI elements, labels, body
✅ Mobile-first em TUDO (sm: breakpoint é base, adicionar md: e lg:)
✅ Touch targets mínimo de 44px (h-11 min ou py-3)
❌ NUNCA use cores hardcodadas inline — use o token system
❌ NUNCA use `!important`
❌ NUNCA use Inter, Roboto, Arial para textos visíveis ao usuário
```

### 2.4 Animações (Framer Motion)

```
✅ Importar variants de /lib/animations.ts — não criar inline
✅ AnimatePresence em TODAS as trocas de tela/modal
✅ stagger em listas de 3+ itens
✅ whileTap={{ scale: 0.97 }} em TODOS os botões
✅ whileHover={{ y: -2 }} em cards clicáveis
✅ layoutId para shared element transitions (se aplicável)
❌ NUNCA anime sem purpose — cada animação deve ter razão semântica
❌ NUNCA use CSS transitions quando Framer Motion já está no componente
```

### 2.5 Backend / Express

```
✅ Todos os controllers em /controllers/ — NUNCA lógica na rota
✅ Todos os inputs validados com Zod antes de chegar no controller
✅ Try/catch em TODOS os async handlers
✅ Retornar erros estruturados: { error: { code, message, details? } }
✅ Logs com winston ou pino (JSON estruturado)
✅ Rate limiting via Redis em endpoints sensíveis
✅ Prisma transactions para operações multi-tabela
❌ NUNCA expor stack traces em respostas de produção
❌ NUNCA acessar req.body sem validação Zod prévia
❌ NUNCA queries Prisma em middleware — apenas em services/controllers
```

### 2.6 Agentes

```
✅ Todo agente extende BaseAgent
✅ Todo agente tem execute(message): Promise<AgentMessage>
✅ AgentRegistry para despacho — API nunca chama agentes diretamente
✅ Correlação de mensagens com correlationId para debugging
✅ Timeout de 30s em chamadas ao AIGateway
✅ Fallback estático implementado em ContentAgent
❌ NUNCA um agente chama outro diretamente — sempre via Registry
```

---

## 3. ESTRUTURA DE ARQUIVOS — OBRIGATÓRIA

```
frontend/src/
├── app/
│   ├── layout.tsx               ← Root layout com fontes + providers
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── onboarding/page.tsx      ← Multi-step com ProfileReveal
│   ├── session/page.tsx         ← Daily session com 8 blocos progressivos
│   ├── dashboard/page.tsx       ← Orb + streak + charts
│   ├── profile/page.tsx
│   ├── history/page.tsx
│   ├── favorites/page.tsx
│   ├── settings/page.tsx
│   └── admin/
├── components/
│   ├── ui/                      ← Design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── consciousness/           ← NOVO: Orb, particles, level indicators
│   │   ├── ConsciousnessOrb.tsx
│   │   ├── LevelBadge.tsx
│   │   └── ScoreDelta.tsx
│   ├── onboarding/
│   │   ├── OnboardingStep.tsx
│   │   ├── OptionCard.tsx       ← Card de seleção visual (não radio)
│   │   └── ProfileReveal.tsx    ← NOVO
│   ├── session/
│   │   ├── SessionBlockReader.tsx  ← Sistema progressivo de leitura
│   │   ├── ContentBlock.tsx
│   │   ├── ReflectionInput.tsx  ← NOVO: campo de diário
│   │   ├── PracticeTimer.tsx    ← NOVO: timer com Howler
│   │   └── CompletionScreen.tsx ← NOVO: celebração
│   ├── dashboard/
│   │   ├── ProgressOrb.tsx
│   │   ├── StreakCard.tsx
│   │   ├── EvolutionChart.tsx
│   │   └── InsightsCard.tsx     ← NOVO: PersonalizationAgent
│   ├── paywall/
│   │   └── PaywallModal.tsx     ← Redesenhado (narrativo)
│   └── layout/
│       ├── BottomNav.tsx        ← Mobile nav
│       └── AppShell.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useDailySession.ts
│   ├── useProgress.ts
│   ├── useNotifications.ts
│   └── useJournal.ts            ← NOVO
├── stores/
│   ├── authStore.ts             ← Zustand
│   ├── sessionStore.ts          ← Zustand
│   └── progressStore.ts         ← Zustand
├── lib/
│   ├── api.ts                   ← Axios instance com interceptors
│   ├── animations.ts            ← Todas as variants Framer Motion
│   └── utils.ts
└── types/
    └── index.ts                 ← Todos os tipos compartilhados
```

---

## 4. CONVENÇÕES DE NOMENCLATURA

```
Componentes:     PascalCase    → ConsciousnessOrb.tsx
Hooks:           camelCase     → useDailySession.ts
Stores:          camelCase     → sessionStore.ts
Utils:           camelCase     → profileMapper.ts
Types/Interfaces: PascalCase   → AgentMessage, DailySession
Constantes:      UPPER_SNAKE   → AI_CONFIG, RATE_LIMITS
CSS Variables:   kebab-case    → --q-bg-void, --q-accent-8
Tailwind classes: utilitários  → Não criar classes customizadas
API endpoints:   kebab-case    → /api/daily-session, /api/streak-freeze
```

---

## 5. PADRÕES DE COMPONENTE

### 5.1 Componente com animação (template)

```tsx
"use client";

import { motion } from "framer-motion";
import { VARIANTS, TRANSITIONS } from "@/lib/animations";

interface Props {
  // tipagem explícita sempre
}

export function NomeComponente({}: Props) {
  return (
    <motion.div
      variants={VARIANTS.cardReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ y: -2, transition: TRANSITIONS.fast }}
      className="rounded-[var(--q-radius-lg)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)]"
    >
      {/* conteúdo */}
    </motion.div>
  );
}
```

### 5.2 Hook de dados (template)

```ts
// hooks/useDailySession.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDailySession() {
  return useQuery({
    queryKey: ["session", "daily"],
    queryFn: () => api.get("/session/daily").then((r) => r.data),
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/session/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
```

### 5.3 Controller backend (template)

```ts
// controllers/session.controller.ts
import { Request, Response, NextFunction } from "express";
import { AgentRegistry } from "../agents/AgentRegistry";
import { SessionResponseSchema } from "../types/api.types";

export async function getDailySession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req.user!; // guaranteed by auth middleware

    const result = await AgentRegistry.dispatch({
      type: "GENERATE_CONTENT",
      userId,
      payload: {},
      timestamp: new Date(),
    });

    const validated = SessionResponseSchema.parse(result.payload);
    res.json({ session: validated });
  } catch (error) {
    next(error); // centralized error handler
  }
}
```

---

## 6. FASES — SCOPE DE CADA SESSÃO

Quando iniciando trabalho em uma fase, consulte PHASES.md e BLUEPRINT_V2.md.

**Fase 7 (atual) — Retention System:**

1. NotificationAgent completo (1/3/7 dias + tons adaptativos)
2. PWA Push Notifications (service worker + VAPID)
3. Cron job de inatividade (node-cron, a cada 1h)
4. Horário customizável (/settings)
5. Streak freeze UI
6. **System 6 extras:**
   - ConsciousnessOrb animado
   - CompletionScreen com celebração
   - Journal entries (ReflectionInput)
   - Paywall redesenhado (narrativo)
   - ProfileReveal screen

---

## 7. COMMIT CONVENTION

```
feat(scope): description     ← nova funcionalidade
fix(scope): description      ← bug fix
refactor(scope): description ← sem mudança funcional
style(scope): description    ← CSS/UI sem lógica
test(scope): description     ← testes
chore(scope): description    ← config, deps

Exemplos:
feat(session): add progressive block reader with journal entries
feat(dashboard): implement ConsciousnessOrb animated component
fix(agent): handle OpenRouter timeout with proper fallback
style(onboarding): replace radio inputs with visual option cards
```

---

## 8. TESTES MÍNIMOS OBRIGATÓRIOS

```
Backend (Jest):
- AuthController: register + login flows
- SessionController: daily session core flow (cache hit + miss)
- MonetizationAgent: free tier enforcement
- ProgressAgent: score calculation + level transitions
- AIGateway: fallback chain (primary fail → fallback → static)

Frontend (Playwright ou Cypress):
- Onboarding: 4 steps + profile reveal
- Daily session: completar sessão → score update
- Paywall: aparecer no dia 8 para free user
- Notificação: subscription flow
```

---

## 9. PERFORMANCE BUDGET

```
Bundle JavaScript (gzipped):
  - First load JS: < 150KB
  - Page JS: < 80KB por rota

API Response Times:
  - /api/session/daily (cache hit):   < 50ms
  - /api/session/daily (AI generate): < 8000ms
  - /api/progress:                    < 30ms
  - /api/auth/*:                      < 200ms

Core Web Vitals:
  - LCP: < 1.8s
  - FID: < 50ms
  - CLS: < 0.05
```

---

## 10. ERROS COMUNS — EVITAR

```
1. AnimatePresence sem key nos children → animações não disparam
   FIX: <motion.div key={uniqueKey}>

2. Fetch no useEffect em vez de React Query
   FIX: useQuery com queryFn

3. State de formulário em componente em vez de store
   FIX: Zustand para estado cross-component

4. Prisma transaction sem try/catch e rollback
   FIX: prisma.$transaction com error handling

5. JWT refresh não implementado → usuário deslogado em 15min
   FIX: Interceptor no axios que tenta refresh automático

6. Push notification sem graceful degradation
   FIX: Verificar Notification.permission antes de solicitar

7. Framer Motion variants undefined → erro silencioso
   FIX: Exportar todos os variants de /lib/animations.ts

8. Texto de conteúdo em DM Sans em vez de Instrument Serif
   FIX: className="font-[family-name:var(--font-instrument)]"
```
