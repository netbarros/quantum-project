SDD — Software Design Document (E2E)
Quantum Project — Consciousness & Spiritual Reprogramming System
Versão: 1.0.0 Data: 26/03/2026 Tipo: AI-powered Behavioral Transformation Platform Modo: Mobile-first SaaS (Multi-tenant)

1. VISÃO GERAL DO SISTEMA
   1.1 Propósito
   O Quantum Project é uma plataforma SaaS de transformação comportamental movida por IA. O sistema guia usuários ao longo de uma jornada adaptativa de 365 dias para reprogramar padrões mentais, expandir consciência, fortalecer percepção espiritual, melhorar regulação emocional, construir disciplina e evoluir identidade progressivamente.

1.2 Loop Primário

Awareness → Reflection → Action → Reinforcement → Identity Shift
1.3 Princípio Fundamental
O sistema NÃO é um app de conteúdo. É um motor de transformação comportamental adaptativo, um sistema de evolução de identidade, um protocolo diário personalizado por IA.

1.4 Decisões Arquiteturais
Decisão Escolha Justificativa
Frontend Next.js + Tailwind CSS (PWA) SSR/SSG, mobile-first, offline support
Backend Express + TypeScript Flexibilidade, ecossistema, tipagem
Agentes Abstração nativa Node.js Elimina dependência de Go/PicoClaw
IA OpenRouter como gateway Multi-provider, fallback, cost control
ORM Prisma Type-safe, migrations, PostgreSQL nativo
Banco PostgreSQL Relacional, JSONB, escalável
Auth JWT Stateless, mobile-friendly 2. ARQUITETURA DO SISTEMA
2.1 Diagrama de Camadas

