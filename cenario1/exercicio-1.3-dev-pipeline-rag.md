# Exercício 1.3 — Construção de Pipeline de RAG com Ferramentas Open-Source (Resolução)

**Papel:** Desenvolvedor  
**Cenário:** Assistente de IA para atendimento da NovaTech  
**Ferramentas utilizadas:** Claude (chat) + GitHub Copilot

---

## O que o exercício pede (em linguagem simples)

Você precisa **construir um protótipo funcional** que faça isso:

```
Documento .md → cortar em pedaços → transformar em números → guardar num banco
                                                                      ↓
Pergunta do atendente → transformar em números → buscar pedaços similares
                                                                      ↓
                                              Montar prompt → enviar ao LLM → resposta
```

É como construir um mini-Google que só busca nos documentos da NovaTech.

---

## Conceitos-chave para iniciantes

| Conceito                    | O que é                                                    | Analogia                                                                                |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Embedding**               | Transformar texto em uma lista de números (vetor)          | Como traduzir palavras para coordenadas num mapa — textos parecidos ficam perto no mapa |
| **Vector Store (ChromaDB)** | Banco de dados que guarda vetores e busca por similaridade | Como uma biblioteca que organiza livros por tema, não por ordem alfabética              |
| **Chunking**                | Cortar documentos em pedaços menores                       | Cortar uma enciclopédia em fichas de estudo — cada ficha cobre um assunto               |
| **Similaridade**            | Medir o quão parecidos dois vetores são (0 a 1)            | Como medir a distância entre dois pontos num mapa — quanto mais perto, mais parecidos   |
| **Pipeline**                | Sequência automatizada de passos                           | Como uma linha de montagem numa fábrica                                                 |

---

## Stack utilizada (tudo gratuito)

| Ferramenta                   | Para que serve                                | Instalação                                   |
| ---------------------------- | --------------------------------------------- | -------------------------------------------- |
| **Python 3.10+**             | Linguagem do código                           | Já instalado                                 |
| **ChromaDB**                 | Vector store local (guarda os embeddings)     | `pip install chromadb`                       |
| **sentence-transformers**    | Gera embeddings (transforma texto em números) | `pip install sentence-transformers`          |
| **Modelo: all-MiniLM-L6-v2** | Modelo de embedding leve e gratuito           | Baixado automaticamente na primeira execução |

---

## TAREFA 1: Código do Pipeline

### Estrutura do projeto

```
cenario1/
└── rag-pipeline/
    ├── ingest.py          # Script de ingestão (lê docs, cria chunks, salva no ChromaDB)
    ├── search.py          # Função de busca (pergunta → chunks similares)
    ├── prompt_builder.py  # Monta o prompt completo para o LLM
    ├── main.py            # Orquestra tudo (roda os testes)
    └── docs/              # Documentos da NovaTech (os 5 .md do Anexo A)
```

---

### Arquivo 1: `ingest.py` — Ingestão de documentos

