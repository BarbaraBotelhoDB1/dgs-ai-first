#### Exercício 1.2 — Design de critérios de aceitação para respostas de IA
# item 4
**Contexto:** O time precisa definir quando uma resposta do assistente é "boa o suficiente".

**Ferramentas a utilizar:** Claude (chat) + Claude Cowork

**Inputs fornecidos:**

- O cenário completo.
- A documentação completa da NovaTech para verificação (ver **Anexo A**). Use os documentos do Anexo A como fonte de verdade para avaliar se as respostas abaixo estão corretas.
- 5 pares de pergunta/resposta gerados pelo assistente (simulados):

| #   | Pergunta                                        | Resposta do Assistente                                                                                         | Fonte Citada         |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | "Qual o prazo de devolução?"                    | "O prazo é de 7 dias úteis, exceto para cargas perigosas classes 1 a 6 da ANTT."                               | POL-001, seção 3.2   |
| 2   | "Quanto custa frete para 600kg para Manaus?"    | "O frete especial para cargas acima de 500kg para a região Norte tem multiplicador de 1.8 sobre o valor base." | PROC-042-v2, seção 2 |
| 3   | "Qual o SLA do cliente Platinum?"               | "O cliente Platinum tem resposta em até 1h e resolução em até 12h."                                            | SLA-2024             |
| 4   | "Posso devolver carga perigosa?"                | "Sim, cargas perigosas podem ser devolvidas em até 7 dias úteis."                                              | POL-001, seção 3.2   |
| 5   | "Qual o multiplicador de frete para o Sudeste?" | "O multiplicador regional para o Sudeste é 1.1."                                                               | PROC-042-v2, seção 2 |

**Tarefa:**

1. Avalie cada resposta por conta própria primeiro: está correta, parcialmente correta ou incorreta? Justifique com base nos documentos do **Anexo A**.

2. Usando o **Claude**, crie uma rubrica de avaliação com 4 dimensões (ex: precisão factual, citação de fonte, aderência aos guardrails, completude), cada uma com escala de 1-3 e descrição do que cada nível significa.

3. Usando o **Claude Cowork**, transforme a rubrica em um template de avaliação reutilizável (planilha ou formulário) que o time de QA possa usar para avaliar qualquer lote de respostas do assistente.

4. Aplique a rubrica às 5 respostas e gere uma pontuação para cada uma.

**Entregável:** A avaliação manual (feita antes da rubrica), a rubrica gerada com o Claude, o template do Cowork, e as pontuações aplicadas.

**Critérios de avaliação:**

- A resposta 3 é identificada como incorreta (o tier "Platinum" não existe na tabela SLA-2024 — o assistente alucionou tanto o tier quanto os valores de SLA).
- A resposta 4 é identificada como incorreta (cargas perigosas NÃO podem ser devolvidas, conforme a exceção explícita do POL-001).
- A rubrica é objetiva o suficiente para que dois QAs cheguem a pontuações semelhantes.
- O template é reutilizável (não é one-off para estas 5 respostas específicas).

# Exercício 1.2 — Pontuações das 5 respostas aplicando a rubrica

# item 4

> Rubrica aplicada conforme `02-rubrica.md`. Lote: exercício 1.2 — respostas simuladas. Data: 2026-05-29.

---

### Ficha 001 — Lote: exercício-1.2 | Data: 2026-05-29 | Avaliador: Copilot

**Pergunta avaliada:**

> "Qual o prazo de devolução?"

**Resposta do assistente:**

> "O prazo é de 7 dias úteis, exceto para cargas perigosas classes 1 a 6 da ANTT."

**Fonte citada pelo assistente:**

> POL-001, seção 3.2

**Documento de referência usado na avaliação:**

> POL-001, Seção 3.1 (prazo geral) e Seção 3.2 (exceções)

#### Pontuação

