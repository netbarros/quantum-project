# Research Brief — Personalization Integration

## Gap 1: PersonalizationAgent → ContentAgent Wire-up

### Estado Atual
- `PersonalizationAgent.ts` (225 linhas): COMPLETO
  - `analyzePatterns()`: analisa UserEvents (14 dias) → completionRate, peakHour, journalEngagement, streakBreakPatterns, favoriteThemes
  - `generateAdjustments()`: gera ContentAdjustments → depthLevel, tone, contentLength, focusArea
  - `execute()`: handles 'get_user_context', returns adjustments + patterns

- `ContentAgent.ts` (25 linhas): recebe ContentInput, chama AIGateway.generateContent()
- `ContentInput` type (ai.types.ts): userId, day, language, painPoint, goal, emotionalState, consciousnessScore, streak, timeAvailable — SEM adjustments

- `session.controller.ts:120`: `AgentRegistry.dispatch()` direto para ContentAgent SEM chamar PersonalizationAgent

- `AIGateway.generateContent()`: recebe ContentInput, constrói prompt — SEM adjustments

### O que Fazer
1. Adicionar `adjustments?: ContentAdjustments` ao type ContentInput
2. Em session.controller.ts, ANTES de chamar ContentAgent:
   - Dispatch para PersonalizationAgent com type 'get_user_context'
   - Extrair adjustments da response
   - Incluir no payload do ContentAgent
3. AIGateway: incorporar adjustments no system prompt da IA
4. ContentAgent: passar adjustments para AIGateway

## Gap 2: Admin Broadcast Page

### Estado Atual
- Backend: POST /admin/broadcast EXISTE (admin.routes.ts)
- Controller: sendNotification() em admin.controller.ts — aceita { type, title, body, userFilter? }
- Frontend: NÃO existe broadcast/page.tsx

### O que Fazer
- Criar admin/broadcast/page.tsx com:
  - Select de tipo (DAILY_REMINDER, MOTIVATIONAL_RESET, RECOVERY_FLOW, SYSTEM)
  - Inputs de título e mensagem
  - Filtro de usuários (todos, premium, free, por level)
  - Preview da notificação
  - Botão enviar com confirmação
  - Feedback de sucesso/erro

## Gap 3: Recharts Migration

### Estado Atual
- `recharts@^3.8.1` instalado no package.json
- admin/costs/page.tsx: trend chart diário com barras motion.div manuais
- admin/page.tsx: streak distribution com barras motion.div manuais

### O que Fazer
- Substituir barras manuais por AreaChart (costs trend) e BarChart (streak distribution)
- Usar tokens --q-* como cores do chart
- Manter Framer Motion para container animations, Recharts para os dados
