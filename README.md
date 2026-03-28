# 🌌 Quantum Project

## **Behavioral Transformation & Identity Evolution System**
### *The System 6 Protocol · Antigravity Edition*

> **DIRETIVA SUPREMA**: Este não é um app. É uma experiência de auto-evolução que provoca uma resposta emocional genuína. Cada pixel, cada transição e cada palavra serve à transformação do usuário.

---

## 💎 Visão Geral

O **Quantum Project** é uma plataforma de reprogramação comportamental movida por Inteligência Artificial Adaptativa, projetada para guiar o usuário em uma jornada de **365 dias** de evolução contínua. 

Diferente de aplicativos de conteúdo estático, o Quantum funciona como um **sistema vivo de evolução de identidade**, utilizando um loop de transformação proprietário:

`AWARENESS` → `REFLECTION` → `ACTION` → `REINFORCEMENT` → `IDENTITY SHIFT`

---

## 🎨 Design System: Cosmic Consciousness (System 6)

A interface foi construída seguindo a estética **System 6**, focada em profundidade espacial, micro-interações premium e tipografia de alta precisão.

- **Tipografia**: 
  - `Instrument Serif` para headlines, afirmações e conteúdo sagrado (sensação de livro físico).
  - `DM Sans` para elementos de interface e leitura técnica.
- **Visual**: Dark Mode profundo (#080810), efeitos de glassmorphism, orbe de consciência animado e transições fluidas via Framer Motion.
- **UX**: Ritual diário progressivo. O usuário não "consome conteúdo", ele "atravessa uma sessão".

---

## 🚀 Tecnologias Core

### **Frontend** (Next.js PWA)
- **Framework**: `Next.js 16` (App Router)
- **Estilização**: `Tailwind CSS 4.0`
- **Animações**: `Framer Motion 12`
- **Estado**: `Zustand` + `React Query` (TanStack)
- **PWA**: Suporte offline completo e instalação nativa.

### **Backend** (Express & Agent System)
- **Runtime**: `Node.js` + `TypeScript`
- **Database**: `PostgreSQL` via `Prisma ORM`
- **Cache/Background**: `Redis` + `Node-Cron`
- **Segurança**: `JWT`, `Zod Validation`, `Helmet`, `Rate Limiting`.

### **Inteligência Artificial**
- **Gateway**: `OpenRouter API`
- **Modelos**: 
  - `Claude 3.5 Sonnet` (Motor Primário)
  - `GPT-4o-mini` (Fallback Dinâmico)
- **Prompting**: Sistema de prompts estritos para evitar alucinações e garantir tom humano/calmo.

---

## 🧠 Arquitetura: System 6 Agent Mesh (PicoClaw v2)

O diferencial técnico reside na malha de agentes especializados que orquestram a experiência:

1.  **ContentAgent**: Gera sessões diárias baseadas no perfil e estado emocional do usuário.
2.  **PersonalizationAgent**: Analisa padrões de comportamento para ajustar profundidade e tom.
3.  **ProgressAgent**: Calcula o `consciousnessScore` (0-1000) e gerencia níveis/streaks.
4.  **NotificationAgent**: Sistema de retenção adaptativo via Push Notifications PWA.
5.  **MonetizationAgent**: Controle de acesso por tiers e cost tracking por usuário.

---

## ⛩️ Estrutura do Monorepo

```text
quantum-project/
├── frontend/           # App Next.js 15 (PWA, Framer Motion)
│   ├── src/app/        # Rotas, Layouts, Session Flow
│   ├── src/components/ # UI Premium (ConsciousnessOrb, Cards)
│   └── src/stores/     # Global State (Auth, Progress, Session)
├── backend/            # API Express + TypeScript
│   ├── src/agents/     # 5-Agent specialization logic
│   ├── src/services/   # AI Gateway, Token Tracking
│   └── prisma/         # Schema, Migrations, Seed
└── docs/               # Blueprint, SDD, PHASES, PLAN
```

---

## 📈 Roadmap de Evolução

- [x] **Fase 1 — Fundação**: Monorepo, DB Schema e Auth System.
- [x] **Fase 2 — Onboarding**: Fluxo de 4 passos com Profile Mapping.
- [x] **Fase 3 — Agentes & IA**: Integração OpenRouter e ContentAgent.
- [x] **Fase 4 — Sessão Diária**: Experiência de leitura progressiva em 8 partes.
- [/] **Fase 5 — Evolução**: Consciousness Score e dashboard de níveis (*In Progress*).
- [/] **Fase 6 — Monetização**: Subscription system e Paywall premium (*In Progress*).
- [ ] **Fase 7 — Retenção**: NotificationAgent com Web Push.
- [ ] **Fase 8 — Admin**: Painel de analytics e cost tracking detalhado.
- [ ] **Fase 9 — Master Review**: Auditoria de segurança e otimização total.

---

## 🛠️ Configuração Local

### Requisitos:
- Node.js 20+
- Docker & Docker Compose
- Chave OpenRouter API

### Passos:
1.  **Clone o projeto** e instale as dependências:
    ```bash
    npm install
    ```
2.  **Configure o Ambiente**:
    - Renomeie `.env.example` para `.env` tanto no `frontend/` quanto no `backend/`.
3.  **Inicie o Banco de Dados**:
    ```bash
    docker-compose up -d
    ```
4.  **Migrações Prisma**:
    ```bash
    cd backend
    npx prisma migrate dev
    ```
5.  **Inicie em Desenvolvimento**:
    ```bash
    # No diretório raiz (se houver scripts de workspace) ou separadamente
    # Terminal 1
    cd backend && npm run dev
    # Terminal 2
    cd frontend && npm run dev
    ```

---

## 🛡️ Licença e Contato

Desenvolvido exclusivamente como parte do ecossistema **Quantum Project - System 6**.
Para suporte técnico: [net.barros@gmail.com](mailto:net.barros@gmail.com)
