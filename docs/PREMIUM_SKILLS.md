# PREMIUM_SKILLS.md — Quantum Project
## Referências Premium de UI/UX para Agentes de IA
### System 6 · Antigravity Edition

---

## SKILL 1 — ONBOARDING PROGRESSIVO

### Problema a resolver
Onboarding genérico com formulários cria fricção. O objetivo é criar **antecipação e intenção** — o usuário deve sentir que está começando algo significativo, não preenchendo um cadastro.

### Padrão Premium (referência: Linear, Notion AI, Luma)

```
Step 0 — Welcome (não pulável)
  Duração: 2 segundos de animação + 1 segundo de leitura
  Elemento: Partícula/orb animado + frase de impacto
  Não tem botão imediato — o usuário precisa absorver

Step 1–4 — Seleção Visual (não formulário)
  Layout: Pergunta grande (Instrument Serif, 28px) + 4-6 cards visuais
  Cada card: ícone ou emoji + label + descrição curta
  Selecionado: border accent + background dim + escala 1.02
  Transição: slide horizontal (direção: esquerda para direita = progresso)
  
Progress bar: linha fina no topo, não dots
CTA: "Continuar" (não "Próximo" ou "Submit")
  
Profile Reveal (após step 4)
  Animação de "revelação": círculo expandindo do centro
  Mostra: nome do perfil + descrição + orb vazio mas animado
  Dura 3 segundos antes do CTA aparecer
  CTA: "Iniciar Dia 1" (nunca "Ir para o app")
```

### Código — OptionCard Component

```tsx
'use client';
import { motion } from 'framer-motion';

interface OptionCardProps {
  icon: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({ icon, label, description, selected, onSelect }: OptionCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: selected ? 1.02 : 1,
        borderColor: selected ? 'var(--q-accent-8)' : 'var(--q-border-default)',
        backgroundColor: selected ? 'var(--q-accent-dim)' : 'var(--q-bg-surface)',
      }}
      transition={{ duration: 0.15 }}
      className="w-full text-left p-4 rounded-[var(--q-radius-lg)] border transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-[var(--q-text-primary)] font-medium">{label}</p>
          {description && (
            <p className="text-[var(--q-text-secondary)] text-sm mt-0.5">{description}</p>
          )}
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto w-5 h-5 rounded-full bg-[var(--q-accent-8)] flex items-center justify-center"
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
```

---

## SKILL 2 — DAILY SESSION — LEITURA PROGRESSIVA

### Problema a resolver
Exibir 8 blocos de texto de uma vez cria sobrecarga cognitiva. O usuário escaneia em vez de absorver. Precisamos de **leitura ritual** — um bloco de cada vez, com intenção.

### Padrão Premium (referência: Readwise, Substack, Apple Books)

```
Arquitectura:
- Usuário vê apenas 1 bloco por vez
- Avança com: tap na metade inferior da tela OU botão "Continuar"
- Blocos especiais têm layout diferente:
  - DIRECTION: fundo único, fonte grande, sem botão imediato (2s delay)
  - AFFIRMATION: tela cheia, efeito glow, fundo mais escuro
  - PRACTICE: timer circular, som ambiente opcional
  - REFLECTION: campo de texto opcional (não obrigatório)

Progress bar: 8 segmentos no topo
- Preenchidos progressivamente
- Cor: --q-accent-8
- Animação de preenchimento: spring

Gestos:
- Swipe left → avançar bloco (se não for primeiro)
- Swipe right → voltar bloco
- Long press → favoritar bloco atual
```

### Código — SessionBlockReader Component

