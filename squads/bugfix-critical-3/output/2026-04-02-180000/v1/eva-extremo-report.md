# Relatório — Eva Extremo

> Analise E2E completa dos 3 bugs criticos do Quantum Project.
> Data: 2026-04-02 | Versao: v1

---

## Bug 1 — Score 0 pts

### TC1. Completar sessao -> perfil mostra score > 0

**Dado:** Um usuario autenticado com onboarding completo, com `consciousnessScore = 0` e nenhuma sessao completada anteriormente.
**Quando:** O usuario navega ate `/session`, percorre os 8 blocos (direction -> explanation -> reflection -> action -> question -> affirmation -> practice -> integration) e clica "Completar dia" no bloco final (integration).
**Entao:**
- A API `POST /api/session/:id/complete` retorna `200` com `newProgress.consciousnessScore >= 10` (delta minimo = 10 para primeira sessao).
- O `CompletionScreen` renderiza mostrando `+10` (ou valor retornado) e `total: {newScore}`.
- Ao navegar para `/profile`, o campo `{profile.consciousnessScore ?? 0} pts` exibe o valor atualizado (>= 10), NAO "0 pts".
- **Ponto critico observado:** O `SessionPage.handleComplete` calcula `completionData` de forma otimista com `scoreDelta: 10` hardcoded (linha 29) ANTES de receber a resposta real do backend. Se `completeSession()` falhar silenciosamente (catch so faz `console.error`), o `CompletionScreen` mostrara dados falsos. O perfil busca de `/api/profile`, portanto so reflete o que o backend realmente persistiu.
**Status:** PENDENTE

### TC2. Duas sessoes consecutivas -> streak = 2

**Dado:** Um usuario que completou a sessao do Dia 1 ontem (lastSessionDate = ontem), agora esta no Dia 2.
**Quando:** O usuario abre `/session` e completa a sessao do Dia 2.
**Entao:**
- O `ProgressAgent` detecta que `lastSessionDate >= yesterdayStart` (linha 60 do ProgressAgent), incrementa streak: `newStreak = streak + 1 = 2`.
- O bonus de streak (+5) e aplicado pois `newStreak >= 2`, totalizando `scoreDelta = 15`.
- O `CompletionScreen` mostra `newStreak = 2` com texto "2 dias seguidos".
- Na pagina `/profile`, `streak` exibe "2 dias".
- **Ponto critico observado:** O `SessionPage` calcula `newStreak: (progress?.streak || 0) + 1` de forma otimista no frontend (linha 31), o que coincide com o backend apenas se o streak nao foi quebrado. Se o backend resetou o streak (gap >= 2 dias), o frontend mostrara streak errado no CompletionScreen.
**Status:** PENDENTE

### TC3. Primeiro acesso sem sessoes -> score 0 e correto

**Dado:** Um usuario recem-registrado com onboarding completo, nenhuma sessao gerada ainda.
**Quando:** O usuario navega para `/profile`.
**Entao:**
- A API `GET /api/profile` retorna `consciousnessScore: 0`, `level: 'BEGINNER'`, `streak: 0`.
- O perfil exibe "0 pts" no campo de consciencia.
- O nivel exibe "Iniciante" com barra de progresso em 10% (`LEVEL_LABELS.BEGINNER.progress = 10`).
- O streak mostra "0 dias".
- Nenhum erro ou estado vazio inesperado aparece.
**Status:** PENDENTE

### TC4. Score persiste apos refresh da pagina

**Dado:** Um usuario que acabou de completar uma sessao e teve score atualizado para 10.
**Quando:** O usuario esta na pagina `/profile` vendo score = 10 e faz um refresh completo do navegador (F5 / Ctrl+R).
**Entao:**
- A pagina recarrega e faz nova chamada `GET /api/profile`.
- O score continua exibindo 10 (ou o valor persistido no banco).
- O estado nao depende de cache local (Zustand) — e re-fetched do servidor.
- **Ponto critico observado:** O `ProfilePage` busca dados diretamente via `fetch('/api/profile')` no `useEffect`, nao usa React Query. Isso significa que nao ha cache inteligente — cada reload faz uma nova chamada, o que e bom para consistencia mas ruim para UX se a API estiver lenta.
**Status:** PENDENTE

---

## Bug 2 — History Placeholder

### TC5. Completar 1 sessao -> navegar para /history -> card aparece