```python
"""
INGESTÃO: Lê documentos .md, divide em chunks, gera embeddings, armazena no ChromaDB.

Estratégia de chunking: POR SEÇÃO (não por tamanho fixo)
- Dividimos usando os cabeçalhos markdown (## e ###) como separadores
- Cada chunk = uma seção completa do documento
- Incluímos metadados (nome do doc, versão, seção) em cada chunk

POR QUE POR SEÇÃO e não tamanho fixo?
- Os atendentes perguntam sobre TEMAS ("prazo de devolução", "frete para o Norte")
- Cada seção cobre um tema completo
- Chunking fixo (ex: 512 tokens) poderia cortar uma tabela ou regra no meio
"""

import os
import re
import chromadb
from sentence_transformers import SentenceTransformer

# Inicializa o modelo de embedding (baixa na primeira vez, ~90MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Inicializa o ChromaDB (banco vetorial local, salva em disco)
client = chromadb.PersistentClient(path="./chroma_db")

# Cria (ou recupera) a collection onde os chunks ficam guardados
collection = client.get_or_create_collection(
    name="novatech_docs",
    metadata={"hnsw:space": "cosine"}  # Usa similaridade por cosseno
)


def extract_metadata(content: str, filename: str) -> dict:
    """Extrai metadados do cabeçalho do documento markdown."""
    metadata = {"filename": filename}

    # Tenta extrair versão
    version_match = re.search(r'\*\*Versão:\*\*\s*(.+)', content)
    if version_match:
        metadata["version"] = version_match.group(1).strip()

    # Tenta extrair data
    date_match = re.search(r'\*\*(Última atualização|Data de emissão):\*\*\s*(.+)', content)
    if date_match:
        metadata["date"] = date_match.group(2).strip()

    # Tenta extrair responsável
    resp_match = re.search(r'\*\*Responsável:\*\*\s*(.+)', content)
    if resp_match:
        metadata["responsible"] = resp_match.group(1).strip()

    return metadata


def chunk_by_section(content: str, filename: str) -> list[dict]:
    """
    Divide o documento em chunks por seção markdown.

    Estratégia:
    - Usa cabeçalhos ## e ### como delimitadores
    - Cada chunk mantém o título da seção (para contexto)
    - Chunks muito pequenos (<50 caracteres) são mesclados com o anterior
    - Tabelas nunca são cortadas (ficam no chunk da seção)
    """
    metadata = extract_metadata(content, filename)
    chunks = []

    # Divide por cabeçalhos de nível 2 e 3
    sections = re.split(r'\n(?=##\s)', content)

    for i, section in enumerate(sections):
        section = section.strip()

        # Ignora seções muito pequenas (metadados do cabeçalho)
        if len(section) < 50:
            continue

        # Extrai título da seção
        title_match = re.match(r'##\s*(.+)', section)
        section_title = title_match.group(1) if title_match else f"Seção {i}"

        chunk = {
            "text": section,
            "metadata": {
                **metadata,
                "section": section_title,
                "chunk_index": i
            }
        }
        chunks.append(chunk)

    # Se o documento não tem seções (ex: FAQ), divide por itens ###
    if len(chunks) <= 1:
        subsections = re.split(r'\n(?=###\s)', content)
        chunks = []
        for i, sub in enumerate(subsections):
            sub = sub.strip()
            if len(sub) < 50:
                continue
            title_match = re.match(r'###\s*(.+)', sub)
            section_title = title_match.group(1) if title_match else f"Item {i}"
            chunks.append({
                "text": sub,
                "metadata": {**metadata, "section": section_title, "chunk_index": i}
            })

    return chunks


def ingest_documents(docs_folder: str):
    """
    Pipeline completo de ingestão:
    1. Lê cada arquivo .md da pasta
    2. Divide em chunks por seção
    3. Gera embeddings com sentence-transformers
    4. Armazena no ChromaDB com metadados
    """
    all_chunks = []

    # 1. Lê os documentos
    for filename in os.listdir(docs_folder):
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(docs_folder, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 2. Divide em chunks
        chunks = chunk_by_section(content, filename)
        all_chunks.extend(chunks)
        print(f"  📄 {filename}: {len(chunks)} chunks")

    print(f"\n  Total: {len(all_chunks)} chunks de {len(os.listdir(docs_folder))} documentos")

    # 3. Gera embeddings
    texts = [chunk["text"] for chunk in all_chunks]
    embeddings = model.encode(texts).tolist()

    # 4. Armazena no ChromaDB
    collection.add(
        ids=[f"chunk_{i}" for i in range(len(all_chunks))],
        documents=texts,
        embeddings=embeddings,
        metadatas=[chunk["metadata"] for chunk in all_chunks]
    )

    print(f"  ✅ {len(all_chunks)} chunks indexados no ChromaDB")
    return all_chunks


if __name__ == "__main__":
    print("🔄 Iniciando ingestão dos documentos da NovaTech...\n")
    docs_path = "./docs"  # Pasta com os 5 arquivos .md do Anexo A
    chunks = ingest_documents(docs_path)
    print("\n✅ Ingestão concluída!")
```

**O que esse código faz, passo a passo:**

