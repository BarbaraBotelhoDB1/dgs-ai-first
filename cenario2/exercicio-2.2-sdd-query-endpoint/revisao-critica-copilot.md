# Revisão Crítica do Código Gerado (Exercício 2.2)

## Contexto

Implementação da primeira task (TQ-001): setup do endpoint de query com validação de input via Zod.

## Pontos que precisam de ajuste antes de code review real

### 1) Contrato de resposta de sucesso ainda não está aderente ao plano

- Problema: na resposta 200 atual, o endpoint retorna message e question.
- Por que é problema: o plan exige payload final com answer e source_document, e já vale manter contrato estável desde o início para reduzir breaking changes.
- Ajuste recomendado:
  - Introduzir schema de output (Zod) desde TQ-002.
  - Mesmo com lógica parcial, responder com estrutura prevista (campos placeholder), por exemplo:
    - answer
    - source_document
    - confidence

### 2) authLevel provavelmente inadequado para produção

- Problema: authLevel está como function.
- Por que é problema: no cenário, o endpoint será consumido por bot Teams/painel web interno e pode exigir integração com identidade corporativa (AAD) + API Management, não apenas function key.
- Ajuste recomendado:
  - Definir estratégia de autenticação no plan técnico da API (APIM + AAD bearer token).
  - Para ambiente local, manter function; para produção, migrar para camada de autenticação corporativa.

### 3) Tratamento de método HTTP é redundante no runtime

- Problema: o app.http já restringe methods para POST, mas o handler valida método novamente e retorna 405.
- Por que é problema: aumenta código sem ganho real em Azure Functions v4; pode gerar comportamento inconsistente dependendo do host.
- Ajuste recomendado:
  - Remover check manual ou manter apenas se houver requisito de log explícito por método inválido em gateway.

## Conclusão

O código atende bem ao objetivo didático da TQ-001 (endpoint + validação), mas precisa desses ajustes para ficar pronto para uma PR de produção.