┌──────────────────────────────────────────────────────────────┐
│ CAMADA 1 — CLIENT LAYER │
│ Next.js 14+ (App Router) │
│ Tailwind CSS + PWA │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│ │Onboarding│ │ Daily │ │Dashboard │ │ Admin Panel │ │
│ │ (4 steps│ │ Session │ │ Progress │ │ (multi-tenant) │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
│ HTTPS / REST API
┌────────────────────────▼─────────────────────────────────────┐
│ CAMADA 2 — API LAYER │
│ Express + TypeScript │
│ ┌────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐ │
│ │ Auth │ │ Routes │ │Middleware │ │ Validation │ │
│ │ JWT │ │ REST │ │Rate Limit │ │ Zod/Joi │ │
│ └────────┘ └──────────┘ └───────────┘ └──────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
│
┌────────────────────────▼─────────────────────────────────────┐
│ CAMADA 3 — AGENT LAYER │
│ Sistema de Agentes (Node.js nativo) │
│ ┌───────────┐ ┌────────────────┐ ┌──────────────────┐ │
│ │ Content │ │Personalization │ │ Progress │ │
│ │ Agent │ │ Agent │ │ Agent │ │
│ └───────────┘ └────────────────┘ └──────────────────┘ │
│ ┌───────────┐ ┌────────────────┐ ┌──────────────────┐ │
│ │Notification│ │ Monetization │ │ AgentRegistry │ │
│ │ Agent │ │ Agent │ │ (Orchestrator) │ │
│ └───────────┘ └────────────────┘ └──────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
│
┌────────────────────────▼─────────────────────────────────────┐
│ CAMADA 4 — AI GATEWAY LAYER │
│ OpenRouter Integration │
│ ┌────────────────┐ ┌──────────────┐ ┌────────────────────┐ │
│ │ Model Routing │ │ Fallback │ │ Token Tracking │ │
│ │ Claude → GPT │ │ Logic │ │ Cost Estimation │ │
│ └────────────────┘ └──────────────┘ └────────────────────┘ │
└────────────────────────┬─────────────────────────────────────┘
│ Prisma ORM
┌────────────────────────▼─────────────────────────────────────┐
│ CAMADA 5 — DATA LAYER │
│ PostgreSQL │
│ ┌──────┐ ┌─────────┐ ┌───────┐ ┌──────────┐ ┌───────────┐ │
│ │ User │ │ Content │ │ Usage │ │ Favorite │ │Notification│ │
│ └──────┘ └─────────┘ └───────┘ └──────────┘ └───────────┘ │
└──────────────────────────────────────────────────────────────┘
2.2 Estrutura de Diretórios

quantum-project/
├── frontend/ # Next.js 14+ (App Router)
│ ├── public/
│ │ ├── manifest.json # PWA manifest
│ │ ├── sw.js # Service Worker
│ │ ├── icons/ # PWA icons (192x192, 512x512)
│ │ └── fallback/ # Offline fallback assets
│ ├── src/
│ │ ├── app/ # App Router pages
│ │ │ ├── layout.tsx # Root layout
│ │ │ ├── page.tsx # Landing / redirect
│ │ │ ├── (auth)/
│ │ │ │ ├── login/page.tsx
│ │ │ │ └── register/page.tsx
│ │ │ ├── onboarding/
│ │ │ │ └── page.tsx # Multi-step onboarding
│ │ │ ├── session/
│ │ │ │ └── page.tsx # Daily session
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx # Progress dashboard
│ │ │ ├── profile/
│ │ │ │ └── page.tsx # User profile
│ │ │ ├── history/
│ │ │ │ └── page.tsx # Session history
│ │ │ ├── favorites/
│ │ │ │ └── page.tsx # Favorited sessions
│ │ │ ├── settings/
│ │ │ │ └── page.tsx # Notification settings
│ │ │ └── admin/
│ │ │ ├── page.tsx # Admin dashboard
│ │ │ ├── users/page.tsx # User management
│ │ │ ├── analytics/page.tsx # Analytics dashboard
│ │ │ └── costs/page.tsx # AI cost tracking
│ │ ├── components/
│ │ │ ├── ui/ # Design system (Button, Card, Input...)
│ │ │ ├── onboarding/ # OnboardingStep, ProgressIndicator
│ │ │ ├── session/ # SessionCard, ContentBlock
│ │ │ ├── dashboard/ # ScoreGauge, StreakCounter, LevelBadge
│ │ │ ├── admin/ # UserTable, AnalyticsChart
│ │ │ └── layout/ # Navbar, Sidebar, MobileNav
│ │ ├── hooks/
│ │ │ ├── useAuth.ts
│ │ │ ├── useSession.ts
│ │ │ ├── useProgress.ts
│ │ │ └── useNotifications.ts
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── lib/
│ │ │ ├── api.ts # Axios/fetch wrapper
│ │ │ └── utils.ts
│ │ ├── types/
│ │ │ └── index.ts # Shared TypeScript types
│ │ └── styles/
│ │ └── globals.css # Tailwind + custom styles
│ ├── next.config.js
│ ├── tailwind.config.ts
│ ├── tsconfig.json
│ └── package.json
│
├── backend/ # Express + TypeScript
│ ├── src/
│ │ ├── server.ts # Entry point
│ │ ├── app.ts # Express app setup
│ │ ├── config/
│ │ │ ├── index.ts # ENV vars, app config
│ │ │ ├── ai.config.ts # AI*CONFIG (models, temp, tokens)
│ │ │ └── database.ts # Prisma client singleton
│ │ ├── routes/
│ │ │ ├── auth.routes.ts # /auth/*
│ │ │ ├── onboarding.routes.ts # /api/onboarding
│ │ │ ├── profile.routes.ts # /api/profile
│ │ │ ├── session.routes.ts # /api/session/_
│ │ │ ├── progress.routes.ts # /api/progress, /api/streak/_
│ │ │ ├── usage.routes.ts # /api/usage/_
│ │ │ ├── subscription.routes.ts # /api/subscription/_
│ │ │ ├── notification.routes.ts # /api/notifications/_
│ │ │ ├── settings.routes.ts # /api/settings/_
│ │ │ └── admin.routes.ts # /api/admin/\_
│ │ ├── controllers/
│ │ │ ├── auth.controller.ts
│ │ │ ├── onboarding.controller.ts
│ │ │ ├── session.controller.ts
│ │ │ ├── progress.controller.ts
│ │ │ ├── subscription.controller.ts
│ │ │ ├── notification.controller.ts
│ │ │ └── admin.controller.ts
│ │ ├── middleware/
│ │ │ ├── auth.middleware.ts # JWT verification
│ │ │ ├── admin.middleware.ts # Admin role check
│ │ │ ├── rateLimiter.middleware.ts # Per-tier rate limiting
│ │ │ └── validation.middleware.ts # Input validation (Zod)
│ │ ├── agents/
│ │ │ ├── BaseAgent.ts # Abstract base class
│ │ │ ├── AgentRegistry.ts # Orchestrator / message bus
│ │ │ ├── ContentAgent.ts # AI content generation
│ │ │ ├── PersonalizationAgent.ts # Behavior analysis
│ │ │ ├── ProgressAgent.ts # Score/streak/level
│ │ │ ├── NotificationAgent.ts # Re-engagement
│ │ │ └── MonetizationAgent.ts # Access control
│ │ ├── services/
│ │ │ ├── AIGateway.ts # OpenRouter integration
│ │ │ ├── TokenTracker.ts # Usage tracking
│ │ │ └── PushNotification.ts # Web Push service
│ │ ├── utils/
│ │ │ ├── profileMapper.ts # Onboarding → profile type
│ │ │ ├── levelCalculator.ts # Score → level mapping
│ │ │ └── staticContent.ts # 7 fallback sessions
│ │ ├── types/
│ │ │ ├── agent.types.ts # AgentMessage, AgentType
│ │ │ ├── ai.types.ts # AIRequest, AIResponse
│ │ │ └── api.types.ts # Request/Response DTOs
│ │ └── jobs/
│ │ └── inactivityChecker.ts # Cron job for notifications
│ ├── prisma/
│ │ ├── schema.prisma # Database schema
│ │ ├── seed.ts # Seed data (static content)
│ │ └── migrations/ # Auto-generated
│ ├── tsconfig.json
│ ├── package.json
│ └── .env.example
│
├── docker-compose.yml # PostgreSQL + app services
├── .gitignore
└── README.md 3. MODELO DE DADOS
3.1 Schema Prisma Completo
prisma

// prisma/schema.prisma

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

// ═══════════════════════════════════════
// USER
// ═══════════════════════════════════════

model User {
id String @id @default(uuid())
email String @unique
password String // bcrypt hash
name String?
language String @default("pt-BR")
role Role @default(USER)

// Onboarding data
painPoint String?
goal String?
emotionalState String?
timeAvailable Int? // minutes per day
profileType ProfileType?

// Evolution
consciousnessScore Int @default(0) // 0–1000
level Level @default(BEGINNER)
streak Int @default(0)
streakFreezeUsed Boolean @default(false)
streakFreezeDate DateTime?
lastSessionDate DateTime?
currentDay Int @default(1) // 1–365

// Subscription
isPremium Boolean @default(false)
premiumSince DateTime?
premiumUntil DateTime?

// Notification preferences
notificationTime String? // "08:00" format
pushSubscription Json? // Web Push subscription object

// Timestamps
lastAccess DateTime @default(now())
onboardingComplete Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
contents Content[]
usages Usage[]
favorites Favorite[]
notifications Notification[]

@@index([email])
@@index([isPremium])
@@index([lastAccess])
}

enum Role {
USER
ADMIN
}

enum ProfileType {
REACTIVE
LOST
INCONSISTENT
SEEKING
STRUCTURED
}

enum Level {
BEGINNER // 0–200
AWARE // 200–400
CONSISTENT // 400–600
ALIGNED // 600–800
INTEGRATED // 800–1000
}

// ═══════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════

model Content {
id String @id @default(uuid())
userId String
day Int // 1–365
language String @default("pt-BR")
contentJSON Json // { direction, explanation, reflection, action, question, affirmation, practice, integration }
isStatic Boolean @default(false) // true = fallback content
isCompleted Boolean @default(false)
completedAt DateTime?
generatedAt DateTime @default(now())

// Relations
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
favorites Favorite[]

@@unique([userId, day])
@@index([userId, day])
}

// ═══════════════════════════════════════
// USAGE (AI Cost Tracking)
// ═══════════════════════════════════════

model Usage {
id String @id @default(uuid())
userId String
date DateTime @default(now()) @db.Date
tokensUsed Int @default(0)
promptTokens Int @default(0)
completionTokens Int @default(0)
modelUsed String // "anthropic/claude-3.5-sonnet" | "openai/gpt-4o-mini"
requestsCount Int @default(1)
costEstimate Float @default(0) // in USD
responseTimeMs Int? // latency tracking

// Relations
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId, date])
@@index([date])
}

