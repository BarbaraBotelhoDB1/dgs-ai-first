
# Exercício 1.2 — Avaliação manual das 5 respostas (sem rubrica)
# item 1
> Feita **antes** de criar a rubrica, com base nos documentos do Anexo A.

---

### Resposta 1 — "Qual o prazo de devolução?"

**Resposta do assistente:** "O prazo é de 7 dias úteis, exceto para cargas perigosas classes 1 a 6 da ANTT."
**Fonte citada:** POL-001, seção 3.2

**Veredicto: Parcialmente correta**

**Justificativa:**
O prazo de 7 dias úteis está correto — conforme **POL-001, Seção 3.1**. A menção à exceção para cargas perigosas classes 1 a 6 também está correta — conforme **POL-001, Seção 3.2**.

Porém há três problemas:

1. **Fonte errada:** A seção citada (3.2) contém as _exceções_, não o prazo geral. O prazo de 7 dias está na Seção 3.1. A citação deveria referenciar ambas as seções.
2. **Incompleta:** A Seção 3.2 lista outras duas exceções que a resposta ignora: cargas refrigeradas com cadeia de frio rompida e cargas com lacre de segurança violado.
3. **Falta orientação de encaminhamento:** Para cargas perigosas, a POL-001 instrui contatar o setor de **Gestão de Riscos (ramal 4500)** — informação operacionalmente crítica que a resposta omite.

---

### Resposta 2 — "Quanto custa frete para 600kg para Manaus?"

**Resposta do assistente:** "O frete especial para cargas acima de 500kg para a região Norte tem multiplicador de 1.8 sobre o valor base."
**Fonte citada:** PROC-042-v2, seção 2

**Veredicto: Parcialmente correta**

**Justificativa:**
O multiplicador regional para o Norte (1.8) está correto conforme **PROC-042-v2, Seção 2.1**, e a fonte está correta.

Porém a resposta está incompleta como resposta a "quanto custa":

1. **Falta o fator de peso:** Para 600kg (faixa de 500kg a 1.000kg), o **fator de peso é 1.0** — conforme PROC-042-v2, Seção 2. A fórmula completa é `Valor base × 1.8 × 1.0`. Omitir o fator de peso deixa o cálculo incompleto.
2. **Falta referência ao valor base:** A resposta não menciona que o valor base vem da tabela mensal de fretes (`\\novatech-fs\comercial\tabelas\frete-base-AAAAMM.xlsx`), sem a qual o multiplicador sozinho não permite calcular o custo final.

O atendente não consegue responder "quanto custa" ao cliente com essa informação incompleta.

---

### Resposta 3 — "Qual o SLA do cliente Platinum?"

**Resposta do assistente:** "O cliente Platinum tem resposta em até 1h e resolução em até 12h."
**Fonte citada:** SLA-2024

**Veredicto: INCORRETA — Alucinação**

**Justificativa:**
O tier **Platinum não existe na NovaTech**. O documento **SLA-2024, Seção 1** é explícito: _"Não existem outros tiers além dos três listados acima"_ (Gold, Silver e Standard). O **FAQ-Item 15** confirma: _"Não existe tier Platinum na NovaTech."_

A IA inventou tanto o tier quanto os valores de SLA (1h de resposta e 12h de resolução não correspondem a nenhum tier existente). Nenhum chunk do SLA-2024 contém a palavra "Platinum" associada a valores de SLA.

Guardrails violados: **(1) Sempre citar fonte** — não há fonte possível pois o tier não existe; **(2) Nunca inventar prazos ou valores** — os valores foram fabricados.

A resposta correta seria: informar que o tier Platinum não existe, que os tiers disponíveis são Gold, Silver e Standard, e solicitar o número de contrato para verificar o tier real do cliente.

---

### Resposta 4 — "Posso devolver carga perigosa?"

**Resposta do assistente:** "Sim, cargas perigosas podem ser devolvidas em até 7 dias úteis."
**Fonte citada:** POL-001, seção 3.2

**Veredicto: INCORRETA — Inversão de regra**

**Justificativa:**
A **POL-001, Seção 3.2** estabelece exatamente o oposto: cargas perigosas classificadas nas classes 1 a 6 da ANTT **NÃO são elegíveis para devolução pelo processo padrão**. A resposta inverte a exceção, transformando uma proibição explícita em permissão.

Agravantes:

1. A fonte citada (POL-001, seção 3.2) é justamente a seção que _proíbe_ a devolução padrão — o assistente citou a fonte correta mas interpretou seu conteúdo de forma contrária.
2. A resposta pode causar dano operacional direto: o atendente pode informar ao cliente que a devolução é possível, gerando expectativa incorreta e complicações legais e de segurança.

A resposta correta seria: informar que cargas perigosas **não são elegíveis** para devolução pelo processo padrão (POL-001, Seção 3.2) e orientar o cliente a contatar o setor de **Gestão de Riscos pelo ramal 4500** para tratamento individual.

---

### Resposta 5 — "Qual o multiplicador de frete para o Sudeste?"

**Resposta do assistente:** "O multiplicador regional para o Sudeste é 1.1."
**Fonte citada:** PROC-042-v2, seção 2

**Veredicto: Correta**

**Justificativa:**
O valor 1.1 para o Sudeste está correto conforme **PROC-042-v2, Seção 2.1**, e a fonte está devidamente citada. Para chamados novos (pós 01/12/2023), esse é o multiplicador vigente.

Observação de completude: a resposta não menciona que a PROC-042-v1 continha multiplicador 1.0 para o Sudeste, e que chamados abertos antes de 01/12/2023 ainda em processamento devem usar a versão antiga (conforme PROC-042-v2, Seção 5 — Disposições Transitórias). Para o contexto da pergunta direta ("qual o multiplicador"), a resposta está correta. Seria ideal mencionar a ressalva de versão se o contexto do chamado fosse antigo.

---

## Resumo da avaliação manual

| #   | Pergunta                    | Veredicto            | Principal problema identificado                                                          |
| --- | --------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Prazo de devolução          | Parcialmente correta | Fonte imprecisa (seção errada); exceções incompletas; falta orientação de encaminhamento |
| 2   | Frete 600kg para Manaus     | Parcialmente correta | Falta fator de peso (1.0) e referência ao valor base — cálculo incompleto                |
| 3   | SLA cliente Platinum        | **INCORRETA**        | Alucinação: tier inexistente, valores de SLA inventados                                  |
| 4   | Devolução de carga perigosa | **INCORRETA**        | Inversão de regra: diz "pode devolver" quando a POL-001 proíbe explicitamente            |
| 5   | Multiplicador Sudeste       | Correta              | Informação factualmente correta e fonte devidamente citada                               |
