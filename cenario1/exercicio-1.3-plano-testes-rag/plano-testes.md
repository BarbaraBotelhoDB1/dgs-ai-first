# Exercício 1.3 — Plano de testes para pipeline de RAG
# item 2
> **Nota sobre testes de IA:** ao contrário de testes tradicionais com resultado binário pass/fail, testes de LLM trabalham com graus de qualidade. Um mesmo teste pode ter resultado "correto mas incompleto" em vez de simplesmente "passou" ou "falhou". O plano abaixo define critérios de aceite explícitos para cada categoria e usa a rubrica do exercício 1.2 onde aplicável.

---

## 1. Testes de ingestão

> Objetivo: verificar que cada documento foi corretamente extraído da fonte, convertido para texto, dividido em chunks e indexado no Azure AI Search com metadados corretos.

### 1.1 Extração e conversão de texto

| ID     | Teste                                | Entrada                          | Critério de aceite                                                                                                       |
| ------ | ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| ING-01 | Extração de PDF sem perda de tabelas | POL-001 (PDF), PROC-042-v2 (PDF) | Texto extraído contém todas as tabelas em formato legível; células não mescladas; números preservados sem arredondamento |
| ING-02 | Extração de planilha Excel           | `frete-base-AAAAMM.xlsx`         | Todas as células numéricas preservadas; cabeçalhos de coluna extraídos; nenhuma linha truncada                           |
| ING-03 | Preservação de caracteres especiais  | Todos os documentos              | Acentos, cedilhas e símbolos (R$, %, ×) preservados sem corrupção de encoding                                            |
| ING-04 | Documentos com múltiplas versões     | PROC-042 v1 e v2                 | Ambas as versões são indexadas com metadado `version` distinto (`v1`, `v2`) e `effective_date` correto                   |

### 1.2 Chunking

| ID     | Teste                                 | Critério de aceite                                                                                                                     |
| ------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ING-05 | Chunk não quebra no meio de uma regra | Seção 3.2 da POL-001 (lista de exceções) deve ser mantida no mesmo chunk ou ter overlap suficiente para não perder o contexto da lista |
| ING-06 | Chunk preserva referência de seção    | Cada chunk contém metadado `source_section` (ex: "POL-001 Seção 3.2") para rastreabilidade de fonte                                    |
| ING-07 | Tamanho de chunk dentro do orçamento  | Nenhum chunk excede 512 tokens; nenhum chunk tem menos de 50 tokens (chunks muito curtos perdem contexto)                              |
| ING-08 | Chunks de tabelas mantêm estrutura    | Chunks derivados de tabelas (SLA-2024 Seção 2, PROC-042 Seção 2.1) preservam o par cabeçalho–valor                                     |

### 1.3 Indexação

| ID     | Teste                                        | Critério de aceite                                                                                              |
| ------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ING-09 | Todos os documentos indexados                | Contagem de chunks no índice corresponde ao total esperado após ingestão completa                               |
| ING-10 | Metadados obrigatórios presentes             | Cada chunk no índice possui: `chunk_id`, `source_document`, `source_section`, `version`, `ingestion_date`       |
| ING-11 | Versão mais recente não sobrescreve a antiga | Após ingestão da PROC-042-v2, a v1 permanece no índice com `version=v1`; ambas recuperáveis                     |
| ING-12 | Reindexação após atualização                 | Ao reingerir um documento atualizado, o chunk atualizado substitui o anterior e a data de ingestão é atualizada |

---

## 2. Testes de retrieval

> Objetivo: dada uma pergunta conhecida, verificar que os chunks corretos são recuperados. Baseado no mapa de cobertura do Anexo B.
> **Critério geral:** os chunks obrigatórios devem aparecer nos top-5 resultados. Chunks de versão errada não devem aparecer nos top-3 quando há versão mais recente disponível.

### 2.1 Pares pergunta → chunk esperado (mínimo 5)

