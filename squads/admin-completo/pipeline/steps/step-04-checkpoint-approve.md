---
type: checkpoint
---

# Step 04: Checkpoint — Validação Final

## Apresentar ao Usuário

Mostrar resultado da implementação:
1. Arquivos criados/modificados
2. Resultado do `tsc --noEmit`
3. Resultado dos testes backend
4. Checklist de verificação manual

### Checklist Manual

- [ ] Login como net.barros@gmail.com → user.role === 'ADMIN'
- [ ] /admin carrega sem redirect
- [ ] /admin/users → clicar em user → /admin/users/[id] abre
- [ ] User detail → toggle premium funciona
- [ ] User detail → toggle role funciona
- [ ] /admin/broadcast → SYSTEM notification → sem erro 400
- [ ] Logout → login como USER → /admin → redirect para /session

### Perguntar

"Implementação completa. Deseja aprovar e commitar?"

Opções:
1. Aprovar e commitar
2. Revisar um fix específico
3. Rejeitar e refazer
