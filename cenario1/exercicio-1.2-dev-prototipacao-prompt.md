# Exercício 1.2 — Prototipação de Prompt com Engenharia de Contexto (Resolução)

**Papel:** Desenvolvedor  
**Cenário:** Assistente de IA para atendimento da NovaTech  
**Ferramenta utilizada:** Claude (chat) — usado como ambiente de teste do prompt

---

## O que o exercício pede (em linguagem simples)

Você precisa **escrever as "instruções" que a IA vai seguir** (o system prompt), **testar com perguntas reais**, **analisar onde falhou**, e **melhorar**. Além disso, precisa mapear o que é fixo vs. o que muda a cada pergunta.

---

## TAREFA 1: System Prompt v1

**O que é "system prompt"?** É o texto de instruções que a IA recebe ANTES de qualquer pergunta do usuário. Pense como o "manual do funcionário" — define quem ela é, o que pode e não pode fazer, e como deve responder.

**Por que não basta escrever "responda sobre a NovaTech"?** Porque a IA é genérica — sem instruções específicas, ela pode inventar informação, misturar dados de versões diferentes, ou responder de forma vaga. Quanto mais preciso o prompt, mais previsível o comportamento.

### System Prompt v1

```
## IDENTIDADE
Você é o Assistente de Atendimento da NovaTech, uma empresa de logística.
Seu papel é ajudar atendentes a encontrar informações na documentação oficial
da empresa para responder dúvidas de clientes.

## FONTES DE INFORMAÇÃO
Você SOMENTE deve usar as informações contidas nos trechos de documentação
fornecidos abaixo (marcados como [DOCUMENTO]). Esses trechos foram recuperados
automaticamente da base de conhecimento da NovaTech.

## REGRAS OBRIGATÓRIAS
1. SEMPRE cite a fonte ao final da resposta no formato: (Fonte: [nome do documento], [seção]).
2. NUNCA invente prazos, valores, percentuais ou procedimentos que não estejam
   explicitamente nos documentos fornecidos.
3. Se a informação solicitada NÃO está nos documentos fornecidos, responda:
   "Não encontrei essa informação na documentação disponível. Recomendo escalar
   para o supervisor ou consultar diretamente o setor responsável."
4. Responda em português formal, mas acessível. Evite jargão técnico.

## CONFLITO ENTRE FONTES
Se dois documentos fornecerem informações contraditórias:
- Priorize o documento com data de atualização mais recente.
- Informe ao atendente que existe divergência entre versões.
- Cite ambas as fontes para transparência.

## FORMATO DE RESPOSTA
- Responda de forma direta e objetiva.
- Use bullet points para listas.
- Limite a resposta ao que foi perguntado — não adicione informações extras
  não solicitadas.

## DOCUMENTAÇÃO RECUPERADA
{{CHUNKS_RECUPERADOS}}

## PERGUNTA DO ATENDENTE
{{PERGUNTA}}
```

### Por que organizei assim?

Cada seção tem um propósito:

- **Identidade**: diz à IA "quem ela é" — isso direciona o tom e o escopo
- **Fontes de informação**: a regra mais importante — restringe a IA a SOMENTE usar os chunks
- **Regras obrigatórias**: os 4 guardrails do Product Specialist, traduzidos em instruções diretas
- **Conflito entre fontes**: endereça o problema real da PROC-042 v1 vs v2
- **Formato**: garante respostas padronizadas
- **Documentação + Pergunta**: são os placeholders dinâmicos (muda a cada query)

---

## TAREFA 2: Mapeamento de Contexto Estático vs Dinâmico

**O que é isso?** Em cada pergunta que o atendente faz, partes do contexto são sempre iguais (estáticas) e partes mudam (dinâmicas). Saber isso é importante para calcular quanto "espaço" sobra para os chunks.

### Anatomia completa de uma query

