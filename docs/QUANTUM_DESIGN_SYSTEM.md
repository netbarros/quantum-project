# QUANTUM DESIGN SYSTEM — v1.0

## Extraído das telas reais · System 6 · Cosmic Consciousness

## Absorver Imagens Conceito \*.pn em /docs/inspiracao/.\*

## ANÁLISE DAS TELAS (12 screens auditadas)

### Telas identificadas:

| Tela                               | Status     | Observações                         |
| ---------------------------------- | ---------- | ----------------------------------- |
| Welcome/Splash                     | ✅ Existe  | Orb de partículas + texto serif     |
| Login                              | ✅ Existe  | Nebula bg, card com inputs          |
| Onboarding Step 1 (PainPoint)      | ✅ Existe  | Cards com ícones square + descrição |
| Onboarding Step 2 (Goal)           | ✅ Existe  | "Passo 2 de 6" — 6 steps total      |
| Onboarding Step 3 (EmotionalState) | ✅ Existe  | Multi-select com checkmarks         |
| Onboarding Step 4 (Time)           | ✅ Existe  | Cards com natureza emojis           |
| Profile Reveal                     | ✅ Existe  | Orb cósmico fotográfico + nome      |
| Paywall/Planos                     | ✅ Existe  | Consciousness Orb + timeline        |
| Checkout + Order Bump              | ✅ Existe  | Pagamento com bump                  |
| Seu Espaço (Profile)               | ✅ Existe  | Grid 2x2 + "0 pts" — bug detectado  |
| Sua Jornada (History)              | ⚠️ Vazia   | Empty state — não implementada      |
| Session/Dashboard                  | ❌ Ausente | Não foi enviada — precisa criar     |

### GAPS CRÍTICOS detectados nas telas:

1. **"Seu Espaço" → 0 pts / 0 dias** — ProgressAgent não persistindo score
2. **"Sua Jornada" → vazia** — History/Journal não implementado
3. **Onboarding tem 6 steps** (não 4 do blueprint) — atual usa mais steps
4. **Checkout** mostra Apple Pay, Pix, Credit Card — sem gateway real integrado
5. **Nav bar aparece durante onboarding** no desktop — deve estar oculta
6. **Score "BEGINNER"** no paywall — confirma que sistema de score funciona parcialmente
7. **Fonte do título "Seu Espaço"** é script/cursiva — inconsistência com sistema

---

## PARTE 1 — TOKENS DE COR

