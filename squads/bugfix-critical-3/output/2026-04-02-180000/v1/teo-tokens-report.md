# Relatorio -- Teo Tokens

**Design Director System 6 -- Quantum Project**
**Data:** 2026-04-02 | **Scope:** Bugs 1-3 (Score, History, Session Typography)

---

## Bug 1 -- Score 0 pts

### 1.1 Diagnostico

O perfil (`profile/page.tsx` L147) exibe o score assim:

```tsx
<span className="text-sm font-bold text-[var(--q-cyan-9)]">
  {profile.consciousnessScore ?? 0} pts
</span>
```

**Problemas identificados:**
- Nenhuma animacao no score delta. Quando o usuario completa uma sessao e volta ao perfil, o valor aparece estático -- sem feedback visual de crescimento.
- O `CompletionScreen.tsx` tem um `+{scoreDelta}` animado (L77-84) mas usa uma transicao inline `TRANSITIONS.spring` com delay manual. Nao aplica o variant `VARIANTS.levelUp` do sistema.
- O `CompletionScreen` simula `scoreDelta: 10` hardcoded (session/page.tsx L29) -- nao recebe dados reais do ProgressAgent.
- No perfil, a barra de progresso usa `initial={{ width: 0 }}` com `transition={{ duration: 1, ease: "easeOut" }}` -- esta correto, mas o score numerico nao anima (deveria contar de 0 ate N).

### 1.2 Spec: Score Delta Animation

**Variant:** `VARIANTS.levelUp` (ja existe em `lib/animations.ts`)

```
initial: { scale: 0.5, opacity: 0 }
animate: { scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }
```

**Transition:** `TRANSITIONS.springBounce`

```
type: 'spring', stiffness: 400, damping: 25
```

**Implementacao requerida para o score delta no Perfil:**

```tsx
{/* Score display with animated counter */}
<motion.span
  key={profile.consciousnessScore}   {/* key change triggers re-animation */}
  variants={VARIANTS.levelUp}
  initial="initial"
  animate="animate"
  transition={TRANSITIONS.springBounce}
  className="text-sm font-bold text-[var(--q-cyan-9)] tabular-nums"
>
  {profile.consciousnessScore ?? 0} pts
</motion.span>
```

