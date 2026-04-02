# Relatório — Pietra Premium

## Bug 1 — Score 0 pts

### Impacto do Freemium no Score Display

O score/streak **NAO esta gated por tier**. O endpoint `GET /api/progress` (progress.controller.ts:13-69) retorna `consciousnessScore`, `level`, `streak` e `levelProgress` diretamente do banco — sem nenhuma verificacao de `isPremium`. Qualquer usuario, free ou premium, recebe os dados completos.

O problema de "0 pts" **nao tem relacao com freemium**. A causa raiz esta no fluxo de dados do frontend:

1. **Profile page** (`profile/page.tsx:56`) faz fetch direto a `GET /api/profile` e exibe `profile.consciousnessScore ?? 0` (linha 147). Este endpoint retorna o User completo — sem gate de tier.

2. **Dashboard page** (`dashboard/page.tsx:11`) usa `useProgress()` que faz `GET /api/progress` — tambem sem gate.

3. **O score comeca em 0 por design** (Prisma schema: `consciousnessScore Int @default(0)`). O score so incrementa quando o usuario completa uma sessao via `POST /api/session/:id/complete`, que despacha para o ProgressAgent.

4. **Possivel causa do bug**: O usuario pode estar vendo 0 pts porque:
   - Nunca completou uma sessao (nunca chamou `completeSession()`)
   - O `useSession.completeSession()` (useSession.ts:88-109) faz hardcode `exerciseCompleted: false`, perdendo o bonus de +5 pts
   - A session page (session/page.tsx:28-34) calcula `completionData` com valores simulados (`scoreDelta: 10`, `newScore: oldScore + 10`) ao inves de usar a resposta real do ProgressAgent — mas isso e so visual, a persistencia no DB esta correta

### Tabela Free vs Premium — Score

| Aspecto | Free | Premium |
|---------|------|---------|
| Score visivel no /profile | Sim (sem gate) | Sim |
| Score visivel no /dashboard | Sim (sem gate) | Sim |
| Score calculo (ProgressAgent) | Identico | Identico |
| Score retornado por /api/progress | Completo | Completo |
| Score retornado por /api/session/daily | Completo (no `progress` obj) | Completo |
| Incremento por sessao | +10 base | +10 base |
| Streak bonus (>= 2 dias) | +5 | +5 |
| Exercise bonus | +5 | +5 |

**Conclusao**: O freemium NAO impacta o Bug 1. O score 0 pts e um problema de ciclo de vida — o usuario precisa completar sessoes para acumular pontos, e o frontend potencialmente nao esta refletindo atualizacoes do ProgressAgent em tempo real na pagina de perfil (que usa fetch independente, nao o estado do useSession).

---

## Bug 2 — History Placeholder

### Analise do Gate de Historico

O backend **tem freemium gate implementado** para o historico, mas o frontend **nao consome o endpoint de forma alguma**.

#### Backend Gate (Implementado)

- `session.controller.ts:213-248` — `getHistory()`:
  - Verifica `isPremium` e `premiumUntil` (linhas 215-222)
  - Se usuario NAO e premium: aplica filtro `where.day >= minHistoryDayForFreeTier(currentDay)` (linhas 225-227)
  - `historyWindow.ts:6`: `minHistoryDayForFreeTier(currentDay) = Math.max(1, currentDay - 6)` — ultimos 7 dias de jornada

- `progress.controller.ts:24-33` — `getProgress()`:
  - Retorna historico dos ultimos 40 registros (`take: 40`) — **SEM gate de tier**
  - Este endpoint e usado pelo Dashboard, que mostra "Ultimos 7 dias" (dashboard/page.tsx:46, 111-129)

#### Frontend (NAO Implementado)

- `history/page.tsx` (23 linhas) e um **placeholder puro** — zero logica de dados
- Nao existe hook `useSessionHistory`
- O endpoint `GET /api/sessions/history` nunca e chamado pelo frontend
- Nao ha NENHUM paywall logic na pagina de historico

#### Tabela Free vs Premium — History

| Aspecto | Free | Premium |
|---------|------|---------|
| GET /api/sessions/history | Ultimos 7 dias de jornada | Historico completo |
| GET /api/progress (dashboard) | Ultimos 40 registros (SEM gate!) | Ultimos 40 registros |
| Frontend /history page | Placeholder (nao consome dados) | Placeholder (nao consome dados) |
| Favoritos (GET /api/sessions/favorites) | Sem filtro de tier | Sem filtro de tier |
| Toggle favorito | Max 5 favoritos (`FREE_TIER_FAVORITES_MAX`) | Ilimitado |

**Inconsistencia detectada**: O dashboard (`GET /api/progress`) mostra ate 40 sessoes de historico para usuarios free, enquanto o endpoint dedicado de historico (`GET /api/sessions/history`) limita a 7 dias. Se o frontend de historico for implementado usando o endpoint correto, o gate sera respeitado. Mas o dashboard serve como "backdoor" involuntaria, exibindo mais dados do que o tier deveria permitir.

**Conclusao**: O Bug 2 nao e causado por freemium gating — e causado por **ausencia total de implementacao frontend**. O backend esta pronto com gating correto. O hook `useSessionHistory` e os cards precisam ser criados do zero.

---

## Bug 3 — Session Verification

### Analise do Timing do Paywall

O paywall esta implementado e funcional, interceptando no momento correto:

#### Fluxo Completo do Paywall

1. **Backend** (`session.controller.ts:45-64`):
   - `getDailySession()` despacha `check_access` para `MonetizationAgent`
   - MonetizationAgent verifica `isPremium` + `premiumUntil` + `currentDay > FREE_DAY_LIMIT (7)`
   - Se free user em dia > 7: retorna HTTP 402 com `paywallRequired: true`

