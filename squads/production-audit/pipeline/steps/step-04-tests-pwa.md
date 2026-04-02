---
execution: inline
agent: tiago-testes
outputFile: squads/production-audit/output/test-report.md
---

# Step 04: Testes (38+) + PWA Audit

## Context Loading
- `squads/production-audit/pipeline/data/ai-gateway-spec.md` — para testes do AIGateway
- Código dos agents: NotificationAgent.ts, ProgressAgent.ts
- Código dos services: PushNotification.ts, AIGateway.ts (reescrito pelo Igor)
- Testes existentes: MonetizationAgent.test.ts (padrão)
- PWA: manifest.json, sw.js, layout.tsx, public/icons/

## Instructions
### Tiago (Tests)
1. NotificationAgent.test.ts (15+ cenários)
2. ProgressAgent.test.ts (10+ cenários)
3. PushNotificationService.test.ts (5+ cenários)
4. AIGateway.test.ts (8+ cenários — health tracker, 429, fallback chain)
5. npm test — todos passam

### Paula (PWA) — executar após testes
1. Gerar/corrigir PNG icons reais
2. Manifest com purpose "any maskable"
3. Meta tags no layout.tsx
4. Documentar checklist Lighthouse

## Veto Conditions
1. npm test falha
2. Menos de 38 test cases

## Quality Criteria
- [ ] 38+ test cases passando
- [ ] PNG icons reais
- [ ] Manifest completo
- [ ] Meta tags presentes
