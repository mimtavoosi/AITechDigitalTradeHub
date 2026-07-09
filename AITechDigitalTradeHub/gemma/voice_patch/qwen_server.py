from __future__ import annotations

import copy
import json
import logging
import os
import re
import time
import uuid
from pathlib import Path

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from requests.adapters import HTTPAdapter

from fast_rag import FastAcademyRAG, TTLCache, compact_context, normalize_persian


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("gemma-rag")

app = FastAPI(title="AITech Gemma RAG", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1", "http://localhost"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

GEMMA_URL = os.getenv(
    "GEMMA_URL",
    "http://127.0.0.1:8000/v1/chat/completions",
)
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma4")
GEMMA_TIMEOUT_SECONDS = float(os.getenv("GEMMA_TIMEOUT_SECONDS", "90"))
MAX_ANSWER_TOKENS = int(os.getenv("MAX_ANSWER_TOKENS", "192"))

DB_CONN = os.getenv(
    "DB_CONN",
    (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=tcp:aitechac.com;"
        "DATABASE=aitechac_AITechDb;"
        "UID=aitechac_AITechDbUser;"
        "PWD=Dp23$s15o;"
        "Encrypt=no;"
    ),
)

ACADEMY = {
    "name": "آکادمی آی‌تک",
    "description": (
        "مجموعه‌ای فعال در آموزش، پژوهش و اجرای پروژه‌های واقعی "
        "در حوزه هوش مصنوعی و فناوری‌های نوین"
    ),
    "mission": "توانمندسازی نسل آینده در هوش مصنوعی و علم داده",
    "services": "هوش مصنوعی، علم داده، یادگیری ماشین و پروژه‌های تحقیقاتی",
    "address": "اصفهان، خیابان میر، حدفاصل چهارراه نظر و پل هوایی",
    "phones": "۰۳۱۳۶۶۷۱۵۹۰ و ۰۳۱۳۶۶۷۱۵۹۱",
    "instagram": "@aitech.institute",
    "email": "info@aitechac.com",
    "team": (
        "دکتر زینب کمالی، بنیان‌گذار و مدیرعامل؛ "
        "دکتر ساناز دالوندی، مدیر اجرایی؛ "
        "سروش نوری، مسئول بخش سلامت و هوش مصنوعی؛ "
        "مانیا یوسفی، مسئول سایت؛ "
        "الهام شریفی، مسئول حسابداری؛ "
        "مهندس مجتبی یوسفی، مسئول بخش دانش‌آموزی؛ "
        "مهندس ناصر عباسی، مدیر فنی"
    ),
}


def load_json_knowledge() -> tuple[dict, list[dict]]:
    paths = [Path(__file__).with_name("aitech_knowledge.json")]
    extra_paths = os.getenv("AITECH_KNOWLEDGE_JSON", "")
    paths.extend(Path(item.strip()) for item in extra_paths.split(";") if item.strip())
    documents = []
    canonical = {}
    for path in paths:
        try:
            with path.open("r", encoding="utf-8-sig") as handle:
                data = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Could not load knowledge JSON %s: %s", path, exc)
            continue
        documents.append({"source": str(path), "data": data})
        if path.name == "aitech_knowledge.json" and isinstance(data, dict):
            canonical = data
    return canonical, documents


JSON_KNOWLEDGE, KNOWLEDGE_DOCUMENTS = load_json_knowledge()
if JSON_KNOWLEDGE:
    contact = JSON_KNOWLEDGE.get("contact", {})
    team = JSON_KNOWLEDGE.get("team", [])
    ACADEMY = {
        "name": JSON_KNOWLEDGE.get("academy_name", "آکادمی آی‌تک"),
        "description": JSON_KNOWLEDGE.get("description", ""),
        "mission": JSON_KNOWLEDGE.get("mission", ""),
        "services": "، ".join(JSON_KNOWLEDGE.get("services", [])),
        "address": contact.get("address", ""),
        "phones": " و ".join(contact.get("phone", [])),
        "instagram": contact.get("instagram", ""),
        "email": contact.get("email", ""),
        "team": "؛ ".join(
            f"{member.get('name')}، {member.get('role')}"
            for member in team
        ),
    }


def retrieve_json_knowledge(question: str, limit: int = 5) -> list[dict]:
    terms = {
        word for word in normalize_persian(question).split()
        if len(word) >= 2
    }
    scored = []
    for document in KNOWLEDGE_DOCUMENTS:
        data = document["data"]
        items = data.items() if isinstance(data, dict) else enumerate(data)
        for key, value in items:
            text = json.dumps(value, ensure_ascii=False, default=str)
            normalized = normalize_persian(f"{key} {text}")
            score = sum(term in normalized for term in terms)
            if score:
                scored.append((
                    score,
                    {
                        "source": Path(document["source"]).name,
                        "section": str(key),
                        "value": value,
                    },
                ))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [item for _, item in scored[:limit]]

rag = FastAcademyRAG(
    DB_CONN,
    query_timeout=int(os.getenv("RAG_QUERY_TIMEOUT", "8")),
    connect_timeout=int(os.getenv("RAG_CONNECT_TIMEOUT", "5")),
    max_records=int(os.getenv("RAG_MAX_RECORDS", "6")),
    cache_ttl_seconds=int(os.getenv("RAG_CACHE_TTL", "300")),
)
answer_cache = TTLCache(
    ttl_seconds=int(os.getenv("ANSWER_CACHE_TTL", "600")),
    max_items=256,
)

http = requests.Session()
adapter = HTTPAdapter(pool_connections=8, pool_maxsize=8, max_retries=1)
http.mount("http://", adapter)
http.mount("https://", adapter)


class ChatRequest(BaseModel):
    messages: list[dict]
    stream: bool = False
    temperature: float = Field(default=0.2, ge=0, le=2)
    max_tokens: int | None = Field(default=None, ge=1, le=2048)


def last_user(messages: list[dict]) -> str:
    for message in reversed(messages):
        if message.get("role") == "user":
            return str(message.get("content", "")).strip()
    return ""


def user_message_count(messages: list[dict]) -> int:
    return sum(message.get("role") == "user" for message in messages)


def openai_response(
    text: str,
    request_id: str,
    rag_meta: dict | None = None,
) -> dict:
    response = {
        "id": f"chatcmpl-{request_id}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": GEMMA_MODEL,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": text},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
        },
    }
    if rag_meta is not None:
        response["rag_meta"] = rag_meta
    return response