```
┌─────────────────────────────────────────────────────┐
│  CONTEXTO COMPLETO ENVIADO AO LLM (por query)      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. SYSTEM PROMPT (ESTÁTICO)              ~400 tokens│
│     - Identidade                                    │
│     - Regras obrigatórias                           │
│     - Tratamento de conflitos                       │
│     - Formato de resposta                           │
│     → Muda raramente. Só quando o time             │
│       atualiza as regras de negócio.               │
│                                                     │
│  2. METADADOS DO CLIENTE (DINÂMICO)       ~50 tokens │
│     - Tier do cliente (Gold/Silver/Standard)        │
│     - Número do contrato                            │
│     → Muda a cada atendimento.                     │
│                                                     │
│  3. CHUNKS RECUPERADOS (DINÂMICO)     ~2.500 tokens │
│     - 5 chunks de ~500 tokens cada                  │
│     - Selecionados pelo Azure AI Search             │
│     → Muda a cada pergunta.                        │
│                                                     │
│  4. HISTÓRICO DA CONVERSA (DINÂMICO)  ~500-2.000 tokens│
│     - Últimas 2-3 trocas de mensagem               │
│     → Cresce durante a sessão no Teams.            │
│     → RISCO: se ficar muito grande, causa          │
│       context rot (IA "esquece" os chunks).        │
│                                                     │
│  5. PERGUNTA ATUAL (DINÂMICO)             ~50 tokens │
│     - A pergunta do atendente                       │
│     → Muda a cada interação.                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│  TOTAL ESTIMADO: ~3.500 - 5.000 tokens por query   │
│  JANELA DO GPT-4o: 128.000 tokens                  │
│  USO: ~3-4% da janela                               │
│  MARGEM: enorme — mas NÃO devemos usar tudo        │
│  (lembre do lost in the middle!)                    │
└─────────────────────────────────────────────────────┘
```

### Por que isso importa?

- Se o histórico crescer demais (ex: 15 perguntas seguidas no Teams), ele pode ultrapassar os chunks em tamanho — e a IA vai prestar mais atenção no histórico do que nos documentos. Isso é **context rot**.
- **Solução:** limitar o histórico a no máximo 3 turnos (~1.500 tokens) e descartar mensagens antigas.

### Tabela resumo

| Parte                 | Tipo                 | Tamanho estimado        | Quem controla                                |
| --------------------- | -------------------- | ----------------------- | -------------------------------------------- |
| System prompt         | Estático             | ~400 tokens             | Time de desenvolvimento (versionado no repo) |
| Metadados do cliente  | Dinâmico             | ~50 tokens              | Sistema de CRM (automático)                  |
| Chunks recuperados    | Dinâmico             | ~2.500 tokens (5 × 500) | Azure AI Search (automático)                 |
| Histórico de conversa | Dinâmico (crescente) | ~500-2.000 tokens       | Bot do Teams (precisa de cap)                |
| Pergunta atual        | Dinâmico             | ~50 tokens              | Atendente                                    |
| **TOTAL**             | —                    | **~3.500-5.000 tokens** | —                                            |

---

## TAREFA 3: Teste do prompt com 3 perguntas

Os chunks fornecidos pelo exercício:

- **Chunk A** (POL-001, seção 3.2): Devolução em 7 dias úteis, EXCETO cargas perigosas classes 1-6 da ANTT
- **Chunk B** (SLA-2024): SLAs Gold (2h/24h), Silver (4h/48h), Standard (8h/72h)
- **Chunk C** (PROC-042-v2, seção 2): Multiplicadores regionais — Sul 1.3, Sudeste 1.1, Norte 1.8, Nordeste 1.5, Centro-Oeste 1.4

---

### Pergunta 1: "Qual o prazo de devolução para carga perigosa?"

**Resposta esperada (correta):**

> Cargas perigosas (classes 1 a 6 da ANTT) **NÃO são elegíveis** para devolução pelo processo padrão. O cliente deve entrar em contato com o setor de Gestão de Riscos (ramal 4500) para tratamento individual. (Fonte: POL-001, seção 3.2)

**Por que essa é a resposta certa?** O Chunk A diz: mercadorias podem ser devolvidas em 7 dias, **EXCETO** cargas perigosas. A palavra "exceto" é crucial — significa que cargas perigosas estão FORA da regra. Se a IA responder "7 dias úteis", ela inverteu a regra (a exceção virou a regra).

