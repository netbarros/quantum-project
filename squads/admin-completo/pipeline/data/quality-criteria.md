# Quality Criteria — Admin Completo

## TypeScript
- `tsc --noEmit` sem erros em frontend e backend
- Sem `any` — usar tipos explícitos
- Response types alinhados entre FE e BE

## Design System (System 6)
- Cores via --q-* tokens (nunca hex hardcoded)
- Fontes: Instrument Serif (headings), DM Sans (UI)
- `whileTap={{ scale: 0.97 }}` em todos os botões
- Motion variants de `@/lib/animations` (nunca inline)
- Loading skeletons (nunca spinner genérico)
- Empty states com mensagem contextual

## Backend
- Zod validation em 100% dos endpoints
- Erros estruturados: `{ error: { code, message } }`
- adminMiddleware em todas as rotas admin
- Self-demotion prevention no updateRole

## Frontend
- React Query para server state (nunca useEffect + fetch)
- `api.ts` client para todas as chamadas (nunca fetch direto)
- AdminRoute guard em todas as páginas admin
- AnimatePresence em transições
