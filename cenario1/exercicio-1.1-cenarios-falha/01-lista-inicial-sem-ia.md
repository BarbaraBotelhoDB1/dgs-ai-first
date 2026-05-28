#### Exercício 1.1 — Identificação de cenários de falha de IA (incluindo falhas de contexto)

**Contexto:** Você é o QA do projeto e precisa identificar cenários onde o assistente de IA pode falhar, considerando as características específicas de LLMs e os problemas que surgem quando o contexto é mal gerenciado.

**Ferramentas a utilizar:** Claude (chat)

**Inputs fornecidos:**

- O cenário completo.
- Os guardrails definidos pelo Product Specialist: _"(1) Sempre citar fonte. (2) Nunca inventar prazos ou valores. (3) Quando não encontrar resposta, dizer explicitamente. (4) Responder em português formal."_
- Uma explicação de alucinação: _"LLMs podem gerar respostas que parecem corretas e confiantes mas são fabricadas. Isso é especialmente perigoso quando o modelo 'preenche lacunas' misturando informação real com inferências não fundamentadas."_
- Uma explicação de problemas de contexto: _"Além da alucinação, existem falhas ligadas ao gerenciamento de contexto: context rot (em conversas longas, informação fornecida no início é 'esquecida'), lost in the middle (informação no meio de um contexto grande é menos processada que no início ou no fim), chunk errado (o retriever traz um trecho irrelevante ou de versão errada que contamina a resposta), e context overflow (a pergunta + chunks + prompt excedem a janela do modelo, causando truncamento)."_

**Tarefa:**

1. Crie sua própria lista inicial de cenários de falha (sem usar IA) com ao menos 4 cenários.

2. Em seguida, use o **Claude** para expandir a lista: forneça o cenário do projeto, os guardrails, e peça que identifique cenários de falha adicionais. O Claude deve gerar ao menos mais 4 cenários que você não pensou.

3. Consolide numa lista final de ao menos 10 cenários, organizados em categorias:
   - Alucinação (o assistente inventa informação) — ao menos 3 cenários.
   - Informação desatualizada ou contraditória — ao menos 2 cenários.
   - Falha de contexto (context rot, lost in the middle, chunk errado, overflow) — ao menos 3 cenários.
   - Recusa inadequada (diz que não sabe, mas a informação existe) — ao menos 1 cenário.
   - Falha de guardrail (responde em outro idioma, não cita fonte, etc) — ao menos 1 cenário.

4. Para cada cenário, defina: a pergunta de teste, o comportamento esperado, o comportamento indesejado, e como verificar.

**Entregável:** A lista inicial (feita sem IA), os cenários adicionais do Claude, e a lista final consolidada com evidência de qual cenário veio de qual fonte.

**Critérios de avaliação:**

- Os cenários são específicos ao domínio da NovaTech, não genéricos.
- A categoria "falha de contexto" demonstra compreensão de engenharia de contexto (ex: "quando o atendente faz 5 perguntas seguidas na mesma sessão do Teams, a resposta da 5ª pergunta ignora os chunks e repete informação do histórico" — isso é context rot).
- O participante gerou cenários próprios ANTES de usar o Claude (demonstra pensamento independente).
- A lista final integra contribuições humanas e de IA de forma coerente.
- Ao menos metade dos cenários inclui uma proposta de verificação automatizada.


## Lista inicial de cenários de falha (sem IA)
> Entregável feito **antes** de consultar o Claude, conforme critério "demonstra pensamento independente".

<!-- Preencher com mínimo 4 cenários. Para cada um: pergunta de teste, comportamento esperado, comportamento indesejado, como verificar. -->
# item 1.
Cenário 1: Interpretar a pergunta do usuário de forma errada.


Cenário 2: Demora execessiva ao dar respostas.


Cenário 3: Experiência desse usuário com a IA (boa, ruim ou mediana).


Cenário 4: Quando a pergunta for sobre o seguro em cargas. 
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







