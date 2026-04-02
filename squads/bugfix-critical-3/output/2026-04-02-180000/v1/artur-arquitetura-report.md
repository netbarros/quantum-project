# Relatório — Artur Arquitetura

**Data:** 2026-04-02
**Escopo:** Auditoria de contratos backend-frontend para 3 bugs criticos
**Metodo:** Analise estatica de tipos, response shapes, e fluxo de dados

---

## Bug 1 — Score 0 pts (CompletionScreen mostra dados hardcoded)

### Cadeia de Dados: ProgressAgent -> Controller -> Frontend

#### 1.1 ProgressAgent.handleSessionComplete() retorna (linha 125-133):

```
payload: {
  consciousnessScore: number,   // updatedUser.consciousnessScore
  level: Level,                 // updatedUser.level (enum string)
  streak: number,               // updatedUser.streak
  currentDay: number,           // updatedUser.currentDay
  levelProgress: number,        // getLevelProgress(score) -> 0-100
  scoreDelta: number,           // calculated delta (10 + bonuses)
  alreadyCompleted: boolean,    // false (or true on idempotent re-call)
}
```

#### 1.2 SessionController.completeSession() retorna (linha 206):

```json
{ "newProgress": <result.payload acima, raw pass-through> }
```

O controller faz `res.status(200).json({ newProgress: result.payload })` -- repassa o payload inteiro do ProgressAgent sem transformacao.

#### 1.3 Frontend useSession.completeSession() consome (linha 88-108):

```typescript
const data = await res.json();
const p = data.newProgress;
setProgress({
  currentDay: p.currentDay,
  consciousnessScore: p.consciousnessScore,
  level: p.level,
  streak: p.streak
});
```

**Contrato OK aqui** -- `currentDay`, `consciousnessScore`, `level`, `streak` estao todos presentes no payload do ProgressAgent.

#### 1.4 PROBLEMA CRITICO: SessionPage.handleComplete() (session/page.tsx linhas 15-34)

```typescript
const handleComplete = async () => {
  const oldLevel = progress?.level;
  const oldScore = progress?.consciousnessScore || 0;
  await completeSession();       // <-- fire and forget, nao retorna payload
  // HARDCODED VALUES:
  setCompletionData({
    scoreDelta: 10,              // HARDCODED! Real delta pode ser 5, 10, 15, ou 20
    newScore: oldScore + 10,     // HARDCODED +10! Ignora penalty/bonus
    newStreak: (progress?.streak || 0) + 1, // WRONG: pode resetar para 1
    leveledUp: false,            // HARDCODED false! Nunca detecta level up
    newLevel: progress?.level,   // Usa level ANTES da atualizacao
  });
};
```

**ROOT CAUSE:** `completeSession()` no hook `useSession.ts` NAO RETORNA o payload `newProgress` para o caller. O `SessionPage` nao tem acesso aos dados reais do ProgressAgent. Por isso hardcoda `scoreDelta: 10` e calcula manualmente.

#### 1.5 Tabela de Comparacao — Bug 1

| Campo | Prisma Schema | ProgressAgent Payload | Controller Response | useSession Hook | SessionPage UI |
|-------|--------------|----------------------|--------------------|-----------------|-----------------|
| consciousnessScore | `Int @default(0)` | `updatedUser.consciousnessScore` | `newProgress.consciousnessScore` | `p.consciousnessScore` (salvo em state) | `oldScore + 10` HARDCODED |
| level | `Level enum` | `updatedUser.level` | `newProgress.level` | `p.level` (salvo em state) | `progress?.level` STALE (pre-update) |
| streak | `Int @default(0)` | `updatedUser.streak` | `newProgress.streak` | `p.streak` (salvo em state) | `(progress?.streak \|\| 0) + 1` WRONG |
| currentDay | `Int @default(1)` | `updatedUser.currentDay` | `newProgress.currentDay` | `p.currentDay` (salvo em state) | N/A |
| scoreDelta | N/A (calculated) | Presente no payload | `newProgress.scoreDelta` | **IGNORADO** | `10` HARDCODED |
| levelProgress | N/A (calculated) | `getLevelProgress(score)` | `newProgress.levelProgress` | **IGNORADO** | **AUSENTE** |
| alreadyCompleted | N/A (flag) | `true/false` | `newProgress.alreadyCompleted` | **IGNORADO** | **AUSENTE** |

#### 1.6 Gaps Identificados

