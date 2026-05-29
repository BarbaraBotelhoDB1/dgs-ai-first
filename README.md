# dgs-ai-first

Trilha de Certificação **AI First — DGS / DB1 Global Software**.
Papel: **QA**. Entregas organizadas por cenário, uma branch por cenário (`Cenario1`, `Cenario2`, `Cenario3`).

## Estrutura

| Cenário                                                          | Branch     | Pasta                  | Status               |
| ---------------------------------------------------------------- | ---------- | ---------------------- | -------------------- |
| 1 — Entendimento e Contexto (Fundamentos, Prompt, Contexto, RAG) | `Cenario1` | [cenario1/](cenario1/) | em andamento         |
| 2 — _a definir_                                                  | `Cenario2` | —                      | aguardando liberação |
| 3 — _a definir_                                                  | `Cenario3` | —                      | aguardando liberação |

Materiais de apoio (cenário-âncora NovaTech, anexos A e B) ficam em `Prática 1/`.

# Cenário 1 — Fase de Entendimento e Contexto (QA)

Tópicos: Fundamentos de IA Generativa · Engenharia de Prompt · Engenharia de Contexto · RAG.

Cenário-âncora: assistente de IA com RAG para o time de atendimento da **NovaTech** (logística).

## O que foi feito

### Exercício 1.1 — Identificação de cenários de falha

- Lista inicial com 4 cenários criados sem IA (pensamento independente): interpretação errada de prazo, demora excessiva, resposta ambígua e informação de seguro via FAQ informal.
- Expansão com o Claude: 10 cenários adicionais cobrindo alucinação, contradição entre versões de documento, falhas de contexto e violação de guardrail.
- Lista consolidada com **14 cenários** em 5 categorias obrigatórias, todos específicos ao domínio NovaTech, com origem marcada (H / IA / H+IA) e 86% com proposta de verificação automatizável.

### Exercício 1.2 — Critérios de aceitação

- Avaliação manual das 5 respostas simuladas antes de criar qualquer rubrica: identificadas 2 falhas bloqueantes (alucinação de tier Platinum e inversão de regra para carga perigosa).
- Rubrica com 4 dimensões (Precisão Factual, Citação de Fonte, Guardrails, Completude), escala 1–3, critério de aceite ≥ 9/12 com falha bloqueante em notas 1.
- Template reutilizável com ficha individual, rótulos padronizados de falha e tabela consolidada de lote.
- Pontuações aplicadas às 5 respostas: 1 aprovada (20%), 2 falhas bloqueantes priorizadas para retreinamento.

### Exercício 1.3 — Plano de testes para pipeline de RAG

- Plano de testes cobrindo 6 categorias: Ingestão, Retrieval, Geração, Contexto, E2E e Regressão.
- 9 pares pergunta→chunk baseados no mapa de cobertura do Anexo B; métricas Recall@5 ≥ 90% e Version accuracy = 100%.
- Testes de contexto cobrindo orçamento de tokens, lost in the middle, context rot e context overflow.
- Checklist rastreável com **46 testes**, prioridade P1/P2, responsável por papel, sprint sugerido e campo de evidência.

## Exercícios

| #   | Pasta                                                                    | Objetivo                                                                                          |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1.1 | [exercicio-1.1-cenarios-falha/](exercicio-1.1-cenarios-falha/)           | 14 cenários de falha em 5 categorias (alucinação, contradição, contexto, recusa, guardrail).      |
| 1.2 | [exercicio-1.2-criterios-aceitacao/](exercicio-1.2-criterios-aceitacao/) | Avaliação manual + rubrica 4 dimensões + template reutilizável + pontuações das 5 respostas.      |
| 1.3 | [exercicio-1.3-plano-testes-rag/](exercicio-1.3-plano-testes-rag/)       | Plano de testes do pipeline RAG (6 categorias, 46 testes) + checklist rastreável com prioridades. |

## Ferramentas usadas

- **Claude (chat)** — expansão de cenários e criação da rubrica.
- **GitHub Copilot** — organização dos artefatos, preenchimento dos templates e consolidação dos entregáveis.
- **Claude Cowork** indisponível na licença → substituído por tabelas Markdown versionadas no Git (mantém o critério de "template reutilizável pelo time de QA").