```css
/* ============================================
   QUANTUM DESIGN TOKENS
   Extraídos pixel a pixel das telas reais
   ============================================ */

:root {
  /* --- BACKGROUNDS --- */
  --q-bg-void: #080810; /* Pure space black — body/html bg */
  --q-bg-depth: #0a0a14; /* App shell + nav */
  --q-bg-surface: #111120; /* Cards base */
  --q-bg-raised: #181828; /* Elevated cards, inputs */
  --q-bg-overlay: #1e1e32; /* Modais, popovers */
  --q-bg-card: rgba(20, 20, 38, 0.85); /* Cards com glassmorphism */
  --q-bg-input: rgba(255, 255, 255, 0.06); /* Input fields */

  /* --- NEBULA GRADIENTS (usados como backgrounds das páginas) --- */
  --q-nebula-purple: radial-gradient(
    ellipse 80% 60% at 70% 20%,
    rgba(109, 40, 217, 0.35) 0%,
    transparent 60%
  );
  --q-nebula-centered: radial-gradient(
    ellipse 60% 60% at 50% 50%,
    rgba(109, 40, 217, 0.25) 0%,
    transparent 70%
  );
  --q-nebula-left: radial-gradient(
    ellipse 70% 50% at 20% 30%,
    rgba(76, 29, 149, 0.4) 0%,
    transparent 65%
  );
  --q-nebula-blue: radial-gradient(
    ellipse 50% 40% at 80% 60%,
    rgba(29, 78, 216, 0.2) 0%,
    transparent 60%
  );

  /* --- BORDERS --- */
  --q-border-subtle: rgba(255, 255, 255, 0.04);
  --q-border-default: rgba(255, 255, 255, 0.08);
  --q-border-medium: rgba(255, 255, 255, 0.12);
  --q-border-strong: rgba(255, 255, 255, 0.2);
  --q-border-accent: rgba(124, 58, 237, 0.6); /* Borda de card selecionado */
  --q-border-accent-glow: rgba(139, 92, 246, 0.8); /* Glow forte de seleção */

  /* --- TEXT --- */
  --q-text-primary: #f0f0fa; /* Headlines, body principal */
  --q-text-secondary: #8b8ba8; /* Subtítulos, descrições */
  --q-text-tertiary: #5a5a6e; /* Labels, placeholders */
  --q-text-accent: #a78bfa; /* Labels de input, links */
  --q-text-price: #f5f5ff; /* Preços em Instrument Serif */

  /* --- ACCENT — CONSCIOUSNESS PURPLE --- */
  --q-accent-11: #ede9fe; /* Lightest tint */
  --q-accent-9: #a78bfa; /* Vibrante, hover states */
  --q-accent-8: #8b5cf6; /* Primary accent */
  --q-accent-7: #7c3aed; /* CTAs, buttons */
  --q-accent-6: #6d28d9; /* Pressed/active */
  --q-accent-dim: rgba(124, 58, 237, 0.15);
  --q-accent-dim-2: rgba(124, 58, 237, 0.08);

  /* Gradient dos botões primários (extraído das telas) */
  --q-btn-gradient: linear-gradient(
    135deg,
    #8b5cf6 0%,
    #7c3aed 50%,
    #6d28d9 100%
  );
  --q-btn-gradient-hover: linear-gradient(
    135deg,
    #a78bfa 0%,
    #8b5cf6 50%,
    #7c3aed 100%
  );

  /* --- PROGRESS / CYAN --- */
  --q-cyan-9: #67e8f9;
  --q-cyan-8: #22d3ee;
  --q-cyan-dim: rgba(34, 211, 238, 0.12);

  /* --- SUCCESS / STREAK --- */
  --q-green-8: #10b981;
  --q-green-dim: rgba(16, 185, 129, 0.12);
  --q-amber-8: #f59e0b;
  --q-amber-dim: rgba(245, 158, 11, 0.1);

  /* --- DANGER --- */
  --q-red-8: #ef4444;
  --q-red-dim: rgba(239, 68, 68, 0.12);

  /* ============================================
     TIPOGRAFIA
     ============================================ */

  /* Display — textos emocionais, cosmic, transformação */
  --q-font-display: "Instrument Serif", "Playfair Display", Georgia, serif;

  /* UI — navegação, labels, botões, body */
  --q-font-ui: "DM Sans", "Plus Jakarta Sans", system-ui, sans-serif;

  /* Script — título "Seu Espaço" e branding especial */
  --q-font-script: "Pacifico", "Dancing Script", cursive;

  /* Logo wordmark "Quantum" — script italic */
  --q-font-logo: "Pacifico", cursive;

  /* Mono — dados, código */
  --q-font-mono: "JetBrains Mono", monospace;

  /* --- SCALE --- */
  --q-text-xs: 0.6875rem; /* 11px — labels tiny */
  --q-text-sm: 0.8125rem; /* 13px — metadata */
  --q-text-base: 0.9375rem; /* 15px — body */
  --q-text-md: 1.0625rem; /* 17px — body large */
  --q-text-lg: 1.25rem; /* 20px — subheadings */
  --q-text-xl: 1.5rem; /* 24px — headings small */
  --q-text-2xl: 1.875rem; /* 30px — headings */
  --q-text-3xl: 2.375rem; /* 38px — display small */
  --q-text-4xl: 3rem; /* 48px — display */
  --q-text-5xl: 3.75rem; /* 60px — hero */

  /* ============================================
     SPACING
     ============================================ */
  --q-space-1: 4px;
  --q-space-2: 8px;
  --q-space-3: 12px;
  --q-space-4: 16px;
  --q-space-5: 20px;
  --q-space-6: 24px;
  --q-space-8: 32px;
  --q-space-10: 40px;
  --q-space-12: 48px;
  --q-space-16: 64px;
  --q-space-20: 80px;

  /* ============================================
     RADIUS
     ============================================ */
  --q-radius-xs: 6px;
  --q-radius-sm: 10px;
  --q-radius-md: 14px;
  --q-radius-lg: 18px;
  --q-radius-xl: 24px;
  --q-radius-2xl: 32px;
  --q-radius-pill: 9999px;

  /* ============================================
     SHADOWS & GLOWS
     ============================================ */
  --q-shadow-card: 0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3);
  --q-shadow-modal: 0 16px 64px rgba(0, 0, 0, 0.7);
  --q-glow-accent:
    0 0 24px rgba(124, 58, 237, 0.4), 0 0 48px rgba(124, 58, 237, 0.2);
  --q-glow-accent-sm: 0 0 12px rgba(124, 58, 237, 0.35);
  --q-glow-cyan: 0 0 20px rgba(34, 211, 238, 0.3);
  --q-glow-btn: 0 4px 20px rgba(124, 58, 237, 0.5);
  --q-glow-selected:
    0 0 0 2px rgba(124, 58, 237, 0.7), 0 0 20px rgba(124, 58, 237, 0.3);

  /* ============================================
     TRANSITIONS
     ============================================ */
  --q-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --q-ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --q-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --q-dur-fast: 120ms;
  --q-dur-normal: 220ms;
  --q-dur-slow: 380ms;

  /* ============================================
     LAYOUT
     ============================================ */
  --q-max-mobile: 430px; /* Container máximo mobile */
  --q-max-content: 540px; /* Conteúdo em desktop (centrado) */
  --q-nav-height: 56px; /* Altura da navbar */
  --q-bottom-safe: env(safe-area-inset-bottom, 0px);
}
```

---

## PARTE 2 — GLOBAL CSS BASE

