# 📝 Exemplos Práticos — Exercício 3.1 Funcionando

## Como o Validador Funciona — 6 Cenários Reais

---

## ✅ Cenário 1: Resposta Correta (Passa em Tudo)

**Entrada (do modelo de IA):**
```typescript
const respostaDoModelo = {
  answer: "O prazo de devolução para produtos standard é de 7 dias úteis após o recebimento.",
  source_document: "POL-001",
  confidence_score: 0.95
};
```

**Execução:**
```typescript
const resultado = validateAssistantResponse(respostaDoModelo);
```

**O que o código verifica:**
1. ✅ JSON tem 3 campos? Sim (answer, source_document, confidence_score)
2. ✅ Nenhum campo extra? Sim (`.strict()` passa)
3. ✅ Valores têm tipos corretos? Sim (string, string, number)
4. ✅ source_document não está vazio? Sim ("POL-001")
5. ✅ Menciona carga perigosa + devolução? NÃO → guardrail não se aplica
6. ✅ Documento "POL-001" existe? Sim (está em VALID_DOCUMENTS)

**Resultado:**
```typescript
{
  response: {
    answer: "O prazo de devolução para produtos standard...",
    source_document: "POL-001",
    confidence_score: 0.95
  },
  accepted: true  // ✅ APROVADO!
}
```

**O que é loggado:**
```
{
  "outcome": "response_accepted",
  "sourceDocument": "POL-001",
  "confidence": 0.95,
  "details": "Resposta passou em todas as validações e guardrails"
}
```

---

## ❌ Cenário 2: Resposta SEM source_document (Guardrail 1 Bloqueado)

**Entrada (do modelo):**
```typescript
const respostaDoModelo = {
  answer: "O prazo é 7 dias úteis.",
  source_document: "",  // VAZIO!
  confidence_score: 0.9
};
```

**O que o código verifica:**
1. ✅ JSON válido? Sim
2. ✅ Sem campos extras? Sim
3. ⚠️ source_document não está vazio? **NÃO!** `"".trim().length === 0` → TRUE

**Resultado:**
```typescript
{
  response: {
    answer: "Desculpe, não consegui gerar uma resposta confiável...",
    source_document: "SYSTEM",
    confidence_score: 0  // Resposta padrão segura
  },
  accepted: false,  // ❌ BLOQUEADO
  blockedBy: "SOURCE_DOCUMENT_REQUIRED"
}
```

**O que é loggado:**
```
{
  "outcome": "response_blocked",
  "reason": "missing_source_document",
  "details": "Resposta não citou nenhuma fonte de conhecimento (GUARDRAIL 1)"
}
```

**Por que é bloqueado?**
O guardrail 1 diz: "Toda resposta DEVE citar a fonte. Se não cita = REJEITADA."
Determinístico = sem exceções!

---

## ❌ Cenário 3: Carga Perigosa + Devolução SEM Negativa (Guardrail 2 Bloqueado)

**Entrada (do modelo):**
```typescript
const respostaDoModelo = {
  answer: "Sim, você pode devolver uma carga perigosa classe 3. Abra um chamado de devolução.",
  source_document: "POL-001",
  confidence_score: 0.88
};
```

**O que o código verifica:**
1. ✅ JSON válido? Sim
2. ✅ source_document preenchido? Sim ("POL-001")
3. ❌ Menciona carga perigosa? Sim ("carga perigosa classe 3")
4. ❌ Menciona devolução? Sim ("devolver")
5. ❌ Tem negação? **NÃO!** ("Sim, você pode devolver" = afirmação, não negação)

**Resultado:**
```typescript
{
  response: {
    answer: "Desculpe, não consegui gerar uma resposta confiável...",
    source_document: "SYSTEM",
    confidence_score: 0
  },
  accepted: false,  // ❌ BLOQUEADO
  blockedBy: "DANGEROUS_CARGO_RETURN_NEGATION_REQUIRED"
}
```

