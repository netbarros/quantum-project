# 🧬 Quantum Project — Plano Completo de Fases

> Consciousness & Spiritual Reprogramming System
> Plataforma SaaS multi-tenant | Next.js PWA + Express + PostgreSQL

---

## Fase 1 — Fundação do Projeto — Scaffolding, Banco de Dados e Autenticação

**Status:** ⬜ Pendente
**Escopo:** Monorepo completo + DB + Auth

Inicializar o projeto greenfield com estrutura de monorepo:

- Criar `frontend/` com Next.js + Tailwind CSS + configuração PWA (manifest.json, service worker). Criar `backend/` com Express + TypeScript.
- Configurar Prisma ORM com schema completo:
  - **User** (id, email, password, language, painPoint, goal, emotionalState, consciousnessScore, level, streak, lastAccess, isPremium, createdAt)
  - **Content** (id, userId, day, language, contentJSON, generatedAt)
  - **Usage** (id, userId, tokensUsed, modelUsed, requestsCount, costEstimate, date)
- Implementar sistema JWT completo:
  - Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
  - Middleware de autenticação no Express
  - AuthContext/hooks no Next.js com rotas protegidas
- Criar `docker-compose.yml` com PostgreSQL local e configuração de variáveis de ambiente (`.env.example`).

**Arquivos de referência:** `BLUEPRINT.md`

---

## Fase 2 — Fluxo de Onboarding e Sistema de Perfil do Usuário

**Status:** ⬜ Pendente
**Escopo:** Onboarding multi-step + Profile Mapping

Implementar onboarding multi-step e perfil do usuário:

- Criar telas de onboarding no Next.js (4 etapas): captura de **painPoint**, **goal**, **emotionalState**, **timeAvailable** com UI minimalista, calma e focada.
- Implementar lógica de **Profile Mapping** no backend: classificar usuário como:
  - Reactive
  - Lost
  - Inconsistent
  - Seeking
  - Structured
- Criar endpoints REST:
  - `POST /api/onboarding` (salvar respostas)
  - `GET /api/profile` (retornar perfil)
  - `PUT /api/profile` (atualizar perfil)
- Criar página de **Profile** no frontend exibindo dados do perfil e nível atual.

**Arquivos de referência:** `BLUEPRINT.md`

---

## Fase 3 — Sistema de Agentes e Gateway de IA (OpenRouter)

**Status:** ⬜ Pendente
**Escopo:** BaseAgent + ContentAgent + AIGateway + Token Tracking

Construir o sistema de agentes nativo em Node.js e integrar com OpenRouter:

- Criar classe base `BaseAgent` em `backend/src/agents/BaseAgent.ts` com protocolo de mensagens JSON `{ type, payload, userId, timestamp }` e métodos `execute()`, `communicate()`.
- Implementar `AgentRegistry` para orquestrar comunicação entre agentes.
- Implementar `ContentAgent` com a função `generateQuantumContent(input)` usando o prompt estrito do BLUEPRINT seção 5.4.
- Integrar `@openrouter/sdk` no `backend/src/services/AIGateway.ts`:
  - Model routing (primary: `anthropic/claude-3.5-sonnet`, fallback: `openai/gpt-4o-mini`)
  - Retry logic
  - Fallback para conteúdo estático em caso de falha total
- Implementar tracking de tokens por usuário (tokensUsed, requestsCount, costEstimate) salvando na tabela **Usage** via Prisma.