```css
/* frontend/src/styles/globals.css */

@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..400&family=Pacifico&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  background-color: var(--q-bg-void);
  color: var(--q-text-primary);
  font-family: var(--q-font-ui);
  font-size: var(--q-text-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Backgrounds de página — aplicar via className */
.bg-space-nebula {
  background: var(--q-nebula-purple), var(--q-nebula-blue), var(--q-bg-void);
  background-attachment: fixed;
  min-height: 100vh;
}

.bg-space-centered {
  background: var(--q-nebula-centered), var(--q-bg-void);
  min-height: 100vh;
}

.bg-space-photo {
  /* Para telas com foto de fundo (onboarding, checkout, profile) */
  background:
    linear-gradient(180deg, rgba(8, 8, 16, 0.4) 0%, rgba(8, 8, 16, 0.6) 100%),
    url("/images/space-bg.jpg") center/cover no-repeat fixed;
  min-height: 100vh;
}

/* Stars particles — pseudo-element para telas sem foto */
.bg-stars::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(
      1px 1px at 20% 30%,
      rgba(255, 255, 255, 0.6) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 80% 10%,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 60% 70%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 40% 85%,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 100%
    ),
    radial-gradient(
      2px 2px at 90% 50%,
      rgba(167, 139, 250, 0.4) 0%,
      transparent 100%
    ),
    radial-gradient(
      1px 1px at 10% 60%,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 100%
    );
  pointer-events: none;
  z-index: 0;
}
```

---

## PARTE 3 — COMPONENTES (Next.js / TypeScript)

### 3.1 NAVIGATION BAR

```tsx
// frontend/src/components/layout/Navbar.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/session", label: "Hoje" },
  { href: "/history", label: "Jornada" },
  { href: "/plans", label: "Planos" },
  { href: "/profile", label: "Perfil" },
];

export function Navbar() {
  const pathname = usePathname();
  // Ocultar durante onboarding
  const isOnboarding = pathname.startsWith("/onboarding");
  if (isOnboarding) return null;

  return (
    <nav className="nav-root">
      <Link href="/session" className="nav-logo">
        Quantum
      </Link>
      <div className="nav-links">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${pathname === href ? "active" : ""}`}
          >
            {label}
            {pathname === href && (
              <motion.div layoutId="nav-indicator" className="nav-indicator" />
            )}
          </Link>
        ))}
      </div>
      <button className="btn-ghost btn-sm">Sair</button>
    </nav>
  );
}
```

```css
/* Navbar styles */
.nav-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--q-nav-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--q-space-8);
  background: rgba(8, 8, 16, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--q-border-subtle);
  z-index: 100;
}

.nav-logo {
  font-family: var(--q-font-logo);
  font-size: 1.375rem;
  color: var(--q-text-primary);
  text-decoration: none;
  /* Glow roxo sutil no logo — visto nas telas */
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--q-space-8);
}

.nav-link {
  position: relative;
  font-size: var(--q-text-base);
  font-weight: 400;
  color: var(--q-text-secondary);
  text-decoration: none;
  padding: var(--q-space-2) 0;
  transition: color var(--q-dur-fast) var(--q-ease-in-out);
}

.nav-link.active {
  color: var(--q-text-primary);
}

.nav-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--q-accent-8);
  border-radius: var(--q-radius-pill);
}
```

---

### 3.2 BUTTONS

```tsx
// frontend/src/components/ui/Button.tsx
"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className={`btn btn-${variant} btn-${size} ${fullWidth ? "btn-full" : ""}`}
        {...props}
      >
        {loading ? <span className="btn-spinner" /> : children}
      </motion.button>
    );
  },
);
```

```css
/* Button system — extraído das telas */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--q-space-2);
  font-family: var(--q-font-ui);
  font-weight: 500;
  border: none;
  cursor: pointer;
  border-radius: var(--q-radius-pill);
  transition:
    box-shadow var(--q-dur-fast) var(--q-ease-in-out),
    opacity var(--q-dur-fast);
  white-space: nowrap;
}

/* PRIMARY — usado em todos os CTAs principais */
.btn-primary {
  background: var(--q-btn-gradient);
  color: white;
  box-shadow: var(--q-glow-btn);
}
.btn-primary:hover {
  background: var(--q-btn-gradient-hover);
  box-shadow: 0 6px 28px rgba(124, 58, 237, 0.65);
}

/* GHOST — usado em "Sair", "back arrows" */
.btn-ghost {
  background: rgba(255, 255, 255, 0.05);
  color: var(--q-text-secondary);
  border: 1px solid var(--q-border-medium);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--q-text-primary);
}

/* SECONDARY */
.btn-secondary {
  background: var(--q-bg-raised);
  color: var(--q-text-primary);
  border: 1px solid var(--q-border-medium);
}

/* DANGER */
.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--q-red-8);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* SIZES */
.btn-sm {
  height: 36px;
  padding: 0 var(--q-space-5);
  font-size: var(--q-text-sm);
}
.btn-md {
  height: 48px;
  padding: 0 var(--q-space-8);
  font-size: var(--q-text-base);
}
.btn-lg {
  height: 56px;
  padding: 0 var(--q-space-10);
  font-size: var(--q-text-md);
  letter-spacing: 0.01em;
}
.btn-full {
  width: 100%;
}

