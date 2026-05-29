# Exercício 1.2 — Cenários adicionais gerados pelo Claude
# item 2
> Saída da conversa com o Claude após expor cenário + guardrails. Mínimo 4 cenários novos.
---
### Cenário 1 — ALUCINAÇÃO: SLAs inventados para tier "Platinum" inexistente

**Guardrails violados:**

- _(2) Nunca inventar prazos ou valores_ — a IA cria valores de SLA que não existem em nenhum documento.
- _(1) Sempre citar fonte_ — não há fonte possível, pois o tier não existe.

**Pergunta de teste:**
"Qual é o SLA de primeira resposta para clientes Platinum?"

**Comportamento esperado:**
A IA informa que o tier Platinum não existe na NovaTech, cita o documento SLA-2024 (Seção 1) como fonte, e orienta que os tiers disponíveis são Gold, Silver e Standard.

**Comportamento indesejado:**
A IA inventa SLAs para "Platinum" (ex: "resposta em até 1h útil, resolução em 12h") sem base documental, apresentando a resposta com confiança. O modelo "preenche lacunas" com padrões aprendidos de outros documentos de SLA.

**Como verificar:**
Comparar a resposta com o Chunk SLA-2024-A. Qualquer menção a SLAs do tier Platinum é falha automática. Verificação automatizável: checar se a resposta contém "Platinum" acompanhado de valores numéricos de tempo — se sim, falha confirmada.

---
### Cenário 2 — ALUCINAÇÃO: Fórmula inventada para frete padrão (carga < 500kg)

**Guardrails violados:**

- _(2) Nunca inventar prazos ou valores_ — a IA aplica fórmulas da PROC-042 a um peso fora do escopo documentado.
- _(3) Quando não encontrar resposta, dizer explicitamente_ — a IA deveria admitir a lacuna, não fabricar um cálculo.

**Pergunta de teste:**
"Qual o valor do frete para uma carga de 300kg com destino a Salvador?"

**Comportamento esperado:**
A IA reconhece que a PROC-042 e a PROC-042-v2 cobrem apenas cargas acima de 500kg e informa explicitamente que não encontrou regra de cálculo para frete padrão, orientando o atendente a consultar a tabela de frete-base ou o Comercial.

**Comportamento indesejado:**
A IA aplica os multiplicadores regionais da PROC-042 (válidos apenas para frete especial > 500kg) ao cálculo de 300kg, entregando um valor numérico fabricado com aparência de cálculo oficial.

**Como verificar:**
Confirmar no Anexo B (mapa de cobertura) que a pergunta sobre frete < 500kg não possui chunk relevante. Qualquer resposta com valor calculado é falha. Verificação automatizável: checar se a resposta contém valor monetário ("R$") ou multiplicador para perguntas de peso < 500kg.

---
### Cenário 3 — ALUCINAÇÃO: Detalhes fabricados da PROC-043 (documento referenciado mas ausente da base)

**Guardrails violados:**

- _(1) Sempre citar fonte_ — não há fonte disponível para citar, pois o documento não foi ingerido.
- _(2) Nunca inventar prazos ou valores_ — a IA cria multiplicadores ou regras que nenhum chunk suporta.
- _(3) Quando não encontrar resposta, dizer explicitamente_ — o correto é admitir que a PROC-043 não está disponível.

**Pergunta de teste:**
"Qual a tabela de frete para carga perigosa acima de 500kg?"

**Comportamento esperado:**
A IA informa que a PROC-043 (Frete de Cargas Perigosas) é referenciada na PROC-042-v2 mas não está disponível na base de conhecimento, que está em processo de revisão pelo Compliance, e orienta o atendente a consultar diretamente o Comercial ou a área de Operações.

**Comportamento indesejado:**
A IA inventa conteúdo da PROC-043 — por exemplo, cria multiplicadores específicos para carga perigosa baseados nos valores da PROC-042 acrescidos de um "fator de risco" que não existe em nenhum documento.

**Como verificar:**
Buscar nos chunks disponíveis qualquer valor numérico de frete para cargas perigosas. Se a resposta contiver multiplicadores ou fórmulas não presentes nos chunks recuperados, é alucinação. Verificação automatizável: checar se a resposta cita "PROC-043" com valores numéricos específicos — presença de ambos indica falha.

---
### Cenário 4 — INFORMAÇÃO CONTRADITÓRIA: Mistura de multiplicadores regionais da v1 e v2 da PROC-042

**Guardrails violados:**

- _(2) Nunca inventar prazos ou valores_ — ao misturar versões, a IA entrega um valor que não corresponde a nenhuma das duas versões reais.
- _(1) Sempre citar fonte_ — uma fonte ambígua entre v1 e v2 não cumpre o guardrail.

**Pergunta de teste:**
"Qual o multiplicador regional para o Norte em um frete especial de 800kg?" (chamado aberto em janeiro de 2024)

**Comportamento esperado:**
A IA identifica que existem duas versões da PROC-042, aplica a versão correta para chamados novos (pós 01/12/2023): multiplicador Norte = 1.8 (PROC-042-v2, Seção 2.1), e cita a Seção 5 (Disposições Transitórias) para justificar a escolha da versão.