// ═══════════════════════════════════════
// FAVORITES
// ═══════════════════════════════════════

model Favorite {
id String @id @default(uuid())
userId String
contentId String
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)
content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)

@@unique([userId, contentId])
}

// ═══════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════

model Notification {
id String @id @default(uuid())
userId String
type NotificationType
title String
body String
tone String? // "gentle" | "motivational" | "recovery"
sentAt DateTime @default(now())
readAt DateTime?

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId, sentAt])
}

enum NotificationType {
DAILY_REMINDER
STREAK_WARNING
MOTIVATIONAL_RESET
RECOVERY_FLOW
LEVEL_UP
SYSTEM
}
3.2 Diagrama ER
ver-> diagrama-ER.png

4. DESIGN DA API REST
   4.1 Base URL

Development: http://localhost:3001/api
Production: https://api.quantumproject.app/api
4.2 Autenticação
Método Endpoint Descrição Auth
POST /auth/register Registro de novo usuário ❌
POST /auth/login Login (retorna JWT) ❌
POST /auth/refresh Refresh do token 🔑 Refresh Token
Request/Response — Register
typescript

// POST /auth/register
// Request
{
email: string; // required, valid email
password: string; // required, min 8 chars
name?: string;
language?: string; // default "pt-BR"
}

// Response 201
{
user: { id, email, name },
accessToken: string, // expires 15min
refreshToken: string // expires 7d
}
Request/Response — Login
typescript

