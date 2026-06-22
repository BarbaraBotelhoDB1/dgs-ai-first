# Exercício 1.1 — Análise de Viabilidade Técnica com Fundamentos de LLM e Engenharia de Contexto (Resolução)

**Papel:** Desenvolvedor  
**Cenário:** Assistente de IA para atendimento da NovaTech  
**Ferramenta utilizada:** Claude (chat)

---

## O que o exercício pede (em linguagem simples)

O Tech Lead quer que você responda: **"Conseguimos construir esse assistente de IA? O que vai dar trabalho? Onde pode dar errado?"**

Você precisa produzir um documento técnico cobrindo 4 pontos:

---

## PONTO 1: Desafios por tipo de fonte

**O que é isso?** A NovaTech tem documentos em vários formatos. Para o assistente funcionar, precisamos transformar TODOS eles em texto limpo que a IA consiga ler. Cada formato tem problemas diferentes.

| Tipo de Fonte                                | O Desafio                                                                                                                                                                                     | Como Afeta as Respostas                                                                                                                                                     | Estratégia                                                                                                                                                                                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PDFs com tabelas complexas** (15+ colunas) | Quando você extrai texto de um PDF com tabela, as colunas viram uma bagunça. Ex: "Sul 1.2 Sudeste 1.0" vira texto corrido sem estrutura.                                                      | O modelo pode misturar valores de uma coluna com outra (ex: dizer que o multiplicador do Norte é 1.2 quando é 1.6).                                                         | Usar bibliotecas especializadas em extração de tabelas (como `unstructured`, `tabula-py`). Converter tabelas para formato Markdown ou JSON estruturado antes de criar os chunks.                                                               |
| **PDFs escaneados** (imagens)                | São fotos de documentos, não têm texto digital. É como tirar print de um papel — o computador não "lê" as palavras automaticamente.                                                           | Se o OCR erra uma palavra (ex: "7 dias" vira "1 dias"), o assistente vai dar informação errada com confiança.                                                               | Usar Azure AI Document Intelligence (OCR avançado da Microsoft, já que a NovaTech tem Azure). Implementar validação pós-OCR e revisão humana nos documentos críticos.                                                                          |
| **Wiki Confluence com links e macros**       | Páginas do Confluence se referenciam entre si. Se você pega só uma página isolada, perde o contexto dos links. Macros customizadas podem gerar conteúdo dinâmico que não aparece na extração. | Respostas podem ficar incompletas porque a informação complementar estava em outra página linkada que não foi recuperada.                                                   | Usar a API do Confluence para extrair conteúdo renderizado (não o código-fonte). Resolver links internos e criar chunks com referências cruzadas. Ignorar macros que geram conteúdo visual (gráficos) e manter as que geram texto.             |
| **Planilhas com fórmulas**                   | As planilhas têm cálculos (ex: frete = base × multiplicador). Se extraímos só os valores, perdemos a lógica. Se extraímos as fórmulas, o modelo pode não interpretá-las.                      | O assistente pode dar um valor calculado desatualizado (se a planilha muda mensalmente e o chunk ficou com valor antigo) ou não conseguir explicar como o cálculo funciona. | Extrair tanto os valores calculados quanto a descrição da fórmula em linguagem natural. Tratar cada planilha como um documento que precisa de re-ingestão mensal (quando é atualizada). Converter para tabelas Markdown com cabeçalhos claros. |

**Como pensar nisso:** Para cada formato, se pergunte: "Se eu fosse um robô tentando ler isso, o que me confundiria?" e "Se o robô entender errado, o que acontece com o cliente?"

---

## PONTO 2: Estimativa de tokens

**O que é "token"?** É a unidade que a IA usa para processar texto. Aproximadamente, 1 token ≈ 0,75 palavras em português (ou ~4 caracteres). Precisamos saber o tamanho total da base para entender o que estamos lidando.

### Cálculo

