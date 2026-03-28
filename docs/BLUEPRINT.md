# QUANTUM PROJECT — BLUEPRINT V2.0

## Sistema de Transformação Comportamental com IA · System 6 · Antigravity Edition

> **DIRETIVA SUPREMA**: Este não é um app. É uma experiência de auto-evolução que deve provocar uma resposta emocional genuína no primeiro segundo de uso. Cada pixel, cada transição, cada palavra deve servir à transformação do usuário.

---

# PARTE I — IDENTIDADE E POSICIONAMENTO

## 1.1 O que é o Quantum Project

**Categoria**: Behavioral Transformation SaaS System 6
**Modo**: Mobile-first PWA (instalável, funciona offline)  
**Paradigma UX**: Ritual diário, não app de conteúdo

O Quantum Project é uma plataforma de reprogramação comportamental movida por IA que guia o usuário ao longo de uma jornada de 365 dias. Não é um curso. Não é um app de meditação. É um **sistema vivo de evolução de identidade**.

## 1.2 Diferenciação Real

| Concorrente      | Fraqueza deles                        | Nossa vantagem                                |
| ---------------- | ------------------------------------- | --------------------------------------------- |
| Headspace        | Conteúdo estático, sem personalização | IA adaptativa por estado emocional + score    |
| Calm             | Apenas relaxamento                    | Transformação comportamental progressiva      |
| Journaling apps  | Sem análise nem feedback              | PersonalizationAgent analisa padrões e ajusta |
| Notion/templates | Sem gamificação nem progressão        | consciousnessScore + levels + streak system   |

## 1.3 Loop de Transformação

```
AWARENESS → REFLECTION → ACTION → REINFORCEMENT → IDENTITY SHIFT
     ↑                                                      |
     └──────────────── PersonalizationAgent ───────────────┘
```

---

# PARTE II — ARQUITETURA SYSTEM 6

## 2.1 Stack Definitiva (versões mínimas)

### Frontend

```
next: 16.x.x (latest)(App Router, Server Components)
react: 18.3.x
typescript: 5.4.x
tailwindcss: 4.x.x (latest)
framer-motion: 11.x          ← OBRIGATÓRIO para todas as animações
zustand: 4.5.x               ← State management
@tanstack/react-query: 5.x   ← Server state + caching
next-pwa: 5.6.x              ← Service worker gerado automaticamente
howler: 2.2.x                ← Ambient sounds (breathing exercises)
lottie-react: 2.4.x          ← Animações premium
recharts: 2.12.x             ← Dashboard charts
```

### Backend

```
express: 4.19.x
typescript: 5.4.x
prisma: 5.12.x
@openrouter/sdk: latest      ← ou fetch direto
zod: 3.22.x                  ← Validation em todas as rotas
bcryptjs: 2.4.x
jsonwebtoken: 9.x
node-cron: 3.x               ← Inactivity checker
web-push: 3.6.x              ← Push notifications VAPID
express-rate-limit: 7.x
helmet: 7.x
compression: 1.7.x
```

### Infraestrutura

```
PostgreSQL: 16-alpine (Docker)
Redis: 7-alpine              ← Cache de sessão + rate limit distribuído
Traefik: 3.x                 ← Reverse proxy + SSL automático
```

