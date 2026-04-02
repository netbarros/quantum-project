# Relatório — 😈 Dante Dúvida

## Bug 1 — Score 0 pts

H1. E SE o score É atualizado internamente mas o session/page não acessa?
    Verificado: `useSession.completeSession()` (linhas 97-105) FAZ `setProgress()` e `updateUser()` com dados reais do backend. Mas `handleComplete()` em session/page.tsx NÃO lê esses dados — hardcoda scoreDelta: 10.
    → Classificação: 🔴 CRITICAL — confirmado como root cause parcial

H2. E SE o score é 0 porque o usuário nunca completou uma sessão?
    Verificado: score default = 0 no Prisma. Para primeiro acesso, 0 pts é CORRETO.
    → Classificação: 🟡 INVESTIGATE — precisa diferenciar "0 porque nunca completou" de "0 por bug"

H3. E SE o profile page mostra dado stale porque useProgress usa useEffect+fetch sem invalidação?
    Verificado: `useProgress()` (linhas 26-46) faz fetch no mount apenas. Sem mecanismo de refetch após completion. NÃO usa React Query — usa useState+useEffect manual.
    → Classificação: 🔴 CRITICAL — useProgress nunca é re-invocado após completeSession

H4. E SE double-click no completar causa dupla contagem?
    Verificado: ProgressAgent tem idempotency check via `user.lastSessionDate` (compara dia). Segundo click no mesmo dia retorna `alreadyCompleted: true`. Frontend não trata esse caso.
    → Classificação: 🟡 INVESTIGATE — backend protege, mas frontend não mostra feedback

H5. E SE o timezone faz o streak resetar no horário errado?
    Verificado: ProgressAgent compara datas UTC. Se usuário em GMT-3 completa às 23h local, é dia seguinte UTC. Pode causar gap falso.
    → Classificação: 🟡 INVESTIGATE — edge case real para usuários fora de UTC

H6. E SE o erro de rede durante complete mostra dados fake?
    Verificado: catch em `completeSession()` (linha 106-108) apenas faz console.error. Mas session/page.tsx `handleComplete()` provavelmente já setou completionData antes do await resolver.
    → Classificação: 🔴 CRITICAL — confirmado por Eva (TC13)

## Bug 2 — History Placeholder

H7. E SE zero sessões retorna erro 500 em vez de array vazio?
    Verificado: session.controller.ts getSessionHistory faz `prisma.content.findMany()` que retorna [] para zero matches. Sem risco de 500.
    → Classificação: 🟢 LOW — backend é seguro

H8. E SE free tier bloqueia TODA a history?
    Verificado: `minHistoryDayForFreeTier` calcula janela baseada em `maxDay - window`. Se window = 7 e user tem 10 dias, vê dias 4-10. Se tem 3 dias, vê TODOS (window > total). Free users sempre veem algo.
    → Classificação: 🟢 LOW — lógica correta

H9. E SE o endpoint precisa de params que o frontend não envia?
    Verificado: GET /api/sessions/history não requer query params obrigatórios. Retorna tudo (filtrado por tier) por default.
    → Classificação: 🟢 LOW — sem risco

H10. E SE dashboard useProgress.history[] conflita com /api/sessions/history?
    Verificado: useProgress retorna `history: HistoryEntry[]` com campos `day, isCompleted, completedAt, date` (sem conteúdo). O endpoint /sessions/history retorna campos diferentes incluindo `contentJSON`. São dados complementares, não conflitantes.
    → Classificação: 🟡 INVESTIGATE — decidir qual endpoint usar para a página /history

H11. E SE 100 sessões causa performance issue na listagem?
    Verificado: Endpoint não tem paginação. 365 sessões em um ano seria array grande. Sem limit/offset.
    → Classificação: 🟡 INVESTIGATE — adicionar paginação preventiva

## Bug 3 — Session Verification

H12. E SE sessão já completada é aberta novamente?
    Verificado: session/page.tsx verifica `session.isCompleted` e mostra CompletionScreen. Mas o conteúdo pode não estar cached — novo fetch para sessão já completed.
    → Classificação: 🟢 LOW — funciona, apenas UX poderia ser melhor

H13. E SE conteúdo vem null do AIGateway?
    Verificado: AIGateway retorna `{ content: null, isFallback: true }` impossível — getStaticFallback sempre retorna objeto válido. No entanto, se JSON.parse falha no response do modelo, content pode ser null antes do static fallback.
    → Classificação: 🟢 LOW — static fallback cobre

H14. E SE back navigation perde estado do bloco?
    Verificado: SessionBlockReader usa `useState(0)` para currentIndex. Browser back sai da página. React state perdido. Voltar = recomeçar do bloco 1.
    → Classificação: 🟡 INVESTIGATE — confirmado por Eva (TC12 P2)

H15. E SE reflection text não é salvo antes de avançar bloco?
    Verificado: ReflectionInput tem auto-save com debounce 1000ms. Se usuário avança bloco antes de 1s, texto pode não ser salvo.
    → Classificação: 🟡 INVESTIGATE — edge case real com debounce timing

## Recomendações

### Investigar Primeiro (🔴 CRITICAL)
1. H1 + H3: completeSession retorna dados mas session/page não os usa E useProgress nunca refetch
2. H6: Erro de rede mostra dados fake no CompletionScreen

### Investigar Depois (🟡)
3. H2: Diferenciar "0 pts primeiro acesso" de "0 pts bug" na UI
4. H5: Timezone UTC vs local para cálculo de streak
5. H10: Decidir qual endpoint usar para /history
6. H11: Paginação preventiva no history
7. H14 + H15: Persistência de estado de sessão e debounce timing
