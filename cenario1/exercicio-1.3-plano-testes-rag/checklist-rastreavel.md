# Exercício 1.3 — Checklist rastreável

# item 2 — Artefato organizado para o time (substitui saída do Claude Cowork)

> **Versão:** 1.0 | **Projeto:** NovaTech AI Assistant | **Fase:** QA / Validação do pipeline RAG
> **Substituto do Claude Cowork:** checklist versionado em Markdown, rastreável via Git.

---

## Como usar este artefato

- **Atualizar status** ao iniciar ou concluir cada teste: substituir o símbolo na coluna Status.
- **Registrar evidência** com link para log, screenshot ou pull request que comprova o resultado.
- **Escalar falhas** com prioridade P1 (bloqueante para go-live) e P2 (melhoria não bloqueante) diretamente na coluna Evidência.
- **Rodar regressão** a cada mudança de documento, prompt ou modelo — ver categoria Regressão.
- Este arquivo deve ser commitado no repositório do projeto após cada ciclo de testes.

**Legenda de status:** ☐ Não iniciado | ⏳ Em andamento | ✅ Concluído | ❌ Falhou

**Legenda de prioridade:** 🔴 P1 — bloqueante para go-live | 🟡 P2 — melhoria recomendada | 🟢 P3 — nice to have

---

## Distribuição de responsabilidades

| Papel                      | Sigla      | Categorias principais                                        |
| -------------------------- | ---------- | ------------------------------------------------------------ |
| Engenheiro de Dados        | Eng. Dados | Ingestão (ING)                                               |
| Engenheiro de IA / MLOps   | Eng. IA    | Retrieval (RET métricas), Contexto (CTX-01), Regressão (REG) |
| QA / Analista de Qualidade | QA         | Retrieval (casos), Geração (GER), Contexto (CTX), E2E        |
| Product Specialist         | PS         | Revisão final E2E-03, E2E-04 (casos de guardrail crítico)    |

---

## Sprint sugerido de execução

| Sprint                        | Categorias                       | Objetivo                                                                                |
| ----------------------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| Sprint 1 — Pipeline base      | ING-01 a ING-12                  | Garantir que todos os documentos estão corretamente indexados antes de testar retrieval |
| Sprint 2 — Retrieval          | RET-01 a RET-11                  | Validar que o Azure AI Search recupera os chunks corretos para perguntas reais          |
| Sprint 3 — Geração e Contexto | GER-01 a GER-07, CTX-01 a CTX-05 | Validar qualidade das respostas e comportamento em sessões longas                       |
| Sprint 4 — E2E                | E2E-01 a E2E-05                  | Teste integrado do fluxo completo; critério de go-live                                  |
| Contínuo — Regressão          | REG-01 a REG-06                  | Automação via CI; executa a cada mudança relevante                                      |

---

## Categoria: Ingestão

| ID     | Prior. | Teste                                                                            | Responsável | Status | Evidência                                                            |
| ------ | ------ | -------------------------------------------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------- |
| ING-01 | 🔴 P1  | Extração de PDF preserva tabelas (POL-001, PROC-042-v2)                          | Eng. Dados  | ☐      | Log de extração; comparar tabelas no PDF com texto extraído          |
| ING-02 | 🔴 P1  | Extração de planilha Excel preserva valores numéricos (`frete-base-AAAAMM.xlsx`) | Eng. Dados  | ☐      | Comparar células da planilha com chunks indexados                    |
| ING-03 | 🟡 P2  | Caracteres especiais preservados (acentos, R$, %)                                | Eng. Dados  | ☐      | Grep por caracteres suspeitos no índice                              |
| ING-04 | 🔴 P1  | Versões v1 e v2 da PROC-042 indexadas com metadado `version` distinto            | Eng. Dados  | ☐      | Query no índice filtrando por `source_document=PROC-042` e `version` |
| ING-05 | 🟡 P2  | Chunks não quebram no meio de listas de regras (POL-001 Seção 3.2)               | Eng. Dados  | ☐      | Inspecionar chunks derivados da seção 3.2                            |
| ING-06 | 🔴 P1  | Cada chunk possui metadado `source_section`                                      | Eng. Dados  | ☐      | Query aleatória de 10 chunks; verificar campo `source_section`       |
| ING-07 | 🟡 P2  | Tamanho de chunk: 50–512 tokens                                                  | Eng. Dados  | ☐      | Script de contagem; nenhum chunk fora da faixa                       |
| ING-08 | 🟡 P2  | Chunks de tabelas preservam par cabeçalho–valor                                  | Eng. Dados  | ☐      | Inspecionar chunks de SLA-2024 Seção 2 e PROC-042 Seção 2.1          |
| ING-09 | 🔴 P1  | Contagem total de chunks corresponde ao esperado                                 | Eng. Dados  | ☐      | Query de count no índice após ingestão completa                      |
| ING-10 | 🔴 P1  | Metadados obrigatórios presentes em todos os chunks                              | Eng. Dados  | ☐      | Query de validação de schema no índice                               |
| ING-11 | 🔴 P1  | Reindexação de versão nova não remove versão antiga                              | Eng. Dados  | ☐      | Verificar que v1 e v2 coexistem após ingestão da v2                  |
| ING-12 | 🟡 P2  | `ingestion_date` atualizado após reindexação de documento                        | Eng. Dados  | ☐      | Comparar timestamp antes/depois de reingestão                        |

