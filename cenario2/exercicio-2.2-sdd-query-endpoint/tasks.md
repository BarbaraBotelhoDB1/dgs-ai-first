# Tasks — Query Endpoint

## Convenções
- Estimativa: P (pequena), M (média), G (grande)
- Status inicial: TODO

## TQ-001 — Criar endpoint HTTP base com validação de input
- Descrição: Implementar Azure Function v4 com rota POST /api/query e validação do body usando Zod para o campo question.
- Critérios de aceite:
  - Endpoint responde 405 para métodos diferentes de POST.
  - Endpoint responde 400 quando body está ausente, inválido ou sem question.
  - Endpoint responde 400 quando question é string vazia ou maior que 2000 caracteres.
  - Endpoint retorna JSON com erro estruturado (code, message, details).
  - Logging estruturado com pino inclui requestId, route e outcome.
- Dependências: nenhuma.
- Estimativa: P

## TQ-002 — Implementar contrato de output do endpoint
- Descrição: Definir e validar schema de saída com Zod para garantir retorno consistente.
- Critérios de aceite:
  - Resposta de sucesso inclui answer, source_document e confidence.
  - source_document é obrigatório mesmo em baixa confiança.
  - Respostas de erro seguem o mesmo contrato de erro estruturado.
- Dependências: TQ-001.
- Estimativa: P

## TQ-003 — Integrar geração de embedding no Azure OpenAI
- Descrição: Criar client para embedding com timeout, retry exponencial e tratamento de erro.
- Critérios de aceite:
  - Para uma pergunta válida, endpoint obtém embedding no deployment configurado.
  - Em falha transitória, retry é realizado até o limite configurado.
  - Em falha final, endpoint retorna 502 com erro de integração.
- Dependências: TQ-001, TQ-002.
- Estimativa: M

## TQ-004 — Integrar busca top-5 no Azure AI Search
- Descrição: Consultar índice vetorial usando embedding e recuperar os 5 chunks mais relevantes.
- Critérios de aceite:
  - Busca retorna no máximo 5 chunks por requisição.
  - Chunks retornados incluem metadados mínimos: source_document, section, effective_date.
  - Em caso de indisponibilidade do search, endpoint retorna 502.
- Dependências: TQ-003.
- Estimativa: M

## TQ-005 — Aplicar política de vigência para documentos contraditórios
- Descrição: Ordenar/filtrar chunks para priorizar documento mais recente (ADR-0003).
- Critérios de aceite:
  - Quando houver duas versões do mesmo documento, versão vigente é priorizada.
  - Resposta informa que existe versão anterior quando aplicável.
  - Casos sem metadata de vigência são logados com warning.
- Dependências: TQ-004.
- Estimativa: M

## TQ-006 — Montar contexto e enforce de budget de tokens
- Descrição: Implementar builder de prompt com orçamento de contexto (ADR-0002).
- Critérios de aceite:
  - Budget de system prompt e chunks é respeitado por requisição.
  - Chunks excedentes são truncados por prioridade/relevância.
  - Log registra tokens estimados por bloco (system/chunks/question/history).
- Dependências: TQ-004, TQ-005.
- Estimativa: G

## TQ-007 — Gerar resposta com GPT-4o e retornar payload final
- Descrição: Chamar chat completion no Azure OpenAI com prompt montado e devolver resposta final ao cliente.
- Critérios de aceite:
  - Endpoint retorna answer textual com source_document.
  - Em baixa confiança, payload inclui aviso de baixa confiança.
  - Tempo total da requisição abaixo de 30s em ambiente alvo.
- Dependências: TQ-006.
- Estimativa: M

## TQ-008 — Criar testes unitários e integração do endpoint
- Descrição: Cobrir validação, erros de integração e fluxo feliz com mocks.
- Critérios de aceite:
  - Cobertura mínima de linhas >= 80% no módulo query.
  - Testes incluem ao menos: input inválido, sem match, contradição documental, happy path.
  - Nenhum teste acessa serviços reais (usar mocks).
- Dependências: TQ-001 até TQ-007.
- Estimativa: G
