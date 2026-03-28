Quantum Project — Plano Completo de Implementação
Li o
 por completo. Abaixo está o plano de 9 fases alinhado com todas as 20 seções do blueprint.

✅ Fase 1 — Fundação do Projeto — Scaffolding, Banco de Dados e Autenticação
Já concluída

Monorepo: frontend/ (Next.js + Tailwind + PWA) e backend/ (Express + TypeScript)
Prisma ORM: tabelas User, Content, Usage
JWT completo: register, login, refresh + middleware + AuthContext
docker-compose.yml com PostgreSQL + .env.example
📋 Fase 2 — Fluxo de Onboarding e Sistema de Perfil do Usuário
Ref: BLUEPRINT.md seções 10, 14

Telas de onboarding (4 etapas): painPoint, goal, emotionalState, timeAvailable
Profile Mapping no backend: Reactive, Lost, Inconsistent, Seeking, Structured
Endpoints: POST /api/onboarding, GET /api/profile, PUT /api/profile
Página de Profile no frontend
📋 Fase 3 — Sistema de Agentes e Gateway de IA (OpenRouter)
Ref: BLUEPRINT.md seções 3, 4, 5

BaseAgent em backend/src/agents/BaseAgent.ts — protocolo JSON { type, payload, userId, timestamp }
AgentRegistry — orquestrador de comunicação entre agentes
ContentAgent — função generateQuantumContent(input) com prompt estrito (seção 5.4)
AIGateway em backend/src/services/AIGateway.ts:
Primary: anthropic/claude-3.5-sonnet
Fallback: openai/gpt-4o-mini
Retry + fallback estático (seção 19)
Token tracking por usuário na tabela Usage
📋 Fase 4 — Sessão Diária e Fluxo Principal de Conteúdo
Ref: BLUEPRINT.md seções 8, 9, 13

Endpoint GET /api/session/daily com core flow: check DB → se não existe → ContentAgent → OpenRouter → store → return
Página Daily Session: renderiza as 8 partes (Direction, Explanation, Reflection, Action Step, Consciousness Question, Affirmation, Practice, Integration)
7 sessões estáticas como fallback (tier gratuito / falha de IA)
Páginas History e Favorites + endpoints REST
📋 Fase 5 — Sistema de Evolução, Streak e Dashboard de Progresso
Ref: BLUEPRINT.md seções 6, 7, 12.1

ProgressAgent: cálculo de consciousnessScore (+10 conclusão, +5 streak, +5 exercício, -5 dia perdido)
Levels automáticos: Beginner (0-200), Aware (200-400), Consistent (400-600), Aligned (600-800), Integrated (800-1000)
Streak tracking + streak freeze (1/semana)
Endpoints: GET /api/progress, POST /api/session/:id/complete, POST /api/streak/freeze
Página Progress Dashboard: barra de progresso, score, nível, streak, gráfico
📋 Fase 6 — Sistema de Monetização e Controle de Uso
Ref: BLUEPRINT.md seção 11

MonetizationAgent: se day > 7 AND !isPremium → bloquear
Limites: free = 3 chamadas AI/dia, premium = soft limits
Middleware de rate limiting por tier
Endpoints: GET /api/usage/summary, POST /api/subscription/upgrade, GET /api/subscription/status
Paywall UI: bloqueio pós-7 dias, comparação free vs premium, CTA upgrade
Cost tracking por usuário
📋 Fase 7 — Sistema de Retenção e Notification Agent
Ref: BLUEPRINT.md seções 12.2, 12.3

NotificationAgent: detecção escalonada (1 dia → reminder, 3 dias → motivational reset, 7 dias → recovery flow)
Tom adaptativo por nível e estado emocional
PWA Push Notifications: service worker + subscription endpoint
Cron job para avaliar inatividade periodicamente
Endpoint PUT /api/settings/notification-time
📋 Fase 8 — Personalização Adaptativa e Painel Administrativo
Ref: BLUEPRINT.md seções 3.1.B, 15

PersonalizationAgent: análise de padrões → ajuste de inputs do ContentAgent (profundidade, tom, complexidade)
Reclassificação dinâmica do profile mapping
Admin Panel (/admin/*): listagem de usuários, gestão premium, dashboard analytics (DAU, retention, completion, streak distribution, AI cost/user)
Endpoints admin: GET /api/admin/users, GET /api/admin/analytics, PUT /api/admin/users/:id/premium, GET /api/admin/costs
Middleware de autorização admin
🔍 Fase 9 — Revisão Geral — Segurança, Integração e Qualidade de Produção
Ref: BLUEPRINT.md seções 16, 19, 20

Verificar comunicação entre os 5 agentes via protocolo JSON
Auditoria de segurança: validação de inputs, rate limiting, proteção de API keys
Validar cadeia de fallback: retry → fallback model → conteúdo estático
Revisar precisão do cost tracking e limites por tier
Testar fluxo fim-a-fim: onboarding → session → progress → monetization → retention
Validar PWA: manifest, service worker, offline, push notifications