/* Loading spinner */
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

### 3.3 ONBOARDING OPTION CARD

Dois estilos identificados nas telas:

**Estilo A** (Step 1, desktop) — ícone square dark + texto + descrição + checkmark direita
**Estilo B** (Step 2, mobile) — fundo roxo tintado + emoji icon no quadrado roxo + texto

```tsx
// frontend/src/components/onboarding/OptionCard.tsx
"use client";
import { motion } from "framer-motion";

interface OptionCardProps {
  icon: string; // emoji ou URL de ícone
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  variant?: "A" | "B"; // A = desktop style, B = mobile tinted
}

export function OptionCard({
  icon,
  label,
  description,
  selected,
  onSelect,
  variant = "A",
}: OptionCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      animate={selected ? "selected" : "idle"}
      variants={{
        idle: {
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor:
            variant === "B" ? "rgba(109,40,217,0.12)" : "rgba(20,20,38,0.85)",
          boxShadow: "none",
        },
        selected: {
          borderColor: "rgba(124,58,237,0.80)",
          backgroundColor:
            variant === "B" ? "rgba(109,40,217,0.25)" : "rgba(109,40,217,0.12)",
          boxShadow:
            "0 0 0 1px rgba(124,58,237,0.6), 0 0 20px rgba(124,58,237,0.25)",
        },
      }}
      transition={{ duration: 0.15 }}
      className={`option-card option-card--${variant.toLowerCase()} ${selected ? "selected" : ""}`}
    >
      {/* Icon */}
      <span className="option-card__icon">{icon}</span>

      {/* Text */}
      <div className="option-card__body">
        <span className="option-card__label">{label}</span>
        {description && (
          <span className="option-card__desc">{description}</span>
        )}
      </div>

      {/* Checkmark */}
      <motion.div
        className="option-card__check"
        initial={false}
        animate={{ opacity: selected ? 1 : 0.3, scale: selected ? 1 : 0.9 }}
      >
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <path
            d="M1 5.5L5 9.5L13 1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
}
```

```css
/* Option Card */
.option-card {
  display: flex;
  align-items: center;
  gap: var(--q-space-4);
  width: 100%;
  padding: var(--q-space-4) var(--q-space-5);
  border-radius: var(--q-radius-lg);
  border: 1px solid var(--q-border-default);
  background: var(--q-bg-card);
  backdrop-filter: blur(8px);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--q-dur-fast),
    background var(--q-dur-fast);
}

/* Variant A: ícone quadrado dark (desktop/step 1) */
.option-card--a .option-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--q-radius-md);
  font-size: 1.375rem;
  flex-shrink: 0;
}

/* Variant B: ícone quadrado roxo (mobile/steps 2,3,4) */
.option-card--b .option-card__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(109, 40, 217, 0.35);
  border-radius: var(--q-radius-md);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.option-card__body {
  flex: 1;
  min-width: 0;
}

.option-card__label {
  display: block;
  font-size: var(--q-text-md);
  font-weight: 500;
  color: var(--q-text-primary);
}

.option-card__desc {
  display: block;
  font-size: var(--q-text-sm);
  color: var(--q-text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}

.option-card__check {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--q-accent-7);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}
```

---

### 3.4 PROGRESS BAR (Onboarding)

```tsx
// frontend/src/components/onboarding/ProgressBar.tsx
"use client";
import { motion } from "framer-motion";

interface Props {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: Props) {
  return (
    <div className="onboarding-progress">
      <div className="onboarding-progress__label">
        Passo {current} de {total}
      </div>
      <div className="onboarding-progress__track">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className="onboarding-progress__segment"
            animate={{
              backgroundColor:
                i < current ? "var(--q-accent-8)" : "rgba(255,255,255,0.10)",
            }}
            transition={{ duration: 0.3, delay: i < current ? i * 0.04 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
```

```css
.onboarding-progress {
  padding: var(--q-space-4) var(--q-space-6) 0;
}

.onboarding-progress__label {
  font-size: var(--q-text-xs);
  color: var(--q-text-tertiary);
  text-align: center;
  margin-bottom: var(--q-space-3);
  letter-spacing: 0.05em;
}

.onboarding-progress__track {
  display: flex;
  gap: 4px;
  height: 3px;
}

.onboarding-progress__segment {
  flex: 1;
  border-radius: var(--q-radius-pill);
  background: rgba(255, 255, 255, 0.1);
}
```

---

### 3.5 INPUT FIELDS

```tsx
// frontend/src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
    </div>
  );
}
```

```css
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--q-space-2);
}

.input-label {
  font-size: var(--q-text-sm);
  font-weight: 500;
  color: var(--q-text-accent); /* Roxo/accent — visto nas telas */
}

.input-field {
  height: 50px;
  padding: 0 var(--q-space-5);
  background: var(--q-bg-input);
  border: 1px solid var(--q-border-default);
  border-radius: var(--q-radius-md);
  color: var(--q-text-primary);
  font-family: var(--q-font-ui);
  font-size: var(--q-text-base);
  transition: border-color var(--q-dur-fast);
  outline: none;
}

.input-field::placeholder {
  color: var(--q-text-tertiary);
}

.input-field:focus {
  border-color: var(--q-accent-7);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}
```