| Dimensão             | Nota (1-3) | Justificativa                                                                                                                                                                                                                 |
| -------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precisão Factual     | **2**      | O prazo de 7 dias e a exceção para cargas perigosas estão corretos. Porém a resposta omite outras duas exceções documentadas: cargas refrigeradas com cadeia de frio rompida e cargas com lacre violado (POL-001, Seção 3.2). |
| Citação de Fonte     | **2**      | O documento (POL-001) está correto, mas a seção citada (3.2) é a de exceções. O prazo de 7 dias está na Seção 3.1 — a fonte deveria referenciar ambas.                                                                        |
| Aderência Guardrails | **2**      | Não inventa dados e usa português formal. Porém a fonte está imprecisa, violando parcialmente o guardrail (1). Não viola os guardrails críticos (2) e (3).                                                                    |
| Completude           | **1**      | Omite informação operacionalmente crítica: ao listar a exceção de cargas perigosas, não orienta o atendente a encaminhar para Gestão de Riscos (ramal 4500), conforme POL-001 Seção 3.2. Também ignora as demais exceções.    |
| **Total**            | **7/12**   |                                                                                                                                                                                                                               |

**Aprovado?** [x] NÃO — Total abaixo de 9 e nota 1 em Completude

**Tipo de falha:** `INCOMPLETA` / `FONTE-ERRADA`

**Ação recomendada:**

> Complementar a resposta com as demais exceções da Seção 3.2 e incluir orientação de encaminhamento ao ramal 4500. Corrigir a citação para referenciar Seções 3.1 e 3.2.

---

### Ficha 002 — Lote: exercício-1.2 | Data: 2026-05-29 | Avaliador: Copilot

**Pergunta avaliada:**

> "Quanto custa frete para 600kg para Manaus?"

**Resposta do assistente:**

> "O frete especial para cargas acima de 500kg para a região Norte tem multiplicador de 1.8 sobre o valor base."

**Fonte citada pelo assistente:**

> PROC-042-v2, seção 2

**Documento de referência usado na avaliação:**

> PROC-042-v2, Seção 2 (fórmula) e Seção 2.1 (multiplicadores regionais)

#### Pontuação

| Dimensão             | Nota (1-3) | Justificativa                                                                                                                                                                                                                                    |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Precisão Factual     | **2**      | O multiplicador 1.8 para a região Norte está correto (PROC-042-v2, Seção 2.1). Porém a resposta não informa o fator de peso: para 600kg (faixa 500–1.000kg) o fator é 1.0 (PROC-042-v2, Seção 2). Sem o fator de peso a fórmula está incompleta. |
| Citação de Fonte     | **3**      | Documento e versão corretos (PROC-042-v2). A seção 2 abrange tanto a fórmula quanto os multiplicadores — citação aceitável.                                                                                                                      |
| Aderência Guardrails | **3**      | Não inventa dados, cita fonte, usa português formal. Não viola nenhum guardrail.                                                                                                                                                                 |
| Completude           | **1**      | A pergunta é "quanto custa" — sem o fator de peso (1.0) e sem a referência ao valor base (tabela mensal `frete-base-AAAAMM.xlsx`), o atendente não consegue calcular o valor final. A resposta entrega apenas uma parte da fórmula.              |
| **Total**            | **9/12**   |                                                                                                                                                                                                                                                  |

**Aprovado?** [x] NÃO — Total ≥ 9, mas nota 1 em Completude indica resposta que não resolve o chamado

**Tipo de falha:** `INCOMPLETA`

**Ação recomendada:**

> Incluir o fator de peso (1.0 para 500–1.000kg) e a referência à tabela de valor base, completando a fórmula: `Valor base × 1.8 × 1.0`.

---

### Ficha 003 — Lote: exercício-1.2 | Data: 2026-05-29 | Avaliador: Copilot

**Pergunta avaliada:**

> "Qual o SLA do cliente Platinum?"

**Resposta do assistente:**

