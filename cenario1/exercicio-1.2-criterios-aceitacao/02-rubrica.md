# Exercício 1.2 — Rubrica de avaliação (gerada com Claude)
# item 2
> 4 dimensões, escala 1-3, descrição clara por nível. Pontuação máxima por resposta: **12 pontos**. Pontuação mínima aceitável: **9 pontos** (≥ 75%). Qualquer dimensão com nota 1 em Precisão Factual invalida a resposta, independente da nota total.

---

## Dimensão 1 — Precisão Factual

> Avalia se os dados, valores, prazos e regras informados correspondem à documentação oficial da NovaTech (Anexo A). É a dimensão de maior peso: uma resposta factualmente errada é inaceitável mesmo que bem formatada.

| Nível                        | Descrição                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — Incorreto**            | A resposta contém ao menos um dado factualmente errado ou invertido em relação à documentação oficial (ex: afirma que carga perigosa pode ser devolvida; inventa tier inexistente; usa multiplicador de versão errada sem ressalva). Falha bloqueante — a resposta não deve chegar ao cliente.         |
| **2 — Parcialmente correto** | Os dados principais estão corretos, mas há omissão de informação relevante que altera o entendimento completo (ex: informa o prazo geral de 7 dias mas omite outras exceções além de cargas perigosas; informa o multiplicador mas não menciona o fator de peso). Requer complementação antes de usar. |
| **3 — Correto**              | Todos os dados, valores e regras estão corretos e alinhados à documentação vigente. Nenhuma informação importante foi omitida no contexto da pergunta feita.                                                                                                                                           |

---

## Dimensão 2 — Citação de Fonte

> Avalia se a resposta identifica de forma rastreável o documento e a seção que embasa a informação. Guardrail (1): "Sempre citar fonte."

| Nível                                  | Descrição                                                                                                                                                                                                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Sem fonte ou fonte inexistente** | A resposta não cita nenhuma fonte, ou cita um documento/seção que não existe na base de conhecimento da NovaTech (ex: citar "SLA-2024" para informar SLA de tier Platinum que não existe).                                                                                             |
| **2 — Fonte parcial ou imprecisa**     | A resposta cita o documento correto mas não especifica a seção (ex: "PROC-042-v2" sem indicar seção 2.1), ou cita a seção errada dentro do documento correto (ex: citar seção 3.2 para o prazo de 7 dias que está na seção 3.1). A informação é rastreável, mas com esforço adicional. |
| **3 — Fonte completa e precisa**       | A resposta cita documento e seção corretos de forma que o avaliador consiga localizar e verificar a informação sem ambiguidade (ex: "POL-001, Seção 3.1" para o prazo geral de devolução).                                                                                             |

---

## Dimensão 3 — Aderência aos Guardrails

> Avalia o cumprimento das 4 regras definidas pelo Product Specialist: (1) Sempre citar fonte; (2) Nunca inventar prazos ou valores; (3) Quando não encontrar resposta, dizer explicitamente; (4) Responder em português formal.

| Nível                              | Descrição                                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Viola guardrail crítico**    | A resposta viola os guardrails (2) ou (3): inventa prazos, valores ou informações não presentes na documentação; ou afirma com confiança algo que deveria admitir como desconhecido (ex: gera SLAs para tier inexistente em vez de dizer que o tier não existe). |
| **2 — Cumpre parcialmente**        | A resposta não inventa informações, mas viola os guardrails (1) ou (4): ausência de citação de fonte, ou uso de linguagem informal, coloquial ou ambígua. Não há dado fabricado, mas o guardrail de processo ou forma não foi respeitado.                        |
| **3 — Cumpre todos os guardrails** | A resposta cita fonte, não inventa dados, está em português formal e, quando a informação não existe, declara explicitamente a ausência. Todos os 4 guardrails são respeitados.                                                                                  |

---

## Dimensão 4 — Completude

> Avalia se a resposta cobre todos os aspectos relevantes da pergunta, incluindo exceções, condições e orientações de encaminhamento quando aplicável. Uma resposta correta mas incompleta pode deixar o atendente sem informação suficiente para resolver o chamado.

| Nível                                  | Descrição                                                                                                                                                                                                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Incompleta de forma relevante**  | A resposta omite informação que muda materialmente a orientação ao cliente (ex: informa que pode devolver mas não menciona o procedimento; informa multiplicador mas sem o fator de peso necessário para o cálculo; não menciona ramal de encaminhamento para casos excepcionais). |
| **2 — Suficiente com lacunas menores** | A resposta cobre o núcleo da pergunta mas omite detalhes secundários que o atendente poderia precisar em casos específicos (ex: não menciona exceções secundárias como lacre violado ao responder sobre prazo de devolução; não cita a ressalva de versão para contratos antigos). |
| **3 — Completa**                       | A resposta cobre todos os aspectos relevantes para que o atendente resolva o chamado sem consulta adicional: dados principais, exceções aplicáveis, condições de contexto e, quando necessário, orientação de encaminhamento.                                                      |

---

## Tabela de referência rápida

| Dimensão                 | Peso na avaliação | Nota mínima aceitável | Falha bloqueante                              |
| ------------------------ | ----------------- | --------------------- | --------------------------------------------- |
| Precisão Factual         | Alta              | 2                     | Nota 1 invalida a resposta                    |
| Citação de Fonte         | Média             | 2                     | —                                             |
| Aderência aos Guardrails | Alta              | 2                     | Nota 1 (guardrail 2 ou 3) invalida a resposta |
| Completude               | Média             | 2                     | —                                             |

**Critério de aceite:** pontuação total ≥ 9/12 **E** nenhuma dimensão com nota 1 em Precisão Factual ou Guardrail crítico.
