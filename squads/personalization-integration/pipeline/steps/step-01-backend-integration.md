---
execution: inline
agent: gabi-gateway
outputFile: squads/personalization-integration/output/backend-changes.md
---

# Step 01: Integração Backend — PersonalizationAgent → ContentAgent

## Context Loading

Carregar antes de executar:
- `squads/personalization-integration/pipeline/data/research-brief.md` — gaps identificados
- `backend/src/types/ai.types.ts` — tipos atuais (ContentInput, AIResponse)
- `backend/src/agents/PersonalizationAgent.ts` — agente existente (225 linhas)
- `backend/src/agents/ContentAgent.ts` — agente existente (25 linhas)
- `backend/src/controllers/session.controller.ts` — controller (324 linhas, foco: linhas 90-135)
- `backend/src/services/AIGateway.ts` — gateway de IA
- `backend/src/types/agent.types.ts` — tipos de mensagem entre agentes

## Instructions

### Process

1. **Estender ai.types.ts**: Criar interface `ContentAdjustments` com campos tipados:
   ```typescript
   export interface ContentAdjustments {
     depthLevel: 'surface' | 'moderate' | 'deep' | 'profound';
     tone: 'gentle' | 'direct' | 'challenging' | 'provocative';
     contentLength: 'brief' | 'standard' | 'extended';
     focusArea: string;
   }
   ```
   Adicionar `adjustments?: ContentAdjustments` em `ContentInput`.

2. **Modificar session.controller.ts**: ANTES do dispatch para ContentAgent (~linha 100-120):
   - Dispatch para PersonalizationAgent com type 'get_user_context'
   - Extrair adjustments do payload de resposta
   - Incluir adjustments no payload do ContentAgent
   - OBRIGATÓRIO: try/catch — se PersonalizationAgent falhar, continua sem adjustments

3. **Atualizar ContentAgent.ts**: Extrair adjustments do payload e passar para AIGateway.

4. **Atualizar AIGateway.ts**: Em `generateContent()` e no prompt builder:
   - Se adjustments presente: adicionar instruções de profundidade, tom, tamanho ao system prompt
   - Se ausente: manter prompt atual inalterado

5. **Documentar mudanças**: Salvar relatório com diff de cada arquivo modificado.

## Output Format

```markdown
# Backend Integration — Mudanças Realizadas

## Arquivos Modificados

### 1. backend/src/types/ai.types.ts
**Mudança**: Adicionada ContentAdjustments interface + campo opcional em ContentInput
```diff
+ export interface ContentAdjustments { ... }
  export interface ContentInput {
    ...
+   adjustments?: ContentAdjustments;
  }
```

### 2. backend/src/controllers/session.controller.ts
**Mudança**: Chamada ao PersonalizationAgent antes do ContentAgent
**Linhas**: ~100-125
```diff
+ // Consultar PersonalizationAgent para adjustments
+ let adjustments: ContentAdjustments | undefined;
+ try { ... } catch (err) { ... }
```

### 3. backend/src/agents/ContentAgent.ts
**Mudança**: Passa adjustments para AIGateway

### 4. backend/src/services/AIGateway.ts
**Mudança**: Incorpora adjustments no system prompt

## Verificação
- [ ] TypeScript compila sem erros
- [ ] Graceful degradation testado (PersonalizationAgent fail → continua sem)
```

## Output Example

```markdown
# Backend Integration — Mudanças Realizadas

## Arquivos Modificados

### 1. backend/src/types/ai.types.ts
Adicionada interface ContentAdjustments com 4 campos tipados.
Campo `adjustments?: ContentAdjustments` adicionado ao ContentInput.

### 2. backend/src/controllers/session.controller.ts (linhas 98-128)
Inserido bloco de chamada ao PersonalizationAgent com try/catch.
adjustments extraídos de `pResult.payload.adjustments`.
Passados no payload do ContentAgent dispatch.

### 3. backend/src/agents/ContentAgent.ts (linhas 15-18)
inputData agora inclui adjustments. Passado para AIGateway.generateContent().

### 4. backend/src/services/AIGateway.ts (linhas 42-58)
System prompt agora inclui bloco condicional:
"Ajuste o conteúdo: profundidade={depthLevel}, tom={tone}, tamanho={contentLength}, foco={focusArea}"

## Verificação
- [x] TypeScript compila sem erros
- [x] Campo adjustments é opcional — sem breakage
- [x] PersonalizationAgent fail → log warn + continua sem adjustments
```

## Veto Conditions

Rejeitar e refazer se:
1. TypeScript não compila após as mudanças
2. ContentAgent quebra se adjustments for undefined

## Quality Criteria

- [ ] ContentAdjustments interface exportada e tipada (sem any)
- [ ] ContentInput estendido com campo opcional
- [ ] SessionController chama PersonalizationAgent com try/catch
- [ ] AIGateway incorpora adjustments no prompt condicionalmente
- [ ] Graceful degradation funciona (PersonalizationAgent fail não bloqueia)
- [ ] correlationId consistente em toda a cadeia