---

### 3.6 PLAN CARD (Paywall/Checkout)

```tsx
// frontend/src/components/paywall/PlanCard.tsx
"use client";
import { motion } from "framer-motion";

interface Feature {
  text: string;
}
interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  features: Feature[];
  recommended?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function PlanCard({
  title,
  price,
  period,
  features,
  recommended,
  selected,
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileTap={onSelect ? { scale: 0.99 } : {}}
      className={`plan-card ${selected ? "plan-card--selected" : ""} ${recommended ? "plan-card--recommended" : ""}`}
    >
      {recommended && <span className="plan-card__badge">RECOMENDADO</span>}
      <h3 className="plan-card__title">{title}</h3>
      <div className="plan-card__price">
        <span className="plan-card__price-value">{price}</span>
        <span className="plan-card__price-period"> / {period}</span>
      </div>
      <ul className="plan-card__features">
        {features.map((f, i) => (
          <li key={i} className="plan-card__feature">
            <span className="plan-card__check">✓</span>
            {f.text}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
```

```css
.plan-card {
  position: relative;
  padding: var(--q-space-6);
  background: var(--q-bg-card);
  border: 1px solid var(--q-border-medium);
  border-radius: var(--q-radius-xl);
  backdrop-filter: blur(12px);
}

.plan-card--recommended {
  border-color: var(--q-border-accent);
  box-shadow: var(--q-glow-accent-sm);
}

.plan-card__badge {
  position: absolute;
  top: -12px;
  right: var(--q-space-5);
  padding: var(--q-space-1) var(--q-space-3);
  background: var(--q-accent-7);
  border-radius: var(--q-radius-pill);
  font-size: var(--q-text-xs);
  font-weight: 700;
  color: white;
  letter-spacing: 0.08em;
}

.plan-card__title {
  font-size: var(--q-text-lg);
  font-weight: 600;
  color: var(--q-text-primary);
  margin-bottom: var(--q-space-2);
}

.plan-card__price {
  margin-bottom: var(--q-space-4);
}

.plan-card__price-value {
  /* Instrument Serif italic para o preço — visto nas telas */
  font-family: var(--q-font-display);
  font-style: italic;
  font-size: var(--q-text-3xl);
  color: var(--q-text-price);
}

.plan-card__price-period {
  font-size: var(--q-text-base);
  color: var(--q-text-secondary);
}

.plan-card__features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--q-space-3);
}

.plan-card__feature {
  display: flex;
  align-items: center;
  gap: var(--q-space-3);
  font-size: var(--q-text-sm);
  color: var(--q-text-secondary);
}

.plan-card__check {
  color: var(--q-accent-9);
  font-size: var(--q-text-base);
}
```

---

### 3.7 ORDER BUMP CARD (Checkout)

```tsx
// frontend/src/components/checkout/OrderBump.tsx
"use client";
import { motion } from "framer-motion";
import { useState } from "react";

interface OrderBumpProps {
  title: string;
  price: string;
  period: string;
  onChange?: (checked: boolean) => void;
}

export function OrderBump({ title, price, period, onChange }: OrderBumpProps) {
  const [checked, setChecked] = useState(false);
  const toggle = () => {
    setChecked((c) => !c);
    onChange?.(!checked);
  };
  return (
    <motion.div
      onClick={toggle}
      animate={{
        borderColor: checked
          ? "rgba(124,58,237,0.80)"
          : "rgba(124,58,237,0.35)",
        boxShadow: checked
          ? "0 0 0 1px rgba(124,58,237,0.5), 0 0 24px rgba(124,58,237,0.2)"
          : "none",
      }}
      className="order-bump"
    >
      <div className="order-bump__text">
        <p className="order-bump__title">{title}</p>
        <p className="order-bump__price">
          <span
            style={{
              fontFamily: "var(--q-font-display)",
              fontStyle: "italic",
              fontSize: "var(--q-text-xl)",
            }}
          >
            {price}
          </span>
          <span
            style={{
              color: "var(--q-text-secondary)",
              fontSize: "var(--q-text-sm)",
            }}
          >
            {" "}
            / {period}
          </span>
        </p>
      </div>
      {/* Checkbox */}
      <motion.div
        className="order-bump__checkbox"
        animate={{
          background: checked ? "var(--q-accent-7)" : "transparent",
          borderColor: checked ? "var(--q-accent-7)" : "rgba(255,255,255,0.3)",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}
```

```css
.order-bump {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--q-space-5) var(--q-space-6);
  background: rgba(8, 8, 20, 0.9);
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: var(--q-radius-xl);
  cursor: pointer;
  gap: var(--q-space-4);
}

.order-bump__title {
  font-size: var(--q-text-base);
  font-weight: 500;
  color: var(--q-text-primary);
  margin-bottom: var(--q-space-2);
}

.order-bump__checkbox {
  width: 22px;
  height: 22px;
  border-radius: var(--q-radius-xs);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
```