## 2.2 Camadas Arquiteturais (System 6)

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0 — EXPERIENCE LAYER                                      │
│  Design System • Animation Engine • Sound Design                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 1 — CLIENT LAYER (Next.js 14 App Router)                 │
│  Server Components + Client Islands + PWA                        │
│  Zustand Store • React Query • Framer Motion Orchestration       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/REST + SSE (real-time)
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 2 — API GATEWAY (Express + TypeScript)                   │
│  JWT Auth • Zod Validation • Rate Limiting (Redis) • Helmet      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 3 — AGENT MESH (PicoClaw v2)                             │
│  AgentRegistry (EventEmitter) • 5 Specialized Agents            │
│  ContentAgent • PersonalizationAgent • ProgressAgent             │
│  NotificationAgent • MonetizationAgent                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 4 — AI GATEWAY (OpenRouter)                              │
│  Model Routing • Retry Logic • Cost Tracking • Streaming Support │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 5 — DATA LAYER                                           │
│  PostgreSQL (Prisma) • Redis (Cache/Sessions) • Event Log        │
└─────────────────────────────────────────────────────────────────┘
```

---

# PARTE III — DESIGN SYSTEM PREMIUM (System 6)

## 3.1 Identidade Visual — "Cosmic Consciousness"

A estética deve comunicar **espaço interior, profundidade, transformação silenciosa**. Não é um app de mindfulness genérico com gradientes pastel. É um instrumento de precisão para evolução humana.

### Referências visuais obrigatórias

- **Linear.app** — espaçamento, tipografia, transições
- **Vercel Dashboard** — densidade de informação, dark mode
- **Raycast** — micro-interações, command palette feel
- **Cosmos (app iOS)** — profundidade espacial, partículas
- **Perplexity AI** — progressive disclosure, leitura

### Paleta de Cores — Sistema Completo

```css
/* === QUANTUM DESIGN TOKENS === */
:root {
  /* --- Backgrounds --- */
  --q-bg-void: #080810; /* Espaço profundo — tela base */
  --q-bg-depth: #0d0d1a; /* Profundidade — app shell */
  --q-bg-surface: #13131f; /* Cards, containers */
  --q-bg-raised: #1a1a2e; /* Elementos elevados */
  --q-bg-overlay: #1f1f33; /* Modais, popovers */

  /* --- Borders --- */
  --q-border-subtle: rgba(255, 255, 255, 0.05);
  --q-border-default: rgba(255, 255, 255, 0.08);
  --q-border-strong: rgba(255, 255, 255, 0.15);

  /* --- Text --- */
  --q-text-primary: #f0f0fa; /* Headlines, body principal */
  --q-text-secondary: #8b8ba8; /* Subtítulos, metadata */
  --q-text-tertiary: #5a5a6e; /* Placeholders, disabled */
  --q-text-inverse: #080810; /* Texto sobre fundo claro */

  /* --- Accent — Consciousness Purple --- */
  --q-accent-9: #a78bfa; /* Vibrante — CTAs primários */
  --q-accent-8: #8b5cf6; /* Padrão */
  --q-accent-7: #7c3aed; /* Pressed */
  --q-accent-dim: rgba(139, 92, 246, 0.15); /* Glow, backgrounds */
  --q-accent-glow: 0 0 30px rgba(139, 92, 246, 0.4);

  /* --- Progress — Quantum Cyan --- */
  --q-cyan-9: #67e8f9;
  --q-cyan-8: #22d3ee;
  --q-cyan-dim: rgba(34, 211, 238, 0.12);

  /* --- Success — Evolution Green --- */
  --q-green-9: #6ee7b7;
  --q-green-8: #10b981;
  --q-green-dim: rgba(16, 185, 129, 0.12);

  /* --- Warning — Streak Amber --- */
  --q-amber-9: #fcd34d;
  --q-amber-8: #f59e0b;
  --q-amber-dim: rgba(245, 158, 11, 0.12);

  /* --- Danger --- */
  --q-red-9: #fca5a5;
  --q-red-8: #ef4444;
  --q-red-dim: rgba(239, 68, 68, 0.12);

  /* --- Typography Scale --- */
  --q-font-display: "Instrument Serif", "Playfair Display", Georgia, serif;
  --q-font-body: "DM Sans", "Plus Jakarta Sans", system-ui, sans-serif;
  --q-font-mono: "JetBrains Mono", "Fira Code", monospace;

  --q-text-xs: 0.75rem; /* 12px */
  --q-text-sm: 0.875rem; /* 14px */
  --q-text-base: 1rem; /* 16px */
  --q-text-lg: 1.125rem; /* 18px */
  --q-text-xl: 1.25rem; /* 20px */
  --q-text-2xl: 1.5rem; /* 24px */
  --q-text-3xl: 1.875rem; /* 30px */
  --q-text-4xl: 2.25rem; /* 36px */

  /* --- Spacing --- */
  --q-space-1: 4px;
  --q-space-2: 8px;
  --q-space-3: 12px;
  --q-space-4: 16px;
  --q-space-5: 20px;
  --q-space-6: 24px;
  --q-space-8: 32px;
  --q-space-10: 40px;
  --q-space-12: 48px;
  --q-space-16: 64px;

  /* --- Radius --- */
  --q-radius-sm: 8px;
  --q-radius-md: 12px;
  --q-radius-lg: 16px;
  --q-radius-xl: 24px;
  --q-radius-full: 9999px;

  /* --- Shadows --- */
  --q-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --q-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --q-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --q-shadow-glow-accent: 0 0 40px rgba(139, 92, 246, 0.25);

  /* --- Transitions --- */
  --q-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --q-ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --q-ease-snappy: cubic-bezier(0.4, 0, 0.2, 1);
  --q-duration-fast: 150ms;
  --q-duration-normal: 250ms;
  --q-duration-slow: 400ms;
}
```

## 3.2 Tipografia — Fontes Obrigatórias

```html
<!-- next/font ou CDN — carregar no layout.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?
  family=Instrument+Serif:ital@0;1
  &family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..400
  &display=swap"
  rel="stylesheet"