**O que é loggado:**
```
{
  "outcome": "response_blocked",
  "reason": "dangerous_cargo_return_without_negation",
  "answer": "Sim, você pode devolver uma carga perigosa classe 3...",
  "details": "Resposta menciona carga perigosa + devolução mas não nega a possibilidade (GUARDRAIL 2)"
}
```

**Por que é bloqueado?**
- A POL-001 diz: "Cargas perigosas NÃO podem ser devolvidas"
- O modelo tentou afirmar o oposto
- Código bloqueia ANTES da resposta chegar ao atendente
- Sem isto, atendente daria informação errada ao cliente!

---

## ✅ Cenário 4: Carga Perigosa + Devolução COM Negativa (Passa!)

**Entrada (do modelo):**
```typescript
const respostaDoModelo = {
  answer: "Não, cargas perigosas (classe 1 a 6) não podem ser devolvidas. Recomendo escalar para supervisor.",
  source_document: "POL-001",
  confidence_score: 0.93
};
```

**O que o código verifica:**
1. ✅ JSON válido? Sim
2. ✅ source_document preenchido? Sim
3. ✅ Menciona carga perigosa + devolução? Sim
4. ✅ Tem negação clara? **SIM!** ("Não... não podem ser devolvidas")
5. ✅ Documento "POL-001" existe? Sim

**Resultado:**
```typescript
{
  response: {
    answer: "Não, cargas perigosas (classe 1 a 6) não podem ser devolvidas...",
    source_document: "POL-001",
    confidence_score: 0.93
  },
  accepted: true  // ✅ APROVADO!
}
```

**Por que passa?**
- A resposta menciona carga perigosa + devolução (ativa o guardrail 2)
- Mas tem negação clara ("Não... não podem")
- O código confirma que está dizendo "NÃO é possível"
- Está de acordo com POL-001 = SEGURO!

---

## ❌ Cenário 5: Documento Inválido / Alucinado (Guardrail 3 Bloqueado)

**Entrada (do modelo):**
```typescript
const respostaDoModelo = {
  answer: "Segundo a documentação, você pode devolver em até 30 dias.",
  source_document: "POL-XYZ-FAKE",  // Documento que NÃO existe!
  confidence_score: 0.91
};
```

**O que o código verifica:**
1. ✅ JSON válido? Sim
2. ✅ source_document preenchido? Sim
3. ✅ Guardrail de carga perigosa? Não se aplica
4. ❌ Documento "POL-XYZ-FAKE" existe em VALID_DOCUMENTS? **NÃO!**

**VALID_DOCUMENTS contém:**
```
{"POL-001", "PROC-042", "PROC-042-v2", "SLA-2024", "FAQ-Atendimento"}
```

**Resultado:**
```typescript
{
  response: {
    answer: "Desculpe, não consegui gerar uma resposta confiável...",
    source_document: "SYSTEM",
    confidence_score: 0
  },
  accepted: false,  // ❌ BLOQUEADO
  blockedBy: "INVALID_SOURCE_DOCUMENT"
}
```

**O que é loggado:**
```
{
  "outcome": "response_blocked",
  "reason": "invalid_source_document",
  "sourceDocument": "POL-XYZ-FAKE",
  "validDocuments": ["POL-001", "PROC-042", "PROC-042-v2", "SLA-2024", "FAQ-Atendimento"],
  "details": "Documento citado \"POL-XYZ-FAKE\" não existe na base (alucinação?)"
}
```

**Por que é bloqueado?**
- Modelo ALUCIOU um documento que não existe
- Se deixasse passar, atendente diria "conforme POL-XYZ-FAKE" (não confiável!)
- Código detecta e bloqueia
- Garante que só documentos reais são citados

---

## ❌ Cenário 6: JSON Malformado / Schema Inválido (Validação Schema Bloqueada)

**Entrada (do modelo):**
```typescript
const respostaDoModelo = {
  answer: "Prazo é 7 dias",
  source_document: "POL-001",
  // FALTA: confidence_score!
};
```

Ou:

```typescript
const respostaDoModelo = {
  answer: "Prazo é 7 dias",
  source_document: "POL-001",
  confidence_score: "0.95"  // Errado! Deveria ser número, não string
};
```

