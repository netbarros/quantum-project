# Relatorio -- Lia Layout

## Bug 1 -- Score 0 pts no Profile

### Pipeline de Dados Completo

```
Backend GET /api/profile  (onboarding.controller.ts:90-126)
  -> Prisma select inclui consciousnessScore (linha 106)
  -> Retorna { user: { ...consciousnessScore, level, streak, ... } }

Frontend profile/page.tsx:56-64
  -> fetch(`${BASE_URL}/profile`)
  -> Extrai { user } da resposta (linha 58)
  -> setProfile(user) (linha 59)

Renderizacao profile/page.tsx:147
  -> {profile.consciousnessScore ?? 0} pts
```

### Causa-Raiz Identificada

O Profile page **NAO** tem bug de leitura em si -- ele le `profile.consciousnessScore` corretamente do endpoint `/api/profile` (onboarding.controller.ts:106). O backend retorna o campo do banco.

**O problema real e de WRITE, nao de READ.** Existem DOIS fluxos paralelos de atualizacao de score que nao se sincronizam com o profile:

1. **Fluxo Session -> completeSession** (useSession.ts:88-109):
   - POST `/api/session/:id/complete` retorna `{ newProgress: { consciousnessScore, level, streak, ... } }`
   - useSession.ts:101-105 chama `updateUser({ streak, consciousnessScore, level })` no AuthContext
   - O AuthContext (AuthContext.tsx:38-43) faz merge parcial no state e salva em localStorage
   - **MAS**: O profile/page.tsx:56 faz seu proprio `fetch('/api/profile')` independente -- NAO usa o AuthContext.user para exibir score

2. **Fluxo de dados desconectado**:
   - profile/page.tsx busca dados frescos do backend via GET /api/profile
   - O backend retorna `user.consciousnessScore` direto do Prisma
   - Se o ProgressAgent (ProgressAgent.ts:125-133) atualizou o score no DB, o profile deveria refletir
   - **PONTO CRITICO**: O score so sera 0 se o usuario NUNCA completou uma sessao, OU se o campo `consciousnessScore` no banco esta default 0

3. **Problema de stale data no login inicial**:
   - AuthContext.tsx:56-57: Na inicializacao, carrega user do localStorage
   - Se o user foi criado com `consciousnessScore: 0` (default do Prisma) e nunca completou sessao, o profile mostrara 0 corretamente
   - **APOS completar sessao**: O completeSession atualiza o AuthContext mas NAO dispara refetch do profile
   - Se o usuario navega Session -> Profile sem recarregar, o profile faz GET /api/profile que DEVERIA retornar o score atualizado do DB

### Cenario mais provavel do bug "0 pts"

O profile/page.tsx:147 usa `profile.consciousnessScore ?? 0`. Se o campo vier como `null` ou `undefined` do backend, renderiza 0. Verificar:

- **Prisma schema default**: Se `consciousnessScore` tem default 0, entao novos usuarios legitimamente mostram 0
- **Apos completar sessao**: O ProgressAgent atualiza o DB (ProgressAgent.ts:100-120), e o profile faz GET independente que deveria capturar o valor atualizado
- **BUG CONFIRMADO**: O profile/page.tsx NAO faz refetch apos navegacao de volta da sessao. Ele depende do `useEffect` com `[accessToken]` como dependencia (linha 54-65). Como o accessToken nao muda apos completar sessao, o profile NAO refetch automaticamente quando o usuario navega de Session -> Profile.

### Diagnostico Final Bug 1

**Severidade**: Media-Alta
**Causa-raiz**: profile/page.tsx faz fetch unico na montagem (useEffect com `[accessToken, BASE_URL]`). Nao ha mecanismo de invalidacao/refetch quando o score muda via completeSession. O useProgress hook (usado no Dashboard) e completamente separado e NAO e usado no Profile.

**Gaps adicionais**:
- profile/page.tsx:147 usa `profile.consciousnessScore ?? 0` -- fallback correto, mas mascara o problema real
- useProgress.ts (hook do Dashboard) faz GET /api/progress (endpoint separado) -- dados duplicados sem single source of truth
- A progressBar no profile (linha 150-156) usa `levelMeta.progress` que e HARDCODED na constante LEVEL_LABELS (linha 18-24), NAO o `levelProgress` dinamico calculado pelo backend

