# Exercício 2.3 — Árvore de Skills do Projeto

## Objetivo

Definir uma estratégia de skills reutilizáveis para garantir consistência de geração de código e artefatos no projeto NovaTech Assistant.

## Hierarquia adotada (Foundation -> Domain -> Artifact)

```text
/skills
├── foundation
│   ├── typescript-conventions
│   ├── error-handling
│   └── project-structure
├── domain
│   ├── azure-functions-endpoint
│   ├── azure-ai-search-integration
│   ├── react-components
│   └── testing-patterns
└── artifact
    ├── create-rag-endpoint
    ├── create-integration-test
    └── create-react-card
```

## Justificativa de coerência com o projeto

- Foundation centraliza decisões duráveis da stack TypeScript/Azure Functions.
- Domain aplica padrão por camada técnica (API, busca, frontend, testes).
- Artifact encapsula receitas repetitivas de entrega (endpoint, teste, componente).

Essa separação evita repetir instruções em cada prompt e melhora a previsibilidade dos outputs do Copilot.
