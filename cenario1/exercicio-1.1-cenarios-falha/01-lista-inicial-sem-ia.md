#### Exercício 1.1 — Identificação de cenários de falha de IA
## Lista inicial de cenários de falha (sem IA)
> Entregável feito **antes** de consultar o Claude, conforme critério "demonstra pensamento independente".

<!-- Preencher com mínimo 4 cenários. Para cada um: pergunta de teste, comportamento esperado, comportamento indesejado, como verificar. -->
# item 1.
### Cenário 1: 
Interpretar a pergunta do usuário de forma errada.

A pergunta teste é:
"Qual é o prazo de devolução?"

Comportamento esperado:
A IA deve entender que existem múltiplos prazos relacionados ao processo de devolução e responder corretamente conforme o contexto do documento. Deve informar que:

O time tem 4 horas úteis para triagem;
A coleta reversa é agendada em até 2 dias úteis após aprovação;
O reembolso ocorre em até 5 dias úteis após recebimento da mercadoria devolvida.

Comportamento indesejado:
A IA não deve interpretar incorretamente a pergunta retornando apenas um dos prazos do fluxo, misturar SLA de atendimento com prazo de devolução ou inventar tempos que não existem na documentação;
Também deve evitar responder apenas um prazo isolado sem contexto.

Dado que o procedimento de devolução possui múltiplas etapas com prazos diferentes
E os prazos estão descritos na seção de Procedimento de devolução
Quando o usuário perguntar "Qual é o prazo de devolução?"
Então a IA deve contextualizar os diferentes prazos do processo
E a IA deve informar separadamente o prazo de triagem, coleta reversa e reembolso
E a IA não deve responder apenas um prazo isolado sem explicação
E a IA não deve misturar SLAs de atendimento com prazo de devolução

### Cenário 2: 
Demora execessiva ao dar respostas.

A pergunta teste é:
"Quais são os SLAs para clientes Gold?"

Comportamento esperado:
A IA deve responder rapidamente utilizando as informações da tabela SLA-2024, apresentando os tempos corretos de primeira resposta, resolução, incidentes críticos, disponibilidade do portal e demais benefícios do tier Gold.

A resposta deve ser objetiva, organizada e sem demora excessiva para recuperação de informações simples da documentação.

Comportamento indesejado:
A IA não deve gerar respostas extremamente longas sem necessidade, ficar repetindo informações da tabela, travar o fluxo do atendimento ou demonstrar dificuldade em localizar informações simples e estruturadas.

Dado que existe uma tabela estruturada de SLA no documento SLA-2024
E as informações do tier Gold estão claramente definidas
Quando o usuário perguntar "Quais são os SLAs para clientes Gold?"
Então a IA deve responder rapidamente com os dados corretos do tier Gold
E a IA deve apresentar as informações de forma objetiva e organizada
E a IA não deve repetir informações desnecessariamente
E a IA não deve demonstrar lentidão excessiva para recuperar informações simples

### Cenário 3: 
Experiência desse usuário com a IA.

Comportamento esperado:
A IA deve responder claramente que clientes Silver não possuem gerente de conta dedicado, utilizando linguagem objetiva e fácil de entender. A resposta deve transmitir confiança, clareza e consistência com o documento SLA-2024.

A experiência deve ser considerada boa quando:
A resposta estiver correta;
For clara;
Contextualizada;
E não gerar dúvidas adicionais desnecessárias.

Comportamento indesejado:
A IA não deve responder de forma ambígua, contraditória ou confusa. Também não deve inventar exceções, sugerir benefícios não documentados ou usar linguagem excessivamente técnica para uma pergunta simples.

Dado que a tabela SLA-2024 define quais tiers possuem gerente de conta dedicado
E apenas clientes Gold possuem esse benefício
Quando o usuário perguntar "Clientes Silver têm gerente de conta dedicado?"
Então a IA deve responder claramente que não
E a IA deve basear a resposta na tabela oficial de SLA
E a IA deve manter uma comunicação clara e objetiva
E a IA não deve inventar exceções ou benefícios adicionais
E a IA não deve gerar respostas ambíguas ou contraditórias

### Cenário 4: 
Quando a pergunta for sobre o seguro em cargas. 

A pergunta teste é ' Qual percentual do seguro aplicado em cargas? '

Comportamento esperado: A IA deve informar corretamente que são 0,3% para cargas padrão, 0,8% para cargas perigosas, que a fonte dessa informação está no arquivo FAQ Item 22, alertar quando contratos antigos variarem e que podem confirmar com o Comercial.

Comportamento indesejado: Não deve afirmar nada que não tenha nesse documento, inventar regras de cálculo ou misturar conceitos com outros itens da documentação.

 Dado que existe informação sobre seguro de carga apenas no FAQ Item 22
 E não existe documento formal POL ou PROC sobre seguro de carga
 Quando o usuário perguntar "Qual percentual do seguro aplicado em cargas?"
 Então a IA deve informar os percentuais descritos no FAQ
 E a IA deve informar que a informação foi encontrada apenas no FAQ
 E a IA não deve tratar a informação como política oficial formal
 E a IA não deve inventar percentuais adicionais ou regras inexistentes







