from __future__ import annotations

import json
import os
import subprocess
import threading
import time
import urllib.error
import urllib.request
from collections import deque
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "ui"
DISTRO = "GemmaUbuntu"
MODEL_PATH = "/mnt/e/abbchb/gemma"
MODEL_URL = "http://127.0.0.1:8000"
RAG_URL = "http://127.0.0.1:8003"
VLLM = "$HOME/.venvs/gemma-vllm/bin/vllm"

app = FastAPI(title="Gemma Studio")
app.mount("/assets", StaticFiles(directory=STATIC), name="assets")

process: subprocess.Popen[str] | None = None
process_kind: str | None = None
rag_process: subprocess.Popen[str] | None = None
logs: deque[str] = deque(maxlen=500)
lock = threading.Lock()


class StartRequest(BaseModel):
    context_length: int = Field(default=8192, ge=1024, le=65536)
    gpu_memory: float = Field(default=0.92, ge=0.5, le=0.98)


class ChatRequest(BaseModel):
    messages: list[dict[str, Any]]
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=1024, ge=1, le=8192)
    use_rag: bool = True


def run_windows(command: list[str], timeout: float = 8) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )


def model_ready(timeout: float = 1.0) -> bool:
    try:
        with urllib.request.urlopen(f"{MODEL_URL}/health", timeout=timeout) as response:
            return response.status == 200
    except (urllib.error.URLError, TimeoutError):
        return False


def rag_ready(timeout: float = 1.0) -> bool:
    try:
        with urllib.request.urlopen(f"{RAG_URL}/health", timeout=timeout) as response:
            payload = json.load(response)
            return (
                response.status == 200
                and payload.get("service_version") == "gemma-rag-3"
            )
    except (urllib.error.URLError, TimeoutError, ValueError):
        return False


def vllm_installed() -> bool:
    try:
        result = run_windows(
            ["wsl", "-d", DISTRO, "--", "bash", "-lc", f'test -x "{VLLM}"']
        )
        return result.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def collect_output(active_process: subprocess.Popen[str]) -> None:
    if active_process.stdout is None:
        return
    for line in active_process.stdout:
        clean = line.rstrip()
        if clean:
            logs.append(clean)


def spawn(command: list[str], kind: str) -> None:
    global process, process_kind
    with lock:
        if process is not None and process.poll() is None:
            raise HTTPException(409, "یک عملیات دیگر در حال اجراست.")
        logs.clear()
        logs.append(f"Starting {kind}...")
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        process_kind = kind
        threading.Thread(target=collect_output, args=(process,), daemon=True).start()


def gpu_info() -> dict[str, Any]:
    try:
        result = run_windows(
            [
                "nvidia-smi",
                "--query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu",
                "--format=csv,noheader,nounits",
            ],
            timeout=4,
        )
        values = [item.strip() for item in result.stdout.strip().split(",")]
        if result.returncode == 0 and len(values) == 5:
            return {
                "name": values[0],
                "used": int(values[1]),
                "total": int(values[2]),
                "utilization": int(values[3]),
                "temperature": int(values[4]),
            }
    except (OSError, ValueError, subprocess.TimeoutExpired):
        pass
    return {}


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC / "index.html")


@app.get("/api/status")
def status() -> dict[str, Any]:
    active = process is not None and process.poll() is None
    return {
        "ready": model_ready(),
        "rag_ready": rag_ready(),
        "installed": vllm_installed(),
        "operation": process_kind if active else None,
        "gpu": gpu_info(),
    }


@app.post("/api/rag/start")
def start_rag() -> dict[str, str]:
    global rag_process
    if rag_ready():
        return {"message": "RAG is already ready."}
    rag_process = subprocess.Popen(
        [
            os.sys.executable,
            "-m",
            "uvicorn",
            "qwen_server:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8003",
        ],
        cwd=ROOT / "voice_patch",
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )
    threading.Thread(target=collect_output, args=(rag_process,), daemon=True).start()
    return {"message": "RAG startup started."}


@app.get("/api/logs")
def get_logs() -> dict[str, list[str]]:
    return {"lines": list(logs)}


@app.post("/api/setup")
def setup() -> dict[str, str]:
    if vllm_installed():
        return {"message": "vLLM از قبل نصب است."}
    spawn(
        [
            "wsl",
            "-d",
            DISTRO,
            "-u",
            "root",
            "--",
            "bash",
            "/mnt/e/abbchb/gemma/setup_vllm.sh",
        ],
        "setup",
    )
    return {"message": "نصب vLLM شروع شد."}