1. **`useSession.completeSession()` e void** -- Nao retorna `data.newProgress` para o caller.
2. **SessionPage hardcoda scoreDelta=10** -- O ProgressAgent calcula deltas de 5 a 20 (base 10, -5 penalty, +5 streak bonus, +5 exercise bonus). A UI sempre mostra "+10".
3. **SessionPage hardcoda leveledUp=false** -- O ProgressAgent retorna `level` atualizado, mas a SessionPage nunca compara old vs new level.
4. **SessionPage calcula streak incorretamente** -- Faz `streak + 1`, mas se o streak foi quebrado o ProgressAgent reseta para 1.
5. **`levelProgress` nunca chega a CompletionScreen** -- O ProgressAgent retorna este campo mas ele e ignorado em toda a cadeia da sessao.
6. **`any` type em SessionPage** -- `useState<any>(null)` no `completionData` viola a regra TypeScript strict do projeto.

---

## Bug 2 — History Placeholder (endpoint response shape audit)

### 2.1 Backend: GET /api/sessions/history (session.controller.ts linhas 213-248)

```json
{
  "history": [
    {
      "id": "uuid",
      "day": 5,
      "isCompleted": true,
      "completedAt": "2026-04-01T...",
      "isFavorite": true,
      "content": { /* contentJSON object */ }
    }
  ]
}
```

Campos retornados: `id`, `day`, `isCompleted`, `completedAt`, `isFavorite`, `content`.

### 2.2 Backend: GET /api/progress (progress.controller.ts linhas 48-64)

```json
{
  "consciousnessScore": 120,
  "level": "BEGINNER",
  "levelProgress": 60,
  "streak": 5,
  "currentDay": 6,
  "totalCompleted": 5,
  "completionRate": 100,
  "streakFreezeAvailable": true,
  "lastSessionDate": "2026-04-01T...",
  "history": [
    {
      "day": 5,
      "isCompleted": true,
      "completedAt": "2026-04-01T...",
      "date": "2026-04-01T..."
    }
  ]
}
```

### 2.3 Frontend: useProgress.ProgressData (useProgress.ts linhas 6-24)

```typescript
export interface HistoryEntry {
  day: number;
  isCompleted: boolean;
  completedAt: string | null;
  date: string;              // <-- maps to generatedAt from backend
}

export interface ProgressData {
  consciousnessScore: number;
  level: Level;
  levelProgress: number;
  streak: number;
  currentDay: number;
  totalCompleted: number;
  completionRate: number;
  streakFreezeAvailable: boolean;
  lastSessionDate: string | null;
  history: HistoryEntry[];
}
```

### 2.4 Tabela de Comparacao — Bug 2 (GET /api/progress)

| Campo Backend | Tipo Backend | Frontend ProgressData | Match? |
|--------------|-------------|----------------------|--------|
| `consciousnessScore` | `number` | `consciousnessScore: number` | OK |
| `level` | `Level enum string` | `level: Level` | OK |
| `levelProgress` | `number (0-100)` | `levelProgress: number` | OK |
| `streak` | `number` | `streak: number` | OK |
| `currentDay` | `number` | `currentDay: number` | OK |
| `totalCompleted` | `number` | `totalCompleted: number` | OK |
| `completionRate` | `number` | `completionRate: number` | OK |
| `streakFreezeAvailable` | `boolean` | `streakFreezeAvailable: boolean` | OK |
| `lastSessionDate` | `DateTime \| null` | `lastSessionDate: string \| null` | OK (serialized) |
| `history[].day` | `number` | `day: number` | OK |
| `history[].isCompleted` | `boolean` | `isCompleted: boolean` | OK |
| `history[].completedAt` | `DateTime?` | `completedAt: string \| null` | OK |
| `history[].date` | `generatedAt (DateTime)` | `date: string` | OK |

**Contrato GET /api/progress <-> useProgress: ALINHADO.**

### 2.5 GET /api/sessions/history -- Endpoint Orfao

O endpoint `GET /api/sessions/history` (session.controller.ts linhas 213-248) esta roteado em `session.routes.ts` linha 12, mas:

1. **Nenhum hook frontend consome este endpoint.** Nao ha nenhuma chamada a `/sessions/history` no frontend.
2. **O dashboard usa `GET /api/progress`** que ja inclui `history[]` no payload.
3. **Shape diferente do /api/progress history:** O `/sessions/history` retorna `{ id, day, isCompleted, completedAt, isFavorite, content }` -- inclui `id`, `isFavorite`, e o full `content` JSON. O `/api/progress` history retorna `{ day, isCompleted, completedAt, date }` -- muito mais leve, sem content body.

