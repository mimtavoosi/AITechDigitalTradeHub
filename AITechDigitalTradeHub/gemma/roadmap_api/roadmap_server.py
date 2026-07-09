"""AITech learning-roadmap API.

Receives the full course catalog plus the user's questionnaire answers from the
.NET backend, asks the local Gemma (vLLM, OpenAI-compatible) server for a
structured learning roadmap, validates the result against the catalog and
returns a frontend-friendly JSON graph.

Run:  uvicorn roadmap_server:app --host 0.0.0.0 --port 8181
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid

import requests
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from requests.adapters import HTTPAdapter

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("roadmap-api")

app = FastAPI(title="AITech Learning Roadmap API", version="1.0")

GEMMA_URL = os.getenv("GEMMA_URL", "http://127.0.0.1:8000/v1/chat/completions")
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma4")
GEMMA_TIMEOUT_SECONDS = float(os.getenv("GEMMA_TIMEOUT_SECONDS", "180"))
MAX_ROADMAP_TOKENS = int(os.getenv("MAX_ROADMAP_TOKENS", "3072"))
API_KEY = os.getenv("ROADMAP_API_KEY", "")

http = requests.Session()
adapter = HTTPAdapter(pool_connections=4, pool_maxsize=4, max_retries=1)
http.mount("http://", adapter)
http.mount("https://", adapter)


# --------------------------------------------------------------------------
# Request / response contract (camelCase to match the .NET backend)
# --------------------------------------------------------------------------

class ProfileAnswer(BaseModel):
    question: str = ""
    answer: str = ""


class UserProfile(BaseModel):
    answers: list[ProfileAnswer] = Field(default_factory=list)
    freeText: str = ""
    goal: str = ""
    level: str = ""
    weeklyHours: int = 0
    preferredMode: str = ""


class CatalogSection(BaseModel):
    title: str = ""
    objective: str = ""
    lessons: list[str] = Field(default_factory=list)


class CatalogCourse(BaseModel):
    id: int
    title: str
    category: str = ""
    level: str = ""
    deliveryMode: str = ""
    priceAmount: float = 0
    durationMinutes: int | None = None
    estimatedWeeks: int | None = None
    weeklyHoursMin: int | None = None
    weeklyHoursMax: int | None = None
    projectBased: bool = False
    requiresMentor: bool = False
    description: str = ""
    learningOutcomes: str = ""
    prerequisitesSummary: str = ""
    skills: list[str] = Field(default_factory=list)
    lessons: list[str] = Field(default_factory=list)
    sections: list[CatalogSection] = Field(default_factory=list)


class CatalogCategory(BaseModel):
    id: int
    name: str


class Catalog(BaseModel):
    categories: list[CatalogCategory] = Field(default_factory=list)
    courses: list[CatalogCourse] = Field(default_factory=list)


class RoadmapRequest(BaseModel):
    profile: UserProfile
    catalog: Catalog
    maxNodes: int = Field(default=7, ge=3, le=10)
    maxCoursesPerNode: int = Field(default=3, ge=1, le=5)


class NodeCourse(BaseModel):
    courseId: int
    reason: str = ""
    matchScore: int = Field(default=50, ge=0, le=100)


class RoadmapNode(BaseModel):
    id: str
    title: str
    description: str = ""
    order: int = 1
    dependsOn: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    estimatedWeeks: int = Field(default=2, ge=1, le=52)
    isOptional: bool = False
    courses: list[NodeCourse] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    roadmapTitle: str
    roadmapSummary: str = ""
    totalEstimatedWeeks: int = 0
    nodes: list[RoadmapNode] = Field(default_factory=list)
    tips: list[str] = Field(default_factory=list)
    model: str = GEMMA_MODEL
    elapsedMs: int = 0


# JSON schema handed to vLLM for guided (structured) generation.
ROADMAP_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "roadmapTitle": {"type": "string"},
        "roadmapSummary": {"type": "string"},
        "totalEstimatedWeeks": {"type": "integer"},
        "nodes": {
            "type": "array",
            "minItems": 3,
            "maxItems": 10,
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "order": {"type": "integer"},
                    "dependsOn": {"type": "array", "items": {"type": "string"}},
                    "skills": {"type": "array", "items": {"type": "string"}},
                    "estimatedWeeks": {"type": "integer"},
                    "isOptional": {"type": "boolean"},
                    "courses": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "courseId": {"type": "integer"},
                                "reason": {"type": "string"},
                                "matchScore": {"type": "integer"},
                            },
                            "required": ["courseId", "reason", "matchScore"],
                        },
                    },
                },
                "required": [
                    "id", "title", "description", "order",
                    "dependsOn", "skills", "estimatedWeeks",
                    "isOptional", "courses",
                ],
            },
        },
        "tips": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["roadmapTitle", "roadmapSummary", "totalEstimatedWeeks", "nodes", "tips"],
}


# --------------------------------------------------------------------------
# Prompt building
# --------------------------------------------------------------------------

def clip(text: str | None, limit: int) -> str:
    text = (text or "").strip()
    return text if len(text) <= limit else text[: limit - 1] + "…"


def compact_catalog(catalog: Catalog) -> str:
    """Serialize the catalog compactly so it fits comfortably in context."""
    courses = []
    for course in catalog.courses:
        # سرفصل‌های ساخت‌یافته (فصل + درس‌ها) در اولویت‌اند؛ درس‌های بدون سرفصل جداگانه می‌آیند.
        if course.sections:
            syllabus: list | dict = [
                {
                    "section": clip(section.title, 100),
                    "objective": clip(section.objective, 200),
                    "lessons": [clip(lesson, 90) for lesson in section.lessons[:15]],
                }
                for section in course.sections[:10]
            ]
            if course.lessons:
                syllabus.append({
                    "section": "سایر درس‌ها",
                    "objective": "",
                    "lessons": [clip(lesson, 90) for lesson in course.lessons[:10]],
                })
        else:
            syllabus = [clip(lesson, 90) for lesson in course.lessons[:25]]

        courses.append({
            "id": course.id,
            "title": clip(course.title, 120),
            "category": clip(course.category, 60),
            "level": course.level,
            "deliveryMode": course.deliveryMode,
            "free": course.priceAmount <= 0,
            "estimatedWeeks": course.estimatedWeeks,
            "weeklyHours": [course.weeklyHoursMin, course.weeklyHoursMax],
            "projectBased": course.projectBased,
            "requiresMentor": course.requiresMentor,
            "description": clip(course.description, 350),
            "learningOutcomes": clip(course.learningOutcomes, 250),
            "prerequisites": clip(course.prerequisitesSummary, 200),
            "skills": [clip(skill, 40) for skill in course.skills[:10]],
            "syllabus": syllabus,
        })
    payload = {
        "categories": [
            {"id": category.id, "name": clip(category.name, 60)}
            for category in catalog.categories
        ],
        "courses": courses,
    }
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def compact_profile(profile: UserProfile) -> str:
    lines = []
    for item in profile.answers:
        if item.question and item.answer:
            lines.append(f"- {clip(item.question, 200)}: {clip(item.answer, 300)}")
    if profile.goal:
        lines.append(f"- هدف اعلام‌شده: {clip(profile.goal, 300)}")
    if profile.level:
        lines.append(f"- سطح فعلی: {profile.level}")
    if profile.weeklyHours:
        lines.append(f"- زمان مطالعه در هفته: حدود {profile.weeklyHours} ساعت")
    if profile.preferredMode:
        lines.append(f"- شیوه یادگیری ترجیحی: {profile.preferredMode}")
    if profile.freeText:
        lines.append(f"- توضیحات خود کاربر: {clip(profile.freeText, 900)}")
    return "\n".join(lines) if lines else "- اطلاعاتی ثبت نشده است."


def build_messages(request: RoadmapRequest) -> list[dict]:
    system = (
        "شما مشاور آموزشی ارشد آکادمی آی‌تک هستید و در طراحی مسیر یادگیری هوش مصنوعی تخصص دارید. "
        "وظیفه شما ساخت یک نقشه راه یادگیری شخصی‌سازی‌شده بر اساس پاسخ‌های پرسشنامه کاربر و کاتالوگ دوره‌های آکادمی است.\n"
        "قواعد الزامی:\n"
        f"1. نقشه راه بین ۳ تا {request.maxNodes} مرحله (نود) داشته باشد و از مبانی به سمت هدف نهایی کاربر پیش برود. "
        "اگر سطح کاربر متوسط یا پیشرفته است، مراحل مقدماتی را حذف یا اختیاری کن.\n"
        "2. هر نود باید id یکتا مثل n1 و n2 داشته باشد؛ order ترتیب مرحله است (نودهای موازی order یکسان می‌گیرند) "
        "و dependsOn فقط id نودهای قبلی را شامل می‌شود.\n"
        f"3. برای هر نود حداکثر {request.maxCoursesPerNode} دوره از کاتالوگ پیشنهاد بده. courseId باید دقیقاً id یکی از "
        "دوره‌های کاتالوگ باشد؛ به هیچ عنوان id جعلی نساز. دوره را فقط وقتی به نودی وصل کن که سرفصل‌ها (syllabus) و "
        "خروجی‌های یادگیری آن دوره واقعاً با موضوع همان نود هم‌خوانی داشته باشد.\n"
        "4. برای هر دوره پیشنهادی، reason را به فارسی و با اشاره به سرفصل‌های مشخص آن دوره بنویس و matchScore بین ۰ تا ۱۰۰ بده.\n"
        "5. اگر برای نودی هیچ دوره مناسبی در کاتالوگ نبود، courses را خالی بگذار؛ دوره نامرتبط پیشنهاد نده.\n"
        "6. estimatedWeeks هر نود را با توجه به زمان هفتگی کاربر واقع‌بینانه تخمین بزن و totalEstimatedWeeks جمع مسیر اصلی باشد.\n"
        "7. skills هر نود نام مهارت‌هایی است که کاربر در آن مرحله یاد می‌گیرد.\n"
        "8. در tips حداکثر ۴ توصیه کوتاه و کاربردی متناسب با شرایط کاربر بنویس.\n"
        "9. همه متن‌ها فارسی روان باشند و خروجی فقط JSON معتبر مطابق ساختار خواسته‌شده باشد؛ هیچ متنی خارج از JSON ننویس."
    )
    user = (
        "کاتالوگ دوره‌های آکادمی (JSON):\n"
        f"{compact_catalog(request.catalog)}\n\n"
        "اطلاعات و پاسخ‌های کاربر:\n"
        f"{compact_profile(request.profile)}\n\n"
        "حالا نقشه راه یادگیری این کاربر را در قالب JSON خواسته‌شده بساز."
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


# --------------------------------------------------------------------------
# Gemma call + output validation
# --------------------------------------------------------------------------

def call_gemma(messages: list[dict], use_schema: bool) -> str:
    body: dict = {
        "model": GEMMA_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": MAX_ROADMAP_TOKENS,
        "stream": False,
    }
    if use_schema:
        body["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": "learning_roadmap",
                "strict": True,
                "schema": ROADMAP_JSON_SCHEMA,
            },
        }
    response = http.post(GEMMA_URL, json=body, timeout=(5, GEMMA_TIMEOUT_SECONDS))
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    if not isinstance(content, str) or not content.strip():
        raise ValueError("Gemma returned an empty answer")
    return content


def extract_json(text: str) -> dict:
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("No JSON object in model output")
    return json.loads(text[start:end + 1])


def sanitize(raw: dict, request: RoadmapRequest) -> RoadmapResponse:
    """Validate the model output against the catalog and normalize it."""
    valid_ids = {course.id for course in request.catalog.courses}
    roadmap = RoadmapResponse(
        roadmapTitle=str(raw.get("roadmapTitle") or "مسیر یادگیری پیشنهادی"),
        roadmapSummary=str(raw.get("roadmapSummary") or ""),
        totalEstimatedWeeks=int(raw.get("totalEstimatedWeeks") or 0),
        tips=[str(tip) for tip in (raw.get("tips") or [])[:4] if str(tip).strip()],
    )

    seen_ids: set[str] = set()
    nodes: list[RoadmapNode] = []
    for index, item in enumerate(raw.get("nodes") or []):
        if not isinstance(item, dict):
            continue
        node_id = str(item.get("id") or f"n{index + 1}").strip() or f"n{index + 1}"
        if node_id in seen_ids:
            node_id = f"{node_id}-{index + 1}"
        seen_ids.add(node_id)

        courses: list[NodeCourse] = []
        used_course_ids: set[int] = set()
        for course_item in (item.get("courses") or [])[: request.maxCoursesPerNode * 2]:
            if not isinstance(course_item, dict):
                continue
            try:
                course_id = int(course_item.get("courseId"))
            except (TypeError, ValueError):
                continue
            if course_id not in valid_ids or course_id in used_course_ids:
                continue
            used_course_ids.add(course_id)
            score = course_item.get("matchScore")
            try:
                score = max(0, min(100, int(score)))
            except (TypeError, ValueError):
                score = 50
            courses.append(NodeCourse(
                courseId=course_id,
                reason=clip(str(course_item.get("reason") or ""), 400),
                matchScore=score,
            ))
            if len(courses) >= request.maxCoursesPerNode:
                break

        try:
            order = max(1, int(item.get("order")))
        except (TypeError, ValueError):
            order = index + 1
        try:
            weeks = max(1, min(52, int(item.get("estimatedWeeks"))))
        except (TypeError, ValueError):
            weeks = 2

        nodes.append(RoadmapNode(
            id=node_id,
            title=clip(str(item.get("title") or f"مرحله {index + 1}"), 140),
            description=clip(str(item.get("description") or ""), 600),
            order=order,
            dependsOn=[str(dep) for dep in (item.get("dependsOn") or [])],
            skills=[clip(str(skill), 60) for skill in (item.get("skills") or [])[:8] if str(skill).strip()],
            estimatedWeeks=weeks,
            isOptional=bool(item.get("isOptional")),
            courses=courses,
        ))
        if len(nodes) >= request.maxNodes:
            break

    node_ids = {node.id for node in nodes}
    for node in nodes:
        node.dependsOn = [dep for dep in node.dependsOn if dep in node_ids and dep != node.id]
    nodes.sort(key=lambda node: node.order)

    if len(nodes) < 2:
        raise ValueError("Model produced fewer than 2 usable roadmap nodes")

    if roadmap.totalEstimatedWeeks <= 0:
        roadmap.totalEstimatedWeeks = sum(
            node.estimatedWeeks for node in nodes if not node.isOptional
        )
    roadmap.nodes = nodes
    return roadmap


# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------

@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "aitech-roadmap-api",
        "model": GEMMA_MODEL,
        "gemma_url": GEMMA_URL,
        "auth": bool(API_KEY),
    }


@app.post("/v1/roadmap", response_model=RoadmapResponse)
def generate_roadmap(
    request: RoadmapRequest,
    x_api_key: str = Header(default=""),
) -> RoadmapResponse:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    if not request.catalog.courses:
        raise HTTPException(status_code=400, detail="Catalog must contain at least one course")

    request_id = uuid.uuid4().hex[:8]
    started_at = time.perf_counter()
    logger.info(
        "[%s] roadmap request: %d courses, %d answers",
        request_id, len(request.catalog.courses), len(request.profile.answers),
    )

    messages = build_messages(request)
    raw_text = ""
    try:
        try:
            raw_text = call_gemma(messages, use_schema=True)
        except requests.HTTPError as exc:
            # Older vLLM builds may reject response_format; retry unguided.
            if exc.response is not None and exc.response.status_code == 400:
                logger.warning("[%s] json_schema rejected, retrying unguided", request_id)
                raw_text = call_gemma(messages, use_schema=False)
            else:
                raise
        roadmap = sanitize(extract_json(raw_text), request)
    except (requests.RequestException, ValueError, KeyError, json.JSONDecodeError) as exc:
        logger.exception("[%s] roadmap generation failed", request_id)
        raise HTTPException(status_code=502, detail=f"Roadmap generation failed: {exc}") from exc

    roadmap.elapsedMs = int((time.perf_counter() - started_at) * 1000)
    logger.info(
        "[%s] roadmap ready: %d nodes, %d ms",
        request_id, len(roadmap.nodes), roadmap.elapsedMs,
    )
    return roadmap