**Dado:** Um usuario que completou pelo menos 1 sessao (Dia 1).
**Quando:** O usuario navega para `/history`.
**Entao:**
- **BUG CONFIRMADO:** A pagina `/history` (history/page.tsx) e um placeholder estatico. Ela NAO faz nenhuma chamada API. O componente renderiza apenas um icone, titulo "Sua Jornada" e texto "O registro das suas epifanias e transformacoes esta sendo preparado."
- Nenhum card de sessao aparece, independentemente de quantas sessoes foram completadas.
- O backend TEM o endpoint `getHistory` implementado no `session.controller.ts` (linha 213-248) que retorna dados reais, mas o frontend NAO o consome.
- **Evidencia:** O `HistoryPage` nao importa nenhum hook, nao usa `useProgress`, nao chama `api.get('/session/history')`. E puramente estatico.
**Status:** BUG CONFIRMADO — frontend nao implementado

### TC6. Zero sessoes -> empty state (nao blank)

**Dado:** Um usuario sem nenhuma sessao completada.
**Quando:** O usuario navega para `/history`.
**Entao:**
- A pagina exibe o placeholder estatico (mesmo conteudo do TC5).
- Tecnicamente nao e um "blank" — ha conteudo visual. Porem, e o MESMO conteudo para 0 sessoes ou 100 sessoes.
- **Esperado (apos fix):** Um empty state dedicado como "Voce ainda nao completou nenhuma sessao. Comece sua jornada!" com CTA para `/session`.
**Status:** PARCIALMENTE OK — nao e blank, mas nao diferencia estados

### TC7. Free tier -> historico limitado

**Dado:** Um usuario free (isPremium = false) no Dia 10 com 10 sessoes completadas.
**Quando:** O usuario navega para `/history`.
**Entao:**
- **BUG CONFIRMADO no frontend:** O frontend nao chama a API, entao nenhuma restricao de tier e visivel.
- **Backend funciona corretamente:** O `getHistory` aplica `minHistoryDayForFreeTier(currentDay)` que retorna `Math.max(1, currentDay - 6)` = dia 4. Ou seja, apenas dias 4-10 seriam retornados (janela de 7 dias).
- Usuarios premium (`isPremium = true` com `premiumUntil` valido) receberiam historico completo sem filtro.
- **Apos fix do frontend:** Validar que free tier ve apenas 7 dias e premium ve tudo.
**Status:** BUG — backend pronto, frontend nao implementado

---

## Bug 3 — Session Verification

### TC8. Navegar 8 blocos em ordem -> cada um renderiza

**Dado:** Um usuario com sessao diaria carregada (session.content com todas as 8 chaves preenchidas).
**Quando:** O usuario esta em `/session` e clica "Continuar" sequencialmente para percorrer os blocos: direction (1/8) -> explanation (2/8) -> reflection (3/8) -> action (4/8) -> question (5/8) -> affirmation (6/8) -> practice (7/8) -> integration (8/8).
**Entao:**
- A progress bar no topo mostra preenchimento progressivo (8 segmentos).
- Cada bloco renderiza `content[blockKey]` com o texto correspondente.
- O bloco `direction` usa fonte serif (`font-instrument`), tamanho `text-2xl`.
- O bloco `explanation` usa fonte sans (`font-dm-sans`), tamanho `text-base`.
- O bloco `reflection` inclui o componente `ReflectionInput` abaixo do texto (`config.hasInput = true`).
- Os blocos `question` e `affirmation` usam fonte serif.
- O botao "Voltar" (seta) esta desabilitado no primeiro bloco (`currentIndex === 0`).
- O botao de navegacao avanca mostra "Continuar" nos blocos 1-7 e "Completar dia" no bloco 8 (integration).
**Status:** PENDENTE

### TC9. Bloco affirmation -> fullscreen com glow

**Dado:** O usuario esta no bloco 5 (question) durante a sessao.
**Quando:** O usuario clica "Continuar" e avanca para o bloco 6 (affirmation).
**Entao:**
- O bloco renderiza em modo fullscreen (`config.fullScreen = true`).
- O container tem classe `absolute inset-0 z-20` cobrindo toda a tela.
- Background usa `bg-[var(--q-bg-depth)]`.
- Um efeito glow e exibido: div com `bg-[var(--q-accent-8)] blur-3xl` que pulsa (`opacity: 0 -> 0.3`, `scale: 0.8 -> 1`, `repeat: Infinity`).
- O texto da afirmacao aparece entre aspas com `font-instrument italic text-3xl` e `drop-shadow` violeta.
- O botao de acao mostra "Absorver" (nao "Continuar").
- Os botoes de navegacao padrao (footer) NAO aparecem (`!config.fullScreen` guard na linha 165).
- A progress bar permanece visivel no topo (z-10, nao coberta pelo z-20? **Potencial issue:** A progress bar tem `z-10` e o fullscreen tem `z-20`, portanto a progress bar fica ATRAS do fullscreen overlay. O usuario perde referencia visual de progresso durante o bloco affirmation).
**Status:** PENDENTE — verificar visibilidade da progress bar