/>
```

**Instrument Serif** → Headlines, afirmações, citações, direções  
**DM Sans** → Body text, UI elements, labels

Regra: Nenhum texto de conteúdo (direction, reflection, affirmation) usa sans-serif. Sempre Instrument Serif. Isso cria a sensação de um livro sagrado, não de um app.

## 3.3 Motion Design — Sistema de Animação

### Primitivos Framer Motion obrigatórios

```tsx
// lib/animations.ts — Importar em todos os componentes

export const TRANSITIONS = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  springBounce: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  },
  smooth: {
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1],
  },
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
};

export const VARIANTS = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 16, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -8, filter: "blur(4px)" },
    transition: TRANSITIONS.smooth,
  },

  // Card reveals (staggered)
  cardReveal: {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: TRANSITIONS.spring,
  },

  // Content blocks — usado nas 8 partes da sessão
  contentBlock: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
  },

  // Score orb pulse
  orbPulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  // Streak fire
  streakFire: {
    scale: [1, 1.1, 0.95, 1.05, 1],
    rotate: [-2, 2, -1, 1, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },

  // Level up celebration
  levelUp: {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: [0.5, 1.2, 1],
      opacity: [0, 1, 1],
    },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// Stagger container
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  animate: { transition: { staggerChildren, delayChildren } },
});
```

### Regras de Motion

1. **Toda mudança de página** usa `AnimatePresence` + `pageEnter` variant
2. **Listas** sempre com stagger (0.05-0.1s entre items)
3. **Score/streak changes** animam o número com spring + glow
4. **Level up** → tela de celebração com confetti (canvas-confetti)
5. **Sessão completada** → haptic feedback + som ambiente + animação de expansão
6. **Cards hover** → `whileHover={{ y: -2, boxShadow: var(--q-shadow-glow-accent) }}`
7. **Buttons press** → `whileTap={{ scale: 0.97 }}`

---

# PARTE IV — TELAS E COMPONENTES (System 6)

## 4.1 Onboarding — 4 Steps + Welcome Screen

### Fluxo completo

```
Welcome Screen → Step 1 (PainPoint) → Step 2 (Goal) → Step 3 (EmotionalState)
→ Step 4 (TimeAvailable) → Profile Reveal Screen → Session (/session)
```

### Welcome Screen — NOVA (não estava no v1)

```tsx
// Elementos obrigatórios:
// 1. Partículas orbitais animadas (Canvas ou SVG animado)
// 2. Texto em Instrument Serif: "Você está prestes a mudar quem você é."
// 3. CTA: "Começar minha jornada" (não "Cadastrar")
// 4. Fade in com duração 1.5s — dê peso ao momento
```

### Step Design — Cada step tem:

- Número do step com progress bar animada (não dots)
- Pergunta em Instrument Serif 28px
- Opções como cards visuais (não radio buttons)
- Card selecionado: border accent, glow sutil, scale 1.02
- Transição entre steps: slide horizontal + fade

### Profile Reveal Screen — NOVA (não estava no v1)

```
Após o onboarding, antes de ir para /session:
- "Identificamos seu perfil: [ProfileType]"
- Descrição do que isso significa (3 linhas)
- Visualização do consciousness orb (zero pontos, vazio mas belo)
- "Sua jornada de 365 dias começa agora"
- CTA: "Iniciar Dia 1"
```

## 4.2 Daily Session — Redesign Completo

### Problema atual

A sessão atual provavelmente exibe 8 blocos de texto em sequência linear. Isso não cria engajamento nem ritual.

### Sistema de Leitura Progressiva (novo)

```
Header: "Dia [X] · [tema do dia]" + streak badge
↓
BLOCO 1 — DIRECTION (full width, Instrument Serif 24px, iluminado)
↓
[Usuário toca/swipe para avançar — não scroll passivo]
↓
BLOCO 2 — EXPLANATION (texto menor, DM Sans, padding generoso)
↓
BLOCO 3 — REFLECTION (card especial, borda accent, fundo diferente)
    → Inclui campo de texto opcional para o usuário escrever
