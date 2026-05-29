# Avaliação do Exercício 1.1 — QA (Cenário 1)

> **Gerado por:** prompt `avaliar-qa-cenario1.prompt.md` via GitHub Copilot
> **Data:** 29/05/2026
> **Participante:** QA — Barbara Magalhães
> **Exercício:** 1.1 — Identificação de cenários de falha de IA

---

## Resumo

Entregável sólido e completo: 14 cenários cobrindo todas as 5 categorias obrigatórias, com verificação automatizável em 12/14. A lista pré-IA é substantiva e claramente independente do output do Claude. O único gap relevante é a ausência de iteração documentada com a ferramenta.

---

## Scores por Dimensão

| Dimensão                       | Score | Justificativa                                                                                                                                                                                                                                                                 |
| ------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 — Domínio Conceitual        | **3** | Distingue corretamente context rot / chunk errado / lost in the middle / overflow com exemplos específicos do domínio. Identifica que PROC-042 vs v2 gera risco de mistura de multiplicadores (o próprio exemplo do score 3 na rubrica).                                      |
| D2 — Uso de Ferramentas        | **2** | Prompt para o Claude foi específico e bem contextualizado (incluiu cenário NovaTech, guardrails, definições de alucinação e falhas de contexto). Porém há evidência de apenas uma rodada — sem v2 do prompt documentado. C4 marcado como H+IA é o único sinal de refinamento. |
| D3 — Qualidade do Entregável   | **3** | 14 cenários, 5 categorias, tabela estruturada com origem (H/IA/H+IA), pergunta de teste, comportamento esperado/indesejado e verificação. 86% com automação. Outro membro do time usaria diretamente.                                                                         |
| D4 — Pensamento Crítico        | **3** | Lista pré-IA tem 4 cenários substanciais e não-idênticos ao Claude. A4 (prazos de devolução), D2 (fonte informal com ressalva), G2 (guardrail de formalidade) são contribuições humanas que o Claude não gerou.                                                               |
| D5 — Aplicabilidade ao Projeto | **3** | Usa chunk IDs reais do Anexo B (PROC-042v2-A/B, SLA-2024-C, FAQ-27), valores específicos (multiplicadores 1.6/1.8, data de vigência 01/12/2023, percentuais 0.3%/0.8%), tiers corretos.                                                                                       |

**Score do exercício: 2.8**

---

## Verificação de Armadilhas

Nenhuma armadilha intencional neste exercício.

---

## Pontos Fortes

1. **Verificação automatizável concreta**: propostas de regex, fixture com data, logging de chunk_ids — não é só "verificar manualmente", é testável de verdade.
2. **Domínio de contexto com profundidade**: os 4 subtipos de falha de contexto foram corretamente identificados com exemplos específicos (sessão Teams, pipeline recuperando v1 antiga, pergunta multi-domínio).
3. **Contribuição humana com valor real**: D2 (ressalva sobre fonte informal do FAQ) e G2 (guardrail de formalidade em português) são cenários que o Claude não criou e têm impacto prático no projeto.

---

## Pontos de Melhoria

1. **Cenário 2 da lista inicial (latência) não é categoria de falha de IA** — performance/latência é concern de infraestrutura, não de modelo. Substituir por um cenário de guardrail ou alucinação teria deixado a lista pré-IA mais precisa conceitualmente.
2. **D2 ficou em 2 por falta de iteração documentada** — um segundo prompt ao Claude pedindo refinamento em algum cenário específico (ex: "C4 está vago, adicione como verificar via token count") elevaria para 3.
3. **Título do Cenário 3 (lista inicial) é genérico** — "Experiência do usuário com a IA" não comunica a categoria. Renomear para algo como "Falha de Guardrail: resposta ambígua viola guardrail #4" tornaria o rastreamento mais claro.

---

## Classificação

**Aprovado com distinção** (score 2.8)

## Tópicos para Reforço

Score acima de 2.5 — nenhum tópico crítico. Para chegar a 3.0: praticar o ciclo de iteração com a ferramenta (gerar → avaliar → refinar → gerar v2).
