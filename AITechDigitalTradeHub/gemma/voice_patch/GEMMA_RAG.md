# Gemma + Fast RAG

The LLM service in this project now uses the local Gemma 4 server instead of
Qwen. The existing wrapper filename and endpoint remain unchanged so
`orchestrator.py` does not need a compatibility change.

## Architecture

```text
STT :8001
   |
   v
qwen_server.py :8003  ->  Gemma 4 / vLLM :8000
   |
   v
FastAcademyRAG -> SQL Server
   |
   v
TTS :8002
```

Despite its legacy filename, `qwen_server.py` is now a Gemma wrapper.

## Start

Start Gemma first:

```powershell
cd E:\abbchb\gemma
.\run_gemma.ps1
```

Then start the optimized RAG wrapper:

```powershell
cd D:\Voice_final_3\voice-assistant-main
.\venv\Scripts\python.exe -m uvicorn qwen_server:app --host 127.0.0.1 --port 8003
```

The orchestrator remains the same:

```powershell
.\venv\Scripts\python.exe orchestrator.py --conversation
```

## Performance Design

- Greetings, contact details, team information and other fixed academy facts
  are answered directly without an LLM or database request.
- Database questions use deterministic, parameterized retrieval instead of
  asking the model to generate SQL.
- Courses, groups, teachers, events, news, articles and books have dedicated
  retrieval routes.
- Unknown academy searches use one read-only cross-table search.
- Database retrieval and complete answers have short TTL caches.
- A normal RAG request calls Gemma only once.
- Responses are intentionally short and plain for TTS.

## Configuration

The following environment variables are supported:

```text
GEMMA_URL=http://127.0.0.1:8000/v1/chat/completions
GEMMA_MODEL=gemma4
GEMMA_TIMEOUT_SECONDS=90
MAX_ANSWER_TOKENS=320
DB_CONN=<ODBC connection string>
RAG_QUERY_TIMEOUT=8
RAG_CONNECT_TIMEOUT=5
RAG_MAX_RECORDS=12
RAG_CACHE_TTL=90
ANSWER_CACHE_TTL=120
```

## Tests

```powershell
.\venv\Scripts\python.exe -m unittest -v test_fast_rag.py
```

Health endpoint:

```text
http://127.0.0.1:8003/health
```
