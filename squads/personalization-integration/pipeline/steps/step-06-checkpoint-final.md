---
type: checkpoint
---

# Step 06: Checkpoint — Aprovação Final

## Apresentar ao Usuário

Mostrar resumo completo do squad com review da Rosa:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🧬 Personalization Integration — Completo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend (Gabi Gateway):
  ✅ ContentAdjustments interface em ai.types.ts
  ✅ PersonalizationAgent chamado em session.controller.ts
  ✅ Adjustments injetados no prompt do AIGateway
  ✅ Graceful degradation ativo

Frontend (Fábio Frontend):
  ✅ admin/broadcast/page.tsx — Form + preview + envio
  ✅ hooks/useAdmin.ts — useBroadcast mutation
  ✅ admin/costs → Recharts AreaChart
  ✅ admin/page → Recharts BarChart

Review (Rosa Revisão):
  📋 BLOCKING: {N} | WARNING: {N} | INFO: {N}
  📋 Verdict: {APPROVE/FIXES/CHANGES}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Perguntar

"Squad completo. O que deseja fazer?"

Opções:
1. Aprovar tudo — pronto para implementar
2. Corrigir issues da review antes de aprovar
3. Ver relatório completo de algum agente
4. Voltar ao menu do Opensquad
