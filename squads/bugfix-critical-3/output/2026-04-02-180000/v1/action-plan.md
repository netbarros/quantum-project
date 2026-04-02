# Plano de Ação — Bugfix Critical 3

## Sumário Executivo

O Bug 1 (score 0 pts) é causado por um pipeline de dados quebrado no frontend: `completeSession()` consome a resposta do backend e atualiza state interno, mas `session/page.tsx` hardcoda scoreDelta e useProgress nunca refetch. O Bug 2 é frontend 100% não implementado (backend pronto). O Bug 3 está funcional com issues menores de design system e persistência.

## Matriz de Prioridade

| # | Ação | Bug | Tipo | Impacto | Esforço | Prioridade | Fonte |
|---|------|-----|------|---------|---------|------------|-------|
| 1 | completeSession() deve retornar dados do ProgressAgent | 1 | 🔴 BUG | Alto | 10min | P0 | Lia+Artur+Eva |
| 2 | handleComplete() deve usar dados reais (não hardcode) | 1 | 🔴 BUG | Alto | 15min | P0 | Artur+Eva |
| 3 | Tratar erro de rede no handleComplete (não mostrar dados fake) | 1 | 🔴 BUG | Alto | 10min | P0 | Eva TC13 |
| 4 | Criar useSessionHistory hook | 2 | 🔴 BUG | Alto | 20min | P1 | Lia+Artur |
| 5 | Reescrever history/page.tsx com cards (spec do Teo) | 2 | 🔴 BUG | Alto | 1h | P1 | Teo+Lia |
| 6 | Empty state motivacional para /history | 2 | 🟡 IMP | Médio | 15min | P2 | Teo |
| 7 | Loading skeleton para /history | 2 | 🟡 IMP | Médio | 15min | P2 | Teo |
| 8 | Score delta animation com levelUp variant | 1 | 🟡 IMP | Médio | 20min | P2 | Teo |
| 9 | Fix dashboard font-family (DM Sans base, não Instrument) | 3 | 🟡 IMP | Baixo | 5min | P2 | Teo |
| 10 | whileHover nos CTAs do SessionBlockReader | 3 | 🟡 IMP | Baixo | 5min | P2 | Teo |
| 11 | motion.button no back button do SessionBlockReader | 3 | 🟡 IMP | Baixo | 5min | P2 | Teo |
| 12 | Tipar ProgressData unificado (eliminar duplicata) | 1 | 🟡 IMP | Médio | 15min | P2 | Artur |
| 13 | Remover useState<any> em session/page.tsx | 3 | 🟡 IMP | Baixo | 5min | P2 | Artur |
| 14 | Persistir block index em sessionStorage | 3 | 🔵 INV | Baixo | 20min | P3 | Eva+Dante |
| 15 | Paginação preventiva no GET /sessions/history | 2 | 🔵 INV | Baixo | 30min | P3 | Dante |

## Ações Agrupadas por Arquivo

### `frontend/src/hooks/useSession.ts`

- [ ] **[P0] Ação 1** — `completeSession()` (linha 88): Modificar para retornar os dados de `newProgress`. Mudar return type de `void` para `Promise<NewProgress | null>`. Após `updateUser()` (linha 105), adicionar `return p;`
  - Fonte: Lia + Artur + Eva
  - Motivo: session/page.tsx precisa dos dados reais para CompletionScreen

```typescript
// ANTES (linha 88):
const completeSession = async () => {
  // ... fetch, setProgress, updateUser
  // retorna void implícito
};

// DEPOIS:
const completeSession = async (): Promise<{ scoreDelta: number; consciousnessScore: number; level: string; streak: number; levelProgress: number } | null> => {
  // ... fetch, setProgress, updateUser
  return {
    scoreDelta: data.newProgress.scoreDelta,
    consciousnessScore: p.consciousnessScore,
    level: p.level,
    streak: p.streak,
    levelProgress: data.newProgress.levelProgress
  };
};
```

### `frontend/src/app/(protected)/session/page.tsx`

- [ ] **[P0] Ação 2** — `handleComplete()` (~linha 15-34): Usar dados retornados por `completeSession()` em vez de hardcode.

```typescript
// ANTES:
const handleComplete = async () => {
  await completeSession();
  setCompletionData({
    scoreDelta: 10,               // ❌ hardcoded
    newScore: (progress?.consciousnessScore ?? 0) + 10,
    leveledUp: false,             // ❌ sempre false
  });
};

// DEPOIS:
const handleComplete = async () => {
  const result = await completeSession();
  if (!result) {
    // Ação 3: tratar erro — não mostrar CompletionScreen com dados fake
    setError('Não foi possível completar a sessão. Tente novamente.');
    return;
  }
  setCompletionData({
    scoreDelta: result.scoreDelta,
    newScore: result.consciousnessScore,
    leveledUp: result.level !== progress?.level,
  });
};
```

- [ ] **[P0] Ação 3** — Tratar erro: se `completeSession()` retorna null, mostrar erro, NÃO renderizar CompletionScreen com dados fake.
  - Fonte: Eva TC13