**O que o código verifica:**
1. ❌ Zod tenta validar contra schema
2. ❌ Campo "confidence_score" falta OU tipo está errado
3. ❌ Falha na validação Zod

**Resultado:**
```typescript
{
  response: {
    answer: "Desculpe, não consegui gerar uma resposta confiável...",
    source_document: "SYSTEM",
    confidence_score: 0
  },
  accepted: false,  // ❌ BLOQUEADO
  blockedBy: "SCHEMA_VALIDATION"
}
```

**O que é loggado:**
```
{
  "outcome": "response_blocked",
  "reason": "schema_validation_failed",
  "details": "Resposta não segue formato JSON esperado. Erros: confidence_score is required",
  "issues": [
    { "code": "invalid_type", "expected": "number", "received": "undefined", "path": ["confidence_score"] }
  ]
}
```

---

## 🎓 Resumo — O Que Cada Cenário Ensina

| Cenário | Lição | Guardrail |
|---------|-------|-----------|
| 1 ✅ | Resposta perfeita passa | N/A |
| 2 ❌ | Deve citar fonte | Guardrail 1 |
| 3 ❌ | Carga perigosa + devolução = negação | Guardrail 2 |
| 4 ✅ | Se nega, passa | Guardrail 2 |
| 5 ❌ | Documento deve existir | Guardrail 3 |
| 6 ❌ | JSON deve ter formato certo | Schema Zod |

---

## 🔧 Como Integrar no Seu Código

**Seu endpoint que recebe resposta do modelo:**

```typescript
import { validateAssistantResponse } from './services/response-validator';

app.post('/api/query', async (req, res) => {
  try {
    const userQuestion = req.body.question;
    
    // 1. Chamar o modelo de IA
    const rawResponseFromModel = await callClaudeAPI(userQuestion);
    
    // 2. VALIDAR E GUARDRAIL (determinístico)
    const finalResponse = validateAssistantResponse(
      rawResponseFromModel,
      req.id  // requestId para logging
    );
    
    // 3. Retornar ao atendente
    res.json(finalResponse.response);
    
    // Se foi bloqueado, pode logar para auditoria
    if (!finalResponse.accepted) {
      console.log(`Response blocked: ${finalResponse.blockedBy}`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});
```

---

## 📊 Fluxo Visual Completo

```
┌─────────────────────────┐
│   Pergunta do Atendente │  "Posso devolver carga perigosa?"
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Modelo de IA (Claude, etc)         │
│  [PROBABILÍSTICO]                   │
│  - Gera resposta em texto livre      │
│  - Tenta seguir prompt instructions  │
│  - Mas pode falhar (12% de erro)     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Response Validator (response-validator.ts) │
│  [DETERMINÍSTICO]                    │
│  ┌─────────────────────────────────┐ │
│  │ 1. Zod Schema Validation        │ │
│  │    ✅ Estrutura JSON OK?        │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ 2. Guardrail 1: source_document │ │
│  │    ✅ Tem fonte citada?         │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ 3. Guardrail 2: Carga Perigosa  │ │
│  │    ✅ Se menciona, nega?        │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ 4. Guardrail 3: Doc Válido      │ │
│  │    ✅ Documento existe?         │ │
│  └─────────────────────────────────┘ │
└────────────┬────────────────────────┘
             │
             ▼
        ┌─────────────┐
        │  ACEITA?    │
        └─────┬───────┘
              │
        ┌─────┴─────┐
        │           │
    ✅ SIM       ❌ NÃO
        │           │
        ▼           ▼
   [Resposta]  [SAFE_FALLBACK]
   Original    "Desculpe, não
               consegui gerar..."
        │           │
        └─────┬─────┘
              │
              ▼
    ┌──────────────────────┐
    │ Retorna ao Atendente │
    └──────────────────────┘
```

---

## 💡 Dica Final para Iniciante

**Lembre-se:**
- 🤖 **Prompt** = pede bonitinho (probabilístico)
- 🔒 **Código** = força sem pedir (determinístico)
- 🎯 **Juntos** = segurança real

Sempre desconfie de respostas geradas por IA sem verificação de código!