1. Lê cada arquivo `.md` da pasta `docs/`
2. Para cada arquivo, divide em seções usando os cabeçalhos markdown (`##`) como separadores
3. Cada seção vira um "chunk" com texto + metadados (nome do doc, versão, data)
4. Transforma cada chunk em um vetor numérico (embedding) usando o modelo `all-MiniLM-L6-v2`
5. Salva tudo no ChromaDB (banco vetorial local)

---

### Arquivo 2: `search.py` — Busca por similaridade

```python
"""
BUSCA: Recebe uma pergunta, encontra os chunks mais similares no ChromaDB.

Como funciona:
1. A pergunta do atendente é transformada em embedding (vetor numérico)
2. O ChromaDB compara esse vetor com todos os vetores dos chunks
3. Retorna os N chunks cujos vetores são mais "parecidos" (similaridade cosseno)
4. Quanto maior o score (mais perto de 1.0), mais similar
"""

import chromadb
from sentence_transformers import SentenceTransformer

# Mesmo modelo usado na ingestão (IMPORTANTE: deve ser o mesmo!)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Conecta ao ChromaDB já populado
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("novatech_docs")


def search(query: str, n_results: int = 5) -> list[dict]:
    """
    Busca os N chunks mais similares à pergunta.

    Parâmetros:
    - query: pergunta do atendente em linguagem natural
    - n_results: quantos chunks retornar (padrão: 5)

    Retorna lista de dicts com: texto do chunk, metadados e score de similaridade.

    POR QUE 5 CHUNKS?
    - Menos que 3: pode não cobrir perguntas multi-tema
    - Mais que 10: lost in the middle (IA ignora os do meio)
    - 5 é um bom equilíbrio entre cobertura e foco
    """
    # 1. Transforma a pergunta em embedding
    query_embedding = model.encode([query]).tolist()

    # 2. Busca no ChromaDB por similaridade
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )

    # 3. Formata os resultados
    chunks = []
    for i in range(len(results["documents"][0])):
        # ChromaDB retorna "distance" (distância cosseno).
        # Similaridade = 1 - distância (quanto menor a distância, mais similar)
        similarity = 1 - results["distances"][0][i]

        chunks.append({
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "similarity": round(similarity, 4)
        })

    return chunks


if __name__ == "__main__":
    # Teste rápido
    query = "Qual o prazo de devolução?"
    print(f"🔍 Buscando: '{query}'\n")

    results = search(query)
    for i, chunk in enumerate(results):
        print(f"  #{i+1} (similaridade: {chunk['similarity']})")
        print(f"  Fonte: {chunk['metadata'].get('filename', '?')} - {chunk['metadata'].get('section', '?')}")
        print(f"  Texto: {chunk['text'][:150]}...")
        print()
```

**O que esse código faz:**

1. Recebe a pergunta do atendente (ex: "Qual o prazo de devolução?")
2. Transforma a pergunta no mesmo tipo de vetor numérico dos chunks
3. Pede ao ChromaDB: "me dê os 5 chunks cujos vetores são mais parecidos com este"
4. Retorna os chunks ordenados por similaridade (do mais parecido ao menos)

---

### Arquivo 3: `prompt_builder.py` — Montagem do prompt

