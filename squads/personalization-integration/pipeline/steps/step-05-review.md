---
execution: inline
agent: rosa-revisao
inputFile: squads/personalization-integration/output/frontend-changes.md
outputFile: squads/personalization-integration/output/review-report.md
---

# Step 05: Code Review — Rosa Revisão

## Context Loading

Carregar antes de executar:
- `squads/personalization-integration/output/backend-changes.md` — relatório backend
- `squads/personalization-integration/output/frontend-changes.md` — relatório frontend
- Todos os arquivos modificados/criados pelos agentes anteriores
- `docs/AGENTS.md` — convenções do projeto
- `frontend/src/lib/animations.ts` — variants disponíveis

## Instructions

### Process

1. **Revisar tipos (ai.types.ts)**:
   - ContentAdjustments interface está completa e exportada?
   - Campo em ContentInput é opcional?
   - Sem `any`?

2. **Revisar integração (session.controller.ts)**:
   - Try/catch ao redor do PersonalizationAgent?
   - correlationId propagado?
   - Graceful degradation funciona?

3. **Revisar AIGateway**:
   - Adjustments no prompt são úteis e claros?
   - Prompt não quebra se adjustments for undefined?
   - Prompt não vaza dados sensíveis do usuário?

4. **Revisar Broadcast page**:
   - Segue padrão visual admin?
   - Tokens --q-* corretos?
   - whileTap em botões?
   - Validação de form antes de envio?
   - Estado de loading durante envio?

5. **Revisar Recharts**:
   - ResponsiveContainer em todos os charts?
   - Cores com tokens (ou valores equivalentes)?
   - Tooltips estilizados?
   - Sem imports desnecessários?

6. **Checklist final**:
   - TypeScript compila?
   - Sem console.log em produção?
   - Imports organizados?
   - Sem dead code?

## Output Format

```markdown
# Code Review — Rosa Revisão

## BLOCKING
- B{N}. `arquivo:linha` — Descrição. Fix: ...

## WARNING
- W{N}. `arquivo:linha` — Descrição. Fix: ...

## INFO
- I{N}. `arquivo:linha` — Sugestão. ...

## Summary
- BLOCKING: {N}
- WARNING: {N}
- INFO: {N}
- Verdict: APPROVE / APPROVE WITH FIXES / REQUEST CHANGES
```

## Output Example

```markdown
# Code Review — Rosa Revisão

## BLOCKING
- B1. `ai.types.ts:15` — focusArea tipado como `string` mas poderia ser union type
  Fix: Manter string por agora (valores dinâmicos do PersonalizationAgent)
  Status: ACEITO como string

## WARNING
- W1. `broadcast/page.tsx:45` — Falta empty state se envio falhar
  Fix: Adicionar mensagem de erro inline
- W2. `AIGateway.ts:52` — Prompt poderia usar formatação mais clara
  Fix: Usar bullet points no prompt de adjustments

## INFO
- I1. `admin/page.tsx` — BarChart poderia ter animação de entrada
  Sugestão: animationDuration={800}

## Summary
- BLOCKING: 0
- WARNING: 2
- INFO: 1
- Verdict: ✅ APPROVE WITH FIXES (W1 e W2)
```

## Veto Conditions

Rejeitar e refazer se:
1. Existem issues BLOCKING não resolvidos
2. TypeScript não compila

## Quality Criteria

- [ ] Todos os arquivos modificados revisados
- [ ] Issues categorizados (BLOCKING/WARNING/INFO)
- [ ] Fix sugerido para cada issue
- [ ] TypeScript compilation verificada
- [ ] Design system compliance checada
- [ ] Verdict final emitido