### TC10. Botao complete -> CompletionScreen

**Dado:** O usuario esta no ultimo bloco (integration, 8/8) durante a sessao.
**Quando:** O usuario clica "Completar dia".
**Entao:**
- A funcao `advance()` detecta `isLast = true` e chama `onComplete()`.
- `onComplete` e o `handleComplete` do `SessionPage`, que chama `completeSession()`.
- Apos sucesso da API, `completionData` e setado com `scoreDelta`, `newScore`, `newStreak`.
- O `CompletionScreen` renderiza com:
  - Icone de check animado (spring animation com checkmark SVG).
  - Score delta grande ("+10" em `text-6xl`).
  - Total de pontos ("pontos de consciencia . total: {newScore}").
  - Badge de streak com emoji fogo e "{N} dias seguidos".
  - Dois botoes CTA: "Ver meu progresso" e "Voltar ao inicio", ambos navegam para `/dashboard`.
**Status:** PENDENTE

---

## Edge Cases

### TC11. Duplo-clique em complete -> nao duplica score

**Dado:** O usuario esta no ultimo bloco (integration) da sessao.
**Quando:** O usuario clica "Completar dia" duas vezes rapidamente (double-click).
**Entao:**
- **Backend protegido:** O `ProgressAgent` tem idempotencia baseada em data (`lastSessionDate >= todayStart`, linha 45). Se o primeiro click ja persistiu, o segundo retorna `alreadyCompleted: true` sem alterar score.
- **Backend protegido (2a camada):** O `completeSession` no controller verifica `content.isCompleted` (linha 180). Se ja completou, retorna `400: Session already completed`.
- **Frontend vulneravel:** O `handleComplete` no `SessionPage` nao desabilita o botao nem previne duplo-clique. O `advance()` no `SessionBlockReader` tambem nao tem debounce.
- **Cenario de race condition:** Se ambos clicks chegam ao backend antes do primeiro persistir, ambos podem passar pela verificacao `content.isCompleted === false`. Porem, o `ProgressAgent` tem a guarda por `lastSessionDate`, que e atomica na transaction.
- **Resultado esperado:** O score deve incrementar exatamente uma vez (+10 base). A segunda chamada retorna `alreadyCompleted: true` ou `400`.
**Status:** PENDENTE — backend protegido, frontend precisa de guard visual

### TC12. Refresh durante sessao -> estado preservado

**Dado:** O usuario esta no bloco 4 (action) de uma sessao.
**Quando:** O usuario faz refresh do navegador (F5).
**Entao:**
- **BUG CONFIRMADO:** O estado do bloco atual (`currentIndex`) e armazenado apenas em `useState` no `SessionBlockReader` (linha 45). NAO ha persistencia em localStorage, sessionStorage ou URL params.
- Apos o refresh, `SessionPage` recarrega e chama `useSession()` -> `fetchSession()`.
- `SessionBlockReader` inicializa com `currentIndex = 0` (direction).
- O usuario perde todo o progresso de navegacao e volta ao bloco 1.
- A sessao em si NAO e perdida (esta no banco), apenas a posicao de leitura.
- O `ReflectionInput` (se preenchido no bloco 3) tambem perde o conteudo se nao foi salvo.
**Status:** BUG — estado de navegacao nao persiste

### TC13. Erro de rede durante complete -> erro graceful

**Dado:** O usuario esta no ultimo bloco e a conexao de rede cai.
**Quando:** O usuario clica "Completar dia" e a chamada `POST /api/session/:id/complete` falha por timeout ou rede.
**Entao:**
- O `completeSession` no `useSession` (linha 96) lanca erro: `throw new Error('Erro ao concluir sessao.')`.
- O catch (linha 106) faz apenas `console.error(err)` — NAO re-lanca, NAO seta estado de erro, NAO notifica o usuario.
- **BUG CONFIRMADO:** O usuario nao recebe NENHUM feedback visual de erro. O `handleComplete` no `SessionPage` continua executando apos o `await completeSession()` e seta `completionData` com valores otimistas (linhas 28-34), portanto o `CompletionScreen` APARECE MESMO COM FALHA.
- O score mostrado no `CompletionScreen` sera o otimista (`oldScore + 10`), mas o backend nao persistiu nada.
- Ao navegar para `/profile` ou `/dashboard`, o score real (inalterado) sera exibido, causando inconsistencia percebida pelo usuario.
- **Esperado:** Erro visivel na UI, botao de retry, e nao mostrar CompletionScreen em caso de falha.
**Status:** BUG CRITICO — falha silenciosa com dados otimistas falsos