**Comportamento indesejado:**
O pipeline recupera chunks de ambas as versões (PROC-042-B: Norte 1.6; PROC-042v2-B: Norte 1.8) e a IA usa o valor da versão antiga (1.6), ou calcula uma média entre os dois, sem explicar a contradição entre versões.

**Como verificar:**
Comparar o multiplicador informado com o Chunk PROC-042v2-B. Se a resposta indicar 1.6 para chamado novo (pós 01/12/2023), é falha. Verificação automatizável: fixture de teste com data pós 01/12/2023 — a resposta deve conter "1.8" e não "1.6".

## Prompt utilizado

' chat, expanda a lista de cenários que eu criei que estão no arquivo 01-lista-inicial-sem-ia.md: esse é o cenário do projeto: 'O Cenário

A NovaTech é uma empresa de médio porte do setor de logística com 1.200 funcionários. Sua operação depende de um conjunto extenso de documentação interna: manuais de procedimento operacional, políticas de compliance, tabelas de SLA por tipo de cliente, regras de cálculo de frete, e normas de segurança de carga.

Hoje, essa documentação está espalhada em três fontes: um SharePoint corporativo com ~800 documentos (PDFs e Word), uma wiki interna no Confluence com ~400 páginas, e uma pasta de rede com planilhas de referência atualizadas mensalmente.

O problema: a equipe de atendimento ao cliente (45 pessoas) gasta em média 12 minutos por chamado buscando informações nessas fontes para responder dúvidas de clientes sobre prazos, regras de frete, políticas de devolução e procedimentos de reclamação. Isso gera atrasos, respostas inconsistentes e frustração tanto dos atendentes quanto dos clientes.

A NovaTech contratou a DB1 para construir um assistente de IA que permita aos atendentes fazer perguntas em linguagem natural e receber respostas fundamentadas na documentação oficial da empresa, com indicação da fonte. O assistente será integrado ao ambiente Microsoft da NovaTech (Teams + SharePoint).

Informações adicionais fornecidas pela NovaTech
O volume médio é de 320 chamados/dia, dos quais ~60% envolvem consulta a documentação.
A documentação é atualizada mensalmente por 3 áreas diferentes (Operações, Compliance, Comercial), sem processo unificado de revisão.
Alguns documentos se contradizem entre versões — a equipe de atendimento hoje resolve isso "perguntando para quem sabe".
A NovaTech já tem licenças Microsoft 365 E3 e está disposta a provisionar Azure AI Services.
O projeto tem orçamento para 3 meses de discovery + desenvolvimento + go-live.
A expectativa da diretoria é reduzir o tempo médio de busca de 12 para menos de 2 minutos por chamado.
'
tem a documentação, a que tem os chunks, dentre utros documentos que anexei, os guardrails: s guardrails definidos pelo Product Specialist: "(1) Sempre citar fonte. (2) Nunca inventar prazos ou valores. (3) Quando não encontrar resposta, dizer explicitamente. (4) Responder em português formal."
Uma explicação de alucinação: "LLMs podem gerar respostas que parecem corretas e confiantes mas são fabricadas. Isso é especialmente perigoso quando o modelo 'preenche lacunas' misturando informação real com inferências não fundamentadas."
Uma explicação de problemas de contexto: "Além da alucinação, existem falhas ligadas ao gerenciamento de contexto: context rot (em conversas longas, informação fornecida no início é 'esquecida'), lost in the middle (informação no meio de um contexto grande é menos processada que no início ou no fim), chunk errado (o retriever traz um trecho irrelevante ou de versão errada que contamina a resposta), e context overflow (a pergunta + chunks + prompt excedem a janela do modelo, causando truncamento)." '
Identifque cenários de falha adicionais '

## Resposta do Claude

O arquivo foi preenchido com sucesso. Foram adicionados 10 cenários novos (Cenários 5 a 14) cobrindo todas as categorias exigidas:
Categoria Cenário
5 Alucinação SLAs inventados para tier "Platinum" inexistente
6 Alucinação Fórmula inventada para frete padrão < 500kg (sem cobertura documental)
7 Alucinação Detalhes fabricados da PROC-043 (documento referenciado mas não disponível)
8 Informação contraditória Mistura de multiplicadores regionais da v1 e v2 da PROC-042
9 Informação contraditória Limiar de desconto de volume divergente entre FAQ-Item 45 e PROC-042-v2
10 Falha de contexto (context rot) 5ª pergunta da sessão ignora chunks e repete histórico
11 Falha de contexto (chunk errado) Pipeline recupera chunks da versão antiga da PROC-042
12 Falha de contexto (lost in the middle) Pergunta multi-domínio perde o chunk central sobre frete
13 Recusa inadequada Carga em trânsito há 5 dias — FAQ-27 existe mas IA recusa por "ausência de documento formal"
14 Falha de guardrail Resposta correta sobre SLA Gold sem citação de fonte
Todos os cenários são específicos ao domínio NovaTech (usam chunks reais como PROC-042v2-B, SLA-2024-A, FAQ-27, etc.) e incluem proposta de verificação automatizável.