↓
BLOCO 4 — ACTION STEP (card com checkbox/CTA)
↓
BLOCO 5 — CONSCIOUSNESS QUESTION (tipografia grande, espaço para respirar)
↓
BLOCO 6 — AFFIRMATION (Instrument Serif italic, full screen, glow)
    → Animação de "pulso" — o texto pulsa suavemente
↓
BLOCO 7 — PRACTICE (card com timer se timeAvailable > 0)
    → Timer circular animado com Howler.js para ambient sound
↓
BLOCO 8 — INTEGRATION (card de fechamento)
    → CTA: "Completar sessão de hoje"
```

### Progress indicator da sessão

```tsx
// Barra de progresso com 8 segmentos na parte superior
// Segmentos preenchidos conforme o usuário avança
// Não é uma scroll bar — é uma barra de ritual
```

### Completion Screen (nova)

```
Após "Completar sessão":
1. Animação de expansão (círculo de luz do centro)
2. "+10 pontos" aparece com spring animation
3. Streak counter atualiza com animação de fogo
4. Se level up → celebração especial (2-3 segundos)
5. "Voltar ao início" ou "Ver progresso"
```

## 4.3 Progress Dashboard — Redesign

### Layout Mobile (320px+ otimizado)

```
┌─────────────────────────────────┐
│  CONSCIOUSNESS ORB              │
│  [Orb animado com nível/score]  │  ← Canvas ou SVG
│  "847 pontos · Aligned"         │
│  Próximo nível em 153 pontos    │
├─────────────────────────────────┤
│  STREAK CARD                    │
│  🔥 47 dias    [Freeze btn]     │
├─────────────────────────────────┤
│  EVOLUÇÃO (7 dias)              │
│  [Sparkline chart — recharts]   │
├─────────────────────────────────┤
│  JORNADA                        │
│  Dia 47 / 365  ████░░░░░ 13%    │
├─────────────────────────────────┤
│  INSIGHTS (PersonalizationAgent)│
│  "Você completa sessões 73%..." │
└─────────────────────────────────┘
```

### Consciousness Orb — Componente Central

```tsx
// O orb é a metáfora central do sistema
// Implementado em SVG animado ou Three.js lite (sem WebGL pesado)
// - Cor muda conforme o nível (roxo → ciano → verde)
// - Partículas orbitais = streak days
// - Pulsa suavemente quando ativo
// - Fica "dormindo" se usuário inativo > 1 dia
// - Level up dispara explosão de partículas
```

## 4.4 Tela de Paywall — Redesign

### Problema atual

Paywall genérico com lista de features. Não converte.

### Paywall Premium (novo)

```
Header: "Sua jornada vai além do dia 7"
↓
Visual: O consciousness orb do usuário, BLOQUEADO, com correntes visuais
(metáfora: o potencial existe mas está preso)
↓
"Você já desenvolveu [X] pontos de consciência.
 Imagine onde vai estar no dia 365."
