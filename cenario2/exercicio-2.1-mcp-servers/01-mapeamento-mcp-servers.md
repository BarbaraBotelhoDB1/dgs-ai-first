# Exercício 2.1 — Mapeamento de MCP Servers

# NovaTech Assistant — db1/novatech-assistant

> **Papel:** Desenvolvedor  
> **Ferramenta usada:** GitHub Copilot (substitui Claude chat conforme decisão do time)  
> **Data:** 2026-06-23

---

## O que é MCP e por que importa aqui

MCP (Model Context Protocol) é o protocolo que padroniza como agentes de IA (Copilot, Claude Code)
se conectam a ferramentas externas. Em vez de cada agente ter sua integração customizada com cada
serviço, o MCP cria uma camada uniforme:

```
[Agente de IA] ←→ [MCP Server] ←→ [Serviço Externo]
```

Um MCP Server expõe 3 tipos de capacidade:

- **Tools**: ações que o agente EXECUTA (escrever, criar, modificar)
- **Resources**: dados que o agente LÊ (read-only, consulta)
- **Prompts**: templates reutilizáveis que o agente pode invocar

A regra de ouro: **expor só o que é necessário, com a menor permissão possível.**

---

## Mapeamento dos 5 MCP Servers do Projeto

### Server 1 — GitHub (`db1/novatech-assistant`)

**Propósito:** Permite ao agente ler e interagir com o repositório do projeto.

| Tipo     | Nome                      | Descrição                                                   |
| -------- | ------------------------- | ----------------------------------------------------------- |
| Tool     | `create_pull_request`     | Agente cria PR após implementar uma task                    |
| Tool     | `list_files`              | Agente verifica estrutura antes de criar arquivo            |
| Tool     | `read_file`               | Agente lê código existente para gerar código coerente       |
| Tool     | `create_branch`           | Agente cria feature branch para nova task                   |
| Tool     | `add_comment`             | Agente adiciona comentário em PR durante review             |
| Resource | `repository_contents`     | Conteúdo atual de qualquer arquivo do repo                  |
| Resource | `pull_requests_open`      | PRs abertos — para contexto de o que está em andamento      |
| Prompt   | `pr_description_template` | Template para descrição de PRs seguindo o padrão do projeto |

**Permissões mínimas (least privilege):**

- Scope OAuth: `repo` (read/write apenas no repo `db1/novatech-assistant`)
- **NÃO** tem acesso a outros repos da organização db1
- **NÃO** tem permissão de delete branch ou force push

**Server existente ou customizado?**
✅ Existe server público: `@modelcontextprotocol/server-github`. Configurar apontando para `db1/novatech-assistant`.

---

### Server 2 — Azure AI Search

**Propósito:** Permite ao agente consultar e gerenciar o índice de documentos da NovaTech.

| Tipo     | Nome              | Descrição                                              |
| -------- | ----------------- | ------------------------------------------------------ |
| Tool     | `query_index`     | Agente faz busca semântica nos chunks indexados        |
| Tool     | `get_index_stats` | Agente verifica quantos documentos estão indexados     |
| Resource | `index_schema`    | Esquema do índice (campos, tipos, filtros disponíveis) |
| Resource | `sample_chunks`   | Amostra de chunks para testar qualidade de chunking    |

**Permissões mínimas (least privilege):**

- Role: `Search Index Data Reader` (leitura de índice apenas)
- **NÃO** tem role `Search Index Data Contributor` (não pode modificar índice)
- **NÃO** tem acesso de administração ao Azure AI Search

**Server existente ou customizado?**
⚠️ Não existe server público oficial para Azure AI Search. Precisa ser construído.
Alternativa pragmática: expor via Azure Function um endpoint HTTP que o MCP server HTTP genérico consome.

---

### Server 3 — Azure OpenAI

**Propósito:** Permite ao agente chamar o GPT-4o para geração de respostas e embeddings.