// POST /auth/login
// Request
{ email: string; password: string; }

// Response 200
{
user: { id, email, name, onboardingComplete, isPremium, level },
accessToken: string,
refreshToken: string
}
JWT Payload
typescript

{
userId: string;
email: string;
role: "USER" | "ADMIN";
iat: number;
exp: number;
}
4.3 Onboarding
Método Endpoint Descrição Auth
POST /api/onboarding Salvar respostas do onboarding 🔑
GET /api/profile Retornar perfil do usuário 🔑
PUT /api/profile Atualizar perfil 🔑
Request — Onboarding
typescript

// POST /api/onboarding
{
painPoint: "anxiety" | "lack_of_purpose" | "emotional_instability" |
"spiritual_disconnection" | "lack_of_discipline" | "identity_crisis";
goal: "inner_peace" | "clarity" | "emotional_mastery" |
"spiritual_growth" | "discipline" | "self_knowledge";
emotionalState: "anxious" | "lost" | "frustrated" |
"hopeful" | "neutral" | "motivated";
timeAvailable: 5 | 10 | 15 | 20 | 30; // minutes
}

// Response 200
{
profile: {
profileType: "REACTIVE" | "LOST" | "INCONSISTENT" | "SEEKING" | "STRUCTURED",
consciousnessScore: 0,
level: "BEGINNER",
currentDay: 1
}
}
Profile Mapping Logic
typescript

// backend/src/utils/profileMapper.ts

function mapProfile(input: OnboardingInput): ProfileType {
const { painPoint, emotionalState, timeAvailable } = input;

if (emotionalState === 'anxious' && painPoint === 'emotional_instability')
return 'REACTIVE';

if (emotionalState === 'lost' && painPoint === 'lack_of_purpose')
return 'LOST';

if (timeAvailable <= 5 && painPoint === 'lack_of_discipline')
return 'INCONSISTENT';

if (emotionalState === 'hopeful' || painPoint === 'spiritual_growth')
return 'SEEKING';

if (timeAvailable >= 20 && emotionalState === 'motivated')
return 'STRUCTURED';

return 'SEEKING'; // default
}
4.4 Sessões
Método Endpoint Descrição Auth
GET /api/session/daily Obter sessão do dia 🔑
POST /api/session/:id/complete Marcar sessão como concluída 🔑
GET /api/sessions/history Listar histórico de sessões 🔑
POST /api/sessions/:id/favorite Favoritar/desfavoritar sessão 🔑
GET /api/sessions/favorites Listar favoritos 🔑
Response — Daily Session
typescript

// GET /api/session/daily
// Response 200
{
session: {
id: string,
day: number,
isStatic: boolean,
isCompleted: boolean,
content: {
direction: string, // "Hoje vamos trabalhar..."
explanation: string, // Contexto teórico
reflection: string, // Pergunta reflexiva
action: string, // Passo prático
question: string, // Consciousness Question
affirmation: string, // Afirmação do dia
practice: string, // Exercício/prática
integration: string // Como integrar no dia
},
generatedAt: string
},
progress: {
currentDay: number,
consciousnessScore: number,
level: string,
streak: number
}
}
4.5 Progresso
Método Endpoint Descrição Auth
GET /api/progress Dashboard de progresso 🔑
POST /api/streak/freeze Usar streak freeze 🔑
Response — Progress
typescript