```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VARIANTS, TRANSITIONS } from '@/lib/animations';

const BLOCK_KEYS = [
  'direction', 'explanation', 'reflection', 'action',
  'question', 'affirmation', 'practice', 'integration'
] as const;

const BLOCK_CONFIG = {
  direction:   { font: 'serif', size: 'text-2xl', fullScreen: false, delay: 2 },
  explanation: { font: 'sans',  size: 'text-base', fullScreen: false, delay: 0 },
  reflection:  { font: 'sans',  size: 'text-lg',   fullScreen: false, delay: 0, hasInput: true },
  action:      { font: 'sans',  size: 'text-base', fullScreen: false, delay: 0, hasCTA: true },
  question:    { font: 'serif', size: 'text-xl',   fullScreen: false, delay: 0 },
  affirmation: { font: 'serif', size: 'text-2xl',  fullScreen: true,  delay: 1.5, glow: true },
  practice:    { font: 'sans',  size: 'text-base', fullScreen: false, delay: 0, hasTimer: true },
  integration: { font: 'sans',  size: 'text-base', fullScreen: false, delay: 0, isFinal: true },
};

export function SessionBlockReader({ content, onComplete }: {
  content: Record<string, string>;
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const blockKey = BLOCK_KEYS[currentIndex];
  const config = BLOCK_CONFIG[blockKey];
  const isLast = currentIndex === BLOCK_KEYS.length - 1;

  const advance = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentIndex(i => i + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--q-bg-void)]">
      {/* Progress bar */}
      <div className="flex gap-1 p-4 pt-safe">
        {BLOCK_KEYS.map((_, i) => (
          <motion.div
            key={i}
            className="h-0.5 flex-1 rounded-full bg-[var(--q-border-subtle)]"
            animate={{
              backgroundColor: i <= currentIndex
                ? 'var(--q-accent-8)'
                : 'var(--q-border-subtle)',
            }}
            transition={TRANSITIONS.smooth}
          />
        ))}
      </div>

      {/* Block content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={blockKey}
            custom={direction}
            variants={{
              initial: (d: number) => ({ opacity: 0, x: d * 32, filter: 'blur(4px)' }),
              animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
              exit: (d: number) => ({ opacity: 0, x: d * -32, filter: 'blur(4px)' }),
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITIONS.smooth}
          >
            <p className={`
              ${config.font === 'serif' ? 'font-[family-name:var(--font-instrument)] italic' : 'font-[family-name:var(--font-dm-sans)]'}
              ${config.size}
              text-[var(--q-text-primary)] leading-relaxed
              ${config.glow ? 'drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]' : ''}
            `}>
              {content[blockKey]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="p-6 pb-safe">
        <motion.button
          onClick={advance}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-base"
        >
          {isLast ? 'Completar sessão ✓' : 'Continuar'}
        </motion.button>
      </div>
    </div>
  );
}
```

---

## SKILL 3 — CONSCIOUSNESS ORB

### Problema a resolver
O dashboard atual provavelmente tem números secos (847/1000, "Aligned"). Isso não cria conexão emocional com o progresso. O **Orb** é a metáfora central — é a representação visual da consciência do usuário.

### Especificação Visual

```
O Orb é um SVG animado (não Canvas/WebGL — muito pesado para mobile):

- Círculo central com gradiente radial
  Cor muda por nível:
  BEGINNER:   #5A4FCF → #3730A3 (roxo frio, opaco)
  AWARE:      #7C3AED → #6D28D9 (roxo puro)
  CONSISTENT: #8B5CF6 → #0EA5E9 (roxo → azul)
  ALIGNED:    #06B6D4 → #0891B2 (ciano, brilhante)
  INTEGRATED: #10B981 → #6EE7B7 (verde, luminoso)

- Anel de progresso
  SVG circle com strokeDashoffset animado
  Mostra: % para próximo nível
  Animação: spring quando score muda

- Partículas orbitais (streak days)
  Pontos pequenos orbitando o círculo
  Quantidade = Math.min(streak, 12)
  Cada ponto = 1 dia de streak
  Animação: rotação contínua (CSS transform)

- Pulsação de vida
  scale: 1 → 1.03 → 1, loop infinito, 3s
  Só ativa se isCompleted today === true
  Se inativo (lastSession > 1 dia): pulsação mais lenta, opacidade reduzida

- Level up: 
  Explosão de partículas (canvas-confetti, 200ms)
  Mudança de cor do orb com transition 600ms
  Número do score animado com spring
```

### Código — ConsciousnessOrb Component