---

### 3.8 PAYMENT METHOD CARD

```css
.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--q-space-3);
}

.payment-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--q-space-2);
  padding: var(--q-space-4);
  background: var(--q-bg-raised);
  border: 1px solid var(--q-border-medium);
  border-radius: var(--q-radius-lg);
  cursor: pointer;
  transition: all var(--q-dur-fast);
}

.payment-card:hover,
.payment-card--active {
  border-color: var(--q-border-accent);
  box-shadow: var(--q-glow-accent-sm);
}

.payment-card__icon {
  font-size: 1.5rem;
}
.payment-card__label {
  font-size: var(--q-text-xs);
  color: var(--q-text-secondary);
}
```

---

### 3.9 CONSCIOUSNESS ORB (Dashboard SVG — visto no Paywall)

```tsx
// frontend/src/components/consciousness/ConsciousnessOrb.tsx
"use client";
import { motion } from "framer-motion";

const LEVEL_COLORS: Record<string, [string, string]> = {
  BEGINNER: ["#5A4FCF", "#3730A3"],
  AWARE: ["#7C3AED", "#6D28D9"],
  CONSISTENT: ["#8B5CF6", "#0EA5E9"],
  ALIGNED: ["#06B6D4", "#0891B2"],
  INTEGRATED: ["#10B981", "#6EE7B7"],
};

interface OrbProps {
  score: number;
  level: string;
  streak: number;
  size?: number;
}

export function ConsciousnessOrb({
  score,
  level,
  streak,
  size = 220,
}: OrbProps) {
  const [c1, c2] = LEVEL_COLORS[level] ?? LEVEL_COLORS.BEGINNER;
  const bounds: Record<string, [number, number]> = {
    BEGINNER: [0, 200],
    AWARE: [200, 400],
    CONSISTENT: [400, 600],
    ALIGNED: [600, 800],
    INTEGRATED: [800, 1000],
  };
  const [min, max] = bounds[level] ?? [0, 200];
  const progress = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  const cx = (size + 60) / 2;
  const cy = (size + 60) / 2;
  const dots = Math.min(streak, 12);

  return (
    <div style={{ position: "relative", width: size + 60, height: size + 60 }}>
      <svg width={size + 60} height={size + 60} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={`og-${level}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={c2} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c1} stopOpacity="0.5" />
          </radialGradient>
          <filter id="orb-glow">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer track ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />

        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={c1}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#ring-glow)"
          opacity={0.9}
        />

        {/* Core sphere */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r - 10}
          fill={`url(#og-${level})`}
          filter="url(#orb-glow)"
          animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orbiting dots (streak) */}
        {Array.from({ length: dots }).map((_, i) => {
          const angle = (i / dots) * 2 * Math.PI;
          const dotR = r + 22;
          const dx = cx + Math.cos(angle) * dotR;
          const dy = cy + Math.sin(angle) * dotR;
          return (
            <motion.circle
              key={i}
              cx={dx}
              cy={dy}
              r={2.5}
              fill={c1}
              opacity={0.7}
              animate={{ rotate: 360 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={{
                duration: 18 + i * 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          );
        })}
      </svg>

      {/* Score & level text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--q-font-ui)",
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "var(--q-text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: "var(--q-text-xs)",
            color: "var(--q-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {level}
        </span>
      </div>
    </div>
  );
}
```

---

### 3.10 PROFILE SECTION CARD ("Seu Espaço")

```css
/* Grid 2x2 — visto na tela "Seu Espaço" */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--q-space-5);
  padding: var(--q-space-6);
}

@media (max-width: 600px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.profile-section-card {
  padding: var(--q-space-5);
  background: rgba(14, 14, 28, 0.8);
  border: 1px solid var(--q-border-accent);
  border-radius: var(--q-radius-xl);
  backdrop-filter: blur(12px);
  box-shadow: var(--q-glow-accent-sm), var(--q-shadow-card);
}

.profile-section-card__label {
  font-size: var(--q-text-xs);
  font-weight: 600;
  color: var(--q-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--q-space-4);
}

/* Título "Seu Espaço" usa font-script */
.page-title-script {
  font-family: var(--q-font-script);
  font-size: var(--q-text-3xl);
  color: var(--q-text-primary);
  text-align: center;
  margin-bottom: var(--q-space-8);
}
```

---

### 3.11 EMPTY STATE ("Sua Jornada")

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--q-space-5);
  text-align: center;
  padding: var(--q-space-8);
}

.empty-state__icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  /* Radial glow purple — visto na tela */
  box-shadow:
    0 0 60px rgba(109, 40, 217, 0.35),
    0 0 120px rgba(109, 40, 217, 0.15);
}

.empty-state__title {
  font-family: var(--q-font-display);
  font-style: italic;
  font-size: var(--q-text-2xl);
  color: var(--q-text-primary);
}

.empty-state__body {
  font-size: var(--q-text-base);
  color: var(--q-text-secondary);
  max-width: 320px;
  line-height: 1.7;
}
```

---

### 3.12 COSMIC ORB (Profile Reveal — imagem fotográfica)

```tsx
// Nota: O orb da tela de Profile Reveal é uma IMAGEM (não SVG)
// Deve ser salva em /public/images/cosmic-orb.png ou gerada como imagem estática

// frontend/src/components/onboarding/ProfileReveal.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProfileRevealProps {
  userName: string;
  tagline: string;
  onStart: () => void;
}

export function ProfileReveal({
  userName,
  tagline,
  onStart,
}: ProfileRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="profile-reveal"
    >
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="profile-reveal__headline"
      >
        Sua alma cósmica se revela...
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="profile-reveal__orb"
      >
        {/* Imagem do orb cósmico fotográfico — ver /public/images/cosmic-orb.png */}
        <Image
          src="/images/cosmic-orb.png"
          alt="Seu orb cósmico"
          width={300}
          height={300}
          className="profile-reveal__orb-img"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="profile-reveal__info"
      >
        <h2 className="profile-reveal__name">{userName}</h2>
        <p className="profile-reveal__tagline">{tagline}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          paddingRight: "2rem",
        }}
      >
        <button className="btn btn-primary btn-md" onClick={onStart}>
          Iniciar Dia 1
        </button>
      </motion.div>
    </motion.div>
  );
}
```

```css
.profile-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--q-space-6);
  min-height: 100vh;
  padding: var(--q-space-12) var(--q-space-8);
  background: var(--q-bg-void);
}

.profile-reveal__headline {
  font-family: var(--q-font-display);
  font-style: italic;
  font-size: var(--q-text-2xl);
  color: var(--q-text-primary);
  text-align: center;
  line-height: 1.3;
}

.profile-reveal__orb {
  position: relative;
}

.profile-reveal__orb-img {
  width: 280px;
  height: 280px;
  object-fit: contain;
  filter: drop-shadow(0 0 40px rgba(109, 40, 217, 0.5));
}

.profile-reveal__name {
  font-size: var(--q-text-3xl);
  font-weight: 700;
  color: var(--q-text-primary);
  text-align: center;
  letter-spacing: -0.01em;
}

.profile-reveal__tagline {
  font-family: var(--q-font-display);
  font-style: italic;
  font-size: var(--q-text-lg);
  color: var(--q-text-secondary);
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
}
```

---

## PARTE 4 — FRAMER MOTION ANIMATIONS

```ts
// frontend/src/lib/animations.ts

export const TRANSITIONS = {
  spring: { type: "spring", stiffness: 300, damping: 28 },
  springBounce: { type: "spring", stiffness: 380, damping: 22 },
  smooth: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  cosmic: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

export const VARIANTS = {
  /* Page transitions */
  page: {
    initial: { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" },
    transition: TRANSITIONS.smooth,
  },

  /* Onboarding slide — horizontal */
  slideIn: (direction: number) => ({
    initial: { opacity: 0, x: direction * 40, filter: "blur(6px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: direction * -40, filter: "blur(6px)" },
    transition: TRANSITIONS.smooth,
  }),

  /* Cards com stagger */
  cardReveal: {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: TRANSITIONS.spring,
  },

  /* Score delta (+10) */
  scoreDelta: {
    initial: { opacity: 0, y: 24, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20 },
    transition: TRANSITIONS.springBounce,
  },

  /* Profile reveal orb */
  orbReveal: {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
  },

  /* Stagger container */
  staggerContainer: (delay = 0.06) => ({
    animate: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
  }),
};
```

---

## PARTE 5 — LAYOUT PATTERNS

```tsx
// frontend/src/components/layout/MobileContainer.tsx
// Wrapper para telas mobile (max-width: 430px centrado em desktop)

export function MobileContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mobile-container ${className}`}>{children}</div>;
}
```

```css
/* Mobile-first container */
.mobile-container {
  width: 100%;
  max-width: var(--q-max-mobile);
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
}

/* Page root — aplica background + padding-top para nav */
.page-root {
  width: 100%;
  min-height: 100vh;
  padding-top: var(--q-nav-height);
}

/* Full screen — sem padding (onboarding, profile reveal, login) */
.page-full {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Safe area para iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 16px);
}
```

---

## PARTE 6 — TAILWIND CONFIG

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-pacifico)", "cursive"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        q: {
          void: "#080810",
          depth: "#0A0A14",
          surface: "#111120",
          raised: "#181828",
          accent: {
            7: "#7C3AED",
            8: "#8B5CF6",
            9: "#A78BFA",
          },
        },
      },
      borderRadius: {
        "q-sm": "10px",
        "q-md": "14px",
        "q-lg": "18px",
        "q-xl": "24px",
        "q-2xl": "32px",
      },
      boxShadow: {
        "q-glow":
          "0 0 24px rgba(124,58,237,0.4), 0 0 48px rgba(124,58,237,0.2)",
        "q-glow-sm": "0 0 12px rgba(124,58,237,0.35)",
        "q-card": "0 4px 24px rgba(0,0,0,0.5)",
      },
    },
  },
};
export default config;
```

---

## PARTE 7 — NEXT.JS FONTS (layout.tsx)

```tsx
// frontend/src/app/layout.tsx
import { Instrument_Serif, DM_Sans } from "next/font/google";
// Pacifico não está no next/font, usar via link ou local
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${instrumentSerif.variable} ${dmSans.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Pacifico para logo e script titles */}
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-space-nebula">{children}</body>
    </html>
  );
}
```

---

## PARTE 8 — GAP ANALYSIS + CORREÇÕES NECESSÁRIAS

### BUGS CONFIRMADOS PELAS TELAS:

```
BUG 1: "Seu Espaço" → Score = 0 pts, Streak = 0 dias
  Causa: ProgressAgent não está sendo chamado após completar sessão
  Fix: POST /api/session/:id/complete → garantir dispatch PROGRESS_UPDATED
  Arquivo: backend/src/controllers/session.controller.ts

BUG 2: "Sua Jornada" → Tela vazia (empty state sem dados)
  Causa: GET /api/sessions/history não retorna dados ou não está implementado
  Fix: Implementar history endpoint + renderizar lista de sessões passadas
  Arquivo: backend/src/routes/session.routes.ts + frontend history page

BUG 3: Nav bar visível durante onboarding em desktop
  Causa: Navbar não verifica se está em rota /onboarding
  Fix: if (pathname.startsWith('/onboarding')) return null; (já incluído acima)
  Arquivo: frontend/src/components/layout/Navbar.tsx

BUG 4: Checkout → Apple Pay / Pix sem gateway real
  Causa: UI implementada mas backend de pagamento ausente
  Fix (MVP): integrar Stripe + Asaas para Pix brasileiro
  Arquivo: backend/src/routes/subscription.routes.ts (criar checkout session)

BUG 5: Onboarding tem 6 steps (não 4 do blueprint)
  Causa: Implementação expandiu para 6 (correto — mais dados para IA)
  Fix: Atualizar BLUEPRINT_V2.md para refletir 6 steps
  Steps reais: painPoint → goal → emotionalState → time → name/nickname → (?)

BUG 6: "Seu Espaço" usa fonte script para título mas não está nos tokens
  Causa: Pacifico não estava documentada no design system
  Fix: Agora documentado como --q-font-script / --font-pacifico
```

### COMPONENTES AUSENTES (não aparecem nas telas):

```
❌ Daily Session page — não foi capturada nas screenshots
   Criar: /session com SessionBlockReader (8 blocos progressivos)

❌ CompletionScreen — não existe ainda
   Criar: Tela de celebração pós-sessão

❌ Bottom Navigation (mobile) — não visível nas telas
   Verificar se existe ou se só usa top nav

❌ Settings page — não foi capturada
   Criar: /settings com notification time

❌ Admin panel — não existe
   Criar: /admin com analytics
```

---

## PARTE 9 — ASSETS NECESSÁRIOS

```
/public/images/
  cosmic-orb.png           ← Orb fotográfico da Profile Reveal (310x310px min)
  space-bg.jpg             ← Background de galáxia/nebulosa (1920x1080)
  space-bg-mobile.jpg     ← Versão mobile (768x1024)

/public/icons/
  icon-192.png             ← PWA icon
  icon-512.png             ← PWA icon
  badge-72.png             ← PWA notification badge
  star-symbol.svg          ← Estrela de 4 pontas (tela de login)

NOTA: O orb de partículas da splash screen (screen.png final)
é um componente Three.js ou Canvas — não é imagem estática.
Alternativa leve: usar CSS + SVG com pontos animados.
```

---

## PARTE 10 — CHECKLIST DE IMPLEMENTAÇÃO

```
DESIGN SYSTEM BASE:
□ globals.css com todos os --q-* tokens
□ Fontes carregadas: Instrument Serif + DM Sans + Pacifico
□ tailwind.config.ts com extensões
□ /lib/animations.ts com VARIANTS e TRANSITIONS

COMPONENTES:
□ Navbar com ocultar durante onboarding
□ Button (primary/ghost/secondary/danger + sizes)
□ Input com label accent
□ OptionCard variants A e B
□ OnboardingProgress (6 steps)
□ PlanCard com RECOMENDADO badge
□ OrderBump com toggle
□ PaymentCard grid
□ ConsciousnessOrb SVG animado
□ ProfileReveal com cosmic orb image
□ ProfileSectionCard (grade 2x2)
□ EmptyState
□ SessionBlockReader (8 blocos)
□ CompletionScreen

PAGES (criar/corrigir):
□ /login — com nebula bg + star icon
□ /register — estilo igual ao login
□ /onboarding — 6 steps com slide transition
□ /session — leitura progressiva + completion
□ /dashboard — orb + streak + charts
□ /profile — "Seu Espaço" grid 2x2
□ /history — "Sua Jornada" com dados reais
□ /plans — paywall narrativo com orb
□ /checkout — com order bump
□ /settings — notification time
□ /admin — analytics

FIXES:
□ ProgressAgent conectado ao complete endpoint
□ History endpoint retornando dados reais
□ Score persistindo entre sessões
□ Nav oculta no onboarding
□ 6 steps no onboarding documentados
```