**O que pode dar errado com o prompt v1?** A IA pode ler "devolvidas em até 7 dias úteis" e "exceto cargas perigosas" e montar a resposta focando na primeira parte. Isso porque o chunk junta a regra geral com a exceção — e modelos podem "pesar" mais a informação que aparece primeiro.

**Análise do guardrail:** Se a IA responder que PODE devolver carga perigosa, ela violou o guardrail 2 (inventou um prazo que não se aplica) e a resposta está factualmente errada — o que pode causar problemas legais reais para a NovaTech (cargas perigosas têm regulação da ANTT).

---

### Pergunta 2: "Meu cliente é Gold, qual o SLA de resolução?"

**Resposta esperada (correta):**

> Para clientes Gold, o SLA de resolução é:
>
> - Chamados gerais: até **24 horas úteis**
> - Incidentes críticos: até **4 horas**
>
> (Fonte: SLA-2024, seção 2)

**Por que essa é mais simples?** O Chunk B tem a informação direta, sem ambiguidade. É uma "consulta de tabela" — a IA só precisa extrair o valor correto.

**O que pode dar errado?** Pouco, neste caso. Mas se o atendente dissesse "Meu cliente é Gold, qual o SLA?" (sem especificar "resolução"), a IA poderia responder com resposta OU resolução. Um prompt bem escrito instruiria a IA a fornecer todas as opções quando a pergunta for ambígua.

**Nota:** O chunk B fornecido no exercício só contém "resolução em até 24h" — não menciona incidentes críticos. Se a IA adicionar informação sobre incidentes críticos que NÃO está no chunk, isso é **alucinação** (mesmo que a info seja verdadeira no documento original, ela não foi recuperada).

---

### Pergunta 3: "Quanto custa o frete para 600kg para Manaus?"

**Resposta esperada (correta):**

> Para cargas acima de 500kg com destino à região Norte (Manaus), os parâmetros disponíveis são:
>
> - **Fórmula:** Valor base × Multiplicador regional × Fator de peso
> - **Multiplicador regional (Norte):** 1.8
> - **Fator de peso (500-1.000kg):** 1.0
>
> O valor final depende da tarifa base vigente, que está na tabela mensal de fretes. Consulte a tabela atualizada para calcular o valor exato.
> (Fonte: PROC-042-v2, seção 2)

**O que pode dar errado?**

1. A IA pode **inventar um valor base** (ex: "R$ 500") que não está nos chunks — violando o guardrail 2
2. A IA pode trazer o multiplicador da v1 (1.6) em vez da v2 (1.8) se ambos os chunks forem recuperados
3. A IA pode não saber que Manaus = Norte (precisa de conhecimento geográfico básico)

**Análise:** O ponto 3 é interessante — o chunk diz "Região Norte: 1.8" mas não lista as cidades. A IA precisa usar conhecimento geral para saber que Manaus fica no Norte. Isso é **aceitável** (é geografia básica), mas se a pergunta fosse sobre uma cidade menor (ex: "Palmas"), o risco de erro geográfico aumenta.

---

## TAREFA 4: Análise Crítica Consolidada

| Pergunta           | Correta?              | Citou fonte? | Guardrails respeitados? | Problema identificado                                  |
| ------------------ | --------------------- | ------------ | ----------------------- | ------------------------------------------------------ |
| Carga perigosa     | RISCO ALTO de erro    | Depende      | Pode violar guardrail 2 | A IA pode inverter a exceção e dizer que PODE devolver |
| SLA Gold           | Provavelmente correta | Sim          | Sim                     | Pode faltar distinção entre chamados gerais e críticos |
| Frete 600kg Manaus | Parcialmente correta  | Sim          | Pode violar guardrail 2 | Pode inventar valor base que não está no chunk         |

### Padrões de falha identificados

1. **Inversão de exceção** — A IA lê a regra geral e a exceção juntas, e pode misturá-las
2. **Invenção de valores** — Quando a resposta exige um valor que não está no chunk, a IA pode inventar em vez de dizer "não tenho esse dado"
3. **Resposta incompleta** — A IA pode responder com apenas parte da informação quando há múltiplos cenários (geral vs crítico)

---

