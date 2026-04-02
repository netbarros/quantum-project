# Anti-Patterns — Quantum Project

## Erros Documentados no Projeto

1. **AnimatePresence sem key nos children** — animações não disparam
   - Fix: `<motion.div key={uniqueKey}>`

2. **Fetch no useEffect em vez de React Query** — estado stale, sem cache, sem retry
   - Fix: `useQuery` com `queryFn`

3. **State de formulário em componente em vez de store** — perde dados cross-component
   - Fix: Zustand para estado compartilhado

4. **Prisma transaction sem try/catch e rollback** — corrupção de dados parcial
   - Fix: `prisma.$transaction` com error handling

5. **JWT refresh não implementado** — usuário deslogado em 15min
   - Fix: Interceptor no axios que tenta refresh automático

6. **Push notification sem graceful degradation** — crash em browsers sem suporte
   - Fix: Verificar `Notification.permission` antes de solicitar

7. **Framer Motion variants undefined** — erro silencioso, componente não anima
   - Fix: Exportar todos os variants de `/lib/animations.ts`

8. **Texto de conteúdo em DM Sans em vez de Instrument Serif** — quebra identidade visual
   - Fix: `className="font-[family-name:var(--font-instrument)]"`

## Anti-Patterns Gerais para este Squad

9. **Assumir que o bug está onde parece** — Bug 1 parece backend mas é frontend
   - Fix: Traçar data flow completo antes de corrigir

10. **Ignorar estados vazios** — /history sem dados mostra tela em branco
    - Fix: Sempre implementar empty state, loading skeleton, error boundary

11. **Não invalidar cache após mutação** — React Query mostra dado stale
    - Fix: `queryClient.invalidateQueries` no onSuccess da mutation

12. **Hardcodar cores** — quebra dark-mode e tokens
    - Fix: Usar variáveis CSS `--q-*` exclusivamente

13. **Implementar sem verificar freemium gates** — free users acessam features premium
    - Fix: Verificar MonetizationAgent limits antes de exibir dados