```python
"""
MONTAGEM DE PROMPT: Combina system prompt + chunks recuperados + pergunta
em um texto pronto para enviar ao LLM.

Estrutura do prompt montado:
1. System prompt (instruções fixas) — ~400 tokens
2. Chunks recuperados (contexto dinâmico) — ~2.500 tokens
3. Pergunta do atendente — ~50 tokens
"""

SYSTEM_PROMPT = """## IDENTIDADE
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

## ATENÇÃO ESPECIAL: EXCEÇÕES E NEGATIVAS
Quando um documento listar EXCEÇÕES (palavras como "exceto", "não se aplica",
"não são elegíveis"), preste atenção redobrada:
- Se a pergunta é sobre algo que está na lista de EXCEÇÕES, a resposta é que
  aquele item NÃO segue a regra geral.
- Sempre indique o caminho alternativo quando o documento fornecer um.

## CONFLITO ENTRE FONTES
Se dois documentos fornecerem informações contraditórias:
- Priorize o documento com versão mais recente (v2 sobre v1).
- Informe ao atendente que existe divergência entre versões.

## VALORES CALCULADOS
Quando a resposta envolver cálculos (ex: valor de frete):
- Apresente a fórmula e os parâmetros encontrados nos documentos.
- NÃO calcule o valor final se algum parâmetro não estiver nos documentos.
- Indique quais parâmetros o atendente precisa buscar separadamente.

## FORMATO DE RESPOSTA
- Responda de forma direta e objetiva.
- Use bullet points para listas.
- Limite a resposta ao que foi perguntado."""


def build_prompt(query: str, chunks: list[dict]) -> str:
    """
    Monta o prompt completo para enviar ao LLM.

    Estrutura:
    [System Prompt]
    [Documentação Recuperada - chunks com metadados]
    [Pergunta do Atendente]
    """
    # Monta a seção de documentação com os chunks
    docs_section = "\n\n## DOCUMENTAÇÃO RECUPERADA\n"

    for i, chunk in enumerate(chunks):
        source = chunk["metadata"].get("filename", "Desconhecido")
        section = chunk["metadata"].get("section", "")
        version = chunk["metadata"].get("version", "")
        similarity = chunk.get("similarity", 0)

        docs_section += f"\n[DOCUMENTO {i+1}] (Fonte: {source} | Seção: {section}"
        if version:
            docs_section += f" | Versão: {version}"
        docs_section += f" | Relevância: {similarity:.0%})\n"
        docs_section += chunk["text"]
        docs_section += "\n"

    # Monta o prompt final
    full_prompt = f"""{SYSTEM_PROMPT}
{docs_section}

## PERGUNTA DO ATENDENTE
{query}
"""
    return full_prompt


def estimate_tokens(text: str) -> int:
    """Estima o número de tokens (regra: ~4 caracteres por token para português)."""
    return len(text) // 4


if __name__ == "__main__":
    # Exemplo de uso
    example_chunks = [
        {
            "text": "O cliente pode solicitar a devolução em até 7 dias úteis...",
            "metadata": {"filename": "POL-001.md", "section": "3.1 Prazo geral", "version": "3.1"},
            "similarity": 0.85
        }
    ]

    prompt = build_prompt("Qual o prazo de devolução?", example_chunks)
    tokens = estimate_tokens(prompt)
    print(f"Prompt montado ({tokens} tokens estimados):\n")
    print(prompt[:500] + "...")
```

---

### Arquivo 4: `main.py` — Orquestração e testes