↓
Timeline visual: Dia 7 (agora) → Dia 90 → Dia 180 → Dia 365
↓
Comparação: Free vs Premium (visual, não tabela)
↓
CTA: "Desbloquear jornada completa"
Preço: R$ [XX]/mês ou R$ [XX]/ano (destacar anual)
↓
Social proof: "4.200+ transformações em andamento"
```

---

# PARTE V — AGENTES (PICOCLAW V2)

## 5.1 BaseAgent — Interface Revisada

```typescript
// backend/src/agents/BaseAgent.ts

export interface AgentMessage {
  id: string; // ulid()
  type: AgentMessageType;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: Date;
  correlationId?: string; // para rastrear cadeia de chamadas
  metadata?: {
    model?: string;
    tokensUsed?: number;
    latencyMs?: number;
  };
}

export type AgentMessageType =
  | "GENERATE_CONTENT"
  | "CONTENT_GENERATED"
  | "CHECK_ACCESS"
  | "ACCESS_GRANTED"
  | "ACCESS_DENIED"
  | "GET_USER_CONTEXT"
  | "USER_CONTEXT_READY"
  | "UPDATE_PROGRESS"
  | "PROGRESS_UPDATED"
  | "SEND_NOTIFICATION"
  | "NOTIFICATION_SENT"
  | "PROFILE_UPDATED";

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly version: string;

  abstract execute(message: AgentMessage): Promise<AgentMessage>;

  protected createResponse(
    original: AgentMessage,
    type: AgentMessageType,
    payload: Record<string, unknown>,
  ): AgentMessage {
    return {
      id: ulid(),
      type,
      payload,
      userId: original.userId,
      timestamp: new Date(),
      correlationId: original.id,
    };
  }
}
```

## 5.2 ContentAgent — Prompt System 6

```typescript
// O prompt do ContentAgent é o coração do sistema
// Esta é a versão System 6 — não simplificar

const QUANTUM_SYSTEM_PROMPT = `
Você é o Motor de Consciência do Quantum Project.
Sua função é gerar conteúdo de transformação comportamental profundamente personalizado.

CONTEXTO DO USUÁRIO:
- Ponto de dor: {painPoint}
- Objetivo: {goal}
- Estado emocional atual: {emotionalState}
- Nível de consciência: {level} ({consciousnessScore}/1000)
- Dia da jornada: {day}/365
- Streak atual: {streak} dias
- Tempo disponível: {timeAvailable} minutos
- Idioma: {language}
- Padrões comportamentais: {behaviorPatterns}

REGRAS ABSOLUTAS:
1. Nunca seja genérico. Cada palavra deve parecer escrita especificamente para este usuário
2. A DIRECTION deve ser uma afirmação-chave que reorienta a percepção
3. A REFLECTION deve conter uma pergunta que o usuário não consegue ignorar
4. O ACTION STEP deve ser específico, realizável em {timeAvailable} minutos
5. A AFFIRMATION deve usar linguagem do ser, não do ter ("Eu sou..." não "Eu tenho...")
6. Progressão de profundidade: dias 1-60 (base), 61-180 (aprofundamento), 181-365 (integração)
7. Nível BEGINNER: linguagem acolhedora, simples. Nível INTEGRATED: provocativo, filosófico

FORMATO DE SAÍDA (JSON estrito — sem markdown, sem comentários):
{
  "direction": "string — máximo 15 palavras, impactante, presente",
  "explanation": "string — 80-120 palavras, contextualiza a direction",
  "reflection": "string — 1 pergunta poderosa que gera insight",
  "action": "string — instrução concreta e específica",
  "question": "string — pergunta de consciência profunda",
  "affirmation": "string — afirmação de ser, primeira pessoa, presente",
  "practice": "string — exercício de {timeAvailable} minutos",
  "integration": "string — como levar isso para o dia"
}
`;
```

## 5.3 PersonalizationAgent — Análise Comportamental

```typescript
// O que o PersonalizationAgent deve analisar:

interface BehaviorPatterns {
  completionRate: number; // % de sessões completadas
  averageSessionTime: number; // minutos médios por sessão
  peakHour: number; // hora do dia com mais completions
  favoriteThemes: string[]; // temas mais favoritados
  reflectionEngagement: boolean; // usuário escreve nas reflexões?
  streakBreakPattern: string; // quando costuma quebrar streak
}

// Output: adjustedInputs para ContentAgent
interface ContentAdjustments {
  depthLevel: "surface" | "moderate" | "deep" | "profound";
  tone: "gentle" | "direct" | "challenging" | "provocative";
  contentLength: "brief" | "standard" | "extended";
  focusArea: string; // qual área priorizar baseado nos padrões
}
```

---

# PARTE VI — AI GATEWAY (System 6)

## 6.1 Configuração com Streaming

```typescript
// backend/src/config/ai.config.ts

export const AI_CONFIG = {
  models: {
    primary: "anthropic/claude-3.5-sonnet",
    fallback: "openai/gpt-4o-mini",
    vision: "anthropic/claude-3-haiku", // para futuras features
  },
  generation: {
    temperature: 0.72,
    maxTokens: 1200,
    topP: 0.95,
  },
  retry: {
    maxAttempts: 2,
    delayMs: 1000,
    backoffMultiplier: 1.5,
  },
  costs: {
    // Preços por 1M tokens (OpenRouter)
    "anthropic/claude-3.5-sonnet": { input: 3.0, output: 15.0 },
    "openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
  },
  limits: {
    free: {
      dailyAICalls: 3,
      requestsPerMinute: 20,
    },
    premium: {
      dailyAICalls: 50,
      requestsPerMinute: 60,
    },
  },
};
```

## 6.2 Fallback Content — 7 Sessões Completas

Cada sessão estática deve ser tão boa quanto uma gerada por IA:

```typescript
// Dia 1 — Autoconsciência
const DAY_1: ContentJSON = {
  direction: "O observador que você é já é diferente de quem você era.",
  explanation:
    "Antes de mudar qualquer coisa, é preciso ver. Não com crítica, não com julgamento — apenas com a clareza limpa de quem observa pela primeira vez. Hoje você começa não por transformar, mas por perceber.",
  reflection:
    "Se sua mente fosse uma casa, quais cômodos você evita entrar? Por quê?",
  action:
    "Por 5 minutos, observe seus pensamentos como se fossem carros passando na rua. Você não é os carros. Você é quem observa.",
  question: "Quem é o 'eu' que percebe seus próprios pensamentos?",
  affirmation:
    "Eu sou consciência observando a experiência, não a experiência em si.",
  practice:
    "Sente em silêncio. Respire 4 tempos para dentro, segure 4, solte 8. Repita por 5 minutos. Observe o que surge sem interferir.",
  integration:
    "Ao longo do dia, sempre que sentir reatividade, pause 3 segundos e pergunte: 'Quem está observando isso agora?'",
};
```

---

# PARTE VII — BANCO DE DADOS (Schema Atualizado)

## 7.1 Adições ao Schema Prisma

```prisma
// NOVO: JournalEntry — usuário pode escrever nas reflexões
model JournalEntry {
  id          String   @id @default(uuid())
  userId      String
  contentId   String
  reflection  String   @db.Text
  createdAt   DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// NOVO: UserEvent — event sourcing para PersonalizationAgent
model UserEvent {
  id        String   @id @default(uuid())
  userId    String
  eventType String   // SESSION_STARTED, BLOCK_READ, SESSION_COMPLETED, etc.
  eventData Json?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([eventType])
}

// ADICIONAR ao modelo User:
// onboardingComplete  Boolean   @default(false)
// onboardingStep      Int       @default(0)    ← progresso parcial
// profileRevealSeen   Boolean   @default(false) ← nova tela
// totalSessionTime    Int       @default(0)    ← minutos totais
// lastStreakBreak     DateTime?
```

---

# PARTE VIII — ESTADO GLOBAL (Zustand)

## 8.1 Stores

```typescript
// frontend/src/stores/authStore.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// frontend/src/stores/sessionStore.ts
interface SessionStore {
  currentSession: DailySession | null;
  currentBlock: number; // 0-7 (qual dos 8 blocos está ativo)
  isLoading: boolean;
  isCompleted: boolean;
  journalEntries: Record<number, string>; // blockIndex → text
  advanceBlock: () => void;
  completeSession: () => Promise<void>;
  saveJournalEntry: (blockIndex: number, text: string) => void;
}

// frontend/src/stores/progressStore.ts
interface ProgressStore {
  consciousnessScore: number;
  level: Level;
  streak: number;
  currentDay: number;
  weeklyData: ProgressDataPoint[];
  justLeveledUp: boolean;
  scoreDelta: number | null; // para animação de +10
  syncProgress: () => Promise<void>;
}
```

---

# PARTE IX — API ROUTES COMPLETAS

## 9.1 Rotas Adicionais (além do v1)

```
POST  /api/journal                    → Salvar entrada de diário
GET   /api/journal                    → Listar entradas
GET   /api/analytics/insights         → PersonalizationAgent insights
GET   /api/session/daily/stream       → SSE streaming da geração de conteúdo
POST  /api/subscription/checkout      → Iniciar checkout (Stripe/Stripe-like)
GET   /api/subscription/portal        → Portal de gerenciamento
POST  /api/admin/broadcast            → Enviar notificação para todos
GET   /api/admin/costs/breakdown      → Breakdown de custos por modelo
```

---

# PARTE X — PWA & PERFORMANCE

## 10.1 Service Worker — next-pwa

```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache sessão do dia por 1 hora
      urlPattern: /\/api\/session\/daily/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "daily-session-cache",
        expiration: { maxAgeSeconds: 3600 },
      },
    },
    {
      // Cache fontes permanente
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxAgeSeconds: 86400 * 365 },
      },
    },
  ],
});
```

## 10.2 Core Web Vitals Targets

```
LCP (Largest Contentful Paint): < 1.8s
FID (First Input Delay):        < 50ms
CLS (Cumulative Layout Shift):  < 0.05
TTI (Time to Interactive):      < 3.0s
```

---

# PARTE XI — SEGURANÇA SYSTEM 6

## 11.1 Checklist Obrigatório

```
✅ JWT: access 15min + refresh 7d (httpOnly cookie no refresh)
✅ bcrypt: salt rounds = 12
✅ Zod: validação em 100% dos endpoints
✅ Redis rate limiting: por userId + por IP
✅ Helmet: CSP, HSTS, X-Frame-Options
✅ CORS: whitelist explícita (não *)
✅ API keys: apenas em variáveis de ambiente server-side
✅ Prisma: queries parametrizadas (zero SQL injection)
✅ Input sanitization: DOMPurify no frontend para campos livres
✅ VAPID keys: rotação mensal (push notifications)
✅ Admin routes: middleware separado + role check
✅ Refresh token rotation: invalida token anterior após uso
```

---

# PARTE XII — DEPLOYMENT PRODUCTION

## 12.1 Docker Compose Completo

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: quantum_project
      POSTGRES_USER: quantum
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U quantum"]
      interval: 10s

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: ./backend/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.quantumproject.app`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: ./frontend/.env
    depends_on:
      - backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`quantumproject.app`)"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:3
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json