---

## Achados Adicionais (Descobertos Durante Analise)

### TC14. Sessao ja completada -> mensagem informativa

**Dado:** O usuario ja completou a sessao de hoje e abre `/session` novamente.
**Quando:** A pagina carrega.
**Entao:**
- O `useSession` retorna `session.isCompleted = true`.
- O `SessionPage` renderiza a mensagem "Dia {N} Concluido" com "Voce ja realizou a pratica de hoje. Volte amanha para o proximo passo."
- O botao "Voltar ao Dashboard" navega para `/dashboard`.
- **OK:** Este fluxo funciona corretamente.

### TC15. CompletionScreen hardcoded scoreDelta vs backend real

**Dado:** O usuario quebrou o streak (gap >= 2 dias). O backend calcula `scoreDelta = 5` (10 - 5 penalidade).
**Quando:** O usuario completa a sessao.
**Entao:**
- **BUG:** O `SessionPage.handleComplete` hardcoda `scoreDelta: 10` (linha 29) e calcula `newScore: oldScore + 10` (linha 30).
- O backend retornou `scoreDelta: 5` e `consciousnessScore: oldScore + 5`, mas esses valores NAO sao usados no CompletionScreen.
- O `CompletionScreen` mostrara "+10" quando o real foi "+5".
- **Ponto:** O `completeSession` ATUALIZA o `progress` state no hook (linha 99), mas `handleComplete` ja criou o `completionData` antes da atualizacao refletir.
- **Impacto:** Informacao enganosa ao usuario sobre ganho de pontos.

---

## Recomendacoes

### Prioridade de Correcao

| Prioridade | TC | Descricao | Severidade |
|---|---|---|---|
| **P0** | TC13 | Erro de rede mostra CompletionScreen falsa | Critica |
| **P0** | TC15 | scoreDelta hardcoded no frontend vs backend real | Critica |
| **P1** | TC5/TC7 | History page e placeholder — backend pronto, frontend nao consome | Alta |
| **P1** | TC11 | Sem guard de duplo-clique no botao complete | Alta |
| **P2** | TC12 | Estado de navegacao dos blocos nao persiste no refresh | Media |
| **P2** | TC2 | Streak otimista pode divergir do backend (edge case de gap) | Media |
| **P3** | TC9 | Progress bar fica atras do fullscreen (z-index) | Baixa |

### Ordem de Testes Recomendada

1. **TC13 + TC15 primeiro** — Sao bugs de integridade de dados que afetam confianca do usuario.
2. **TC1 + TC4** — Validam o fluxo principal (happy path) de score end-to-end.
3. **TC5 + TC6 + TC7** — History page precisa de implementacao real no frontend.
4. **TC8 + TC9 + TC10** — Validam navegacao de blocos (o core da experiencia).
5. **TC11 + TC12** — Edge cases que precisam de guards defensivos.
6. **TC2 + TC3** — Cenarios de streak e primeiro acesso.

### Sugestoes de Fix

1. **TC13/TC15:** `completeSession()` deve retornar o payload do backend. O `handleComplete` deve usar os dados reais (`result.scoreDelta`, `result.newScore`) ao inves de hardcoded. Em caso de erro, mostrar toast/modal de falha e NAO renderizar CompletionScreen.
2. **TC5/TC7:** Implementar o frontend de `/history` usando `useProgress` ou novo hook que chame `GET /api/session/history`. Respeitar a janela de 7 dias para free tier.
3. **TC11:** Adicionar `disabled` state ao botao "Completar dia" apos primeiro click, ou usar ref de `isSubmitting`.
4. **TC12:** Persistir `currentIndex` em `sessionStorage` com key baseada no `contentId`.

---

*Relatorio gerado por Eva Extremo — QA E2E Senior*
*Arquivos analisados: 7 source files + 1 type definition*
*Bugs confirmados: 4 (TC5 history placeholder, TC12 state loss, TC13 silent failure, TC15 hardcoded delta)*