| ID     | Pergunta                                                                                                                       | Chunks obrigatórios (top-5)                       | Chunks proibidos (top-3)                                             | Risco se falhar                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| RET-01 | "Qual o prazo de devolução?"                                                                                                   | POL-001-A, POL-001-B                              | —                                                                    | Resposta omite exceções críticas                                              |
| RET-02 | "Posso devolver carga perigosa?"                                                                                               | POL-001-B                                         | —                                                                    | Resposta pode inverter a regra de proibição                                   |
| RET-03 | "Qual o SLA do cliente Gold?"                                                                                                  | SLA-2024-B                                        | —                                                                    | Resposta usa SLA de tier errado                                               |
| RET-04 | "Qual o SLA do cliente Platinum?"                                                                                              | SLA-2024-A                                        | —                                                                    | Se SLA-2024-A não for recuperado, IA pode alucinar SLAs para tier inexistente |
| RET-05 | "Frete especial para 600kg para Manaus?"                                                                                       | PROC-042v2-A, PROC-042v2-B                        | PROC-042-A, PROC-042-B (v1)                                          | Resposta usa multiplicadores desatualizados (Norte: 1.6 em vez de 1.8)        |
| RET-06 | "Qual o multiplicador para o Sudeste?"                                                                                         | PROC-042v2-B                                      | PROC-042-B (v1)                                                      | Contradição: 1.0 (v1) vs 1.1 (v2)                                             |
| RET-07 | "Frete para 300kg para Salvador?"                                                                                              | Nenhum chunk relevante esperado                   | Qualquer chunk de PROC-042 aplicado como se fosse válido para <500kg | Alucinação de fórmula para peso fora do escopo                                |
| RET-08 | "O tracking mostra 'em trânsito' há 5 dias. O que faço?"                                                                       | FAQ-27                                            | —                                                                    | Recusa inadequada: IA diz que não tem informação                              |
| RET-09 | Pergunta multi-domínio: "Qual o prazo de devolução, o frete para 2.000kg para o Nordeste e o SLA Gold para incidente crítico?" | POL-001-A, PROC-042v2-A, PROC-042v2-B, SLA-2024-C | —                                                                    | Lost in the middle: chunk central (PROC-042) não processado                   |

### 2.2 Métricas de retrieval

| Métrica          | Definição                                                                     | Meta  |
| ---------------- | ----------------------------------------------------------------------------- | ----- |
| Recall@5         | % dos chunks obrigatórios que aparecem nos top-5 resultados                   | ≥ 90% |
| Precision@3      | % dos top-3 resultados que são relevantes para a pergunta                     | ≥ 80% |
| Version accuracy | % dos casos em que a versão mais recente é preferida sobre a antiga nos top-3 | 100%  |

---

## 3. Testes de geração

> Objetivo: dados os chunks corretos, verificar que o LLM gera resposta adequada. Avaliar o que pode dar errado mesmo quando o retrieval está correto.

### 3.1 Testes de qualidade de resposta (usar rubrica do exercício 1.2)

| ID     | Cenário                                    | Chunks injetados                                              | Critério de aceite (rubrica)                                                                          |
| ------ | ------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GER-01 | Resposta sobre prazo de devolução          | POL-001-A, POL-001-B, POL-001-C                               | Precisão ≥ 2, Completude ≥ 2, Total ≥ 9/12                                                            |
| GER-02 | Resposta sobre tier inexistente (Platinum) | SLA-2024-A (contém "não existem outros tiers")                | IA deve negar o tier, não inventar SLAs; Precisão = 3 obrigatório                                     |
| GER-03 | Resposta sobre carga perigosa + devolução  | POL-001-B, FAQ-03                                             | IA não deve inverter a regra de proibição; Precisão = 3 obrigatório                                   |
| GER-04 | Resposta com dois chunks contraditórios    | PROC-042-B (v1) + PROC-042v2-B (v2) injetados simultaneamente | IA deve identificar a contradição, usar a versão mais recente e alertar o atendente                   |
| GER-05 | Pergunta sem cobertura na base             | Nenhum chunk relevante injetado                               | IA deve dizer explicitamente que não encontrou a informação (guardrail 3); não deve inventar resposta |

### 3.2 Falhas possíveis mesmo com chunks corretos

| Falha                    | Descrição                                                                                      | Como testar                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Inversão de exceção      | Chunk POL-001-B lista o que NÃO pode ser devolvido; IA pode interpretar como lista do que pode | Perguntar "Posso devolver carga perigosa?" com apenas POL-001-B injetado       |
| Mistura de versões       | Com v1 e v2 injetados, IA usa valores da versão errada sem alertar                             | Injetar PROC-042-B e PROC-042v2-B juntos; verificar qual multiplicador é usado |
| Omissão de guardrail     | Resposta correta mas sem citação de fonte                                                      | Verificar presença de referência ao documento-fonte em 100% das respostas      |
| Resposta em outro idioma | Termos técnicos em inglês ou resposta parcialmente em inglês                                   | Verificar idioma da resposta em 100% das avaliações                            |

---

## 4. Testes de contexto

> Objetivo: verificar que o contexto montado (prompt + chunks) está dentro do orçamento de tokens, que o efeito _lost in the middle_ não afeta respostas e que conversas longas no Teams não degradam a qualidade.