**CONCLUSAO:** O endpoint `/api/sessions/history` existe e funciona, mas e um endpoint "orfao" -- nao ha consumer no frontend. O dashboard mostra history via `/api/progress` que retorna apenas os ultimos 40 dias com shape minimo. Se a intencao era ter uma pagina "Historico Completo" com conteudo expandido + favoritos, o frontend ainda nao implementou esse consumer.

### 2.6 Monetizacao de History

O `getHistory` controller aplica corretamente o filtro `minHistoryDayForFreeTier` para usuarios free. O `/api/progress` history NAO aplica este filtro -- retorna os ultimos 40 dias indiscriminadamente. **Possivel gap de monetizacao:** usuarios free veem 40 dias de history via `/api/progress` mas deveriam ver apenas os ultimos N dias conforme regra de negocio.

---

## Bug 3 — Session Verification (Content Generation Pipeline)

### 3.1 Pipeline Completo

```
SessionController.getDailySession()
  |
  +-- MonetizationAgent.check_access()  -> accessGranted: boolean
  |
  +-- Cache check: prisma.content.findUnique({ userId, day })
  |     |
  |     +-- HIT: retorna content existente
  |     +-- MISS: continua para generation
  |
  +-- evaluateAiCallGate()              -> rate limit check
  |
  +-- ContentAgent.execute()
  |     |
  |     +-- AIGateway.generateContent(ContentInput)
  |           |
  |           +-- Primary model (OpenRouter)
  |           +-- Fallback model (OpenRouter)
  |           +-- Static fallback (getStaticFallback)
  |
  +-- prisma.content.create()           -> persist generated content
  |
  +-- Response: { session, progress, correlationId }
```

### 3.2 ContentInput (backend) vs Controller dispatch

| ContentInput field | Controller source | Prisma User field |
|-------------------|------------------|-------------------|
| `userId` | `user.id` | `id` |
| `day` | `user.currentDay` | `currentDay` |
| `language` | `user.language` | `language` |
| `painPoint` | `user.painPoint \|\| 'general'` | `painPoint String?` |
| `goal` | `user.goal \|\| 'growth'` | `goal String?` |
| `emotionalState` | `user.emotionalState \|\| 'neutral'` | `emotionalState String?` |
| `consciousnessScore` | `user.consciousnessScore` | `consciousnessScore Int` |
| `streak` | `user.streak` | `streak Int` |
| `timeAvailable` | `user.timeAvailable \|\| 10` | `timeAvailable Int?` |

**Contrato ContentInput: ALINHADO.** Todos os campos do `ContentInput` interface sao corretamente preenchidos pelo controller.

### 3.3 ContentOutput (AI response) vs Frontend SessionData.content

| ContentOutput field | Frontend content field | Match? |
|--------------------|----------------------|--------|
| `direction` | `direction: string` | OK |
| `explanation` | `explanation: string` | OK |
| `reflection` | `reflection: string` | OK |
| `action` | `action: string` | OK |
| `question` | `question: string` | OK |
| `affirmation` | `affirmation: string` | OK |
| `practice` | `practice: string` | OK |
| `integration` | `integration: string` | OK |

**Contrato ContentOutput <-> SessionData.content: ALINHADO.**

### 3.4 Session Response Shape

Backend `getDailySession` retorna:
```json
{
  "session": {
    "id": "uuid",
    "day": 5,
    "isStatic": false,
    "isCompleted": false,
    "content": { /* ContentOutput */ },
    "generatedAt": "2026-04-01T...",
    "isFavorite": false
  },
  "progress": {
    "currentDay": 5,
    "consciousnessScore": 120,
    "level": "BEGINNER",
    "streak": 4
  },
  "correlationId": "uuid"
}
```

Frontend `SessionData` (useSession.ts):
```typescript
{
  id: string;
  day: number;
  isCompleted: boolean;
  isStatic: boolean;
  isFavorite: boolean;
  content: ContentOutput;
}
```

| Backend session field | Frontend SessionData | Match? |
|----------------------|---------------------|--------|
| `id` | `id: string` | OK |
| `day` | `day: number` | OK |
| `isStatic` | `isStatic: boolean` | OK |
| `isCompleted` | `isCompleted: boolean` | OK |
| `content` (contentJSON) | `content: {...}` | OK |
| `generatedAt` | **AUSENTE no type** | MISSING |
| `isFavorite` | `isFavorite: boolean` | OK |