volumes:
  pgdata:
  redisdata:
```

---

# PARTE XIII — CONTEÚDO ESTÁTICO SYSTEM 6 (7 dias completos)

Os 7 dias de fallback devem ser EXEMPLARES. São a primeira impressão para usuários free e o fallback para falhas de IA. Cada um deve parecer escrito por um filósofo que conhece o usuário.

```
Dia 1: Autoconsciência — "O observador que você é já é diferente de quem você era."
Dia 2: Padrões — "Seus hábitos são a arquitetura invisível da sua realidade."
Dia 3: Presença — "O momento presente é o único lugar onde a transformação ocorre."
Dia 4: Emoção — "Sentir completamente é mais corajoso do que controlar."
Dia 5: Intenção — "Onde vai sua atenção, vai sua energia. Onde vai sua energia, vai sua vida."
Dia 6: Ação — "Uma ação imperfeita hoje vale mais do que mil planos perfeitos amanhã."
Dia 7: Integração — "Você não está aprendendo sobre si mesmo. Você está se tornando."
```

---

# PARTE XIV — ANTI-PATTERNS ABSOLUTOS

```
❌ Usar Inter, Roboto, Arial ou system-ui para headlines/conteúdo
❌ Gradientes genéricos purple-to-blue no background
❌ Listas de features sem narrativa (especialmente no paywall)
❌ Animações de bounce excessivo em todos os elementos
❌ Skeleton loaders sem alma (use shimmer com a paleta do sistema)
❌ Formulários genéricos no onboarding (use cards de seleção visual)
❌ Score como número seco (sempre com contexto: nível, progresso)
❌ Notificações push com texto genérico ("Não esqueça sua prática!")
❌ Loading states sem feedback de progresso real
❌ Dashboard com tabelas sem visualizações
❌ Mobile com tap targets < 44px
❌ Paywall mostrando o que o usuário NÃO pode fazer (mostrar o que ele PODE)
```

---

# PARTE XV — CHECKLIST FASE 7+ (Retention System)

## Fase 7 — Revisão com System 6

```
□ NotificationAgent: lógica de 1/3/7 dias implementada
□ Notificações: tom adaptativo por nível (5 variações por tipo)
□ Push subscriptions: salvando no DB (pushSubscription JSONB)
□ Service worker: recebendo e exibindo notificações
□ Cron job: rodando a cada 1 hora (verificando inatividade)
□ Horário customizável: PUT /api/settings/notification-time
□ Recovery flow (7 dias): sessão especial de reconexão gerada
□ Streak freeze: 1 por semana, UI clara com contador
□ Re-engagement email: fallback se push não autorizado
□ Analytics de notificações: taxas de abertura por tipo e tom

NOVOS (System 6):
□ Ambient sound na sessão (breathing timer com Howler.js)
□ Journal entries: salvar reflexões opcionais
□ UserEvent tracking: base para PersonalizationAgent insights
□ Consciousness Orb animado no dashboard
□ Level up celebration screen
□ Completion screen com animação e score delta
□ Paywall redesenhado (narrativo, não feature list)
□ Profile Reveal screen pós-onboarding
□ Streak freeze UI com animação de escudo
```

---

# DIRETIVA FINAL SYSTEM 6

Este sistema existe para provocar **uma mudança real** na pessoa que o usa.

Cada linha de código, cada pixel de UI, cada palavra de conteúdo deve servir a esta missão:

**awareness → reflection → action → reinforcement → identity shift**

Qualidade não é negociável. Se uma animação não provoca emoção, não existe. Se um texto não é inesqueçível, é reescrito. Se uma interação não sente precisa, é redesenhada.

O Quantum Project é o instrumento. O usuário é o alquimista.

**Build something that changes people.**