| ID     | Tipo                              | Teste                                                                                                                | Critério de aceite                                                                                                     |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| CTX-01 | Orçamento                         | Medir token count de: system prompt + top-5 chunks + pergunta + histórico                                            | Total deve caber na janela do modelo com margem de 20% para a resposta; alerta automático se ultrapassar 80% do limite |
| CTX-02 | Lost in the middle                | Perguntar sobre 3 domínios diferentes em uma única pergunta (RET-09)                                                 | Os três domínios devem ser respondidos corretamente; falha parcial no domínio central indica lost in the middle        |
| CTX-03 | Context rot                       | Sessão com 5 perguntas sequenciais; comparar resposta da 5ª com resposta da mesma pergunta em sessão nova            | Divergência > 20% na pontuação da rubrica indica degradação por context rot                                            |
| CTX-04 | Prioridade de chunks vs histórico | Em sessão longa, a 5ª resposta deve usar informação dos chunks recuperados, não do histórico de mensagens anteriores | Verificar que a resposta cita fonte do chunk, não repete informação de turno anterior                                  |
| CTX-05 | Context overflow                  | Sessão com 10+ trocas + documentos extensos: verificar se a qualidade da resposta se mantém                          | Pontuação da rubrica na 10ª resposta deve ser ≥ 90% da pontuação em sessão nova                                        |

---

## 5. Testes de ponta a ponta

> Objetivo: simular o fluxo completo (pergunta do atendente → resposta ao cliente) com conjunto fixo de perguntas e respostas esperadas.

### 5.1 Conjunto de casos E2E

| ID     | Pergunta                                                       | Resposta esperada (resumo)                                                                                          | Fonte esperada             | Resultado aceito se...                                                 |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| E2E-01 | "Qual o prazo de devolução?"                                   | 7 dias úteis; exceções: cargas perigosas, refrigeradas, lacre violado; orientação de encaminhamento para ramal 4500 | POL-001 Seções 3.1 e 3.2   | Rubrica ≥ 9/12, sem nota 1                                             |
| E2E-02 | "Frete especial para 800kg para o Norte, chamado aberto hoje?" | Multiplicador Norte 1.8 (v2), fator de peso 1.0, fórmula completa com referência ao valor base                      | PROC-042-v2 Seções 2 e 2.1 | Multiplicador 1.8 presente; fator de peso mencionado                   |
| E2E-03 | "Qual o SLA do cliente Platinum?"                              | Informa que tier não existe; orienta tiers disponíveis; solicita número de contrato                                 | SLA-2024 Seção 1           | Ausência de valores de SLA inventados; presença de "não existe"        |
| E2E-04 | "Posso devolver carga perigosa?"                               | Não, não é elegível pelo processo padrão; encaminhar para ramal 4500 (Gestão de Riscos)                             | POL-001 Seção 3.2          | Presença de "não" ou "não elegível"; presença de "4500"                |
| E2E-05 | "Frete para 300kg para Salvador?"                              | Informa que não há regra documentada para frete padrão abaixo de 500kg; orienta consultar Comercial                 | — (sem chunk relevante)    | Ausência de valor calculado; presença de "não encontrei" ou "consulte" |

---

## 6. Testes de regressão

> Objetivo: garantir que mudanças no prompt, na documentação ou no pipeline não introduzam regressões silenciosas.

| ID     | Gatilho                                                  | Testes que devem rodar automaticamente                                           | Critério de aceite                                                                                                         |
| ------ | -------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| REG-01 | Atualização de qualquer documento (nova versão ingerida) | RET-05, RET-06, E2E-02 (testes que envolvem multiplicadores de versão)           | Nenhum resultado usa dados da versão substituída para chamados novos                                                       |
| REG-02 | Mudança no system prompt                                 | GER-01 a GER-05, E2E-01 a E2E-05 completos                                       | Pontuação média da rubrica não cai mais de 10% em relação ao baseline                                                      |
| REG-03 | Mudança nos parâmetros de chunking (tamanho, overlap)    | ING-05 a ING-08, RET-01 a RET-09                                                 | Recall@5 mantém ≥ 90%; nenhum chunk obrigatório sai do top-5                                                               |
| REG-04 | Mudança no modelo de embedding                           | RET-01 a RET-09 completos                                                        | Version accuracy mantém 100%; Recall@5 ≥ 90%                                                                               |
| REG-05 | Mudança no LLM ou versão do modelo                       | GER-01 a GER-05, CTX-02, CTX-03, E2E-03, E2E-04 (casos de alucinação e inversão) | Nenhuma resposta antes aprovada passa a ter nota 1 em Precisão Factual ou Guardrails                                       |
| REG-06 | Adição de documento novo à base                          | RET-07, E2E-05 (perguntas sem cobertura)                                         | Respostas sobre temas ainda sem cobertura continuam declarando ausência; novos documentos são recuperados nos seus tópicos |
