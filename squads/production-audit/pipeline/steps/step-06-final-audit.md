---
execution: inline
agent: vera-verificacao
inputFile: squads/production-audit/output/test-report.md
outputFile: squads/production-audit/output/final-audit.md
---

# Step 06: Auditoria Final

## Context Loading
- Todos os relatórios em output/
- Código modificado por Igor, Hugo, Tiago, Paula
- Output de npm test

## Instructions
1. AI Gateway: MODEL_CHAIN, health tracker, 429, static fallback ✓
2. Security: JWT, Zod, CSP, CORS, Redis, rate limiter ✓
3. Tests: 38+ passando ✓
4. PWA: manifest, icons, meta tags, SW ✓
5. Graceful degradation: Redis down, all models fail, push denied ✓
6. TypeScript compila ✓
7. Zero API keys no frontend ✓
8. Relatório PASS/FAIL com evidência

## Veto Conditions
1. BLOCKING issues não resolvidos
2. Testes falhando

## Quality Criteria
- [ ] AI Gateway: 5 critérios
- [ ] Security: 7 critérios
- [ ] Tests: 38+ passam
- [ ] PWA: 5 critérios
- [ ] Verdict emitido