**Tokens exatos:**
- Cor do score: `var(--q-cyan-9)` (#67E8F9)
- Fonte: `font-[family-name:var(--font-dm-sans)]` (dados numericos = UI font)
- Tamanho: `text-sm` (atual) -- OK
- `tabular-nums` para alinhamento numerico estavel
- `font-bold` -- OK

**Para o CompletionScreen (+scoreDelta):**

O `CompletionScreen.tsx` L77-84 deve usar `VARIANTS.levelUp` + `TRANSITIONS.springBounce` em vez de inline:

```tsx
<motion.div
  variants={VARIANTS.levelUp}
  initial="initial"
  animate="animate"
  transition={{ ...TRANSITIONS.springBounce, delay: 0.5 }}
  className="text-[var(--q-accent-9)] text-6xl font-bold mb-1 tabular-nums"
>
  +{scoreDelta}
</motion.div>
```

### 1.3 Spec: Animated Number Counter (recomendado)

Para o perfil, um counter que anima de `prevScore` ate `newScore`:

```
Component: <AnimatedScore value={number} />
Animation: useMotionValue + useTransform + animate
Duration: 1.2s, ease: TRANSITIONS.smooth
Font: font-[family-name:var(--font-dm-sans)]
Color: var(--q-cyan-9)
Size: text-sm font-bold tabular-nums
```

---

## Bug 2 -- History Placeholder

### 2.1 Diagnostico

O arquivo `history/page.tsx` e um placeholder estatico. 22 linhas. Nao consome dados do backend. Exibe apenas um icone `(simbolo)` com texto motivacional. Nao ha componente `HistoryCard`. Nao ha skeleton. Nao ha estado de erro.

O backend JA TEM os dados:
- `GET /api/progress` retorna `history: HistoryEntry[]` com `{ day, isCompleted, completedAt, date }`
- `model Content` no Prisma tem `contentJSON` (JSON completo da sessao), `isCompleted`, `completedAt`
- `model JournalEntry` tem `reflection` (texto escrito pelo usuario)

**O que falta:** Um componente de pagina que consome `/api/progress`, lista as sessoes completadas como cards, e exibe estados corretos para loading/empty/error.

### 2.2 Spec: History Card Component

**Nome:** `HistoryCard`
**Local:** `frontend/src/components/history/HistoryCard.tsx`

#### ASCII Mockup -- History Card (Estado: Completado)

```
+--------------------------------------------------+
|  [var(--q-bg-surface)]  border: var(--q-border-subtle)  |
|  rounded-2xl (--q-radius-xl: 24px)              |
|                                                  |
|  DIA 12                           ter, 15 mar    |
|  [--q-accent-9, 10px, uppercase,  [--q-text-     |
|   tracking-widest, DM Sans]        tertiary,     |
|                                    text-xs]      |
|                                                  |
|  "Voce nao precisa ser perfeito               |
|   para comecar de novo."                        |
|  [Instrument Serif, italic, text-lg,            |
|   --q-text-primary, leading-relaxed]            |
|                                                  |
|  -------------------------------------------    |
|  [--q-border-subtle, 1px]                       |
|                                                  |
|  Reflexao:                                       |
|  "Hoje entendi que a constancia..."             |
|  [DM Sans, text-sm, --q-text-secondary,         |
|   max 2 lines, line-clamp-2]                    |
|                                                  |
|  [check icon] Completado    [heart icon]         |
|  [--q-green-8, text-xs]    [--q-red-8 if fav]  |
|                                                  |
+--------------------------------------------------+
```

#### ASCII Mockup -- History Card (Estado: Nao Completado)

```
+--------------------------------------------------+
|  [var(--q-bg-raised)]  border: var(--q-border-subtle)   |
|  rounded-2xl   opacity: 0.6                     |
|                                                  |
|  DIA 8                             seg, 11 mar   |
|                                                  |
|  Sessao nao realizada                           |
|  [DM Sans, text-sm, --q-text-tertiary, italic]  |
|                                                  |
|  [x icon] Perdido                                |
|  [--q-text-tertiary, text-xs]                   |
|                                                  |
+--------------------------------------------------+
```

#### Tokens Exatos

| Propriedade         | Token / Valor                                  |
| ------------------- | ---------------------------------------------- |
| Card bg (done)      | `var(--q-bg-surface)` (#13131F)                |
| Card bg (missed)    | `var(--q-bg-raised)` (#1A1A2E) + opacity 0.6  |
| Card border         | `var(--q-border-subtle)` (rgba 255,255,255,0.05) |
| Card radius         | `rounded-2xl` = `var(--q-radius-xl)` (24px)    |
| Card padding        | `p-5` (20px = --q-space-5)                     |
| Card shadow         | Nenhum (flat, coerente com profile cards)      |
| Day label font      | `font-[family-name:var(--font-dm-sans)]`       |
| Day label style     | `text-[10px] font-bold uppercase tracking-widest` |
| Day label color     | `var(--q-accent-9)` (#A78BFA)                  |
| Date label font     | `font-[family-name:var(--font-dm-sans)]`       |
| Date label color    | `var(--q-text-tertiary)` (#5A5A6E)             |
| Direction quote     | `font-[family-name:var(--font-instrument)] italic` |
| Direction size      | `text-lg` (20px)                               |
| Direction color     | `var(--q-text-primary)` (#F0F0FA)              |
| Direction leading   | `leading-relaxed`                              |
| Reflection font     | `font-[family-name:var(--font-dm-sans)]`       |
| Reflection size     | `text-sm` (13px)                               |
| Reflection color    | `var(--q-text-secondary)` (#8B8BA8)            |
| Reflection truncate | `line-clamp-2`                                 |
| Divider             | `border-t border-[var(--q-border-subtle)]`     |
| Status completed    | `var(--q-green-8)` (#10B981) + check icon      |
| Status missed       | `var(--q-text-tertiary)` (#5A5A6E) + x icon    |
| Favorite active     | `var(--q-red-8)` (#EF4444) filled heart        |
| Favorite inactive   | `var(--q-text-tertiary)` outline heart          |

#### Animation Spec

| Element           | Variant                | Transition              | Notes                         |
| ----------------- | ---------------------- | ----------------------- | ----------------------------- |
| Page container    | `VARIANTS.pageEnter`   | `TRANSITIONS.spring`    | Blur-in on mount              |
| Card list parent  | `stagger(0.08)`        | --                      | Stagger children on mount     |
| Each card         | `VARIANTS.cardReveal`  | `TRANSITIONS.spring`    | y:24 + scale:0.97 entrance    |
| Favorite toggle   | `VARIANTS.streakFire`  | `TRANSITIONS.springBounce` | Scale + rotate on tap      |
| Card tap          | `whileTap={{ scale: 0.98 }}` | --               | Micro-feedback                |

### 2.3 Spec: Empty State for /history

#### ASCII Mockup -- Empty State

```
+--------------------------------------------------+
|              min-h-[80vh] flex center             |
|                                                  |
|        +----------------------------+            |
|        |  w-24 h-24 rounded-full    |            |
|        |  bg: var(--q-bg-surface)   |            |
|        |  border: --q-accent-8/20   |            |
|        |                            |            |
|        |        (orb glow)          |            |
|        |    orbPulse animation      |            |
|        +----------------------------+            |
|                                                  |
|            Sua Jornada Comeca Aqui              |
|  [Instrument Serif, italic, text-2xl,           |
|   --q-text-primary, glow-accent class]          |
|                                                  |
|    Cada sessao completada se torna um           |
|    fragmento da sua transformacao. Comece       |
|    hoje e veja sua evolucao tomar forma.        |
|  [DM Sans, text-sm, --q-text-secondary,        |
|   max-w-xs, text-center, leading-relaxed]       |
|                                                  |
|  +------------------------------------------+   |
|  |   Comecar Primeira Sessao                |   |
|  |   h-12 rounded-full bg-[--q-accent-8]   |   |
|  |   text-white, font-medium               |   |
|  |   whileTap={{ scale: 0.97 }}            |   |
|  |   shadow: --q-shadow-glow-accent        |   |
|  +------------------------------------------+   |
|                                                  |
+--------------------------------------------------+
```

#### Tokens Exatos

| Elemento          | Especificacao                                       |
| ----------------- | --------------------------------------------------- |
| Orb container     | `w-24 h-24 rounded-full bg-[var(--q-bg-surface)]`  |
| Orb border        | `border border-[var(--q-accent-8)]/20`              |
| Orb glow ring     | Pseudo-element `absolute inset-0 rounded-full border border-[var(--q-accent-8)] opacity-20 scale-110` |
| Orb animation     | `animate={VARIANTS.orbPulse}` com `transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}` |
| Headline font     | `font-[family-name:var(--font-instrument)] italic`  |
| Headline size     | `text-2xl` (30px)                                   |
| Headline color    | `var(--q-text-primary)` + class `glow-accent`       |
| Body font         | `font-[family-name:var(--font-dm-sans)]`            |
| Body size         | `text-sm`                                           |
| Body color        | `var(--q-text-secondary)`                           |
| Body width        | `max-w-xs mx-auto`                                 |
| CTA button        | `h-12 rounded-full bg-[var(--q-accent-8)]`          |
| CTA text          | `text-white font-medium text-base`                  |
| CTA shadow        | `shadow-[var(--q-shadow-glow-accent)]`              |
| CTA tap           | `whileTap={{ scale: 0.97 }}`                        |
| CTA hover         | `whileHover={{ scale: 1.01 }}`                      |
| Page animation    | `VARIANTS.pageEnter` initial="initial" animate="animate" |
| Page transition   | `TRANSITIONS.spring`                                |

**Nota sobre o empty state atual:** O `history/page.tsx` existente usa `VARIANTS.pageEnter` (correto) e a tipografia esta alinhada. Porem falta:
1. Animacao `orbPulse` no icone central (atualmente estatico)
2. Botao CTA para redirecionar a `/session`
3. O texto motivacional deve usar Instrument Serif (headline) + DM Sans (body) -- atualmente o body ja esta correto

### 2.4 Spec: Loading Skeleton

#### ASCII Mockup

```
+--------------------------------------------------+
|  Header skeleton                                 |
|  [w-32 h-6 rounded-lg bg-[--q-bg-raised]       |
|   animate-pulse]                                 |
|                                                  |
|  +--------------------------------------------+ |
|  | Card skeleton 1                             | |
|  | [w-16 h-3]  [day label pulse]   [w-20 h-3] | |
|  | [w-full h-5] [direction pulse, 2 lines]    | |
|  | [w-3/4 h-4]                                | |
|  | [w-2/3 h-3] [reflection pulse]             | |
|  +--------------------------------------------+ |
|                                                  |
|  +--------------------------------------------+ |
|  | Card skeleton 2  (staggered delay 0.08)    | |
|  | ...                                         | |
|  +--------------------------------------------+ |
|                                                  |
|  +--------------------------------------------+ |
|  | Card skeleton 3  (staggered delay 0.16)    | |
|  | ...                                         | |
|  +--------------------------------------------+ |
+--------------------------------------------------+
```

#### Tokens

| Propriedade       | Valor                                     |
| ----------------- | ----------------------------------------- |
| Skeleton bg       | `bg-[var(--q-bg-raised)]` (#1A1A2E)      |
| Skeleton radius   | `rounded-lg` (16px)                       |
| Skeleton animation| `animate-pulse` (Tailwind built-in)       |
| Card container    | Same as HistoryCard: `bg-[var(--q-bg-surface)] rounded-2xl p-5 border border-[var(--q-border-subtle)]` |
| Stagger           | `stagger(0.08)` entre cards               |
| Variant           | `VARIANTS.cardReveal` com stagger         |
| Quantidade        | 3 skeleton cards                          |

### 2.5 Spec: Error State

```
+--------------------------------------------------+
|              min-h-[60vh] flex center             |
|                                                  |
|    Nao foi possivel carregar sua jornada.       |
|    [DM Sans, text-sm, --q-red-8]               |
|                                                  |
|    +--------------------------------------+      |
|    |  Tentar novamente                    |      |
|    |  rounded-full border --q-border-default|    |
|    |  text-[--q-text-secondary]           |      |
|    |  whileTap={{ scale: 0.97 }}          |      |
|    +--------------------------------------+      |
+--------------------------------------------------+
```

Segue o padrao identico ao error state de `session/page.tsx` L62-72.

---

## Bug 3 -- Session Block Typography Verification

### 3.1 Auditoria por Bloco

Analisei `SessionBlockReader.tsx` contra o Design System. O `BLOCK_CONFIG` (L20-32):

| Block         | Config font  | Config size | Font Correta?        | Size Correto?  | Nota                              |
| ------------- | ------------ | ----------- | -------------------- | -------------- | --------------------------------- |
| `direction`   | `serif`      | `text-2xl`  | SIM (Instrument)     | SIM            | Conteudo espiritual = serif       |
| `explanation` | `sans`       | `text-base` | SIM (DM Sans)        | SIM            | Corpo explicativo = sans          |
| `reflection`  | `sans`       | `text-lg`   | **AUDITORIA**: OK    | OK             | Prompt de reflexao, sans correto  |
| `action`      | `sans`       | `text-base` | SIM                  | SIM            | Instrucao pratica = sans          |
| `question`    | `serif`      | `text-xl`   | SIM (Instrument)     | SIM            | Pergunta profunda = serif         |
| `affirmation` | `serif`      | `text-3xl`  | SIM (Instrument)     | SIM            | Fullscreen, italic, glow correto  |
| `practice`    | `sans`       | `text-base` | SIM                  | SIM            | Instrucao pratica = sans          |
| `integration` | `sans`       | `text-base` | SIM                  | SIM            | Fechamento, sans correto          |

**Resultado: Tipografia dos blocos esta 100% aderente ao Design System.**

### 3.2 Auditoria de Micro-Interacoes

| Elemento               | Presente? | Spec                                          | Status          |
| ---------------------- | --------- | --------------------------------------------- | --------------- |
| Progress bar segments  | SIM       | `TRANSITIONS.spring` no fill                  | CORRETO         |
| Block transition       | SIM       | `VARIANTS.slideHorizontal` + `TRANSITIONS.smooth` | CORRETO     |
| Back button hover      | SIM       | `hover:bg-[var(--q-bg-surface)]`              | CORRETO         |
| CTA button `whileTap`  | SIM       | `scale: 0.97`                                 | CORRETO         |
| CTA button shadow      | SIM       | `var(--q-shadow-glow-accent)`                 | CORRETO         |
| Affirmation glow       | SIM       | Pulsing `orbPulse`-style com blur-3xl         | CORRETO         |
| Affirmation drop-shadow| SIM       | `drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]` | CORRETO        |
| Reflection input delay | SIM       | `delay: 0.4` fadeIn                           | CORRETO         |
| `whileHover` no CTA    | **NAO**   | Deveria ter `whileHover={{ scale: 1.01 }}`    | **FALTANDO**    |
| Disabled back opacity  | SIM       | `disabled:opacity-30`                         | CORRETO         |

### 3.3 Problemas Encontrados na Session

1. **whileHover ausente no CTA principal** (L177): O botao "Continuar" tem `whileTap` mas falta `whileHover={{ scale: 1.01 }}` -- padrao System 6 para todos os botoes (ver CLAUDE.md: "Button Pattern: Always include whileTap and specific styling").

2. **CTA do fullscreen** (L114-120): Tambem sem `whileHover`. Mesma correcao.

3. **AnimatePresence mode="wait"** (L87): Correto para transicoes sequenciais entre blocos.

4. **Back button sem motion.button** (L167-175): E um `<button>` normal. Deveria ser `<motion.button>` com `whileTap={{ scale: 0.95 }}` para micro-feedback tatil.

---

## Recomendacoes

### Prioridade Alta (Bugs reportados)

1. **Score Delta no Perfil**: Envolver o score em `<motion.span>` com `VARIANTS.levelUp` + `TRANSITIONS.springBounce`. Usar `key={score}` para re-trigger na mudanca.

2. **History Page Completa**: Implementar com `useProgress()` hook (ja existe), mapear `data.history` para `HistoryCard` components. Idealmente criar endpoint dedicado `/api/history` que retorne o `contentJSON` junto (atualmente `HistoryEntry` so tem `day`, `isCompleted`, `completedAt`, `date` -- falta o conteudo textual da sessao para exibir a direction quote no card).

3. **Empty State com CTA**: Adicionar botao "Comecar Primeira Sessao" que navega para `/session`. Adicionar `orbPulse` no icone.

### Prioridade Media (Conformidade System 6)

4. **whileHover em todos os CTAs**: Adicionar `whileHover={{ scale: 1.01 }}` nos botoes do SessionBlockReader (L117 e L177).

5. **Back button como motion.button**: Converter para `<motion.button whileTap={{ scale: 0.95 }}>` no SessionBlockReader L167.

6. **CompletionScreen score animation**: Trocar transicao inline por `VARIANTS.levelUp` + `TRANSITIONS.springBounce` para coerencia com o sistema.

### Prioridade Baixa (Melhorias)

7. **Backend: Endpoint /api/history**: Criar rota dedicada que retorne sessoes completadas com `contentJSON.direction` (a quote do dia) e `journalEntries[0].reflection` para popular o HistoryCard completo.

8. **Animated Number Counter**: Implementar `<AnimatedScore>` component que conta de prevValue ate newValue usando `useMotionValue` + `useTransform` -- reutilizavel no perfil, dashboard e CompletionScreen.

9. **Skeleton shimmer customizado**: Substituir `animate-pulse` por um shimmer gradient animado com tokens Quantum (purple-tinted) em vez do cinza generico do Tailwind.

10. **Dashboard typography incoerencia**: O `dashboard/page.tsx` usa `font-family: var(--font-instrument, system-ui, sans-serif)` no `.dashboard-root` (L138) -- isto aplica Instrument Serif como fonte BASE de toda a pagina incluindo labels UI. Deveria ser `var(--font-dm-sans)` como fonte base, com Instrument Serif apenas em headlines especificas.

---

## Arquivos Auditados

| Arquivo | Linhas | Aderencia System 6 |
| ------- | ------ | ------------------- |
| `frontend/src/app/(protected)/profile/page.tsx` | 227 | 90% -- falta score animation |
| `frontend/src/app/(protected)/history/page.tsx` | 23 | 40% -- placeholder, sem dados |
| `frontend/src/components/session/SessionBlockReader.tsx` | 188 | 95% -- falta whileHover |
| `frontend/src/components/session/CompletionScreen.tsx` | 156 | 85% -- inline transitions |
| `frontend/src/lib/animations.ts` | 93 | 100% -- referencia correta |
| `frontend/src/app/globals.css` | 127 | 100% -- tokens alinhados |
| `frontend/src/app/(protected)/dashboard/page.tsx` | 360 | 75% -- font-family bug, inline styles |

---

*Relatorio gerado por Teo Tokens -- Design Director System 6*
*READ-ONLY audit -- nenhum arquivo foi modificado*