**Gap menor:** `generatedAt` e retornado pelo backend mas nao tipado no frontend. Nao causa bug funcional mas e inconsistencia de type safety.

### 3.5 Progress Shape na Session Response

O `getDailySession` retorna `progress` com 4 campos: `currentDay`, `consciousnessScore`, `level`, `streak`.

Frontend `ProgressData` em useSession.ts tambem tem exatamente estes 4 campos. **ALINHADO.**

Porem, note que esta e uma interface DIFERENTE de `ProgressData` em `useProgress.ts` (que tem 10 campos). Ambas se chamam `ProgressData` mas tem shapes diferentes -- potencial confusao de tipos.

### 3.6 Pipeline OK

A pipeline de geracao de conteudo esta correta:
- ContentInput -> AIGateway -> ContentOutput -> persist em Content.contentJSON -> retorna como session.content
- Fallback chain (primary -> fallback -> static) funciona corretamente
- Static fallback marca `isStatic: true` para rastreamento
- Rate limiting via `evaluateAiCallGate` protege contra abuso
- Idempotencia via `@@unique([userId, day])` impede geracao duplicada

---

## Recomendacoes

### CRITICO (Bug 1 — Score incorreto na CompletionScreen)

1. **`useSession.completeSession()` deve retornar `newProgress`:**
   ```typescript
   // useSession.ts - completeSession deve retornar o payload
   const completeSession = async (): Promise<NewProgressPayload | null> => {
     // ... fetch ...
     const data = await res.json();
     const p = data.newProgress;
     setProgress({ ... });
     return p;  // <-- RETORNAR para o caller
   };
   ```

2. **SessionPage deve usar dados reais do ProgressAgent:**
   ```typescript
   const handleComplete = async () => {
     const oldLevel = progress?.level;
     const result = await completeSession();
     if (result) {
       setCompletionData({
         scoreDelta: result.scoreDelta,        // REAL delta
         newScore: result.consciousnessScore,   // REAL score
         newStreak: result.streak,              // REAL streak
         leveledUp: oldLevel !== result.level,  // REAL comparison
         newLevel: result.level,                // REAL new level
       });
     }
   };
   ```

3. **Definir tipo `NewProgressPayload` no frontend** para type safety:
   ```typescript
   interface NewProgressPayload {
     consciousnessScore: number;
     level: string;
     streak: number;
     currentDay: number;
     levelProgress: number;
     scoreDelta: number;
     alreadyCompleted: boolean;
   }
   ```

4. **Eliminar `useState<any>`** em `session/page.tsx` linha 12 -- substituir por tipo concreto.

### MEDIO (Bug 2 — History orfao + gap de monetizacao)

5. **Decidir destino do endpoint `/api/sessions/history`:** Se pretende-se uma tela de historico completo, implementar consumer no frontend. Se nao, considerar deprecar.

6. **Aplicar filtro de monetizacao no `/api/progress` history:** O `getProgress` retorna 40 dias sem filtro de plano. Deve aplicar `minHistoryDayForFreeTier` de forma consistente com `/api/sessions/history`.

### MENOR (Type safety e consistencia)

7. **Unificar ou renomear as duas interfaces `ProgressData`:** `useSession.ProgressData` (4 campos) e `useProgress.ProgressData` (10 campos) podem confundir. Renomear a menor para `SessionProgress` ou similar.

8. **Adicionar `generatedAt` ao tipo `SessionData`** no frontend para consistencia com o backend.

9. **Frontend `User` type (types/index.ts) nao inclui:** `currentDay`, `streakFreezeUsed`, `streakFreezeDate`, `lastSessionDate`, `premiumSince`, `premiumUntil`. Campos sao acessiveis via outros hooks mas o tipo central esta incompleto.

---

## Resumo de Severidade

| Bug | Severidade | Root Cause | Impacto no Usuario |
|-----|-----------|------------|-------------------|
| Bug 1 | **CRITICO** | `completeSession()` void + hardcoded values | Score incorreto (+10 sempre), streak incorreto, level-up nunca detectado |
| Bug 2 | MEDIO | Endpoint orfao + filtro monetizacao inconsistente | History funcional via /progress, mas /sessions/history sem consumer; free users podem ver mais history do que deveriam |
| Bug 3 | BAIXO | Pipeline OK; gaps menores de type safety | `generatedAt` nao tipado, dois `ProgressData` com mesmo nome |