2. **Frontend Hook** (`useSession.ts:48-53`):
   - `fetchSession()` detecta `res.status === 402`
   - Seta `paywallRequired = true` e `paywallCurrentDay`

3. **Frontend Page** (`session/page.tsx:47-52`):
   - Se `paywallRequired`: `router.replace('/plans')` — redirect imediato
   - NAO mostra PaywallModal (usa redirect para pagina dedicada)

#### Timing do Paywall

| Momento | Comportamento |
|---------|---------------|
| Dia 1-7 (free) | Acesso normal a sessao |
| Dia 6-7 (approaching) | `paywallApproaching: true` via `/subscription/status` — mas nenhum UI avisa o usuario! |
| Dia 8+ (free) | 402 no `/session/daily` → redirect para `/plans` |
| Dia 8+ (premium) | Acesso normal |
| AI call limit (free, 3/dia) | 429 no `/session/daily` se cache miss — com `upgradeRequired: true` |

#### Problemas Encontrados no Timing

1. **Paywall "seco" sem transicao emocional**: O redirect e abrupto (`router.replace('/plans')`). O `PaywallModal.tsx` existe como componente completo com animacoes bonitas, orb visual, prova social, pricing — mas **nunca e usado**. O session/page.tsx faz redirect direto ao inves de mostrar o modal first.

2. **Sem pre-paywall warning**: O campo `paywallApproaching` (retornado por `/subscription/status` quando `currentDay >= 6`) nao e consumido em nenhum lugar do frontend. O usuario nao recebe aviso de que esta chegando ao limite — simplesmente e bloqueado no dia 8.

3. **Paywall nao mostra score real**: Tanto `/plans` quanto `/paywall` usam fallback hardcoded: `user?.consciousnessScore || 70` e `user?.streak || 7` (plans/page.tsx:44-46, paywall/page.tsx:44-46). Se o user tiver score 0 (Bug 1), a pagina mostra "70 pontos" — dados falsos que podem destruir confianca.

4. **Dupla pagina de paywall**: Existem `/plans` e `/paywall` com codigo identico (copiar-colar). O session redirect vai para `/plans`, mas o PaywallModal nao e usado.

5. **exerciseCompleted sempre false**: `useSession.completeSession()` (linha 95) envia `exerciseCompleted: false` hardcoded, privando o usuario de +5 pts por exercicio. Isso nao e um problema de paywall mas afeta o score que e mostrado no paywall.

#### Tabela Free vs Premium — Session

| Aspecto | Free (dia 1-7) | Free (dia 8+) | Premium |
|---------|----------------|----------------|---------|
| GET /session/daily | Acesso normal | 402 + redirect /plans | Acesso normal |
| AI calls/dia | 3 (hard limit) | Bloqueado antes | 50 (soft limit) |
| Requests/min | 20 | 20 | 60 |
| Session complete | Funcional | Inacessivel | Funcional |
| Paywall warning | Nenhum (bug) | Redirect abrupto | N/A |

**Conclusao**: O paywall funciona tecnicamente — free users sao bloqueados apos dia 7. Mas o **timing UX e subotimo**: sem warning pre-paywall, redirect abrupto, PaywallModal nao utilizado, dados hardcoded na pagina de upgrade.

---

## Recomendacoes

### Conversao UX — Melhorias Prioritarias

1. **Usar PaywallModal antes do redirect**: No session/page.tsx, ao detectar `paywallRequired`, mostrar o `PaywallModal` (que ja existe e e bonito) antes de redirecionar. Isso cria um momento emocional de "quero continuar" ao inves de uma parede fria.

2. **Implementar pre-paywall banner (dia 6-7)**: Consumir `paywallApproaching` do `useSubscription()` e mostrar um banner suave no dashboard/session: "Voce tem mais X dias gratuitos. Garanta seu acesso completo." Isso prepara psicologicamente e aumenta conversao.

3. **Score real no paywall**: Substituir os fallbacks `|| 70` e `|| 7` por dados reais do usuario. Se o score for 0, adaptar a copy: "Comece sua transformacao agora" ao inves de mostrar numeros falsos.

4. **Unificar /plans e /paywall**: Sao paginas identicas. Manter uma so e usar query params ou props para variar a copy baseada no contexto (paywall vs upgrade voluntario).

5. **Historico como teaser de conversao**: Quando o frontend de historico for implementado, mostrar os 7 dias free com um blur/lock nos dias anteriores e CTA "Desbloqueie todo seu historico". O gate backend ja existe (`minHistoryDayForFreeTier`).

6. **Corrigir inconsistencia dashboard vs history**: O endpoint `GET /api/progress` serve 40 registros sem gate de tier. Ou aplicar o mesmo gate, ou aceitar que o mini-calendario de 7 dias no dashboard e um preview e o historico completo e feature premium.

7. **exerciseCompleted dinamico**: Passar `exerciseCompleted: true` quando o usuario de fato completar o exercicio. Os +5 pts extras ajudam a criar sensacao de progresso, que aumenta perceived value do produto e motivacao para upgrade.

### Tabela Resumo — Impacto Freemium nos 3 Bugs

| Bug | Freemium e causa? | Impacto real do freemium | Acao necessaria |
|-----|-------------------|--------------------------|-----------------|
| Bug 1 (Score 0 pts) | NAO | Score nao e gated — exibido igualmente free/premium | Fix no ciclo de atualizacao frontend, nao no freemium |
| Bug 2 (History placeholder) | NAO | Backend gate existe mas frontend nao consome nada | Implementar frontend; gate sera automatico |
| Bug 3 (Session verification) | PARCIAL | Paywall funciona mas UX de transicao e ruim | Usar PaywallModal, adicionar pre-warning, corrigir dados |