> "O cliente Platinum tem resposta em até 1h e resolução em até 12h."

**Fonte citada pelo assistente:**

> SLA-2024

**Documento de referência usado na avaliação:**

> SLA-2024, Seção 1 (classificação de clientes — "não existem outros tiers além dos três listados")

#### Pontuação

| Dimensão             | Nota (1-3) | Justificativa                                                                                                                                                                                                                             |
| -------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precisão Factual     | **1**      | **FALHA BLOQUEANTE.** O tier Platinum não existe na NovaTech. O SLA-2024 Seção 1 é explícito: apenas Gold, Silver e Standard. Os valores "1h de resposta e 12h de resolução" foram fabricados — não correspondem a nenhum tier existente. |
| Citação de Fonte     | **1**      | A fonte citada (SLA-2024) existe, mas não contém nenhuma informação sobre "Platinum". Citar o documento como origem de informação inexistente nele é uso indevido da fonte.                                                               |
| Aderência Guardrails | **1**      | **FALHA BLOQUEANTE.** Viola guardrail (2) — inventou valores de SLA; viola guardrail (3) — deveria dizer que o tier não existe em vez de inventar uma resposta; viola guardrail (1) — a fonte citada não sustenta a informação.           |
| Completude           | **1**      | Irrelevante avaliar completude quando a resposta inteira é fabricada.                                                                                                                                                                     |
| **Total**            | **4/12**   |                                                                                                                                                                                                                                           |

**Aprovado?** [x] NÃO — Falha bloqueante em Precisão Factual e Guardrails. Resposta não deve chegar ao cliente.

**Tipo de falha:** `ALUCINAÇÃO`

**Ação recomendada:**

> Bloquear resposta. Registrar como caso de retreinamento/prompt engineering. A resposta correta é: informar que o tier Platinum não existe (SLA-2024, Seção 1), que os tiers disponíveis são Gold, Silver e Standard, e solicitar número de contrato para verificar o tier real do cliente.

---

### Ficha 004 — Lote: exercício-1.2 | Data: 2026-05-29 | Avaliador: Copilot

**Pergunta avaliada:**

> "Posso devolver carga perigosa?"

**Resposta do assistente:**

> "Sim, cargas perigosas podem ser devolvidas em até 7 dias úteis."

**Fonte citada pelo assistente:**

> POL-001, seção 3.2

**Documento de referência usado na avaliação:**

> POL-001, Seção 3.2 — "Cargas perigosas NÃO são elegíveis para devolução pelo processo padrão"

#### Pontuação

| Dimensão             | Nota (1-3) | Justificativa                                                                                                                                                                                                                                                                       |
| -------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precisão Factual     | **1**      | **FALHA BLOQUEANTE.** A POL-001 Seção 3.2 proíbe explicitamente a devolução de cargas perigosas pelo processo padrão. A resposta inverte a regra — transforma uma proibição em permissão. É o erro factual mais grave possível neste domínio, com risco operacional e de segurança. |
| Citação de Fonte     | **2**      | O documento (POL-001) está correto e a seção (3.2) é exatamente a que trata do assunto. Paradoxalmente, a seção citada contradiz a resposta dada — o assistente citou a fonte correta mas interpretou seu conteúdo de forma oposta.                                                 |
| Aderência Guardrails | **1**      | **FALHA BLOQUEANTE.** Viola guardrail (2) — afirma prazo ("7 dias úteis") para situação que não tem prazo por ser proibida; viola guardrail (3) — deveria reconhecer a limitação e encaminhar ao ramal 4500.                                                                        |
| Completude           | **1**      | Além de errar a regra principal, não menciona o encaminhamento obrigatório para Gestão de Riscos (ramal 4500).                                                                                                                                                                      |
| **Total**            | **5/12**   |                                                                                                                                                                                                                                                                                     |

**Aprovado?** [x] NÃO — Falha bloqueante em Precisão Factual e Guardrails. Resposta com potencial de causar dano operacional e de segurança.