---

## Bug 2 -- History Page Placeholder

### Estado Atual

```
frontend/src/app/(protected)/history/page.tsx -- 23 linhas
  -> Renderiza apenas UI estatica placeholder (linhas 7-22)
  -> Nenhum fetch, nenhum hook, nenhum dado real
  -> Mensagem: "O registro das suas epifanias esta sendo preparado"
```

### Backend Pronto (Nao Consumido)

```
Backend route: GET /api/sessions/history
  -> session.routes.ts:12 -- router.get('/sessions/history', ...)
  -> session.controller.ts:213-248 -- getHistory()
  -> Retorna { history: [{ id, day, isCompleted, completedAt, isFavorite, content }] }
  -> Suporta filtro free/premium (linhas 220-227)
```

### Hook Ausente

```
Busca em frontend/src/hooks/: ZERO resultados para "useSessionHistory"
Hooks existentes:
  - useAuth.ts
  - useSession.ts (sessao diaria, sem history)
  - useProgress.ts (progress/stats, sem session history)
  - useJournal.ts
  - useSettings.ts
  - useNotifications.ts
  - useSubscription.ts
```

### O Que Falta (Pipeline Completo)

1. **Hook `useSessionHistory`** -- Nao existe. Deve ser criado em `frontend/src/hooks/useSessionHistory.ts`:
   - GET `/sessions/history` via api.get
   - Retornar `{ history, isLoading, error, refetch }`
   - Tipo de retorno: `Array<{ id: string; day: number; isCompleted: boolean; completedAt: string|null; isFavorite: boolean; content: Record<string, string> }>`

2. **Page rewrite** -- `frontend/src/app/(protected)/history/page.tsx` precisa:
   - Importar e usar o hook useSessionHistory
   - Renderizar lista de sessoes com conteudo
   - Indicar sessoes completadas vs nao completadas
   - Suportar favoritos (toggle via POST /api/sessions/:id/favorite)

3. **Integracao com useSession.ts** -- O hook useSession ja tem `toggleFavorite` (linha 111-131) que faz POST para `/sessions/:id/favorite`. O history page poderia reusar essa logica ou o toggleFavorite poderia ser extraido para um hook compartilhado.

### Diagnostico Final Bug 2

**Severidade**: Alta (feature completamente ausente no frontend)
**Causa-raiz**: Frontend nunca implementou o consumo do endpoint GET /api/sessions/history. A page e um placeholder puro. O hook useSessionHistory nao foi criado.

---

## Bug 3 -- Session Flow Verification

### Pipeline de Dados Completo

```
1. ENTRADA: session/page.tsx:11
   -> useSession() retorna { session, progress, loading, error, completeSession, ... }

2. FETCH: useSession.ts:38-82
   -> GET /api/session/daily (com Bearer token)
   -> Backend retorna { session: {...content}, progress: {currentDay, consciousnessScore, level, streak} }
   -> useSession.ts:68-69: setSession(data.session), setProgress(data.progress)
   -> useSession.ts:72-76: updateUser({ streak, consciousnessScore, level }) -- sincroniza AuthContext

3. RENDER: session/page.tsx:114-118
   -> <SessionBlockReader contentId={session.id} content={session.content} onComplete={handleComplete} />

4. BLOCOS: SessionBlockReader.tsx:7-16
   -> 8 blocos progressivos: direction, explanation, reflection, action, question, affirmation, practice, integration
   -> Configuracao por bloco em BLOCK_CONFIG (linhas 20-32)
   -> Navegacao via advance()/goBack() (linhas 52-66)
   -> Progress bar visual (linhas 71-85)
   -> Bloco "reflection" tem input (ReflectionInput component, linha 156)
   -> Bloco "affirmation" e fullscreen com glow (linhas 88-121)

5. COMPLETE: session/page.tsx:15-34
   -> handleComplete() chama completeSession()
   -> useSession.ts:88-109: POST /api/session/:id/complete
   -> Backend dispatches session_complete -> ProgressAgent
   -> ProgressAgent.ts:33-133: Calcula score delta, streak, level, atualiza DB
   -> Retorna { newProgress: { consciousnessScore, level, streak, currentDay, levelProgress, scoreDelta } }
   -> useSession.ts:98-105: Atualiza state local + AuthContext

6. COMPLETION SCREEN: session/page.tsx:76-88
   -> CompletionScreen recebe scoreDelta, newScore, newStreak, leveledUp, newLevel
```

