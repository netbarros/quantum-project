# Company Profile — Quantum Project

## Identidade

- **Nome:** Quantum Project
- **Fundador:** Fabiano Barros
- **Categoria:** Behavioral Transformation SaaS (System 6)
- **Repositório:** https://github.com/netbarros/quantum-project
- **Status:** Em desenvolvimento (Fase 1 — Fundação)

## Descrição

Plataforma SaaS de transformação comportamental movida por IA. Guia usuários ao longo de uma jornada adaptativa de 365 dias para reprogramar padrões mentais, expandir consciência, fortalecer percepção espiritual, melhorar regulação emocional, construir disciplina e evoluir identidade progressivamente.

**Não é** um app de conteúdo, meditação ou journaling. É um **sistema vivo de evolução de identidade** — um motor de transformação comportamental adaptativo com protocolo diário personalizado por IA.

## Loop de Transformação

```
AWARENESS → REFLECTION → ACTION → REINFORCEMENT → IDENTITY SHIFT
     ↑                                                      |
     └──────────────── PersonalizationAgent ───────────────┘
```

## Público-Alvo

Pessoas em busca de transformação pessoal profunda que querem:
- Reprogramar padrões mentais negativos
- Expandir consciência e percepção espiritual
- Melhorar regulação emocional
- Construir disciplina e consistência
- Evoluir identidade de forma progressiva e mensurável

**Perfis de usuário:** Reactive, Lost, Inconsistent, Seeking, Structured

## Diferenciação Competitiva

| Concorrente | Fraqueza | Vantagem Quantum |
|-------------|----------|------------------|
| Headspace | Conteúdo estático, sem personalização | IA adaptativa por estado emocional + score |
| Calm | Apenas relaxamento | Transformação comportamental progressiva |
| Journaling apps | Sem análise nem feedback | PersonalizationAgent analisa padrões e ajusta |
| Notion/templates | Sem gamificação nem progressão | consciousnessScore + levels + streak system |

## Stack Técnica

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Zustand, React Query, PWA
- **Backend:** Express + TypeScript, Prisma ORM, Zod validation
- **Database:** PostgreSQL 16, Redis 7
- **IA:** OpenRouter gateway (Claude 3.5 Sonnet → GPT-4o-mini → Static Content fallback)
- **Infra:** Docker Compose, Traefik reverse proxy

## Arquitetura de Agentes (PicoClaw v2)

5-Agent Mesh com comunicação via AgentRegistry:
1. **ContentAgent** — Geração de sessões diárias personalizadas
2. **PersonalizationAgent** — Análise comportamental e adaptação
3. **ProgressAgent** — consciousnessScore, levels, streaks
4. **NotificationAgent** — Push notifications PWA (VAPID)
5. **MonetizationAgent** — Controle de assinatura e limites

## Tom de Voz

- **Experiência:** Ritualística, imersiva, transformacional
- **UI:** Minimalista, calma, focada
- **Design:** Dark-first, System 6 design tokens, animações intencionais
- **Copy:** Direto, profundo, sem superficialidade — cada palavra serve à transformação

## Produto

- **Modelo:** Freemium → Premium (assinatura)
- **Modo:** Mobile-first PWA (instalável, funciona offline)
- **Paradigma UX:** Ritual diário, não app de conteúdo
- **Jornada:** 365 dias de evolução progressiva

## Redes Sociais

- GitHub: https://github.com/netbarros/quantum-project
- (Outras redes a serem adicionadas)