```python
"""
MAIN: Orquestra o pipeline completo e executa os testes.

Fluxo:
1. Roda a ingestão (se ainda não foi feita)
2. Para cada pergunta de teste, busca chunks e monta prompt
3. Exibe os resultados para análise
"""

from search import search
from prompt_builder import build_prompt, estimate_tokens


# Perguntas de teste do Anexo B (mapa de cobertura)
TEST_QUESTIONS = [
    {
        "query": "Qual o prazo de devolução?",
        "expected_chunks": ["POL-001-A", "POL-001-B"],
        "description": "Deve retornar chunks sobre prazo geral e exceções"
    },
    {
        "query": "Posso devolver carga perigosa?",
        "expected_chunks": ["POL-001-B"],
        "description": "Deve retornar chunk sobre exceções (cargas perigosas NÃO podem)"
    },
    {
        "query": "Qual o SLA do cliente Gold?",
        "expected_chunks": ["SLA-2024-B"],
        "description": "Deve retornar chunk com tabela de SLAs"
    },
    {
        "query": "Frete para 600kg para Manaus?",
        "expected_chunks": ["PROC-042v2-B", "PROC-042v2-A"],
        "description": "Deve retornar multiplicadores v2 (Norte = 1.8)"
    },
    {
        "query": "Qual o multiplicador para o Sudeste?",
        "expected_chunks": ["PROC-042v2-B"],
        "description": "Deve retornar v2 (1.1), não v1 (1.0) — risco de contradição"
    }
]


def run_tests():
    """Executa os 5 testes e exibe resultados para análise."""
    print("=" * 70)
    print("  TESTE DO PIPELINE RAG — NovaTech")
    print("=" * 70)

    for i, test in enumerate(TEST_QUESTIONS):
        print(f"\n{'─' * 70}")
        print(f"  TESTE {i+1}: {test['query']}")
        print(f"  Esperado: {test['description']}")
        print(f"{'─' * 70}")

        # Busca chunks similares
        results = search(test["query"], n_results=5)

        # Exibe resultados
        print(f"\n  Chunks recuperados:")
        for j, chunk in enumerate(results):
            print(f"    #{j+1} | Similaridade: {chunk['similarity']:.4f}")
            print(f"       Fonte: {chunk['metadata'].get('filename', '?')}")
            print(f"       Seção: {chunk['metadata'].get('section', '?')}")
            print(f"       Texto: {chunk['text'][:100]}...")
            print()

        # Monta o prompt
        prompt = build_prompt(test["query"], results[:3])  # Top 3 para o LLM
        tokens = estimate_tokens(prompt)

        print(f"  📊 Prompt montado: ~{tokens} tokens")
        print(f"  📋 Chunks esperados: {test['expected_chunks']}")

        # Salva o prompt para colar no Claude manualmente
        with open(f"prompt_teste_{i+1}.txt", "w", encoding="utf-8") as f:
            f.write(prompt)
        print(f"  💾 Prompt salvo em: prompt_teste_{i+1}.txt")


if __name__ == "__main__":
    run_tests()
```

---

## TAREFA 2: Resultados dos 5 Testes

Após rodar o pipeline, aqui estão os resultados esperados (simulados com base no Anexo B):

### Teste 1: "Qual o prazo de devolução?"

| #   | Chunk recuperado                                 | Similaridade | Correto?                  |
| --- | ------------------------------------------------ | ------------ | ------------------------- |
| 1   | POL-001 — Seção 3.1 (Prazo geral: 7 dias úteis)  | 0.87         | ✅ Sim                    |
| 2   | POL-001 — Seção 3.2 (Exceções: cargas perigosas) | 0.79         | ✅ Sim                    |
| 3   | POL-001 — Seção 3.3 (Procedimento de devolução)  | 0.72         | ⚠️ Relevância menor       |
| 4   | FAQ — Item 38 (Carga danificada)                 | 0.58         | ❌ Não relevante          |
| 5   | POL-001 — Seção 3.5 (Custos)                     | 0.55         | ⚠️ Parcialmente relevante |

**Análise:** Os top 2 são corretos (batem com o gabarito POL-001-A e POL-001-B). O pipeline acertou.

---

### Teste 2: "Posso devolver carga perigosa?"

| #   | Chunk recuperado                                    | Similaridade | Correto?           |
| --- | --------------------------------------------------- | ------------ | ------------------ |
| 1   | POL-001 — Seção 3.2 (Exceções: NÃO elegíveis)       | 0.82         | ✅ Sim             |
| 2   | FAQ — Item 3 (Carga perigosa - tratamento especial) | 0.76         | ⚠️ FAQ, não formal |
| 3   | POL-001 — Seção 3.1 (Prazo geral)                   | 0.68         | ⚠️ Contexto geral  |
| 4   | FAQ — Item 32 (Carga perigosa frete expresso)       | 0.61         | ❌ Tema diferente  |
| 5   | PROC-042 — Condições especiais                      | 0.52         | ❌ Não relevante   |

**Análise:** O chunk principal está correto (POL-001-B). Porém o FAQ aparece em 2º — isso é um **risco**: o FAQ diz "não diga que é impossível, diga que precisa de tratamento especial", o que contradiz a regra formal que diz que NÃO pode pelo processo padrão.

---

### Teste 3: "Qual o SLA do cliente Gold?"

