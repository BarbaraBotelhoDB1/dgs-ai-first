# dgs-ai-first
AI FIRST DGS - Trilha de formação


Cenário 3 — Fase de Governança e Validação
Papel: Desenvolvedor | Tópico: Harness Engineering

Contexto
O assistente de IA da NovaTech estava retornando respostas em texto livre — sem garantia de que campos obrigatórios (fonte, confiança) viessem preenchidos. Em testes internos, 12% das respostas estavam incorretas (alucinação, documento desatualizado, chunk errado). O objetivo foi adicionar uma camada de governança determinística sobre as respostas do modelo.

O que foi feito
Exercício 3.1 — Structured Output e Verificações Determinísticas
1. Schema Zod (Structured Output)
O modelo de IA foi forçado a responder em JSON com formato fixo e validável:

O schema usa .strict() — rejeita qualquer campo extra, prevenindo dados inesperados.

2. Guardrail 1 — source_document obrigatório
Toda resposta sem fonte citada é rejeitada e substituída por mensagem padrão segura. Determinístico: sem exceções.

3. Guardrail 2 — Carga Perigosa + Devolução
Se a resposta menciona "carga perigosa" junto com "devolução", DEVE conter negativa explícita. Caso afirme que a devolução é possível, a resposta é bloqueada (protege a POL-001).

4. Guardrail 3 (Bonus) — Documento Válido
O source_document citado é verificado contra a lista de documentos reais da NovaTech. Detecta alucinações onde o modelo inventa um documento que não existe.

5. Code Review
Foram identificados 5 problemas reais no código gerado, incluindo regex insuficiente que não cobria variações de "carga perigosa" (explosivo, inflamável, tóxico). Correções aplicadas.