---

## Categoria: Retrieval

| ID     | Prior. | Teste                                                                                              | Responsável  | Status | Evidência                                                                |
| ------ | ------ | -------------------------------------------------------------------------------------------------- | ------------ | ------ | ------------------------------------------------------------------------ |
| RET-01 | 🔴 P1  | "Qual o prazo de devolução?" → recupera POL-001-A e POL-001-B nos top-5                            | QA           | ☐      | Logar chunk_ids retornados; comparar com esperados                       |
| RET-02 | 🔴 P1  | "Posso devolver carga perigosa?" → recupera POL-001-B nos top-5                                    | QA           | ☐      | Logar chunk_ids; POL-001-B deve estar presente                           |
| RET-03 | 🔴 P1  | "Qual o SLA do cliente Gold?" → recupera SLA-2024-B nos top-5                                      | QA           | ☐      | Logar chunk_ids; SLA-2024-B deve estar presente                          |
| RET-04 | 🔴 P1  | "Qual o SLA do cliente Platinum?" → recupera SLA-2024-A (contém "não existem outros tiers")        | QA           | ☐      | SLA-2024-A deve estar nos top-5; ausência aumenta risco de alucinação    |
| RET-05 | 🔴 P1  | "Frete para 600kg para Manaus?" → recupera PROC-042v2-A e v2-B; NÃO recupera v1 nos top-3          | QA           | ☐      | Verificar que `version=v1` não aparece nos top-3 para chamado novo       |
| RET-06 | 🔴 P1  | "Multiplicador para o Sudeste?" → recupera PROC-042v2-B; v1 não nos top-3                          | QA           | ☐      | Contradição 1.0 (v1) vs 1.1 (v2) se v1 aparecer no top-3                 |
| RET-07 | 🟡 P2  | "Frete para 300kg para Salvador?" → nenhum chunk de PROC-042 aplicado como relevante nos top-3     | QA           | ☐      | Verificar que chunks de PROC-042 não dominam resultado para peso < 500kg |
| RET-08 | 🟡 P2  | "Tracking em trânsito há 5 dias." → recupera FAQ-27 nos top-5                                      | QA           | ☐      | FAQ-27 deve estar presente; ausência causa recusa inadequada             |
| RET-09 | 🟡 P2  | Pergunta multi-domínio (devolução + frete + SLA) → recupera chunks dos 3 domínios nos top-5        | QA           | ☐      | POL-001-A, PROC-042v2-B, SLA-2024-C todos presentes                      |
| RET-10 | 🔴 P1  | **Métrica Recall@5 ≥ 90%** sobre os 9 casos acima                                                  | QA / Eng. IA | ☐      | Script de avaliação de retrieval com ground truth do Anexo B             |
| RET-11 | 🔴 P1  | **Métrica Version accuracy = 100%** — v2 preferida sobre v1 nos top-3 para chamados pós 01/12/2023 | QA / Eng. IA | ☐      | Script filtrando casos com ambas as versões disponíveis                  |

---

## Categoria: Geração

| ID     | Prior. | Teste                                                                             | Responsável | Status | Evidência                                                               |
| ------ | ------ | --------------------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------- |
| GER-01 | 🟡 P2  | Prazo de devolução: rubrica ≥ 9/12, sem nota 1                                    | QA          | ☐      | Ficha de avaliação preenchida (template `03-template-avaliacao.md`)     |
| GER-02 | 🔴 P1  | Tier Platinum: IA nega o tier; não inventa SLAs (Precisão = 3 obrigatório)        | QA          | ☐      | Ausência de valores numéricos de SLA na resposta                        |
| GER-03 | 🔴 P1  | Carga perigosa + devolução: IA não inverte a proibição (Precisão = 3 obrigatório) | QA          | ☐      | Presença de "não elegível" ou "não pode"; presença de ramal 4500        |
| GER-04 | 🟡 P2  | Chunks contraditórios (v1 + v2 injetados): IA usa v2 e alerta sobre contradição   | QA          | ☐      | Resposta cita v2 e menciona existência de versão anterior               |
| GER-05 | 🔴 P1  | Pergunta sem cobertura: IA declara ausência de informação (guardrail 3)           | QA          | ☐      | Presença de "não encontrei" ou equivalente; ausência de valor calculado |
| GER-06 | 🔴 P1  | 100% das respostas citam fonte (guardrail 1)                                      | QA          | ☐      | Regex verificando padrão de citação em amostra de 20 respostas          |
| GER-07 | 🟡 P2  | 100% das respostas em português formal (guardrail 4)                              | QA          | ☐      | Verificação de idioma em amostra de 20 respostas                        |