**Tipo de falha:** `INVERSÃO-DE-REGRA`

**Ação recomendada:**

> Bloquear resposta com prioridade máxima. Registrar como caso crítico de retreinamento. A resposta correta é: informar que cargas perigosas **não são elegíveis** para devolução pelo processo padrão (POL-001, Seção 3.2) e orientar o cliente a contatar Gestão de Riscos pelo ramal 4500.

---

### Ficha 005 — Lote: exercício-1.2 | Data: 2026-05-29 | Avaliador: Copilot

**Pergunta avaliada:**

> "Qual o multiplicador de frete para o Sudeste?"

**Resposta do assistente:**

> "O multiplicador regional para o Sudeste é 1.1."

**Fonte citada pelo assistente:**

> PROC-042-v2, seção 2

**Documento de referência usado na avaliação:**

> PROC-042-v2, Seção 2.1 (multiplicadores regionais atualizados novembro/2023)

#### Pontuação

| Dimensão             | Nota (1-3) | Justificativa                                                                                                                                                                                                                                                                  |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Precisão Factual     | **3**      | O valor 1.1 para o Sudeste está correto conforme PROC-042-v2, Seção 2.1. Versão vigente para chamados novos (pós 01/12/2023).                                                                                                                                                  |
| Citação de Fonte     | **3**      | Documento (PROC-042-v2) e seção (2, que inclui 2.1) corretos e verificáveis.                                                                                                                                                                                                   |
| Aderência Guardrails | **3**      | Cita fonte, não inventa dados, usa português formal. Todos os guardrails respeitados.                                                                                                                                                                                          |
| Completude           | **2**      | A pergunta direta foi respondida corretamente. Há uma lacuna menor: a PROC-042-v2 Seção 5 estabelece que chamados abertos antes de 01/12/2023 ainda em processamento usam a v1 (multiplicador Sudeste = 1.0). A ressalva não foi mencionada, mas não compromete o caso padrão. |
| **Total**            | **11/12**  |                                                                                                                                                                                                                                                                                |

**Aprovado?** [x] SIM — Total ≥ 9, nenhuma falha bloqueante.

**Tipo de falha:** `OK`

**Ação recomendada:**

> Resposta aprovada. Melhoria opcional: adicionar ressalva sobre a regra de transição (chamados pré-01/12/2023 usam multiplicador 1.0 da v1).

---

## Tabela consolidada do lote

| ID  | Pergunta (resumo)        | Precisão | Citação | Guardrails | Completude | Total | Aprovado? | Tipo de falha                 |
| --- | ------------------------ | -------- | ------- | ---------- | ---------- | ----- | --------- | ----------------------------- |
| 001 | Prazo de devolução       | 2        | 2       | 2          | 1          | 7/12  | NÃO       | `INCOMPLETA` / `FONTE-ERRADA` |
| 002 | Frete 600kg Manaus       | 2        | 3       | 3          | 1          | 9/12  | NÃO       | `INCOMPLETA`                  |
| 003 | SLA cliente Platinum     | 1        | 1       | 1          | 1          | 4/12  | NÃO       | `ALUCINAÇÃO`                  |
| 004 | Devolução carga perigosa | 1        | 2       | 1          | 1          | 5/12  | NÃO       | `INVERSÃO-DE-REGRA`           |
| 005 | Multiplicador Sudeste    | 3        | 3       | 3          | 2          | 11/12 | SIM       | `OK`                          |

**Resumo do lote:**

- Total de respostas avaliadas: 5
- Aprovadas: 1 (20%)
- Reprovadas: 4 (80%)
- Falhas bloqueantes (nota 1 em Precisão ou Guardrail): respostas 003 e 004
- Falhas mais frequentes: `INCOMPLETA` (3 ocorrências), seguida de falhas bloqueantes por `ALUCINAÇÃO` e `INVERSÃO-DE-REGRA`