```
PDFs do SharePoint:
- 800 documentos × 10 páginas × ~500 palavras/página = 4.000.000 palavras
- 4.000.000 ÷ 0,75 = ~5.333.000 tokens

Wiki do Confluence:
- 400 páginas × 1.500 palavras = 600.000 palavras
- 600.000 ÷ 0,75 = ~800.000 tokens

Planilhas:
- 50 planilhas × ~2.000 palavras (estimativa conservadora incluindo
  cabeçalhos e dados tabulares convertidos) = 100.000 palavras
- 100.000 ÷ 0,75 = ~133.000 tokens

TOTAL ESTIMADO: ~6.266.000 tokens (~6,3 milhões de tokens)
```

### O que isso significa na prática?

A base inteira é MUITO maior do que cabe na janela de contexto de qualquer modelo (128K tokens no GPT-4o). Por isso precisamos de RAG: buscar só os pedaços relevantes para cada pergunta, em vez de mandar tudo de uma vez.

---

## PONTO 3: Análise de orçamento de contexto

**O que é "orçamento de contexto"?** O modelo tem um limite de quanto texto pode "ver" de uma vez (a "janela de contexto"). Precisamos dividir esse espaço entre várias coisas.

### Distribuição do orçamento

```
Janela total do GPT-4o:          128.000 tokens

Descontando o que é fixo:
- System prompt + instruções:     ~2.000 tokens
- Histórico de conversa:          ~1.000 tokens (2-3 turnos anteriores)
- Resposta gerada pelo modelo:    ~1.000 tokens (reserva para a saída)
- Margem de segurança:            ~1.000 tokens

Sobra para chunks de documentação: ~123.000 tokens
```

### Quantos chunks cabem?

Se cada chunk tem ~500 tokens:

- 123.000 ÷ 500 = **~246 chunks** (máximo teórico)

### Mas CUIDADO — mais NÃO é melhor!

Aqui entra o conceito de **lost in the middle**:

> Quando o modelo recebe muita informação, ele presta mais atenção no início e no final do contexto, e "esquece" o que está no meio. É como ler um livro enorme — você lembra do começo e do fim, mas o meio fica nebuloso.

### Recomendação prática

Usar entre **5 e 10 chunks** por query (2.500–5.000 tokens). Isso porque:

- Menos chunks = modelo presta atenção em cada um com mais cuidado
- Chunks mais relevantes no início do contexto (onde o modelo presta mais atenção)
- Sobra espaço para instruções detalhadas sobre como usar a informação
- Reduz o risco de o modelo misturar informações de chunks conflitantes

---

## PONTO 4: Estratégia de chunking recomendada

**O que é "chunking"?** É cortar os documentos em pedaços menores que possam ser buscados individualmente. A forma como você corta afeta diretamente a qualidade das respostas.

### Recomendação: Chunking semântico por seção com overlap

| Aspecto                       | Decisão                                                           | Justificativa                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tamanho do chunk**          | 300–600 tokens                                                    | Grande o suficiente para ter contexto completo de uma regra, pequeno o bastante para ser específico                                                 |
| **Estratégia de divisão**     | Por seção/tópico do documento (não por número fixo de caracteres) | Os atendentes fazem perguntas sobre temas ("prazo de devolução", "frete para o Norte"), não sobre páginas. Cada chunk deve cobrir UM tema completo. |
| **Overlap (sobreposição)**    | ~50 tokens entre chunks adjacentes                                | Se uma regra começa no final de um chunk e termina no início do próximo, o overlap garante que não perdemos o contexto.                             |
| **Metadados no chunk**        | Incluir: nome do documento, versão, data, seção                   | Permite ao modelo citar a fonte e ao sistema filtrar por versão (resolver contradições PROC-042 v1 vs v2).                                          |
| **Tabelas**                   | Cada tabela vira um chunk único (mesmo que ultrapasse 600 tokens) | Tabelas cortadas no meio perdem sentido. Melhor um chunk maior que uma tabela partida.                                                              |
| **Documentos contraditórios** | Marcar com metadado de versão e data de vigência                  | O sistema de retrieval pode priorizar a versão mais recente ou retornar ambas com indicação.                                                        |