@app.post("/api/model/start")
def start_model(settings: StartRequest) -> dict[str, str]:
    if model_ready():
        return {"message": "مدل از قبل آماده است."}
    if not vllm_installed():
        raise HTTPException(412, "ابتدا vLLM را نصب کنید.")

    command = (
        f'exec "{VLLM}" serve "{MODEL_PATH}" '
        "--served-model-name gemma4 "
        "--tool-call-parser gemma4 "
        "--reasoning-parser gemma4 "
        "--enable-auto-tool-choice "
        "--trust-remote-code "
        f"--max-model-len {settings.context_length} "
        "--max-num-batched-tokens 4096 "
        f"--gpu-memory-utilization {settings.gpu_memory} "
        "--host 0.0.0.0 --port 8000"
    )
    spawn(["wsl", "-d", DISTRO, "--", "bash", "-lc", command], "model")
    return {"message": "بارگذاری مدل شروع شد."}


@app.post("/api/model/stop")
def stop_model() -> dict[str, str]:
    global process, process_kind
    run_windows(
        [
            "wsl",
            "-d",
            DISTRO,
            "--",
            "bash",
            "-lc",
            "pkill -INT -f '[v]llm.*serve.*abbchb/gemma' || true",
        ]
    )
    with lock:
        if process is not None and process.poll() is None:
            try:
                process.terminate()
                process.wait(timeout=5)
            except (OSError, subprocess.TimeoutExpired):
                process.kill()
        process = None
        process_kind = None
    logs.append("Model stopped.")
    return {"message": "مدل متوقف شد."}


def stream_chat(payload: dict[str, Any]):
    request = urllib.request.Request(
        f"{MODEL_URL}/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            for raw_line in response:
                line = raw_line.decode("utf-8", errors="replace").strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    yield "data: [DONE]\n\n"
                    return
                try:
                    event = json.loads(data)
                    delta = event["choices"][0]["delta"]
                    content = delta.get("content")
                    reasoning = delta.get("reasoning_content")
                    if content:
                        yield f"data: {json.dumps({'text': content}, ensure_ascii=False)}\n\n"
                    if reasoning:
                        yield f"data: {json.dumps({'reasoning': reasoning}, ensure_ascii=False)}\n\n"
                except (KeyError, json.JSONDecodeError):
                    continue
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        yield f"data: {json.dumps({'error': detail}, ensure_ascii=False)}\n\n"
    except (urllib.error.URLError, TimeoutError) as exc:
        yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"


def stream_rag_chat(payload: dict[str, Any]):
    request = urllib.request.Request(
        f"{RAG_URL}/v1/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    started_at = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            result = json.load(response)
        content = result["choices"][0]["message"]["content"]
        elapsed_ms = round((time.perf_counter() - started_at) * 1000)
        event = {
            "text": content,
            "rag": True,
            "elapsed_ms": elapsed_ms,
            "rag_meta": result.get("rag_meta", {}),
        }
        yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        yield f"data: {json.dumps({'error': detail}, ensure_ascii=False)}\n\n"
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError) as exc:
        yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"


@app.post("/api/chat")
def chat(request: ChatRequest) -> StreamingResponse:
    if not model_ready():
        raise HTTPException(503, "مدل هنوز آماده نیست.")
    if request.use_rag:
        if not rag_ready():
            raise HTTPException(503, "سرویس RAG روی پورت 8003 آماده نیست.")
        rag_payload = {
            "messages": request.messages,
            "temperature": min(request.temperature, 0.3),
            "max_tokens": min(request.max_tokens, 192),
            "stream": False,
        }
        return StreamingResponse(
            stream_rag_chat(rag_payload),
            media_type="text/event-stream",
        )
    payload = {
        "model": "gemma4",
        "messages": request.messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "stream": True,
    }
    return StreamingResponse(stream_chat(payload), media_type="text/event-stream")


@app.on_event("shutdown")
def shutdown() -> None:
    if process is not None and process.poll() is None and process_kind == "model":
        try:
            process.terminate()
        except OSError:
            pass
    if rag_process is not None and rag_process.poll() is None:
        try:
            rag_process.terminate()
        except OSError:
            pass