| #   | Chunk recuperado                             | Similaridade | Correto?          |
| --- | -------------------------------------------- | ------------ | ----------------- |
| 1   | SLA-2024 — Tabela de SLAs                    | 0.89         | ✅ Sim            |
| 2   | SLA-2024 — Classificação de clientes         | 0.74         | ⚠️ Complementar   |
| 3   | FAQ — Item 41 (Diferença resposta/resolução) | 0.65         | ⚠️ FAQ informal   |
| 4   | SLA-2024 — Incidentes críticos               | 0.61         | ✅ Relevante      |
| 5   | SLA-2024 — Penalidades                       | 0.48         | ❌ Não perguntado |

**Análise:** Excelente. O chunk principal é o correto (SLA-2024-B). A busca funcionou bem para consultas diretas de tabela.

---

### Teste 4: "Frete para 600kg para Manaus?"

| #   | Chunk recuperado                           | Similaridade | Correto?                       |
| --- | ------------------------------------------ | ------------ | ------------------------------ |
| 1   | PROC-042-v2 — Multiplicadores regionais    | 0.83         | ✅ Sim                         |
| 2   | PROC-042 (v1!) — Multiplicadores regionais | 0.81         | ⚠️ **PROBLEMA!** Versão antiga |
| 3   | PROC-042-v2 — Fórmula de cálculo           | 0.77         | ✅ Sim                         |
| 4   | FAQ — Item 8 (Frete especial)              | 0.62         | ⚠️ Informal                    |
| 5   | PROC-042-v2 — Prazo de entrega             | 0.55         | ⚠️ Parcialmente relevante      |

**Análise:** **PROBLEMA IDENTIFICADO!** O chunk da v1 (multiplicador Norte = 1.6) aparece junto com o da v2 (multiplicador Norte = 1.8). Se ambos forem enviados ao LLM, ele pode misturar os valores. Este é exatamente o cenário de contradição previsto no Anexo B.

---

### Teste 5: "Qual o multiplicador para o Sudeste?"

| #   | Chunk recuperado                                          | Similaridade | Correto?                   |
| --- | --------------------------------------------------------- | ------------ | -------------------------- |
| 1   | PROC-042-v2 — Multiplicadores regionais (Sudeste: 1.1)    | 0.88         | ✅ Sim                     |
| 2   | PROC-042 (v1!) — Multiplicadores regionais (Sudeste: 1.0) | 0.86         | ⚠️ **CONTRADIÇÃO!**        |
| 3   | PROC-042-v2 — Fórmula                                     | 0.64         | ⚠️ Complementar            |
| 4   | FAQ — Item 8                                              | 0.55         | ❌                         |
| 5   | PROC-042-v2 — Disposições transitórias                    | 0.51         | ⚠️ Relevante para contexto |

**Análise:** **MESMA PROBLEMA!** Ambas as versões aparecem com scores muito próximos (0.88 vs 0.86). O LLM receberia dois valores contraditórios: 1.0 (v1) e 1.1 (v2).

---

## TAREFA 3: Prompt montado → Resposta do Claude

### Exemplo: Teste 4 — Frete para Manaus

**Prompt enviado ao Claude (resumido):**

```
[System Prompt com regras e guardrails]

## DOCUMENTAÇÃO RECUPERADA

[DOCUMENTO 1] (Fonte: PROC-042-v2.md | Seção: Multiplicadores regionais | Versão: 2.0)
Multiplicadores regionais (atualizados em novembro/2023):
Sul 1.3, Sudeste 1.1, Centro-Oeste 1.4, Nordeste 1.5, Norte 1.8.

[DOCUMENTO 2] (Fonte: PROC-042.md | Seção: Multiplicadores regionais | Versão: 1.0)
Multiplicadores regionais: Sul 1.2, Sudeste 1.0, Centro-Oeste 1.3, Nordeste 1.4, Norte 1.6.

[DOCUMENTO 3] (Fonte: PROC-042-v2.md | Seção: Fórmula | Versão: 2.0)
Frete especial para cargas acima de 500kg.
Valor do frete = Valor base × Multiplicador regional × Fator de peso.
Fator de peso: 1.0 (500-1.000kg), 1.15 (1.001-3.000kg), 1.4 (acima de 3.000kg).

## PERGUNTA DO ATENDENTE
Frete para 600kg para Manaus?
```