// GET /api/progress
{
consciousnessScore: number, // 0–1000
level: "BEGINNER" | "AWARE" | "CONSISTENT" | "ALIGNED" | "INTEGRATED",
streak: number,
currentDay: number,
totalCompleted: number,
completionRate: number, // 0.0–1.0
streakFreezeAvailable: boolean,
levelProgress: number, // % within current level
history: [
{ day: number, completed: boolean, date: string }
]
}
4.6 Monetização
Método Endpoint Descrição Auth
GET /api/usage/summary Resumo de uso 🔑
POST /api/subscription/upgrade Upgrade para premium 🔑
GET /api/subscription/status Status da assinatura 🔑
4.7 Notificações
Método Endpoint Descrição Auth
POST /api/notifications/subscribe Registrar push subscription 🔑
POST /api/notifications/send Disparar notificação (admin/system) 🔑 Admin
PUT /api/settings/notification-time Definir horário preferido 🔑
4.8 Admin
Método Endpoint Descrição Auth
GET /api/admin/users Listar todos os usuários 🔑 Admin
GET /api/admin/users/:id Detalhe de um usuário 🔑 Admin
PUT /api/admin/users/:id/premium Toggle premium 🔑 Admin
GET /api/admin/analytics Dashboard de analytics 🔑 Admin
GET /api/admin/costs Custos de IA por período 🔑 Admin
Response — Analytics
typescript

// GET /api/admin/analytics
{
dau: number, // Daily Active Users
mau: number, // Monthly Active Users
retentionRate: number, // %
completionRate: number, // %
avgStreakLength: number,
streakDistribution: {
"0": number,
"1-7": number,
"8-30": number,
"31-90": number,
"91+": number
},
totalAICost: number, // USD
avgCostPerUser: number, // USD
premiumConversion: number // %
} 5. SISTEMA DE AGENTES
5.1 BaseAgent — Classe Abstrata
typescript

// backend/src/agents/BaseAgent.ts

export interface AgentMessage {
type: string;
payload: Record<string, any>;
userId: string;
timestamp: Date;
sourceAgent: string;
targetAgent?: string;
}

export abstract class BaseAgent {
abstract readonly name: string;
abstract readonly description: string;

abstract execute(message: AgentMessage): Promise<AgentMessage>;

async communicate(
targetAgent: string,
message: Omit<AgentMessage, 'sourceAgent'>
): Promise<AgentMessage> {
const fullMessage: AgentMessage = {
...message,
sourceAgent: this.name,
targetAgent,
};
return AgentRegistry.getInstance().dispatch(fullMessage);
}

protected createResponse(
originalMessage: AgentMessage,
payload: Record<string, any>
): AgentMessage {
return {
type: `${originalMessage.type}_response`,
payload,
userId: originalMessage.userId,
timestamp: new Date(),
sourceAgent: this.name,
};
}
}
5.2 AgentRegistry — Orquestrador
typescript

// backend/src/agents/AgentRegistry.ts

export class AgentRegistry {
private static instance: AgentRegistry;
private agents: Map<string, BaseAgent> = new Map();

static getInstance(): AgentRegistry {
if (!AgentRegistry.instance) {
AgentRegistry.instance = new AgentRegistry();
}
return AgentRegistry.instance;
}

register(agent: BaseAgent): void {
this.agents.set(agent.name, agent);
}

async dispatch(message: AgentMessage): Promise<AgentMessage> {
const target = message.targetAgent;
if (!target || !this.agents.has(target)) {
throw new Error(`Agent "${target}" not found`);
}
return this.agents.get(target)!.execute(message);
}

getAgent(name: string): BaseAgent | undefined {
return this.agents.get(name);
}
}

5.3 Fluxo de Comunicação entre Agentes
Ver-> fluxo-comunicacao-entre-agentes.png

5.4 Tabela de Agentes
Agente Responsabilidade Triggers Outputs
ContentAgent Gerar sessão diária via OpenRouter daily_session_request contentJSON, usage
PersonalizationAgent Analisar comportamento, ajustar inputs get_user_context, reclassify_profile adjustedInputs
ProgressAgent Atualizar score, streak, level session_complete, check_streak newProgress
NotificationAgent Detectar inatividade, enviar push Cron job (periódico) Push notifications
MonetizationAgent Validar acesso por tier check_access accessGranted / accessDenied 6. AI GATEWAY — OPENROUTER
6.1 Configuração
typescript