**AI_CONFIG:**
```json
{
  "primaryModel": "openrouter/anthropic/claude-3.5-sonnet",
  "fallbackModel": "openrouter/openai/gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 1200
}

Arquivos de referência: BLUEPRINT.md

Fase 4 — Sessão Diária e Fluxo Principal de Conteúdo
Status: ⬜ Pendente Escopo: Core flow + Daily Session UI + History + Favorites

Implementar o core flow completo da aplicação:

Criar endpoint GET /api/session/daily que executa:
Identifica usuário
Determina dia atual
Consulta DB
Se não existe → invoca ContentAgent → gera via OpenRouter → armazena na tabela Content → retorna
Se existe → retorna cache
Criar página Daily Session no Next.js renderizando as 8 partes do conteúdo:
Direction
Explanation
Reflection
Action Step
Consciousness Question
Affirmation
Practice
Integration
Criar 7 sessões de conteúdo estático como fallback.
Implementar páginas History (/history) e Favorites (/favorites) com endpoints:
GET /api/sessions/history
POST /api/sessions/:id/favorite
GET /api/sessions/favorites
Arquivos de referência: BLUEPRINT.md

Fase 5 — Sistema de Evolução, Streak e Dashboard de Progresso
Status: ⬜ Pendente Escopo: ProgressAgent + Score + Levels + Streak + Dashboard UI

Implementar o motor de progressão e dashboard visual:

Implementar ProgressAgent estendendo BaseAgent:
consciousnessScore (0-1000):
+10 conclusão diária
+5 continuidade de streak
+5 exercício concluído
-5 dia perdido
Implementar sistema de levels com transição automática:
Beginner (0-200)
Aware (200-400)
Consistent (400-600)
Aligned (600-800)
Integrated (800-1000)
Implementar streak tracking: incremento diário, reset se perdido, streak freeze (1 por semana).
Criar endpoints:
GET /api/progress
POST /api/session/:id/complete
POST /api/streak/freeze
Criar página Progress Dashboard no Next.js: barra de progresso visual, consciousnessScore, nível atual, streak counter, gráfico de evolução.
Arquivos de referência: BLUEPRINT.md

Fase 6 — Sistema de Monetização e Controle de Uso
Status: ⬜ Pendente Escopo: MonetizationAgent + Paywall + Rate Limiting + Cost Tracking

Implementar o sistema de billing e controle de acesso:

Implementar MonetizationAgent estendendo BaseAgent:
Se day > 7 AND !isPremium → bloquear acesso
Implementar limites de uso:
Free users → máximo 3 chamadas AI/dia
Premium users → soft limits configuráveis
Criar middleware de rate limiting na API baseado em tier do usuário.
Criar endpoints:
GET /api/usage/summary
POST /api/subscription/upgrade
GET /api/subscription/status
Implementar paywall UI no Next.js: tela de bloqueio após 7 dias, comparação free vs premium, CTA de upgrade.
Adicionar tracking de custo por usuário (costEstimate) na tabela Usage.
Tiers:

Feature	FREE	PREMIUM
Dias disponíveis	7	365
Chamadas AI	Limitadas (3/dia)	Ilimitadas
Personalização	❌	✅
Arquivos de referência: BLUEPRINT.md

Fase 7 — Sistema de Retenção e Notification Agent
Status: ⬜ Pendente Escopo: NotificationAgent + Push Notifications + Cron Jobs

Implementar o sistema de re-engagement e notificações push:

Implementar NotificationAgent estendendo BaseAgent:
1 dia perdido → reminder gentil
3 dias → motivational reset
7 dias → recovery flow
Implementar tom adaptativo nas notificações baseado no nível e estado emocional do usuário.
Configurar PWA Push Notifications:
Service worker para receber push
POST /api/notifications/subscribe para salvar subscription
POST /api/notifications/send para disparar
Criar cron job / scheduled task no backend para o NotificationAgent avaliar usuários inativos periodicamente.
Implementar endpoint PUT /api/settings/notification-time para horário definido pelo usuário.
Arquivos de referência: BLUEPRINT.md

Fase 8 — Personalização Adaptativa e Painel Administrativo
Status: ⬜ Pendente Escopo: PersonalizationAgent + Admin Panel + Analytics

Implementar inteligência adaptativa e admin panel multi-tenant:

Implementar PersonalizationAgent estendendo BaseAgent:
Análise de comportamento (padrões de conclusão, tempo gasto, respostas a exercícios)
Ajustar inputs do ContentAgent (profundidade, tom, complexidade)
Implementar atualização dinâmica de perfil: reclassificar profile mapping conforme evolução.
Criar Admin Panel com rotas /admin/* no Next.js:
Listagem de usuários
Visualização de perfil individual
Gestão de premium
Dashboard de analytics (DAU, retention rate, completion rate, streak distribution, AI cost per user)
Criar endpoints admin:
GET /api/admin/users
GET /api/admin/analytics
PUT /api/admin/users/:id/premium
GET /api/admin/costs
Implementar middleware de autorização admin.
Arquivos de referência: BLUEPRINT.md

Fase 9 — Revisão Geral — Segurança, Integração de Agentes e Qualidade de Produção
Status: ⬜ Pendente Escopo: Revisão cross-cutting completa

Revisão cross-cutting do sistema completo:

Verificar comunicação entre todos os 5 agentes (ContentAgent, PersonalizationAgent, ProgressAgent, NotificationAgent, MonetizationAgent) via protocolo JSON.
Auditar segurança: validação de inputs, rate limiting global, proteção de API keys, sanitização de dados do usuário.
Validar fluxo de fallback completo: retry → fallback model → conteúdo estático.
Revisar tracking de custos: precisão do costEstimate, limites por tier, soft limits premium.
Verificar integridade do fluxo de dados fim-a-fim: onboarding → daily session → progress → monetization → retention.
Revisar configuração PWA: manifest, service worker, offline behavior, push notifications.
📐 Arquitetura do Sistema

┌─────────────────────────────────────────────────┐
│                 FRONTEND (Next.js PWA)           │
│  Onboarding │ Daily Session │ Dashboard │ Admin  │
└──────────────────────┬──────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────┐
│              BACKEND (Express + TypeScript)       │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │           AGENT SYSTEM (Node.js)             │ │
│  │  ContentAgent │ ProgressAgent │ Notification │ │
│  │  PersonalizationAgent │ MonetizationAgent    │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │         AI GATEWAY (OpenRouter)              │ │
│  │  Primary: Claude 3.5 │ Fallback: GPT-4o-mini│ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────┐
│              DATABASE (PostgreSQL)                │
│         User │ Content │ Usage                    │
└─────────────────────────────────────────────────┘
🚫 NÃO FAZER
Hardcodar todo o conteúdo
Usar provider LLM único
Ignorar tracking de custos
Criar experiência estática
🎯 DIRETIVA FINAL
awareness → action → consistency → identity transformation