### Por que essa estratégia e não outra?

O atendente vai perguntar coisas como _"Qual o prazo de devolução?"_ — essa pergunta mapeia para uma SEÇÃO específica de um documento (seção 3.1 do POL-001). Se o chunking fosse por tamanho fixo (ex: a cada 500 caracteres), essa seção poderia ficar dividida entre 2 chunks, e o retrieval poderia trazer só metade da regra.

Considerando o efeito _lost in the middle_, os chunks mais relevantes devem ser posicionados no INÍCIO do contexto. Por isso, o sistema de retrieval deve ordenar por relevância decrescente.

---

## PONTO EXTRA: A Iteração (Revisão Crítica)

O exercício pede que você peça ao Claude para revisar sua análise. Aqui está o que uma boa revisão identificaria:

### Pontos fracos da análise que o Claude apontaria

1. **Estimativa otimista de OCR:** Assumimos que o Azure Document Intelligence resolve PDFs escaneados, mas a taxa de erro em documentos com carimbos, anotações manuscritas ou baixa resolução pode ser >5%.

2. **Não consideramos o custo:** Processar 6,3M tokens de embeddings tem custo. Com Azure OpenAI, o embedding custa ~$0.13/1M tokens, então a indexação inicial seria barata (~$0.82), mas re-indexação mensal e as queries diárias (320 chamados × 60% = 192 queries/dia) acumulam.

3. **Não consideramos latência:** Buscar 5-10 chunks + gerar resposta leva 2-5 segundos. Para um atendente ao telefone, isso é aceitável? Sim, comparado aos 12 minutos atuais, mas precisa testar.

4. **Planilhas com fórmulas interdependentes:** Se Planilha A referencia Planilha B, extrair isoladamente pode perder contexto. Precisa de mapeamento de dependências.

### Incorporação do feedback

Após a revisão, os seguintes ajustes seriam feitos na análise:

- Adicionar etapa de validação pós-OCR com amostragem de 10% dos documentos escaneados
- Incluir estimativa de custo operacional mensal (embeddings + queries)
- Definir SLA de latência do assistente (resposta em <5 segundos)
- Mapear dependências entre planilhas antes da ingestão

---

## Fluxo do Pipeline (Visão Geral)

```
Documentação bruta da NovaTech
        │
        ▼
┌─────────────────────────────────┐
│ Qual o formato?                 │
├─────────────────────────────────┤
│ PDF com tabela → Extrator de    │
│   tabelas → Markdown            │
│ PDF escaneado → OCR Azure →     │
│   Texto + Validação             │
│ Wiki Confluence → API → HTML    │
│   renderizado → Texto           │
│ Planilha → Exportar valores +   │
│   fórmulas → Markdown           │
└─────────────┬───────────────────┘
              ▼
   Chunking semântico por seção
              │
              ▼
   Embeddings → Azure AI Search
              │
              ▼
   Query do atendente
              │
              ▼
   Top 5-10 chunks recuperados
              │
              ▼
   LLM gera resposta com citação de fonte
```

---

## Meta-explicação: como esse exercício foi resolvido

1. **Li o cenário inteiro** para entender o problema de negócio (atendentes gastam 12 min buscando info)
2. **Identifiquei os tipos de dados** a partir das informações técnicas fornecidas
3. **Para cada tipo, pensei no "caminho" do documento:** formato original → extração → chunk → embedding → busca → resposta
4. **Fiz as contas de tokens** usando a regra de 0,75 palavras/token
5. **Apliquei os conceitos teóricos** (lost in the middle, orçamento de atenção) para justificar decisões práticas
6. **Simulei a revisão** pensando: "O que está otimista demais? O que faltou?"

### Ponto-chave

RAG não é mágica — a qualidade depende de cada etapa do pipeline, desde como você extrai o texto até quantos chunks você coloca no contexto.