// backend/src/config/ai.config.ts

export const AI_CONFIG = {
primaryModel: "anthropic/claude-3.5-sonnet",
fallbackModel: "openai/gpt-4o-mini",
temperature: 0.7,
maxTokens: 1200,
baseUrl: "https://openrouter.ai/api/v1",
retryAttempts: 2,
retryDelayMs: 1000,
costPerToken: {
"anthropic/claude-3.5-sonnet": { input: 0.000003, output: 0.000015 },
"openai/gpt-4o-mini": { input: 0.00000015, output: 0.0000006 }
}
};
6.2 AIGateway Service
typescript

// backend/src/services/AIGateway.ts

export class AIGateway {
async generateContent(input: ContentInput): Promise<AIResponse> {
// 1. Try primary model
try {
return await this.callOpenRouter(AI_CONFIG.primaryModel, input);
} catch (error) {
console.warn("Primary model failed, trying fallback...");
}

    // 2. Try fallback model
    try {
      return await this.callOpenRouter(AI_CONFIG.fallbackModel, input);
    } catch (error) {
      console.warn("Fallback model failed, using static content...");
    }

    // 3. Return static content as last resort
    return this.getStaticFallback(input.day);

}

private async callOpenRouter(model: string, input: ContentInput): Promise<AIResponse> {
const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
method: "POST",
headers: {
"Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
"Content-Type": "application/json",
"HTTP-Referer": process.env.APP_URL,
"X-Title": "Quantum Project"
},
body: JSON.stringify({
model,
messages: [
{ role: "system", content: SYSTEM_PROMPT },
{ role: "user", content: this.buildUserPrompt(input) }
],
temperature: AI_CONFIG.temperature,
max_tokens: AI_CONFIG.maxTokens,
response_format: { type: "json_object" }
})
});

    // Track usage
    const data = await response.json();
    await this.trackUsage(input.userId, model, data.usage);
    return this.parseResponse(data);

}
}
6.3 Prompt Estrito (System Prompt)
typescript

const SYSTEM_PROMPT = `You are the Quantum Project AI — a consciousness transformation engine.

Generate a daily transformation session.

Language: {language}

User Context:

- Pain: {painPoint}
- Goal: {goal}
- Emotional State: {emotionalState}
- Consciousness Score: {consciousnessScore}
- Streak: {streak}
- Time Available: {timeAvailable} minutes

Rules:

- Human, calm, grounded tone
- No mystical exaggeration
- Combine spirituality, psychology, behavior
- Practical and applicable
- Adaptive depth based on consciousness score

Structure (return JSON only):
{
"direction": "Opening guidance for the day",
"explanation": "Theoretical context blending psychology + spirituality",
"reflection": "Deep reflective question",
"action": "One concrete action step",
"question": "Consciousness-expanding question",
"affirmation": "Daily affirmation aligned with user's journey",
"practice": "Specific exercise or meditation (adapted to timeAvailable)",
"integration": "How to carry this through the rest of the day"
}

Return JSON only. No markdown. No extra text.`;
6.4 Cadeia de Fallback

┌─────────────────┐ fail ┌─────────────────┐ fail ┌─────────────────┐
│ Claude 3.5 │ ──────────→ │ GPT-4o-mini │ ──────────→ │ Static Content │
│ Sonnet │ │ │ │ (7 sessions) │
│ (primary) │ │ (fallback) │ │ (last resort) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
↑ retry x2 ↑ retry x2 7. SISTEMA DE EVOLUÇÃO
7.1 Consciousness Score (0–1000)
Evento Pontos Condição
Conclusão diária +10 Marca sessão como completa
Continuidade de streak +5 Streak ≥ 2 dias consecutivos
Exercício concluído +5 Completa a prática do dia
Dia perdido -5 Não acessa por 1 dia
Score Effects — Como o score afeta o conteúdo gerado:

Score Range Depth Tone Complexity
0–200 Introdutório Acolhedor, gentil Exercícios simples, 3-5 min
200–400 Intermediário Encorajador Reflexões mais profundas
400–600 Aprofundado Direto, confiante Práticas avançadas
600–800 Avançado Provocativo Integração comportamental
800–1000 Mastery Companheiro de jornada Exercícios transformacionais
7.2 Levels
typescript