def format_retrieval_answer(
    question: str,
    retrieval: dict,
) -> str | None:
    records = retrieval["records"]
    if not records:
        return "اطلاعات مرتبطی در پایگاه داده آی‌تک پیدا نشد."

    normalized = normalize_persian(question)
    intent = retrieval["intent"]
    if intent == "course":
        detail_words = {
            "سرفصل", "توضیح", "توضیحات", "پیش", "پیشنیاز", "مناسب",
            "یاد", "محتوا", "درباره",
        }
        if set(normalized.split()) & detail_words:
            return None
        unique = []
        seen = set()
        for record in records:
            title = str(record.get("course_title") or "").strip()
            if not title or title in seen:
                continue
            seen.add(title)
            details = [title]
            if any(word in normalized for word in ("شهریه", "هزینه", "قیمت")):
                fee = record.get("fee")
                if fee is not None:
                    details.append(f"مبلغ ثبت‌شده {int(fee):,}")
            if any(word in normalized for word in ("زمان", "ساعت", "روز", "برنامه")):
                day = record.get("day_of_week")
                start = record.get("start_time")
                end = record.get("end_time")
                start_date = record.get("start_date")
                schedule = " ".join(
                    str(item)
                    for item in (day, start, end, start_date)
                    if item
                )
                if schedule:
                    details.append(schedule)
            if "ظرفیت" in normalized and record.get("capacity") is not None:
                details.append(f"ظرفیت {record['capacity']} نفر")
            unique.append("، ".join(details))
            if len(unique) >= 5:
                break
        if unique:
            return "دوره‌های مرتبط آی‌تک: " + "؛ ".join(unique) + "."

    if intent == "teacher":
        unique = []
        seen = set()
        for record in records:
            name = " ".join(
                str(record.get(key) or "").strip()
                for key in ("first_name", "last_name")
            ).strip()
            course = str(record.get("course_title") or "").strip()
            if not name or (name, course) in seen:
                continue
            seen.add((name, course))
            unique.append(f"{name}" + (f"، مدرس {course}" if course else ""))
        if unique:
            return "مدرس‌های مرتبط: " + "؛ ".join(unique[:4]) + "."

    if intent == "event":
        record = records[0]
        title = record.get("title")
        event_date = record.get("event_date")
        return f"رویداد مرتبط: {title}" + (f"، تاریخ {event_date}." if event_date else ".")

    if intent == "news":
        record = records[0]
        title = record.get("title")
        publish_date = record.get("publish_date")
        return f"خبر مرتبط: {title}" + (f"، منتشرشده در {publish_date}." if publish_date else ".")

    return None


