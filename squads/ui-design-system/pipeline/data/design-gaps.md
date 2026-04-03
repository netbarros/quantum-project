# Design Gaps — Inspiração vs Implementação

## Referência: docs/inspiracao/

### 1. Onboarding Steps (4 telas)
**Inspiração**: Cards com emojis grandes + descrição por opção + fundo nebulosa
**Atual**: Cards sem ícones, sem descrição, fundo sólido
**Arquivos**: `frontend/src/app/(protected)/onboarding/page.tsx`

Gaps por step:
- **Step 1 (PainPoint)** — inspiração: emotional_focus_selection/screen.png
  - Cada opção tem emoji: 😰 Ansiedade, 🌫️ Falta de propósito, 💔 Instabilidade, etc.
  - Cada opção tem descrição em sub-texto
  - Fundo: nebulosa centralizada ✅ (já aplicado)

- **Step 2 (Goal)** — inspiração: intentional_growth_selection/screen.png
  - Cada opção tem emoji colorido: ☮️ Paz, 🔮 Clareza, 👑 Domínio, etc.
  - "Passo 2 de 6" no topo
  - Cards com borda accent quando selecionado

- **Step 3 (Emotional State)** — inspiração: current_state_check_in/screen.png
  - Emojis por estado: 😰 Ansioso, 😵 Perdido, 😤 Frustrado, etc.
  - Checkmark ao lado quando selecionado

- **Step 4 (Time)** — inspiração: daily_commitment_selection/screen.png
  - Ícones de plantas/natureza por opção: 🌱 5min, 🌿 10min, 🌳 15min, etc.

### 2. Profile Reveal
**Inspiração**: soulful_profile_reveal/screen.png
- **Orb cósmico ENORME** (tipo 200px) com brilho intenso
- "Sua alma cósmica se revela..."
- Nome em fonte grande
- Descrição personalizada
- Botão "Iniciar Dia 1"
**Arquivo**: `frontend/src/components/onboarding/ProfileReveal.tsx`

### 3. Checkout / Order Bump
**Inspiração**: chekout-orderbump.png
- Título: "Soulful Premium Checkout"
- Card principal: "Acesso Completo R$ 297"
- Order bump com border amber: "Adicionar Mentor de IA Personalizado R$ 19,90/trimestral"
- **Formas de Pagamento**: ícones de Credit Card, Pix, Apple Pay
- Botão: "Finalizar Transformação"
**Arquivo**: `frontend/src/app/(protected)/plans/page.tsx`

### 4. Seu Espaço (Profile)
**Inspiração**: seu-espaco.png
- Layout grid 2x2 com cards
- Fundo nebulosa ✅ (já aplicado)
- Fonte "Seu Espaço" em Pacifico (script)
**Arquivo**: `frontend/src/app/(protected)/profile/page.tsx`

### 5. Sua Jornada (History)
**Inspiração**: sua-jornada.png
- Mandala/orb central com glow roxo
- Texto poético: "O registro das suas epifanias e transformações, cada sessão guardada para revisitar seus ahos."
- Fundo nebulosa ✅ (já aplicado)
**Arquivo**: `frontend/src/app/(protected)/history/page.tsx`

### 6. Login
**Inspiração**: login.png
- Fundo nebulosa ✅ (já aplicado)
- Já bastante próximo

### 7. Planos
**Inspiração**: planos.png
- Score orb grande + timeline
- Card checkout com order bump
- Fundo nebulosa ✅ (já aplicado)