---

## Categoria: Contexto

| ID     | Prior. | Teste                                                                                     | Responsável | Status | Evidência                                                         |
| ------ | ------ | ----------------------------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------- |
| CTX-01 | 🔴 P1  | Token count de prompt completo ≤ 80% da janela do modelo                                  | Eng. IA     | ☐      | Log de token count por requisição; alerta se > 80%                |
| CTX-02 | 🔴 P1  | Lost in the middle: pergunta multi-domínio (RET-09) — 3 domínios respondidos corretamente | QA          | ☐      | Assertion triplo na resposta; falha no domínio central é sinal    |
| CTX-03 | 🟡 P2  | Context rot: 5ª pergunta de sessão longa ≥ 90% da qualidade em sessão nova                | QA          | ☐      | Comparar pontuação da rubrica entre sessão longa e sessão nova    |
| CTX-04 | 🟡 P2  | Chunks recuperados têm prioridade sobre histórico de conversa em sessão longa             | QA          | ☐      | Resposta da 5ª pergunta cita fonte do chunk, não repete histórico |
| CTX-05 | 🟡 P2  | Context overflow: qualidade na 10ª resposta ≥ 90% da qualidade em sessão nova             | QA          | ☐      | Comparar rubrica em sessão com 10+ trocas vs sessão nova          |

---

## Categoria: Ponta a Ponta (E2E)

| ID     | Prior. | Teste                                                                      | Responsável | Status | Evidência                                                          |
| ------ | ------ | -------------------------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------ |
| E2E-01 | 🔴 P1  | "Qual o prazo de devolução?" — resposta completa com exceções e ramal 4500 | QA          | ☐      | Rubrica ≥ 9/12; presença dos 3 prazos (4h, 2 dias, 5 dias)         |
| E2E-02 | 🔴 P1  | Frete 800kg Norte — multiplicador 1.8, fator de peso 1.0, fórmula completa | QA          | ☐      | Presença de "1.8", "1.0" e referência ao valor base                |
| E2E-03 | 🔴 P1  | SLA Platinum — nega tier, orienta tiers reais, sem SLAs inventados         | QA + PS     | ☐      | Ausência de valores numéricos de SLA para Platinum                 |
| E2E-04 | 🔴 P1  | Devolução carga perigosa — "não elegível", ramal 4500                      | QA + PS     | ☐      | Presença de "não" + "4500"                                         |
| E2E-05 | 🟡 P2  | Frete 300kg Salvador — declara ausência de informação, orienta Comercial   | QA          | ☐      | Ausência de valor calculado; presença de "consulte" ou equivalente |

---

## Categoria: Regressão

| ID     | Prior. | Gatilho                            | Testes automáticos                             | Responsável  | Status | Evidência                                                                        |
| ------ | ------ | ---------------------------------- | ---------------------------------------------- | ------------ | ------ | -------------------------------------------------------------------------------- |
| REG-01 | 🔴 P1  | Nova versão de documento ingerida  | RET-05, RET-06, E2E-02                         | Eng. IA / QA | ☐      | Pipeline CI executa testes ao detectar mudança no índice                         |
| REG-02 | 🔴 P1  | Mudança no system prompt           | GER-01 a GER-07, E2E-01 a E2E-05               | QA           | ☐      | Score médio da rubrica não cai > 10% vs baseline                                 |
| REG-03 | 🟡 P2  | Mudança nos parâmetros de chunking | ING-05 a ING-08, RET-01 a RET-11               | Eng. IA / QA | ☐      | Recall@5 ≥ 90% mantido; nenhum chunk obrigatório sai do top-5                    |
| REG-04 | 🟡 P2  | Mudança no modelo de embedding     | RET-01 a RET-11                                | Eng. IA / QA | ☐      | Version accuracy = 100%; Recall@5 ≥ 90%                                          |
| REG-05 | 🔴 P1  | Mudança no LLM ou versão do modelo | GER-02, GER-03, CTX-02, CTX-03, E2E-03, E2E-04 | QA           | ☐      | Nenhuma resposta antes aprovada passa a ter nota 1 em Precisão ou Guardrails     |
| REG-06 | 🟡 P2  | Adição de documento novo à base    | RET-07, E2E-05                                 | QA           | ☐      | Perguntas sem cobertura ainda declaram ausência; novo doc recuperado no seu tema |

---

## Resumo de cobertura

| Categoria | Total  | P1 (bloqueantes) | P2     | Concluídos | Falharam |
| --------- | ------ | ---------------- | ------ | ---------- | -------- |
| Ingestão  | 12     | 7                | 5      | 0          | 0        |
| Retrieval | 11     | 8                | 3      | 0          | 0        |
| Geração   | 7      | 4                | 3      | 0          | 0        |
| Contexto  | 5      | 2                | 3      | 0          | 0        |
| E2E       | 5      | 4                | 1      | 0          | 0        |
| Regressão | 6      | 3                | 3      | 0          | 0        |
| **Total** | **46** | **28**           | **18** | **0**      | **0**    |