def direct_answer(question: str) -> str | None:
    normalized = normalize_persian(question)
    words = set(normalized.split())

    for member in JSON_KNOWLEDGE.get("team", []):
        name_parts = [
            part for part in normalize_persian(member.get("name", "")).split()
            if len(part) > 2 and part not in {"دکتر", "مهندس"}
        ]
        if name_parts and all(part in normalized for part in name_parts):
            return f"{member['name']}، {member['role']} آکادمی آی‌تک است."

    if normalized in {"سلام", "درود", "سلام خوبی", "خوبی", "حالت چطوره"}:
        return "سلام، ممنون. من دستیار آکادمی آی‌تک هستم؛ چطور می‌توانم کمکتان کنم؟"
    if words & {"ممنون", "مرسی", "متشکرم", "سپاس"} and len(words) <= 5:
        return "خواهش می‌کنم، خوشحال می‌شوم باز هم کمکتان کنم."
    if words & {"خداحافظ", "فعلا", "بدرود"} and len(words) <= 5:
        return "خداحافظ، روز خوبی داشته باشید."

    if words & {"آدرس", "نشانی", "کجا"}:
        return f"آدرس {ACADEMY['name']}: {ACADEMY['address']}."
    if words & {"تلفن", "شماره", "تماس"}:
        return (
            f"شماره‌های تماس آکادمی {ACADEMY['phones']} است. "
            f"ایمیل: {ACADEMY['email']}."
        )
    if "اینستاگرام" in words:
        return f"صفحه اینستاگرام آکادمی {ACADEMY['instagram']} است."
    if words & {"ایمیل", "رایانامه"}:
        return f"ایمیل آکادمی {ACADEMY['email']} است."
    if words & {"اعضا", "تیم", "مدیریت", "مدیرعامل"}:
        return f"اعضای تیم آکادمی: {ACADEMY['team']}."
    if words & {"ماموریت", "مأموریت", "هدف"}:
        return f"ماموریت آکادمی آی‌تک {ACADEMY['mission']} است."
    if words & {"خدمات", "فعالیت", "حوزه"}:
        return f"حوزه‌های فعالیت آکادمی شامل {ACADEMY['services']} است."
    introduction_phrases = {
        "آیتک چیست",
        "آی تک چیست",
        "آکادمی آیتک چیست",
        "آکادمی آی تک چیست",
    }
    if "معرفی" in words or normalized in introduction_phrases:
        return f"{ACADEMY['name']} {ACADEMY['description']} است."
    return None


def looks_academy_related(question: str) -> bool:
    normalized = normalize_persian(question)
    words = set(normalized.split())
    domain_words = {
        "آیتک", "آکادمی", "دوره", "کلاس", "گروه", "شهریه", "هزینه", "استاد",
        "مدرس", "رویداد", "خبر", "اخبار", "مقاله", "کتاب", "ثبت", "ظرفیت",
        "برنامه", "زمان", "ساعت",
    }
    return bool(words & domain_words)