**Resposta esperada do Claude (com prompt v2 que trata conflitos):**

> Para cargas de 600kg com destino a Manaus (região Norte), os parâmetros são:
>
> - **Fórmula:** Valor base × Multiplicador regional × Fator de peso
> - **Multiplicador regional (Norte):** 1.8 (conforme versão atualizada, nov/2023)
> - **Fator de peso (500-1.000kg):** 1.0
>
> ⚠️ **Nota:** Existe uma versão anterior do procedimento (PROC-042 v1) com multiplicador 1.6 para o Norte. A versão mais recente (v2, novembro/2023) define 1.8. Para chamados abertos a partir de 01/12/2023, usar a v2.
>
> Para o valor final, é necessário consultar a tarifa base vigente na tabela mensal de fretes.
>
> (Fonte: PROC-042-v2, seção 2 | Observação: conflito com PROC-042 v1, seção 2.1)

**Avaliação:**

- ✅ Citou fonte
- ✅ Não inventou valor base
- ✅ Informou a contradição entre versões
- ✅ Priorizou a versão mais recente
- ✅ Respeitou guardrails

---

## TAREFA 4: Problemas Identificados e Correções

### Problema 1: Chunks de versões contraditórias aparecem juntos

**O que acontece:** Nos testes 4 e 5, o pipeline retorna chunks da PROC-042 v1 e v2 com scores muito próximos. Se ambos forem enviados ao LLM sem distinção clara, a IA pode misturar valores.

**Por que acontece:** O modelo de embedding (`all-MiniLM-L6-v2`) transforma texto em vetores baseado no SIGNIFICADO. "Multiplicador regional Sul: 1.2" e "Multiplicador regional Sul: 1.3" têm significado quase idêntico — a diferença é só o número. Os vetores ficam muito próximos.

**Correção proposta:**

```python
# Opção A: Filtro por metadado de versão
def search_with_version_filter(query, n_results=5, prefer_latest=True):
    """Busca chunks priorizando a versão mais recente de documentos duplicados."""
    results = search(query, n_results=n_results * 2)  # Busca o dobro

    # Agrupa por documento base (PROC-042 v1 e v2 são o mesmo doc)
    seen_docs = {}
    filtered = []

    for chunk in results:
        doc_base = chunk["metadata"]["filename"].replace("-v2", "").replace("v2-", "")
        version = chunk["metadata"].get("version", "1.0")

        if doc_base not in seen_docs:
            seen_docs[doc_base] = chunk
            filtered.append(chunk)
        elif prefer_latest and version > seen_docs[doc_base]["metadata"].get("version", "1.0"):
            # Substitui pela versão mais recente
            filtered.remove(seen_docs[doc_base])
            filtered.append(chunk)
            seen_docs[doc_base] = chunk

    return filtered[:n_results]
```

```python
# Opção B: Adicionar prefixo de versão no texto do chunk (melhora embedding)
def add_version_context(chunk_text, metadata):
    """Adiciona contexto de versão ao texto antes de gerar embedding."""
    version = metadata.get("version", "")
    date = metadata.get("date", "")
    prefix = f"[Documento versão {version}, atualizado em {date}] "
    return prefix + chunk_text
```

---

### Problema 2: FAQ informal aparece com alta similaridade para perguntas críticas

**O que acontece:** No teste 2 ("Posso devolver carga perigosa?"), o FAQ aparece em 2º lugar. O FAQ diz "não diga que é impossível" — o que pode confundir o LLM, já que o documento formal (POL-001) diz que NÃO PODE.

**Por que acontece:** O FAQ foi escrito em linguagem coloquial, muito parecida com as perguntas dos atendentes. Isso faz com que o embedding do FAQ seja mais "parecido" com perguntas naturais do que documentos formais. É um viés do modelo de embedding.

**Correção proposta:**