// backend/src/utils/levelCalculator.ts

export function calculateLevel(score: number): Level {
if (score < 200) return 'BEGINNER';
if (score < 400) return 'AWARE';
if (score < 600) return 'CONSISTENT';
if (score < 800) return 'ALIGNED';
return 'INTEGRATED';
}

export function getLevelProgress(score: number): number {
const ranges = [0, 200, 400, 600, 800, 1000];
const idx = ranges.findIndex((r) => score < r) - 1;
const base = ranges[Math.max(idx, 0)];
const next = ranges[Math.min(idx + 1, ranges.length - 1)];
return ((score - base) / (next - base)) \* 100;
}
7.3 Streak System
typescript

// Lógica do streak
ON session_complete:
if (lastSessionDate === yesterday OR lastSessionDate === today):
streak += 1
else if (lastSessionDate < yesterday):
if (streakFreezeAvailable):
// offer freeze
else:
streak = 1 // reset

ON streak_freeze:
if (!streakFreezeUsed this week):
mantém streak atual
streakFreezeUsed = true
streakFreezeDate = now()

ON new_week (monday):
streakFreezeUsed = false // reset semanal 8. SISTEMA DE MONETIZAÇÃO
8.1 Tiers
Feature FREE PREMIUM
Dias de conteúdo 7 365
Geração IA 3 calls/dia Ilimitada (soft limits)
Personalização ❌ Básica ✅ Completa
Streak Freeze ❌ ✅ 1/semana
Histórico completo ❌ Últimos 7 dias ✅ Completo
Favoritos ❌ ✅ Ilimitados
8.2 Rate Limiting
typescript

// backend/src/middleware/rateLimiter.middleware.ts

const RATE_LIMITS = {
free: {
aiCallsPerDay: 3,
requestsPerMinute: 20
},
premium: {
aiCallsPerDay: 50, // soft limit
requestsPerMinute: 60
}
};
8.3 MonetizationAgent — Enforcement Flow
Ver -> MonetizationAgent-EnforcementFlow.png

9. SISTEMA DE RETENÇÃO
   9.1 Detecção de Inatividade (Cron Job)
   typescript

// backend/src/jobs/inactivityChecker.ts
// Executa a cada 1 hora

Schedule: "0 \* \* \* \*" // every hour

Logic:
FOR each user WHERE lastAccess < now():
daysMissed = diff(now(), lastSessionDate)

    IF daysMissed === 1:
      NotificationAgent.send("DAILY_REMINDER", tone: "gentle")
      // "Ei, {name}. Sua jornada de consciência te espera.
      //  Só 5 minutos podem mudar o seu dia."

    IF daysMissed === 3:
      NotificationAgent.send("MOTIVATIONAL_RESET", tone: "motivational")
      // "Você começou algo importante. 3 dias sem praticar
      //  é apenas uma pausa, não o fim. Volte agora."

    IF daysMissed === 7:
      NotificationAgent.send("RECOVERY_FLOW", tone: "recovery")
      // "Faz uma semana. Sem julgamento.
      //  Preparamos uma sessão especial de reconexão para você."

9.2 Tom Adaptativo
O tom das notificações se adapta ao nível e estado emocional do usuário:

Nível Tom Base Exemplo
BEGINNER Acolhedor, simples "Você está começando algo lindo. Continue."
AWARE Encorajador "Sua consciência está crescendo. Não pare agora."
CONSISTENT Direto "Você já provou que é consistente. Mantenha."
ALIGNED Provocativo "O que acontece quando você para de evoluir?"
INTEGRATED Companheiro "Você sabe o caminho. A prática te chama." 10. FRONTEND — UI/UX
10.1 Design Principles
Minimal: Sem clutter, sem distrações
Calm: Paleta suave, tipografia limpa
Focused: Uma ação por tela
Reading-first: Conteúdo é protagonista
Mobile-first: Toda UI otimizada para toque
10.2 Paleta de Cores (sugestão)
css