### Problemas Menores Encontrados

1. **`any` type em session/page.tsx:12**: `const [completionData, setCompletionData] = useState<any>(null)` -- Viola regra TypeScript strict do CLAUDE.md ("No `any` type - ever")

2. **Score delta hardcoded**: session/page.tsx:28-34 -- O `completionData` e construido com valores simulados (`scoreDelta: 10`, `newScore: oldScore + 10`) em vez de usar o retorno real do `completeSession()`. O comentario na linha 26-27 admite: "we simulate the ProgressAgent return signature". Isso significa:
   - `completeSession()` (useSession.ts:88-109) NAO retorna o payload do backend
   - O `handleComplete` nao tem acesso ao `scoreDelta` real do ProgressAgent
   - A CompletionScreen mostra dados FAKE (+10 sempre) em vez dos dados reais

3. **completeSession nao retorna dados**: useSession.ts:88-109 -- A funcao `completeSession` recebe `data.newProgress` do backend (linha 98) mas NAO retorna nada (void). O session/page.tsx nao consegue acessar o payload real.

### Diagnostico Final Bug 3

**Severidade**: Baixa (funcional, mas com dados imprecisos na CompletionScreen)
**Status**: O fluxo de 8 blocos esta COMPLETO e FUNCIONAL. A sessao carrega, renderiza progressivamente, e completa corretamente. Os dados sao persistidos no backend via ProgressAgent.
**Problema menor**: CompletionScreen mostra scoreDelta=10 hardcoded em vez do valor real calculado pelo ProgressAgent (que pode ser 5 se streak quebrou, ou 10+streak_bonus).

---

## Recomendacoes

### Prioridade 1 -- Bug 2: History Page (CRITICO)
1. Criar `frontend/src/hooks/useSessionHistory.ts` com GET /api/sessions/history
2. Reescrever `frontend/src/app/(protected)/history/page.tsx` consumindo o hook
3. Implementar lista de sessoes com estados completed/pending e toggle favorite
4. Estimativa: ~2h de trabalho

### Prioridade 2 -- Bug 1: Score 0 no Profile (ALTO)
1. **Opcao A (rapida)**: Trocar profile/page.tsx para usar `useProgress()` hook (que ja faz GET /api/progress e retorna consciousnessScore atualizado) em vez de depender do GET /api/profile
2. **Opcao B (correta)**: Adicionar `refetch` trigger no profile -- ao montar a pagina, sempre buscar dados frescos. Considerar usar React Query para cache invalidation automatica
3. **Fix adicional**: Substituir progressBar hardcoded (LEVEL_LABELS.progress) pelo `levelProgress` dinamico retornado pelo backend em GET /api/progress
4. Estimativa: ~1h de trabalho

### Prioridade 3 -- Bug 3: Session completionData (BAIXO)
1. Fazer `completeSession()` em useSession.ts retornar o payload `data.newProgress`
2. Em session/page.tsx, usar o retorno real: `const result = await completeSession(); setCompletionData(result);`
3. Remover os valores simulados (linhas 28-34)
4. Tipar `completionData` com interface propria em vez de `any`
5. Estimativa: ~30min de trabalho

### Problema Arquitetural Transversal
- **Dual data source**: O Profile usa GET /api/profile, o Dashboard usa GET /api/progress -- ambos retornam `consciousnessScore` de fontes diferentes (mesmo DB, mas endpoints separados sem cache compartilhado)
- **Sem React Query**: O projeto usa `useState`+`useEffect` em vez de React Query (mencionado no CLAUDE.md como padrao). Isso causa stale data, falta de cache invalidation, e refetch manual
- **Recomendacao futura**: Migrar hooks para React Query com `queryClient.invalidateQueries(['progress'])` apos completeSession, resolvendo o stale data systemicamente