## TAREFA 5: System Prompt v2 (Iterado)

Com base nas falhas, aqui estão as melhorias aplicadas:

### System Prompt v2

```
## IDENTIDADE
Você é o Assistente de Atendimento da NovaTech, uma empresa de logística.
Seu papel é ajudar atendentes a encontrar informações na documentação oficial
da empresa para responder dúvidas de clientes.

## FONTES DE INFORMAÇÃO
Você SOMENTE deve usar as informações contidas nos trechos de documentação
fornecidos abaixo (marcados como [DOCUMENTO]). Esses trechos foram recuperados
automaticamente da base de conhecimento da NovaTech.

## REGRAS OBRIGATÓRIAS
1. SEMPRE cite a fonte ao final da resposta no formato: (Fonte: [nome do documento], [seção]).
2. NUNCA invente prazos, valores, percentuais ou procedimentos que não estejam
   explicitamente nos documentos fornecidos. Se o valor exato não está nos
   documentos (ex: tarifa base de frete), diga que o atendente precisa consultar
   a fonte indicada.
3. Se a informação solicitada NÃO está nos documentos fornecidos, responda:
   "Não encontrei essa informação na documentação disponível. Recomendo escalar
   para o supervisor ou consultar diretamente o setor responsável."
4. Responda em português formal, mas acessível. Evite jargão técnico.

## ATENÇÃO ESPECIAL: EXCEÇÕES E NEGATIVAS
Quando um documento listar EXCEÇÕES (palavras como "exceto", "não se aplica",
"não são elegíveis"), preste atenção redobrada:
- Se a pergunta é sobre algo que está na lista de EXCEÇÕES, a resposta é que
  aquele item NÃO segue a regra geral.
- Exemplo: se o documento diz "devolução em 7 dias, EXCETO cargas perigosas",
  e a pergunta é sobre carga perigosa, a resposta é que carga perigosa NÃO
  pode ser devolvida pelo processo padrão.
- Sempre indique o caminho alternativo quando o documento fornecer um (ex:
  "entre em contato com o setor X").

## CONFLITO ENTRE FONTES
Se dois documentos fornecerem informações contraditórias:
- Priorize o documento com versão mais recente (v2 sobre v1, data mais recente).
- Informe ao atendente que existe divergência entre versões.
- Cite ambas as fontes para transparência.

## PERGUNTAS AMBÍGUAS
Se a pergunta do atendente for ambígua ou puder ter múltiplas respostas
(ex: "qual o SLA?" sem especificar tipo de chamado), forneça TODAS as
opções relevantes encontradas nos documentos, organizadas claramente.

## VALORES CALCULADOS
Quando a resposta envolver cálculos (ex: valor de frete):
- Apresente a fórmula e os parâmetros encontrados nos documentos.
- NÃO calcule o valor final se algum parâmetro (ex: tarifa base) não estiver
  nos documentos fornecidos.
- Indique quais parâmetros o atendente precisa buscar separadamente.

## FORMATO DE RESPOSTA
- Responda de forma direta e objetiva.
- Use bullet points para listas.
- Limite a resposta ao que foi perguntado — não adicione informações extras
  não solicitadas.

## DOCUMENTAÇÃO RECUPERADA
{{CHUNKS_RECUPERADOS}}

## PERGUNTA DO ATENDENTE
{{PERGUNTA}}
```

### O que mudou da v1 para a v2 e por quê

| Seção adicionada/alterada      | Por que foi necessário                                                        | Qual falha resolve                                   |
| ------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| **ATENÇÃO ESPECIAL: EXCEÇÕES** | A IA invertia exceções (dizia que carga perigosa PODE ser devolvida)          | Pergunta 1: inversão de regra sobre cargas perigosas |
| **Guardrail 2 expandido**      | A IA podia inventar valores que não estavam no chunk (ex: tarifa base)        | Pergunta 3: invenção de valor de frete               |
| **PERGUNTAS AMBÍGUAS**         | A IA podia responder parcialmente quando a pergunta tinha múltiplas respostas | Pergunta 2: poderia omitir incidentes críticos       |
| **VALORES CALCULADOS**         | A IA tentava calcular valores finais sem ter todos os parâmetros              | Pergunta 3: cálculo de frete sem tarifa base         |

