# Quality Criteria — Quantum Project Conventions

## TypeScript
- [ ] Strict mode — nenhum `any` explícito
- [ ] Todos os parâmetros tipados, return types explícitos
- [ ] Zod para validação em runtime no backend
- [ ] Types compartilhados em `/types/index.ts`
- [ ] Zero `@ts-ignore` ou `@ts-expect-error`
- [ ] Zero `console.log` em produção — usar logger estruturado

## React / Next.js
- [ ] Server Components por padrão
- [ ] `'use client'` apenas onde necessário
- [ ] Zustand para estado global do cliente
- [ ] React Query para estado do servidor (nunca useEffect + fetch)
- [ ] Nenhum fetch direto em componentes — sempre via hooks
- [ ] Error boundaries em todas as rotas
- [ ] Suspense boundaries com fallbacks elegantes
- [ ] Dynamic imports para componentes pesados

## Tailwind + Design System
- [ ] CSS variables `--q-*` para cores — nunca hex hardcoded
- [ ] Instrument Serif para textos de conteúdo (direction, reflection, affirmation)
- [ ] DM Sans para UI elements, labels, body
- [ ] Mobile-first (sm: é base)
- [ ] Touch targets mínimo 44px
- [ ] Nunca `!important`

## Animations (Framer Motion)
- [ ] Variants importados de `lib/animations.ts` — nunca inline
- [ ] AnimatePresence em todas as trocas de tela/modal
- [ ] Stagger em listas de 3+ itens
- [ ] `whileTap={{ scale: 0.97 }}` em TODOS os botões
- [ ] `whileHover={{ y: -2 }}` em cards clicáveis
- [ ] Cada animação com razão semântica

## Backend / Express
- [ ] Controllers em /controllers/ — nunca lógica na rota
- [ ] Inputs validados com Zod
- [ ] Try/catch em todos os async handlers
- [ ] Erros estruturados: `{ error: { code, message, details? } }`
- [ ] Rate limiting via Redis em endpoints sensíveis
- [ ] Prisma transactions para operações multi-tabela

## Agentes
- [ ] Todo agente extende BaseAgent
- [ ] AgentRegistry para despacho — nunca chamar diretamente
- [ ] Correlação com correlationId
- [ ] Timeout 30s em chamadas ao AIGateway
- [ ] Fallback estático implementado

## Performance Budget
- [ ] First load JS < 150KB (gzipped)
- [ ] Page JS < 80KB por rota
- [ ] /api/session/daily (cache hit) < 50ms
- [ ] /api/progress < 30ms
- [ ] LCP < 1.8s, FID < 50ms, CLS < 0.05