:root {
--bg-primary: #0F0F1A; /_ Deep space blue _/
--bg-secondary: #1A1A2E; /_ Card background _/
--bg-surface: #16213E; /_ Surface _/
--text-primary: #E8E8F0; /_ Main text _/
--text-secondary: #9CA3AF; /_ Secondary text _/
--accent-primary: #7C3AED; /_ Purple — consciousness _/
--accent-secondary: #06B6D4; /_ Cyan — progress _/
--accent-success: #10B981; /_ Green — completion _/
--accent-warning: #F59E0B; /_ Amber — streak _/
--accent-danger: #EF4444; /_ Red — alerts _/
}
10.3 Telas Principais
Tela Rota Descrição
Login /login Email + senha, CTA registro
Register /register Criação de conta
Onboarding /onboarding 4 steps com progress indicator
Daily Session /session Conteúdo do dia, 8 seções expansíveis
Dashboard /dashboard Score, level, streak, progresso
Profile /profile Dados pessoais + tipo de perfil
History /history Lista de sessões passadas
Favorites /favorites Sessões favoritadas
Settings /settings Horário de notificação
Admin /admin Dashboard administrativo
Paywall Modal Comparação free vs premium
10.4 PWA Configuration
json

// public/manifest.json
{
"name": "Quantum Project",
"short_name": "Quantum",
"description": "Consciousness & Spiritual Reprogramming System",
"start_url": "/session",
"display": "standalone",
"background_color": "#0F0F1A",
"theme_color": "#7C3AED",
"orientation": "portrait",
"icons": [
{ "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
{ "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
}

11. CORE FLOW — FLUXO PRINCIPAL E2E

Ver -> CoreFlow-FluxoPrincipal.png

12.1 Checklist
Aspecto Implementação
Autenticação JWT (access 15min + refresh 7d)
Senhas bcrypt com salt rounds = 12
Input Validation Zod schemas em todos os endpoints
Rate Limiting express-rate-limit por tier
API Keys Variáveis de ambiente, nunca em código
CORS Whitelist de origens permitidas
Helmet Headers de segurança HTTP
SQL Injection Prisma (parameterized queries)
XSS Sanitização no frontend e backend
HTTPS Obrigatório em produção
12.2 Variáveis de Ambiente
env

# .env.example

# Database

DATABASE_URL=postgresql://user:pass@localhost:5432/quantum_project

# JWT

JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenRouter

OPENROUTER_API_KEY=sk-or-v1-xxxx
APP_URL=http://localhost:3000

# Server

PORT=3001
NODE_ENV=development

# Push Notifications (VAPID)

VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_EMAIL=mailto:admin@quantumproject.app 13. DEPLOYMENT
13.1 Docker Compose
yaml

# docker-compose.yml

version: '3.8'
services:
postgres:
image: postgres:16-alpine
environment:
POSTGRES_DB: quantum_project
POSTGRES_USER: quantum
POSTGRES_PASSWORD: ${DB_PASSWORD}
ports: - "5432:5432"
volumes: - pgdata:/var/lib/postgresql/data

backend:
build: ./backend
ports: - "3001:3001"
env_file: ./backend/.env
depends_on: - postgres

frontend:
build: ./frontend
ports: - "3000:3000"
env_file: ./frontend/.env
depends_on: - backend

volumes:
pgdata: 14. CONTEÚDO ESTÁTICO (FALLBACK)
7 sessões pré-escritas para os primeiros 7 dias (tier gratuito + fallback em caso de falha total da IA). Armazenadas em backend/src/utils/staticContent.ts e carregadas via seed no banco.

Dia Tema
1 Autoconsciência — Quem sou eu hoje?
2 Observação — Percebendo padrões automáticos
3 Presença — A âncora do momento presente
4 Emoção — Sentir sem reagir
5 Intenção — Direcionando energia consciente
6 Ação — Pequenos passos, grandes mudanças
7 Integração — Revisão da primeira semana 15. RESTRIÇÕES E ANTI-PADRÕES
❌ NÃO FAZER ✅ FAZER
Hardcodar todo conteúdo Geração dinâmica via IA com fallback estático
Usar LLM provider único OpenRouter com model routing + fallback
Ignorar tracking de custos Tracking por request, por usuário, por dia
Criar experiência estática Conteúdo adaptativo baseado em score/perfil
Expor API keys no client Variáveis de ambiente, server-side only
Permitir uso ilimitado free Rate limiting + day cap + paywall 16. DIRETIVA FINAL
Este não é um app. É um sistema de auto-evolução movido por IA.

Tudo deve servir:

awareness → action → consistency → identity transformation

Documento gerado para o Quantum Project v1.0.0 — SDD Completo E2E
