# Design System Spec — System 6 (Quantum Project)

## Tokens de Cor

### Backgrounds
| Token | Valor | Uso |
|-------|-------|-----|
| `--q-bg-void` | #080810 | Body/html bg |
| `--q-bg-depth` | #0a0a14 | App shell + nav |
| `--q-bg-surface` | #111120 | Cards base |
| `--q-bg-raised` | #181828 | Elevated cards, inputs |
| `--q-bg-overlay` | #1e1e32 | Modais, popovers |
| `--q-bg-card` | rgba(20,20,38,0.85) | Cards glassmorphism |
| `--q-bg-input` | rgba(255,255,255,0.06) | Input fields |

### Nebula Gradients (backgrounds de página)
| Token | Uso |
|-------|-----|
| `--q-nebula-purple` | Páginas principais |
| `--q-nebula-centered` | Profile reveal, modais |
| `--q-nebula-left` | Onboarding |
| `--q-nebula-blue` | Detalhes, secondary |

### Borders
| Token | Valor | Uso |
|-------|-------|-----|
| `--q-border-subtle` | rgba(255,255,255,0.04) | Separadores leves |
| `--q-border-default` | rgba(255,255,255,0.08) | Cards normais |
| `--q-border-medium` | rgba(255,255,255,0.12) | Hover states |
| `--q-border-strong` | rgba(255,255,255,0.2) | Destaque |
| `--q-border-accent` | rgba(124,58,237,0.6) | Card selecionado |
| `--q-border-accent-glow` | rgba(139,92,246,0.8) | Glow de seleção |

### Text
| Token | Valor | Uso |
|-------|-------|-----|
| `--q-text-primary` | #f0f0fa | Headlines, body |
| `--q-text-secondary` | #8b8ba8 | Subtítulos, descrições |
| `--q-text-tertiary` | #5a5a6e | Labels, placeholders |
| `--q-text-accent` | #a78bfa | Labels de input, links |

### Accent — Consciousness Purple
| Token | Valor | Uso |
|-------|-------|-----|
| `--q-accent-11` | #ede9fe | Lightest tint |
| `--q-accent-9` | #a78bfa | Hover states |
| `--q-accent-8` | #8b5cf6 | Primary accent |
| `--q-accent-7` | #7c3aed | CTAs, buttons |
| `--q-accent-6` | #6d28d9 | Pressed/active |
| `--q-accent-dim` | rgba(124,58,237,0.15) | Background seleção |

## Tipografia

### Fontes
| Fonte | Uso | Classe CSS |
|-------|-----|------------|
| Instrument Serif | Conteúdo: headlines, affirmations, reflections, directions, preços | `font-[family-name:var(--font-instrument)]` |
| DM Sans | UI: labels, body text, buttons, navigation, descriptions | `font-[family-name:var(--font-dm-sans)]` |

### Tamanhos por Contexto
| Contexto | Tamanho | Fonte |
|----------|---------|-------|
| Page title | text-2xl / text-3xl | Instrument Serif |
| Section heading | text-xl | Instrument Serif |
| Body text | text-base | DM Sans |
| Card label | text-sm font-medium | DM Sans |
| Meta/caption | text-xs | DM Sans |
| Affirmation (fullscreen) | text-3xl | Instrument Serif |
| Score display | text-4xl font-bold | DM Sans |

## Animações (lib/animations.ts)

### Transitions
| Nome | Config | Quando Usar |
|------|--------|-------------|
| `spring` | stiffness 300, damping 30, mass 0.8 | Default para maioria |
| `springBounce` | stiffness 400, damping 25 | Celebrações, rewards |
| `smooth` | 0.4s cubic-bezier | Fades, opacity changes |
| `fast` | 0.15s cubic-bezier | Micro-interações, hover |

### Variants
| Nome | Efeito | Quando Usar |
|------|--------|-------------|
| `pageEnter` | fade + slide up + blur | Transição entre páginas |
| `cardReveal` | fade + scale + slide | Cards aparecendo (ex: history cards) |
| `contentBlock` | fade + slide horizontal | Blocos de conteúdo dentro de session |
| `fadeIn` | opacity only | Elementos sutis, overlays |
| `slideUp` | fade + slide up | Listas, itens empilhados |
| `slideDown` | fade + slide down + height auto | Expansões, accordions |
| `slideHorizontal` | fade + slide direction-aware | SessionBlockReader navegação |

### Infinite Animations
| Nome | Efeito | Quando Usar |
|------|--------|-------------|
| `orbPulse` | scale [1,1.05,1] + opacity [0.7,1,0.7] | ConsciousnessOrb pulsando |
| `streakFire` | scale + rotate wobble | Streak ativo, fire indicator |
| `levelUp` | scale [0.5,1.2,1] + opacity | Celebração level up, score delta |

### Utility
- `stagger(0.08)` — container para listas com animação escalonada (default 80ms entre itens)

## Padrões de Componente

### Cards de Lista (/history)
```
Variant: cardReveal + stagger(0.08)
Container: motion.div com stagger como parent
Border: --q-border-default
Background: --q-bg-surface
Hover: whileHover={{ y: -2 }} + border --q-border-medium
Tap: whileTap={{ scale: 0.98 }}
Corner: rounded-[var(--q-radius-lg)]
```

### Botões
```
Primary: bg-[var(--q-accent-8)] text-white h-12 rounded-full
         whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}
Secondary: bg-[var(--q-bg-raised)] border border-[var(--q-border-default)]
           whileTap={{ scale: 0.97 }}
Touch target: mínimo h-11 (44px) ou py-3
```

### Estados
```
Loading: Skeleton shimmer com bg-[var(--q-bg-raised)] animate-pulse
Empty: Ilustração/ícone + texto Instrument Serif + CTA
Error: Error boundary + fallback graceful com retry
```

### Gamificação UX
```
Score Delta: levelUp variant + springBounce + "+15 pts" text
Level Badge: LevelBadge component com accent glow
Streak: StreakCard com streakFire variant quando ativo
Completion: CompletionScreen com celebração (orb + particles)
```

### Mobile-First
```
Base: mobile layout (sem sm: prefix)
Tablet: md: breakpoint para ajustes
Desktop: lg: breakpoint para layout wider
Touch: todos os interativos h-11+ (44px)
Safe area: pb-safe para bottom nav
```
