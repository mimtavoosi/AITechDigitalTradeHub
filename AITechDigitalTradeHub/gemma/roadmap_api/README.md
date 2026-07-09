# AITech Roadmap API (پورت ۸۱۸۱)

سرویس تولید «نقشه راه یادگیری» با مدل Gemma برای بخش آموزش سایت.
بک‌اند دات‌نت کاتالوگ کامل دوره‌ها + پاسخ‌های پرسشنامه کاربر را می‌فرستد و این سرویس
یک رودمپ ساخت‌یافته (JSON گرافی) برمی‌گرداند که فرانت آن را به‌صورت گرافیکی رسم می‌کند.

## معماری

```
فرانت Next.js → بک‌اند دات‌نت (POST /api/education/recommendations)
                    → این سرویس (POST http://37.255.232.255:8181/v1/roadmap)
                        → vLLM/Gemma (http://127.0.0.1:8000/v1/chat/completions)
```

## راه‌اندازی روی سرور (37.255.232.255)

1. این پوشه (`roadmap_api`) را کنار پوشه مدل gemma روی سرور کپی کنید.
2. مطمئن شوید vLLM روی پورت ۸۰۰۰ بالا است (`run_gemma.ps1`).
3. کلید مشترک را ست کنید و سرویس را اجرا کنید:

```powershell
$env:ROADMAP_API_KEY = "یک-مقدار-تصادفی-طولانی"
.\start_roadmap_api.ps1
```

یا مستقیم (لینوکس/WSL):

```bash
pip install -r requirements.txt
ROADMAP_API_KEY="یک-مقدار-تصادفی-طولانی" \
  uvicorn roadmap_server:app --host 0.0.0.0 --port 8181
```

4. پورت ۸۱۸۱ را در فایروال فقط برای IP سرور سایت باز کنید (سرویس نباید عمومی باشد).
5. همان کلید را در `appsettings.json` بک‌اند در بخش `AiRoadmap:ApiKey` قرار دهید.

## متغیرهای محیطی

| متغیر | پیش‌فرض | توضیح |
|---|---|---|
| `GEMMA_URL` | `http://127.0.0.1:8000/v1/chat/completions` | آدرس vLLM |
| `GEMMA_MODEL` | `gemma4` | نام مدل سروشده |
| `GEMMA_TIMEOUT_SECONDS` | `180` | مهلت پاسخ مدل |
| `MAX_ROADMAP_TOKENS` | `3072` | سقف توکن خروجی |
| `ROADMAP_API_KEY` | خالی | اگر ست شود، هدر `X-Api-Key` اجباری است |

## قرارداد API

### `GET /health`
وضعیت سرویس.

### `POST /v1/roadmap` (هدر `X-Api-Key`)

بدنه درخواست (خلاصه):

```json
{
  "profile": {
    "answers": [{ "question": "هدف شما...", "answer": "شروع مسیر شغلی" }],
    "freeText": "توضیحات آزاد کاربر",
    "goal": "...", "level": "Beginner", "weeklyHours": 6, "preferredMode": "Recorded"
  },
  "catalog": {
    "categories": [{ "id": 1, "name": "یادگیری ماشین" }],
    "courses": [{
      "id": 12, "title": "...", "category": "...", "level": "Beginner",
      "deliveryMode": "Recorded", "priceAmount": 0,
      "estimatedWeeks": 6, "weeklyHoursMin": 3, "weeklyHoursMax": 6,
      "projectBased": true, "requiresMentor": false,
      "description": "...", "learningOutcomes": "...", "prerequisitesSummary": "...",
      "skills": ["python"],
      "lessons": ["درس‌های بدون سرفصل"],
      "sections": [
        { "title": "سرفصل ۱", "objective": "هدف یادگیری فصل", "lessons": ["درس ۱", "درس ۲"] }
      ]
    }]
  },
  "maxNodes": 7,
  "maxCoursesPerNode": 3
}
```

پاسخ:

```json
{
  "roadmapTitle": "مسیر توسعه‌دهنده هوش مصنوعی",
  "roadmapSummary": "...",
  "totalEstimatedWeeks": 16,
  "nodes": [{
    "id": "n1", "title": "مبانی برنامه‌نویسی", "description": "...",
    "order": 1, "dependsOn": [], "skills": ["python"],
    "estimatedWeeks": 4, "isOptional": false,
    "courses": [{ "courseId": 12, "reason": "به دلیل سرفصل‌های...", "matchScore": 92 }]
  }],
  "tips": ["..."],
  "model": "gemma4",
  "elapsedMs": 9500
}
```

نکات اعتبارسنجی داخل سرویس:

- `courseId`هایی که در کاتالوگ نباشند حذف می‌شوند (جلوی توهم مدل گرفته می‌شود).
- `dependsOn`های نامعتبر حذف و نودها بر اساس `order` مرتب می‌شوند.
- اگر خروجی مدل کمتر از ۲ نود قابل‌استفاده داشته باشد، پاسخ `502` برمی‌گردد
  و بک‌اند همان خطا را به کاربر نمایش می‌دهد.
- خروجی مدل با `response_format: json_schema` (ساختار اجباری vLLM) گرفته می‌شود و
  اگر نسخه vLLM آن را نپذیرد، بدون schema تلاش مجدد و JSON از متن استخراج می‌شود.
