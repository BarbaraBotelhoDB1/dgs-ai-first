# SKILL: typescript-conventions

## Nível
Foundation

## Quando usar (frase-ativação)
Use esta skill quando precisar gerar ou refatorar qualquer código TypeScript no projeto NovaTech Assistant e precisar garantir aderência a padrões de produção.

## Contexto
Esta skill é base para todas as outras (`domain/*` e `artifact/*`).
Ela define convenções obrigatórias de tipagem, validação, estrutura de retorno e observabilidade.

## Regras prescritivas (MUST)

1. MUST usar TypeScript com `strict` e sem `any` explícito.
2. MUST validar entradas externas com schema (Zod) antes de processar lógica.
3. MUST retornar erro estruturado com `code`, `message` e `details` quando aplicável.
4. MUST usar logging estruturado (`pino`) em vez de `console.log`.
5. MUST manter funções pequenas e com responsabilidade única.
6. MUST tipar contratos de request/response em arquivo dedicado de schema/tipos.
7. MUST evitar side effects em helpers utilitários puros.

## Regras proibitivas (MUST NOT)

1. MUST NOT usar `as any` para contornar erros de tipagem.
2. MUST NOT usar import dinâmico CommonJS (`require`) em código TypeScript do backend.
3. MUST NOT usar assertions vagas como "deve funcionar" em validações internas.
4. MUST NOT lançar erros sem contexto observável (sem code e sem log).

## DO / DON'T com código

### DO

```ts
import { z } from "zod";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

const inputSchema = z.object({
  question: z.string().trim().min(1).max(2000),
});

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

function toApiError(code: string, message: string, details?: unknown): ApiError {
  return { code, message, details };
}

export function parseInput(payload: unknown) {
  const parsed = inputSchema.safeParse(payload);

  if (!parsed.success) {
    logger.info({ outcome: "validation_error", issues: parsed.error.issues });
    return { ok: false as const, error: toApiError("VALIDATION_ERROR", "Invalid payload", parsed.error.flatten()) };
  }

  return { ok: true as const, data: parsed.data };
}
```

### DON'T

```ts
// anti-pattern: sem validação, sem tipo estável, sem logging estruturado
export function parseInput(payload: any) {
  console.log("received", payload);

  if (!payload.question) {
    throw new Error("bad request");
  }

  return payload as any;
}
```

## Anti-padrões comuns gerados por IA

1. Uso de `as any` para fazer o código compilar rápido.
2. Uso de `console.log` no backend em vez de logger estruturado.
3. Função única grande misturando validação, regra de negócio e integração externa.
4. Erros genéricos (`throw new Error("failed")`) sem `code` de domínio.
5. Schemas incompletos que aceitam payload inválido por falta de constraints (`min`, `max`, `trim`).

## Dependências e leitura prévia

- AGENTS.md do projeto (regras globais)
- `/skills/foundation/project-structure`
- `/skills/foundation/error-handling`

## Checklist de saída (quick check)

- Não há `any` explícito.
- Input externo foi validado com Zod.
- Erros usam contrato estável.
- Logs são estruturados.
- Código não usa `require` dinâmico.