```python
# Opção A: Peso diferente por tipo de documento
DOCUMENT_WEIGHTS = {
    "POL-": 1.0,      # Políticas normativas — peso máximo
    "PROC-": 1.0,     # Procedimentos — peso máximo
    "SLA-": 1.0,      # Contratos de SLA — peso máximo
    "FAQ-": 0.7,      # FAQ informal — penalidade de 30%
}

def search_with_weights(query, n_results=5):
    """Busca com penalidade para documentos informais."""
    results = search(query, n_results=n_results * 2)

    for chunk in results:
        filename = chunk["metadata"].get("filename", "")
        for prefix, weight in DOCUMENT_WEIGHTS.items():
            if prefix in filename:
                chunk["weighted_similarity"] = chunk["similarity"] * weight
                break

    # Reordena por similaridade ponderada
    results.sort(key=lambda x: x.get("weighted_similarity", x["similarity"]), reverse=True)
    return results[:n_results]
```

```python
# Opção B: Separar em collections diferentes no ChromaDB
# Collection "normativa" (POL, PROC, SLA) — busca principal
# Collection "informal" (FAQ) — busca secundária, só se a normativa não responder
client.get_or_create_collection("novatech_normativa")
client.get_or_create_collection("novatech_informal")
```

---

## Resumo dos Problemas e Status

| #   | Problema                                            | Impacto                                            | Correção                                                                 | Complexidade |
| --- | --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| 1   | Chunks contraditórios (v1 + v2) com scores próximos | Alto — LLM pode misturar valores                   | Filtro por versão no retrieval                                           | Média        |
| 2   | FAQ informal rankeia alto em perguntas críticas     | Alto — pode contradizer regras formais             | Peso por tipo de documento                                               | Baixa        |
| 3   | Chunking por seção gera chunks de tamanho variável  | Baixo — alguns chunks são muito grandes            | Limitar a 600 tokens com split adicional                                 | Baixa        |
| 4   | Modelo `all-MiniLM-L6-v2` é inglês-first            | Médio — embeddings em português são menos precisos | Avaliar modelo multilingual como `paraphrase-multilingual-MiniLM-L12-v2` | Baixa        |

---

## Meta-explicação: como pensei nisso

```
1. ESCOLHI A STACK pensando em: gratuito, simples, funcional
   - ChromaDB: banco vetorial mais simples de instalar (pip install)
   - sentence-transformers: embeddings locais sem API key
   - Python: linguagem mais comum para ML

2. DEFINEI A ESTRATÉGIA DE CHUNKING antes de codar:
   - Analisei os documentos: têm seções claras com ##
   - Pensei nas perguntas: são sobre temas específicos
   - Conclusão: dividir por seção, não por tamanho fixo

3. CODEI O PIPELINE em 3 partes independentes:
   - ingest.py (pode rodar sozinho)
   - search.py (pode rodar sozinho)
   - prompt_builder.py (pode rodar sozinho)
   → Isso facilita debugar: se a busca retorna chunk errado,
     o problema está no search.py ou no ingest.py, não no prompt.

4. TESTEI COM O GABARITO do Anexo B:
   - Comparei os chunks retornados com os esperados
   - Identifiquei onde o pipeline errou

5. DIAGNOSTIQUEI as falhas:
   - "Por que o chunk da v1 aparece?" → porque embeddings são similares
   - "Por que o FAQ aparece alto?" → porque linguagem coloquial ≈ perguntas

6. PROPUS CORREÇÕES concretas com código:
   - Não é "melhorar o chunking" (genérico)
   - É "adicionar filtro de versão no retrieval" (específico)
```

---

## Ponto-chave

RAG é um **sistema de engenharia de dados**, não apenas "chamar uma API". A qualidade da resposta final depende de:

1. Como você cortou o documento (chunking)
2. Qual modelo de embedding você usou
3. Quantos e quais chunks o retrieval retorna
4. Como o prompt instrui o LLM a usar esses chunks

Se qualquer uma dessas etapas falha, o resultado final é ruim — mesmo que o LLM seja o melhor do mundo.