- [ ] **[P2] Ação 13** — Remover `useState<any>` — tipar completionData com interface explícita.
  - Fonte: Artur

### `frontend/src/hooks/useSessionHistory.ts` (CRIAR)

- [ ] **[P1] Ação 4** — Criar novo hook:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface SessionHistoryItem {
  id: string;
  day: number;
  isCompleted: boolean;
  completedAt: string | null;
  isFavorite: boolean;
  content: {
    direction: string;
    reflection: string;
    affirmation: string;
  } | null;
}

export function useSessionHistory() {
  const [data, setData] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.get<SessionHistoryItem[]>('/sessions/history');
      setData(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { data, isLoading, error, refetch: fetchHistory };
}
```
  - Fonte: Lia + Artur

### `frontend/src/app/(protected)/history/page.tsx` (REESCREVER)

- [ ] **[P1] Ação 5** — Reescrever com cards seguindo spec do Teo:
  - Layout: cardReveal + stagger(0.08) container
  - Cada card: dia (DM Sans text-xs), título (Instrument Serif text-lg), preview (DM Sans text-sm line-clamp-2)
  - Tokens: --q-bg-surface, --q-border-default, whileHover y:-2, whileTap scale: 0.98
  - 3 estados: loading (skeleton), empty (motivacional), data (cards)
  - Fonte: Teo + Lia

- [ ] **[P2] Ação 6** — Empty state: Instrument Serif text-xl "Sua jornada começa hoje" + CTA accent "Completar primeira sessão"
  - Variant: fadeIn + smooth

- [ ] **[P2] Ação 7** — Loading: 3 skeleton cards com animate-pulse, bg-[var(--q-bg-raised)], stagger(0.12)

### `frontend/src/app/(protected)/dashboard/page.tsx`

- [ ] **[P2] Ação 9** — Fix font-family: trocar `var(--font-instrument)` por `var(--font-dm-sans)` como base da página. Instrument Serif apenas em headings de conteúdo.
  - Fonte: Teo

### `frontend/src/components/session/SessionBlockReader.tsx`

- [ ] **[P2] Ação 10** — Adicionar `whileHover={{ scale: 1.01 }}` nos botões CTA (linhas ~117 e ~177)
- [ ] **[P2] Ação 11** — Converter back button de `<button>` para `<motion.button>` com `whileTap={{ scale: 0.97 }}`
  - Fonte: Teo

### `frontend/src/hooks/useProgress.ts`

- [ ] **[P2] Ação 12** — Unificar ProgressData type (eliminar duplicata entre useProgress e useSession)
  - Fonte: Artur

## Design Specs (Teo Tokens)

### History Card
```
┌─────────────────────────────────────┐
│ Dia 15 · 12 mar 2026        ⭐ fav │  text-xs DM Sans --q-text-tertiary
│                                     │
│ A Força da Intenção Consciente      │  text-lg Instrument Serif --q-text-primary
│                                     │
│ Você praticou presença e            │  text-sm DM Sans --q-text-secondary
│ descobriu algo novo sobre...        │  line-clamp-2
│                                     │
│ ┌──────┐ ┌──────────┐              │
│ │+15pts│ │ SEEKER   │              │  DM Sans, accent badges
│ └──────┘ └──────────┘              │
└─────────────────────────────────────┘

Container: motion.div + stagger(0.08)
Card: variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring}
Background: bg-[var(--q-bg-surface)]
Border: border border-[var(--q-border-default)]
Hover: whileHover={{ y: -2 }}
Tap: whileTap={{ scale: 0.98 }}
```

### Score Delta Animation
```
1. Número atual: scale(0.95) + opacity(0.5) [fast, 150ms]
2. Novo número: levelUp variant [springBounce]
3. "+N pts": fadeIn + slideUp [smooth, 400ms] → desaparece após 2s
```

## Test Cases Prioritários (Eva Extremo)

| TC | Cenário | Prioridade |
|----|---------|------------|
| TC15 | scoreDelta hardcoded → deve usar valor real | P0 |
| TC13 | Network error → não mostrar dados fake | P0 |
| TC1 | Complete → score > 0 no perfil | P0 |
| TC5 | Complete → card aparece no /history | P1 |
| TC6 | Zero sessões → empty state (não branco) | P1 |
| TC12 | Refresh durante sessão → preservar block | P3 |

## Hipóteses Pendentes (Dante Dúvida)

| Hipótese | Classificação | Como Verificar |
|----------|---------------|----------------|
| H2 — Score 0 é correto para primeiro acesso | 🟡 | Diferenciar "nunca completou" de "bug" na UI |
| H5 — Timezone UTC vs local para streak | 🟡 | Testar com GMT-3 às 23h local |
| H11 — 365 sessões sem paginação | 🟡 | Adicionar limit/offset preventivo |
| H15 — Debounce 1s no ReflectionInput | 🟡 | Flush imediato antes de avançar bloco |