| Tipo     | Nome                     | Descrição                                                    |
| -------- | ------------------------ | ------------------------------------------------------------ |
| Tool     | `chat_completion`        | Agente envia prompt e recebe resposta do GPT-4o              |
| Tool     | `create_embedding`       | Agente converte texto em vetor para busca semântica          |
| Resource | `deployed_models`        | Lista de modelos deployados (gpt-4o, text-embedding-3-small) |
| Prompt   | `system_prompt_novatech` | System prompt versionado do assistente NovaTech              |

**Permissões mínimas (least privilege):**

- Role: `Cognitive Services OpenAI User`
- **NÃO** tem `Cognitive Services OpenAI Contributor` (não pode criar deployments)
- API Key com escopo restrito ao resource específico, não à subscription

**Server existente ou customizado?**
⚠️ Não existe server público oficial para Azure OpenAI. Necessário construir ou usar SDK wrapper.
Durante desenvolvimento, o agente usa o modelo via Copilot mesmo — este server é mais relevante
para pipelines de CI/CD e automações.

---

### Server 4 — Azure DevOps (boards e tracking)

**Propósito:** Permite ao agente ler e criar work items (tasks, bugs, user stories).

| Tipo     | Nome               | Descrição                                          |
| -------- | ------------------ | -------------------------------------------------- |
| Tool     | `create_work_item` | Agente cria task no board quando decompõe uma spec |
| Tool     | `update_work_item` | Agente atualiza status de uma task                 |
| Tool     | `list_work_items`  | Agente consulta tasks do sprint atual              |
| Resource | `current_sprint`   | Trabalho em andamento no sprint ativo              |
| Resource | `backlog`          | Backlog completo do projeto                        |

**Permissões mínimas (least privilege):**

- Scope: `vso.work_write` (leitura e escrita de work items)
- **NÃO** tem acesso ao pipeline de CI/CD
- **NÃO** tem permissão de administração do projeto

**Server existente ou customizado?**
✅ Existe server público: `@azure/azure-devops-mcp`. Configurar com o projeto `NovaTech`.

---

### Server 5 — Confluence NovaTech (read-only)

**Propósito:** Permite ao agente consultar a documentação de negócio da NovaTech (políticas, SLAs, procedimentos).

| Tipo     | Nome               | Descrição                                             |
| -------- | ------------------ | ----------------------------------------------------- |
| Resource | `page_content`     | Conteúdo de qualquer página do Confluence da NovaTech |
| Resource | `space_pages`      | Lista de páginas num espaço específico                |
| Resource | `page_attachments` | Anexos de uma página (PDFs de contratos, etc.)        |

**Não tem nenhuma Tool** — este server é estritamente read-only.

**Permissões mínimas (least privilege):**

- Acesso apenas ao espaço `NOVATECH` no Confluence
- **NÃO** tem acesso a outros espaços da DB1
- Role: `viewer` (leitura apenas, sem edição)
- Token de serviço dedicado (não token pessoal de desenvolvedor)

**Server existente ou customizado?**
✅ Existe server público: `@modelcontextprotocol/server-confluence`. Configurar com espaço restrito.

---

## Tabela Resumo — Quem Consome o Quê

| MCP Server      | Dev | Tech Lead | QA  | Product Specialist | Delivery Manager |
| --------------- | --- | --------- | --- | ------------------ | ---------------- |
| GitHub          | ✅  | ✅        | ✅  | ❌                 | ❌               |
| Azure AI Search | ✅  | ✅        | ✅  | ❌                 | ❌               |
| Azure OpenAI    | ✅  | ✅        | ❌  | ❌                 | ❌               |
| Azure DevOps    | ✅  | ✅        | ✅  | ✅                 | ✅               |
| Confluence      | ✅  | ✅        | ✅  | ✅                 | ✅               |

---

## Riscos de Segurança

Ver arquivo `03-analise-riscos-seguranca.md` para análise completa.

---

## Referências

- Estrutura do repositório: `Anexo C — Estrutura do Repositório`
- Convenção MCP do projeto: `.mcp.json` na raiz do repositório
- System prompt versionado: `/prompts/system-prompt.md`