```tsx
'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const LEVEL_COLORS = {
  BEGINNER:   ['#5A4FCF', '#3730A3'],
  AWARE:      ['#7C3AED', '#6D28D9'],
  CONSISTENT: ['#8B5CF6', '#0EA5E9'],
  ALIGNED:    ['#06B6D4', '#0891B2'],
  INTEGRATED: ['#10B981', '#6EE7B7'],
} as const;

interface OrbProps {
  score: number;
  level: keyof typeof LEVEL_COLORS;
  streak: number;
  isActiveToday: boolean;
  size?: number;
}

export function ConsciousnessOrb({ score, level, streak, isActiveToday, size = 200 }: OrbProps) {
  const [colorStart, colorEnd] = LEVEL_COLORS[level];
  
  // Score animado com spring
  const springScore = useSpring(score, { stiffness: 100, damping: 30 });
  
  // Progress ring: % para próximo nível
  const levelBounds = { BEGINNER: [0,200], AWARE: [200,400], CONSISTENT: [400,600], ALIGNED: [600,800], INTEGRATED: [800,1000] };
  const [min, max] = levelBounds[level];
  const progress = (score - min) / (max - min);
  const circumference = 2 * Math.PI * (size / 2 - 12);
  const strokeDashoffset = circumference * (1 - progress);
  
  const orbitingDots = Math.min(streak, 12);
  const radius = size / 2 + 20;

  return (
    <div className="relative" style={{ width: size + 60, height: size + 60 }}>
      <svg
        width={size + 60}
        height={size + 60}
        viewBox={`0 0 ${size + 60} ${size + 60}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`orbGrad-${level}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colorEnd} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colorStart} stopOpacity="0.6" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Progress ring */}
        <motion.circle
          cx={(size + 60) / 2}
          cy={(size + 60) / 2}
          r={size / 2 - 12}
          fill="none"
          stroke={colorStart}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${(size + 60) / 2} ${(size + 60) / 2})`}
          opacity={0.8}
        />

        {/* Orb core */}
        <motion.circle
          cx={(size + 60) / 2}
          cy={(size + 60) / 2}
          r={size / 2 - 16}
          fill={`url(#orbGrad-${level})`}
          filter="url(#glow)"
          animate={{
            scale: isActiveToday ? [1, 1.03, 1] : [1, 1.01, 1],
            opacity: isActiveToday ? [0.9, 1, 0.9] : [0.6, 0.7, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbiting dots (streak) */}
        {Array.from({ length: orbitingDots }).map((_, i) => {
          const angle = (i / orbitingDots) * 2 * Math.PI;
          const x = (size + 60) / 2 + Math.cos(angle) * radius;
          const y = (size + 60) / 2 + Math.sin(angle) * radius;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={colorStart}
              opacity={0.7}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.5,
              }}
              style={{ transformOrigin: `${(size + 60) / 2}px ${(size + 60) / 2}px` }}
            />
          );
        })}
      </svg>

      {/* Score no centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.p
            className="text-3xl font-bold text-[var(--q-text-primary)] tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {Math.round(score)}
          </motion.p>
          <p className="text-xs text-[var(--q-text-secondary)] uppercase tracking-widest mt-1">
            {level.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## SKILL 4 — COMPLETION SCREEN & SCORE DELTA

### Problema a resolver
Completar uma sessão é o momento de maior valor emocional. Uma tela genérica de "parabéns" desperdiça esse momento. Precisamos de **celebração proporcional** que reforce o comportamento.

### Especificação

```
Trigger: POST /api/session/:id/complete → sucesso

Animação sequence (1.5 segundos total):
  0.0s: Fundo expande do centro (circle clip-path: 0% → 100%)
  0.2s: Ícone de check aparece com spring bounce
  0.4s: "+10" aparece acima com float-up animation
  0.6s: Streak counter atualiza com "fogo" animation
  0.8s: Se level up → explosão de partículas + novo título
  1.0s: Cards de CTA aparecem com stagger

Se level up (level changed):
  - Tela adicional: "Novo Nível: [LEVEL NAME]"
  - Confetti com canvas-confetti (cores do level)
  - Descrição do novo nível
  - Duração: +2 segundos
```

### Código — CompletionScreen

```tsx
'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TRANSITIONS } from '@/lib/animations';

interface CompletionProps {
  scoreDelta: number;           // +10 normalmente
  newScore: number;
  newStreak: number;
  leveledUp?: boolean;
  newLevel?: string;
  onContinue: () => void;
  onViewProgress: () => void;
}

export function CompletionScreen({
  scoreDelta, newScore, newStreak, leveledUp, newLevel,
  onContinue, onViewProgress
}: CompletionProps) {

  useEffect(() => {
    if (leveledUp) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
      });
    }
  }, [leveledUp]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[var(--q-bg-void)] flex flex-col items-center justify-center px-6 z-50"
    >
      {/* Check icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-[var(--q-green-dim)] border border-[var(--q-green-8)] flex items-center justify-center mb-8"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <motion.path
            d="M6 16L13 23L26 9"
            stroke="var(--q-green-8)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          />
        </svg>
      </motion.div>

      {/* Score delta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TRANSITIONS.spring, delay: 0.5 }}
        className="text-[var(--q-accent-9)] text-5xl font-bold mb-2"
      >
        +{scoreDelta}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-[var(--q-text-secondary)] text-sm mb-8"
      >
        pontos de consciência · total: {newScore}
      </motion.p>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...TRANSITIONS.spring, delay: 0.6 }}
        className="flex items-center gap-2 bg-[var(--q-amber-dim)] px-4 py-2 rounded-full border border-[var(--q-amber-8)] mb-10"
      >
        <motion.span
          animate={{ rotate: [-5, 5, -3, 3, 0] }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xl"
        >
          🔥
        </motion.span>
        <span className="text-[var(--q-amber-9)] font-semibold">{newStreak} dias seguidos</span>
      </motion.div>

      {/* Level up */}
      <AnimatePresence>
        {leveledUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...TRANSITIONS.spring, delay: 0.9 }}
            className="bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] rounded-[var(--q-radius-xl)] px-6 py-4 text-center mb-8"
          >
            <p className="text-[var(--q-accent-9)] font-semibold text-sm uppercase tracking-widest mb-1">
              Novo Nível
            </p>
            <p className="font-[family-name:var(--font-instrument)] text-2xl text-[var(--q-text-primary)] italic">
              {newLevel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="w-full space-y-3"
      >
        <motion.button
          onClick={onViewProgress}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium"
        >
          Ver meu progresso
        </motion.button>
        <motion.button
          onClick={onContinue}
          whileTap={{ scale: 0.97 }}
          className="w-full h-12 rounded-full border border-[var(--q-border-default)] text-[var(--q-text-secondary)]"
        >
          Voltar ao início
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
```

---

## SKILL 5 — PAYWALL NARRATIVO

### Problema a resolver
Paywalls com "compare os planos" convertem mal porque focam em privação. O paywall do Quantum deve focar em **continuidade da transformação** — o usuário já começou algo, o paywall é a porta para continuar.

### Copy Framework

```
HEADLINE: "Sua consciência está despertando."
SUBLINE: "Você chegou até aqui. O que acontece quando você não para?"

VISUAL: O orb do usuário, com um "anel de bloqueio" — o potencial visível mas não liberado.
  (Não usar um cadeado genérico — usar a metáfora do próprio sistema)

PROVA: Score atual + streak atual + "Em 7 dias você chegou a [score] pontos."
      "Imagine 365."

TIMELINE (visual, não lista):
  Dia 7   ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Dia 365
  [você está aqui]
  
OFFER:
  Premium: R$ 47/mês  ou  R$ 297/ano (economia de 47%)
  Destaque: anual
  
CTA PRIMÁRIO: "Continuar minha jornada"
CTA SECUNDÁRIO: "Ver mais detalhes" (abre comparação completa, NÃO é o CTA principal)

SOCIAL PROOF: "4.200+ pessoas em transformação hoje"
```

---

## SKILL 6 — NOTIFICATION AGENT — TOM ADAPTATIVO

### 5 Níveis × 3 Tipos = 15 mensagens únicas

```typescript
// Todas as mensagens de notificação — nunca use genérico "Não esqueça!"

const NOTIFICATION_COPY = {
  DAILY_REMINDER: {
    BEGINNER:   { title: "Tudo bem, {name} 🌱", body: "Seu dia 1 foi incrível. Sua jornada continua aqui." },
    AWARE:      { title: "{name}, sua consciência te chama", body: "Cada sessão é um tijolo na sua nova identidade." },
    CONSISTENT: { title: "Hora da prática, {name}", body: "Você já provou que consegue. Continue." },
    ALIGNED:    { title: "{name} →", body: "O que acontece quando você interrompe um processo em curso?" },
    INTEGRATED: { title: "A prática te espera", body: "Você já sabe o caminho. Seu eu futuro também." },
  },
  MOTIVATIONAL_RESET: {
    BEGINNER:   { title: "3 dias. Não é o fim.", body: "Recomeçar faz parte. Sem julgamento. Sem pressão." },
    AWARE:      { title: "Sua evolução não parou", body: "A consciência que você desenvolveu ainda está aqui." },
    CONSISTENT: { title: "Uma pausa não te define", body: "Sua consistência histórica é maior que 3 dias." },
    ALIGNED:    { title: "O padrão te chama de volta", body: "Você sabe a diferença que faz. Volte hoje." },
    INTEGRATED: { title: "A semente ainda está plantada", body: "Pause não é abandono. Volte quando estiver pronto." },
  },
  RECOVERY_FLOW: {
    BEGINNER:   { title: "Sentimos sua falta, {name} 🌱", body: "Criamos uma sessão especial de boas-vindas de volta." },
    AWARE:      { title: "Uma semana. Sem julgamentos.", body: "Preparamos algo especial para sua reconexão." },
    CONSISTENT: { title: "{name}, a jornada continua", body: "7 dias de pausa, 100 dias de prática. O saldo ainda é seu." },
    ALIGNED:    { title: "O que te trouxe até aqui ainda existe", body: "Sessão especial de reconexão preparada para você." },
    INTEGRATED: { title: "Sem palavras necessárias.", body: "Sua sessão de retorno está aqui quando você estiver." },
  },
};
```

---

## SKILL 7 — PERFORMANCE MOBILE

### Checklist obrigatório para cada PR

```
Images:
□ next/image com sizes="" correto
□ priority={true} apenas no hero/LCP element
□ WebP ou AVIF quando possível

Fonts:
□ next/font com display: 'swap'
□ preconnect para Google Fonts
□ Subset apenas dos caracteres usados

Bundle:
□ dynamic import() para Recharts, Lottie, canvas-confetti
□ Nenhuma biblioteca de ícones completa — tree-shake ou SVG inline
□ Framer Motion: importar apenas o que usar

Rendering:
□ Server Components para conteúdo estático
□ 'use client' apenas em folhas da árvore (não layouts)
□ Suspense boundaries com skeleton específico (não genérico)

Otimizações mobile específicas:
□ -webkit-overflow-scrolling: touch em listas longas
□ overscroll-behavior: contain em modais
□ safe-area-inset para notch/home indicator
□ Touch targets: mínimo 44x44px
□ Debounce em inputs de texto (300ms)
□ Virtualize listas > 50 items (react-window)
```

---

## REFERÊNCIAS EXTERNAS PREMIUM

Para o agente consultar ao gerar código de UI complexo:

```
Design Systems de referência:
- Linear Design: linear.app (dark mode, transições, tipografia)
- Vercel Dashboard: vercel.com/dashboard (densidade, dark theme)
- Raycast: raycast.com (micro-interações, command palette)
- Luma: lu.ma (onboarding, conversão)

Animation Libraries:
- Framer Motion docs: framer.com/motion (tudo que precisar)
- Lottiefiles: lottiefiles.com (animações premium pre-built)
- Motion One: motion.dev (alternativa leve)

Icon Sets (usar SVG inline — não bundle inteiro):
- Lucide: lucide.dev (consistent, clean)
- Phosphor: phosphoricons.com (expressivo, múltiplos pesos)
- Heroicons: heroicons.com (Tailwind native)

Color Tools:
- Radix Colors: radix-ui.com/colors (escala perfeita dark mode)
- oklch.com (perceptual color)
```