def call_gemma(
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> dict:
    try:
        response = http.post(
            GEMMA_URL,
            json={
                "model": GEMMA_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False,
            },
            timeout=(3, GEMMA_TIMEOUT_SECONDS),
        )
        response.raise_for_status()
        payload = response.json()
        content = payload["choices"][0]["message"]["content"]
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Gemma returned an empty answer")
        return payload
    except (requests.RequestException, KeyError, IndexError, TypeError, ValueError) as exc:
        raise RuntimeError(f"Gemma request failed: {exc}") from exc


def build_messages(
    request_messages: list[dict],
    question: str,
    retrieval: dict | None,
    json_knowledge: list[dict],
) -> list[dict]:
    system = (
        "شما دستیار صوتی فارسی آکادمی آی‌تک هستید. "
        "پاسخ را روان، دقیق و کوتاه بنویسید؛ معمولاً حداکثر سه جمله. "
        "از نشانه‌گذاری پیچیده، جدول و Markdown استفاده نکنید چون پاسخ با TTS خوانده می‌شود. "
        "هیچ اطلاعاتی را حدس نزنید."
    )
    if retrieval is not None:
        context = compact_context(retrieval["records"])
        system += (
            "\nاطلاعات بازیابی‌شده زیر تنها منبع شما برای داده‌های آکادمی است. "
            "اگر پاسخ در آن نیست، صریح بگویید اطلاعات کافی پیدا نشد. "
            "نام دیتابیس، RAG، SQL، context یا فرایند داخلی را ذکر نکنید."
            f"\nمنبع بازیابی‌شده:\n{context}"
        )
    if json_knowledge:
        static_context = json.dumps(
            json_knowledge,
            ensure_ascii=False,
            default=str,
        )[:5000]
        system += (
            "\nاطلاعات JSON زیر نیز منبع معتبر آی‌تک است. "
            "فقط اطلاعات مرتبط با سؤال را استفاده کنید و چیزی حدس نزنید."
            f"\nمنبع JSON:\n{static_context}"
        )

    history = [
        {
            "role": message.get("role", "user"),
            "content": str(message.get("content", "")),
        }
        for message in request_messages[-4:]
        if message.get("role") in {"user", "assistant"}
    ]
    if not history or history[-1]["role"] != "user":
        history.append({"role": "user", "content": question})
    return [{"role": "system", "content": system}, *history]


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service_version": "gemma-rag-3",
        "source_dir": str(Path(__file__).resolve().parent),
        "model": GEMMA_MODEL,
        "gemma_url": GEMMA_URL,
        "rag": "fast-hybrid",
        "json_sources": len(KNOWLEDGE_DOCUMENTS),
    }


@app.post("/v1/chat/completions")
def chat(req: ChatRequest):
    request_id = uuid.uuid4().hex[:8]
    started_at = time.perf_counter()
    question = last_user(req.messages)
    if not question:
        raise HTTPException(status_code=400, detail="A user message is required")

    logger.info("[%s] question=%s", request_id, question)
    deterministic = direct_answer(question)
    if deterministic is not None:
        logger.info("[%s] route=direct elapsed_ms=%d", request_id, int(
            (time.perf_counter() - started_at) * 1000
        ))
        return openai_response(
            deterministic,
            request_id,
            {"route": "direct", "retrieval_ms": 0, "records": 0},
        )

    cache_key = normalize_persian(question)
    can_cache = user_message_count(req.messages) == 1
    if can_cache:
        cached = answer_cache.get(cache_key)
        if cached is not None:
            logger.info("[%s] route=answer-cache", request_id)
            return copy.deepcopy(cached)

    retrieval = None
    json_knowledge = retrieve_json_knowledge(question)
    if looks_academy_related(question):
        try:
            retrieval = rag.retrieve(question)
            logger.info(
                "[%s] route=rag intent=%s records=%d cache=%s retrieval_ms=%s",
                request_id,
                retrieval["intent"],
                len(retrieval["records"]),
                retrieval["cache_hit"],
                retrieval.get("retrieval_ms"),
            )
            retrieved_answer = format_retrieval_answer(question, retrieval)
            if retrieved_answer is not None:
                return openai_response(
                    retrieved_answer,
                    request_id,
                    {
                        "route": "rag-direct",
                        "intent": retrieval["intent"],
                        "retrieval_ms": retrieval.get("retrieval_ms", 0),
                        "cache_hit": retrieval["cache_hit"],
                        "records": len(retrieval["records"]),
                    },
                )
        except Exception as exc:
            logger.exception("[%s] RAG retrieval failed", request_id)
            raise HTTPException(
                status_code=502,
                detail=f"Academy information retrieval failed: {exc}",
            ) from exc
    else:
        logger.info("[%s] route=general-chat", request_id)

    try:
        payload = call_gemma(
            build_messages(
                req.messages,
                question,
                retrieval,
                json_knowledge,
            ),
            temperature=req.temperature,
            max_tokens=min(req.max_tokens or MAX_ANSWER_TOKENS, MAX_ANSWER_TOKENS),
        )
    except RuntimeError as exc:
        logger.exception("[%s] Gemma failed", request_id)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if can_cache:
        answer_cache.set(cache_key, copy.deepcopy(payload))
    logger.info(
        "[%s] completed_ms=%d",
        request_id,
        int((time.perf_counter() - started_at) * 1000),
    )
    return payload
