# Exercício 1.2 — Template reutilizável de avaliação
# item 3
> Substituição do Claude Cowork (licença indisponível): template em Markdown versionado no repo.
> **Uso:** copiar a seção "Ficha de avaliação" para cada lote de respostas a avaliar. Não editar as seções de instrução — apenas as fichas de preenchimento.

---

## Instruções de uso

1. Para cada resposta do assistente a avaliar, preencha uma **Ficha de avaliação** (copie o bloco abaixo).
2. Atribua nota 1, 2 ou 3 a cada dimensão conforme a rubrica (`02-rubrica.md`).
3. Some as 4 notas no campo **Total** (máximo: 12).
4. Preencha **Aprovado?** com `SIM` se Total ≥ 9 **E** nenhuma dimensão tiver nota 1 em Precisão Factual ou Guardrail crítico; caso contrário, `NÃO`.
5. Registre o **Tipo de falha** usando os rótulos padronizados (ver tabela abaixo).
6. Salve o arquivo com nome `avaliacao-lote-AAAA-MM-DD.md` na pasta do exercício correspondente.

---

## Rótulos padronizados de tipo de falha

| Rótulo                 | Quando usar                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `ALUCINAÇÃO`           | A IA inventou dado, valor ou entidade inexistente                        |
| `INVERSÃO-DE-REGRA`    | A IA respondeu o oposto do que a documentação estabelece                 |
| `FONTE-ERRADA`         | Documento ou seção citados não correspondem à informação fornecida       |
| `FONTE-AUSENTE`        | Nenhuma fonte foi citada                                                 |
| `INCOMPLETA`           | Informação correta mas faltam exceções, condições ou encaminhamento      |
| `VERSÃO-DESATUALIZADA` | Usou dados de versão antiga de documento com versão mais recente vigente |
| `RECUSA-INADEQUADA`    | Disse não saber quando a informação existe na base                       |
| `GUARDRAIL-IDIOMA`     | Respondeu em outro idioma ou com linguagem informal                      |
| `OK`                   | Sem falha identificada                                                   |

---

## Ficha de avaliação — modelo para copiar

```
---
### Ficha [ID] — Lote: [nome do lote] | Data: [AAAA-MM-DD] | Avaliador: [nome]

**Pergunta avaliada:**
> [colar pergunta]

**Resposta do assistente:**
> [colar resposta]

**Fonte citada pelo assistente:**
> [colar fonte]

**Documento de referência usado na avaliação:**
> [ex: POL-001 Seção 3.1, SLA-2024 Seção 2]

#### Pontuação

| Dimensão              | Nota (1-3) | Justificativa |
|-----------------------|------------|---------------|
| Precisão Factual      |            |               |
| Citação de Fonte      |            |               |
| Aderência Guardrails  |            |               |
| Completude            |            |               |
| **Total**             |   **/12**  |               |

**Aprovado?** [ ] SIM  [ ] NÃO

**Tipo de falha:** [rótulo ou OK]

**Ação recomendada:**
> [ex: bloquear resposta / complementar com seção X / registrar como caso de retreinamento]
---
```

---

## Tabela consolidada do lote (resumo)

> Preencher após completar todas as fichas do lote.

| ID  | Pergunta (resumo) | Precisão | Citação | Guardrails | Completude | Total | Aprovado? | Tipo de falha |
| --- | ----------------- | -------- | ------- | ---------- | ---------- | ----- | --------- | ------------- |
|     |                   |          |         |            |            |       |           |               |

**Resumo do lote:**

- Total de respostas avaliadas: \_\_\_
- Aprovadas: **_ (_**%)
- Reprovadas: **_ (_**%)
- Falhas mais frequentes: \_\_\_