---

## Teste da v2 com as mesmas perguntas

### Pergunta 1 (v2): "Qual o prazo de devolução para carga perigosa?"

**Resposta esperada com prompt v2:**

> Cargas perigosas (classes 1 a 6 da ANTT) **não são elegíveis** para devolução pelo processo padrão. Para essas categorias, o cliente deve entrar em contato com o setor de **Gestão de Riscos** (ramal 4500) para tratamento individual. (Fonte: POL-001, seção 3.2)

**Melhoria:** A seção "ATENÇÃO ESPECIAL: EXCEÇÕES" instrui explicitamente a IA a não inverter exceções. O exemplo concreto no próprio prompt (que menciona carga perigosa) funciona como "vacina" contra esse erro específico.

### Pergunta 2 (v2): "Meu cliente é Gold, qual o SLA de resolução?"

**Resposta esperada com prompt v2:**

> Para clientes Gold, o SLA de resolução é:
>
> - **Chamados gerais:** até 24 horas úteis
> - **Incidentes críticos:** até 4 horas
>
> (Fonte: SLA-2024)

**Melhoria:** A seção "PERGUNTAS AMBÍGUAS" instrui a IA a fornecer todas as opções quando há múltiplos cenários. Porém, só pode responder sobre incidentes críticos se o chunk B contiver essa informação — caso contrário, deve se limitar ao que está disponível.

### Pergunta 3 (v2): "Quanto custa o frete para 600kg para Manaus?"

**Resposta esperada com prompt v2:**

> Para cargas acima de 500kg com destino à região Norte, os parâmetros disponíveis são:
>
> - **Fórmula:** Valor base × Multiplicador regional × Fator de peso
> - **Multiplicador regional (Norte):** 1.8
> - **Fator de peso (500-1.000kg):** 1.0
>
> ⚠️ Para o cálculo final, é necessário consultar a **tarifa base vigente** na tabela mensal de fretes, que não está disponível nos documentos recuperados.
> (Fonte: PROC-042-v2, seção 2)

**Melhoria:** A seção "VALORES CALCULADOS" impede que a IA invente a tarifa base. Ela diz explicitamente o que falta e onde buscar.

---

## Resumo do raciocínio (como pensei nisso)

```
1. Escrevi o prompt v1 traduzindo os 4 guardrails em instruções diretas

2. Testei mentalmente cada pergunta contra o prompt:
   "Se eu fosse uma IA seguindo essas instruções ao pé da letra,
    o que responderia?"

3. Identifiquei 3 padrões de falha:
   - Inversão de exceção (carga perigosa)
   - Invenção de valores (tarifa base)
   - Resposta incompleta (SLA sem distinguir tipos)

4. Para cada falha, adicionei uma seção ESPECÍFICA ao prompt v2
   (não genérica como "cuidado com exceções" — mas com exemplo concreto)

5. Verifiquei se o prompt v2 resolveria os problemas sem criar novos
```

---

## Conceitos-chave para iniciantes

### O que é "contexto estático"?

As instruções que não mudam entre perguntas. É como o regulamento de uma empresa — está sempre ali, igual para todos.

### O que é "contexto dinâmico"?

A informação que muda a cada pergunta: os trechos de documentação recuperados, os dados do cliente, o histórico da conversa.

### Por que separar os dois?

Porque o estático você controla (pode otimizar, versionar, testar), mas o dinâmico é imprevisível (depende da pergunta do atendente e do que o Azure AI Search retorna). Se algo der errado, saber onde está o problema (no prompt estático ou nos dados dinâmicos) é crucial para debugar.

### O que é "iterar" o prompt?

É o mesmo conceito de "iterar" código: escrever → testar → falhar → corrigir → testar de novo. Nenhum prompt nasce perfeito na primeira tentativa. A v1 é o rascunho; a v2 é refinada com base em falhas reais.

---

## Ponto-chave

O prompt não é texto jogado — é **código em linguagem natural**. Cada frase existe por um motivo, e a iteração (v1 → testar → falhar → v2) é como funciona na prática real de engenharia de prompts.
