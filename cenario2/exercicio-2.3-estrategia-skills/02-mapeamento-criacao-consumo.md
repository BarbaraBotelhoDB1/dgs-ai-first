# Exercício 2.3 — Mapeamento de Criação e Consumo de Skills

## Convenções

- Frequência: Alta (diária), Média (semanal), Baixa (pontual)
- Agentes considerados: GitHub Copilot, Claude (chat)

## Foundation

| Skill                    | Frase-ativação                                                                                | Quem cria              | Quem consome                                   | Frequência |
| ------------------------ | --------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- | ---------- |
| `typescript-conventions` | "Gerar código TypeScript de produção para NovaTech seguindo strict mode e contratos estáveis" | Tech Lead + Dev sênior | Devs, Tech Lead, Copilot                       | Alta       |
| `error-handling`         | "Aplicar padrão de erros, retries e logging estruturado no backend"                           | Tech Lead + QA         | Devs, QA, Copilot                              | Alta       |
| `project-structure`      | "Criar arquivos respeitando estrutura oficial de pastas e exports"                            | Tech Lead              | Devs, Product Specialist (spec links), Copilot | Alta       |

## Domain

| Skill                         | Frase-ativação                                                            | Quem cria                         | Quem consome                               | Frequência |
| ----------------------------- | ------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------ | ---------- |
| `azure-functions-endpoint`    | "Criar endpoint HTTP em Azure Functions v4 com validação e logs"          | Dev sênior + Tech Lead            | Devs, Copilot                              | Alta       |
| `azure-ai-search-integration` | "Integrar consulta vetorial no Azure AI Search com metadados de vigência" | Dev sênior                        | Devs, Tech Lead, Copilot                   | Média      |
| `react-components`            | "Gerar componentes React do painel com padrão visual e acessibilidade"    | Dev frontend + Product Specialist | Devs frontend, Product Specialist, Copilot | Média      |
| `testing-patterns`            | "Criar testes Vitest/msw com fixtures e assertions específicas"           | QA + Dev                          | QA, Devs, Copilot                          | Alta       |

## Artifact

| Skill                     | Frase-ativação                                                           | Quem cria                         | Quem consome                               | Frequência |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------ | ---------- |
| `create-rag-endpoint`     | "Gerar endpoint RAG completo (input -> embedding -> search -> answer)"   | Dev sênior + Tech Lead            | Devs, Copilot                              | Média      |
| `create-integration-test` | "Gerar teste de integração do endpoint com cenários de negócio NovaTech" | QA + Dev                          | QA, Devs, Copilot                          | Alta       |
| `create-react-card`       | "Gerar card de resposta para painel web com fonte e confiança"           | Dev frontend + Product Specialist | Devs frontend, Product Specialist, Copilot | Média      |

## Decisões de governança

- Skill Foundation pode ser alterada apenas por Tech Lead ou Dev sênior com review do Tech Lead.
- Skill Domain pode ser alterada por dono da camada + 1 aprovador técnico.
- Skill Artifact pode ser ajustada pelo time executor (Dev/QA/PS), desde que preserve dependências.
- Toda alteração relevante de comportamento deve registrar changelog no próprio SKILL.md.
