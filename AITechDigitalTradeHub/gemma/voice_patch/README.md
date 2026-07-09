# دستیار صوتی فارسی AITech

> به‌روزرسانی ۱۱ ژوئن ۲۰۲۶: سرویس `qwen_server.py` اکنون به‌جای Qwen از
> Gemma 4 روی vLLM و پورت `8000` استفاده می‌کند. RAG نیز با router پارامتری،
> cache و حداکثر یک فراخوانی مدل بازطراحی شده است. راهنمای دقیق اجرا در
> `GEMMA_RAG.md` قرار دارد و اجرای یک‌فرمانی با `start_gemma_rag.ps1` انجام
> می‌شود.

این پروژه یک نمونه‌ی محلی از دستیار صوتی فارسی است که ورودی صوتی را به متن تبدیل می‌کند، با کمک یک مدل زبانی و اطلاعات آکادمی AITech پاسخ می‌سازد و پاسخ را به فایل صوتی WAV تبدیل می‌کند.

پروژه از چند سرویس مستقل FastAPI تشکیل شده است:

```text
میکروفن یا فایل صوتی
        |
        v
Whisper STT :8001
        |
        v
Qwen + SQL RAG :8003 ----> Qwen upstream :8080
        |                         |
        |                         v
        |                   SQL Server خارجی
        v
Chatterbox TTS :8002
        |
        v
output.wav
```

## وضعیت فعلی پروژه

- زبان اصلی تعامل: فارسی
- نسخه‌ی محیط فعلی: Python 3.11.9
- پردازش گفتار و TTS برای اجرا روی CUDA تنظیم شده‌اند.
- مدل Whisper و مدل Chatterbox از مسیرهای محلی خارج از پوشه‌ی پروژه بارگذاری می‌شوند.
- سرور Qwen در این مخزن وجود ندارد و باید جداگانه روی پورت `8080` اجرا شود.
- فایل `requirements.txt`، اسکریپت اجرای یکپارچه و تست خودکار در پروژه وجود ندارد.
- تمام فایل‌های پایتون فعلی از نظر نحوی با `py_compile` معتبر هستند.

## ساختار فایل‌ها

| فایل | کاربرد |
|---|---|
| `orchestrator.py` | کلاینت خط فرمان و هماهنگ‌کننده‌ی مسیر STT، LLM و TTS |
| `whisper_server.py` | سرویس تبدیل گفتار به متن، شامل آپلود فایل و دریافت تکه‌ای صدای میکروفن |
| `qwen_server.py` | واسط OpenAI-compatible برای تولید SQL، اجرای جست‌وجوی دیتابیس و ساخت پاسخ فارسی |
| `qwen_itself.py` | واسط ساده‌تر Qwen بدون RAG و دیتابیس |
| `tts_server.py` | سرویس تبدیل متن به گفتار با Chatterbox Multilingual TTS |
| `sql_rag.py` | اجرای query روی SQL Server و تبدیل نتیجه به `list[dict]` |
| `pdf_rag.py` | نمونه‌ی RAG برای PDF با Sentence Transformers و FAISS؛ فعلا به مسیر اصلی وصل نیست |
| `test.py` | اسکریپت آزمایشی مستقیم برای تولید فایل `ff.wav` با Chatterbox؛ تست خودکار نیست |

فایل `D:\Voice_final_3\best_model.pth` نیز در پوشه‌ی والد وجود دارد، اما هیچ‌کدام از فایل‌های این پروژه به آن ارجاع نمی‌دهند.

## جریان اجرای اصلی

### ورودی فایل صوتی

1. `orchestrator.py` فایل را با درخواست `multipart/form-data` به `POST /transcribe` می‌فرستد.
2. سرویس Whisper صوت را با `librosa` به mono و نرخ 16 kHz تبدیل می‌کند.
3. مدل محلی Whisper متن تشخیص‌داده‌شده را برمی‌گرداند.
4. متن به endpoint سازگار با OpenAI در سرویس `qwen_server.py` ارسال می‌شود.
5. سرویس Qwen ابتدا از مدل بالادستی می‌خواهد فقط یک query برای SQL Server بسازد.
6. `SQLRAG` query را اجرا می‌کند و نتیجه را همراه دانش ثابت AITech دوباره به مدل می‌دهد.
7. پاسخ فارسی به سرویس TTS ارسال می‌شود.
8. صدای خروجی در فایل `output.wav` ذخیره می‌شود.

### ورودی میکروفن

1. میکروفن با مشخصات mono، `PCM16` و 16 kHz خوانده می‌شود.
2. Silero VAD شروع گفتار و پایان جمله را از روی صدا تشخیص می‌دهد.
3. ضبط تا زمانی که کاربر صحبت می‌کند ادامه دارد و پس از سکوت پیش‌فرض 1.2 ثانیه‌ای پایان می‌یابد.
4. orchestrator یک session با `POST /signalr/negotiate` ایجاد می‌کند.
5. صدای ضبط‌شده به endpoint مربوط به session فرستاده می‌شود.
6. `POST /signalr/stop/{id}` کل صدای جمع‌شده را رونویسی می‌کند.
7. ادامه‌ی مسیر مانند حالت فایل، از Qwen به TTS انجام می‌شود.

نام‌گذاری `signalr` در این پروژه به یک API سفارشی مبتنی بر HTTP و Long Polling اشاره دارد؛ پیاده‌سازی واقعی Microsoft SignalR یا WebSocket نیست.

## پیش‌نیازها

- Windows
- Python 3.11
- کارت گرافیک NVIDIA و نسخه‌ی سازگار CUDA برای تنظیمات فعلی
- مدل Whisper در مسیر زیر:

```text
D:\STT model\Whisper-medium-ytcv-persian
```

- مدل Chatterbox در مسیر زیر:

```text
D:\TTS_model\chatterbox
```

- یک سرور مدل Qwen با API سازگار با OpenAI در:

```text
http://127.0.0.1:8080/v1/chat/completions
```

- Microsoft ODBC Driver 18 for SQL Server
- دسترسی شبکه به SQL Server تنظیم‌شده در `qwen_server.py`
- برای ورودی میکروفن، دستگاه ضبط سازگار با `sounddevice`

## وابستگی‌های پایتون

محیط مجازی موجود هنگام بررسی شامل نسخه‌های مهم زیر بود:

```text
fastapi==0.136.3
uvicorn==0.48.0
pydantic==2.13.4
python-multipart==0.0.30
requests==2.34.2
torch==2.10.0+cu130
torchaudio==2.10.0+cu130
transformers==5.2.0
librosa==0.11.0
numpy==1.26.4
sounddevice==0.5.5
soundfile==0.13.1
silero-vad==6.2.1
chatterbox-tts==0.1.7
pyodbc==5.3.0
sentence-transformers==3.3.1
faiss-cpu==1.14.2
pdfplumber==0.11.9
```

فعال‌سازی محیط موجود در PowerShell:

```powershell
cd D:\Voice_final_3\voice-assistant-main
.\venv\Scripts\Activate.ps1
```

محیط مجازی معمولا نباید بین سیستم‌ها کپی یا داخل Git نگهداری شود. برای قابل‌تکرار شدن نصب بهتر است بعدا یک `requirements.txt` یا فایل مدیریت وابستگی ساخته شود.

## اجرای پروژه

ابتدا سرور Qwen سازگار با OpenAI را روی `127.0.0.1:8080` اجرا کنید. فرمان دقیق آن به موتور سروینگ و محل مدل Qwen بستگی دارد و در این مخزن تعریف نشده است.

سپس سه ترمینال جدا باز کنید.

### 1. سرویس Whisper

```powershell
.\venv\Scripts\python.exe -m uvicorn whisper_server:app --host 127.0.0.1 --port 8001
```

### 2. سرویس TTS

```powershell
.\venv\Scripts\python.exe -m uvicorn tts_server:app --host 127.0.0.1 --port 8002
```

### 3. سرویس Qwen و SQL RAG

```powershell
.\venv\Scripts\python.exe -m uvicorn qwen_server:app --host 127.0.0.1 --port 8003
```

برای چت عمومی بدون دیتابیس می‌توان به‌جای مورد بالا این نسخه را اجرا کرد:

```powershell
.\venv\Scripts\python.exe -m uvicorn qwen_itself:app --host 127.0.0.1 --port 8003
```

هر دو فایل endpoint یکسان دارند، بنابراین نباید هم‌زمان روی پورت `8003` اجرا شوند.

## استفاده

### ضبط از میکروفن

حالت پیش‌فرض پایان صحبت را خودکار تشخیص می‌دهد:

```powershell
.\venv\Scripts\python.exe orchestrator.py --mic
```

برای مکالمه‌ی پیوسته، پاسخ صوتی پخش می‌شود و برنامه دوباره منتظر صحبت بعدی می‌ماند:

```powershell
.\venv\Scripts\python.exe orchestrator.py --conversation
```

حالت مکالمه اکنون پیش‌فرض است، بنابراین این فرمان نیز همان رفتار را دارد:

```powershell
.\venv\Scripts\python.exe orchestrator.py --mic
```

خروج از حالت مکالمه با فشردن کلید `q` انجام می‌شود. برای اجرای فقط یک سؤال:

```powershell
.\venv\Scripts\python.exe orchestrator.py --once
```

تغییر مدت سکوت لازم برای پایان جمله:

```powershell
.\venv\Scripts\python.exe orchestrator.py --mic --silence-seconds 1.5
```

برای استفاده از ضبط با مدت ثابت قدیمی:

```powershell
.\venv\Scripts\python.exe orchestrator.py --mic --seconds 10
```

در حالت خودکار، برنامه حداکثر 15 ثانیه منتظر شروع صحبت می‌ماند و سقف ایمنی هر ضبط 120 ثانیه است. این مقادیر با `--start-timeout` و `--max-seconds` قابل تغییرند.

نکته: اگر `--file` داده نشود، برنامه حتی بدون نوشتن `--mic` نیز ورودی میکروفن را اجرا می‌کند.

### ورودی از فایل صوتی

```powershell
.\venv\Scripts\python.exe orchestrator.py --file .\sample.wav
```

خروجی نهایی در مسیر کاری فعلی با نام زیر ساخته می‌شود:

```text
output.wav
```

## APIها

پس از اجرای هر سرویس، مستندات تعاملی FastAPI در `/docs` در دسترس است؛ برای مثال:

```text
http://127.0.0.1:8001/docs
http://127.0.0.1:8002/docs
http://127.0.0.1:8003/docs
```

### Whisper روی پورت 8001

| متد و مسیر | توضیح |
|---|---|
| `POST /transcribe` | دریافت فایل صوتی و پاسخ `{"text": "..."}` |
| `POST /signalr/negotiate` | ساخت session دریافت صوت |
| `POST /signalr/chunk/{connection_id}` | افزودن بایت‌های صوتی به session |
| `GET /signalr/poll/{connection_id}` | دریافت transcription موقت در صورت کافی بودن داده |
| `POST /signalr/stop/{connection_id}` | پایان session و دریافت متن نهایی |
| `POST /signalr/reset/{connection_id}` | پاک‌کردن buffer همان session |
| `DELETE /signalr/connection/{connection_id}` | بستن session بدون پردازش نهایی |

نمونه‌ی payload برای شروع session:

```json
{
  "filename": "microphone.pcm",
  "audio_format": "pcm16",
  "sample_rate": 16000,
  "channels": 1
}
```

برای transcription موقت حداقل 0.8 ثانیه از پردازش قبلی و 32000 بایت صدای جدید لازم است. orchestrator فعلی از endpoint مربوط به `poll` استفاده نمی‌کند و فقط در پایان ضبط نتیجه می‌گیرد.

### TTS روی پورت 8002

`POST /tts`

```json
{
  "text": "سلام، به آکادمی آی‌تک خوش آمدید."
}
```

پاسخ یک فایل `audio/wav` با PCM 16-bit است.

### Qwen wrapper روی پورت 8003

`POST /v1/chat/completions`

```json
{
  "messages": [
    {
      "role": "user",
      "content": "چه دوره‌هایی برگزار می‌شود؟"
    }
  ],
  "stream": false
}
```

مدل ورودی فقط فیلد `messages` را تعریف کرده است. فیلدهای اضافه مانند `stream` در تنظیم پیش‌فرض Pydantic نادیده گرفته می‌شوند. خروجی همان ساختار پاسخ سرور Qwen بالادستی است و orchestrator متن را از مسیر زیر می‌خواند:

```text
choices[0].message.content
```

## SQL RAG و دانش AITech

`qwen_server.py` از دو منبع برای پاسخ استفاده می‌کند:

1. نتیجه‌ی query تولیدشده توسط مدل روی SQL Server
2. دیکشنری ثابت `AITEC_KNOWLEDGE` شامل معرفی، خدمات، اطلاعات تماس و اعضای تیم

schema قابل مشاهده برای مدل شامل جدول‌هایی مانند `Users`، `Courses`، `Groups`، `TeacherResumes`، `Events`، `News`، `Articles` و `Books` است.

`SQLRAG` فقط queryهایی را قبول می‌کند که متن آن‌ها با `SELECT` شروع شود، سپس نام ستون‌ها و ردیف‌ها را به دیکشنری تبدیل می‌کند. خطاهای تولید SQL، اتصال و اجرای query همراه با شناسه درخواست در لاگ ثبت و به‌صورت پاسخ خطای API برگردانده می‌شوند.

سلام، تشکر، خداحافظی و احوال‌پرسی‌های کوتاه بدون مراجعه به SQL Server مستقیما توسط مدل زبانی پاسخ داده می‌شوند. پاسخ‌هایی که از جدول `News` می‌آیند نیز در انتها لینک خبر را با قالب زیر دریافت می‌کنند:

```text
https://aitechac.com/news/[NEWS_ID]
```

## PDF RAG

کلاس `PDFRAG`:

- متن PDF را با `pdfplumber` استخراج می‌کند.
- متن را به قطعه‌های 500 کاراکتری تقسیم می‌کند.
- embedding چندزبانه‌ی 384بعدی می‌سازد.
- داده‌ها را در `faiss.IndexFlatL2` داخل حافظه نگه می‌دارد.
- نزدیک‌ترین قطعه‌ها را با `search(query, k=3)` برمی‌گرداند.

این کلاس در هیچ‌یک از سرورها import یا نمونه‌سازی نشده و فعلا جزئی از pipeline عملیاتی نیست. index نیز persistence ندارد و با هر بار اجرای برنامه از نو ساخته می‌شود.

## تنظیمات مهم داخل کد

تنظیمات زیر hard-coded هستند:

- آدرس و پورت هر سرویس در `orchestrator.py`
- مسیر مدل Whisper در `whisper_server.py`
- مسیر مدل Chatterbox و دستگاه `cuda` در `tts_server.py` و `test.py`
- آدرس Qwen بالادستی در `qwen_server.py` و `qwen_itself.py`
- schema، اطلاعات ثابت AITech و connection string دیتابیس در `qwen_server.py`

برای استقرار قابل‌حمل بهتر است این مقادیر با environment variable یا فایل تنظیمات مدیریت شوند.

## نکات و محدودیت‌های شناخته‌شده

### امنیت

- connection string شامل نام کاربری و رمز دیتابیس به‌صورت متن ساده در `qwen_server.py` است. این credential باید فورا تعویض و از کد خارج شود.
- محدودکردن query به `startswith("select")` محافظت کافی در برابر SQL injection یا queryهای مخرب تولیدشده توسط مدل نیست. باید parser یا allowlist، حساب دیتابیس read-only، timeout و محدودیت تعداد ردیف اضافه شود.
- CORS در سرویس Qwen برای همه‌ی originها باز است.
- APIها authentication و rate limit ندارند و نباید بدون لایه‌ی محافظ روی شبکه‌ی عمومی منتشر شوند.
- اطلاعات دیتابیس و پرسش کاربر وارد prompt مدل می‌شوند؛ در استفاده‌ی واقعی باید سیاست حریم خصوصی و حذف داده‌های حساس مشخص باشد.

### پایداری و منابع

- مدل‌ها هنگام import فایل بارگذاری می‌شوند؛ startup طولانی و مصرف زیاد GPU طبیعی است.
- `tts_server.py` دستگاه را صریحا `cuda` تعیین کرده و fallback به CPU ندارد.
- مدل Whisper fallback به CPU دارد، ولی اجرای مدل medium روی CPU احتمالا بسیار کند است.
- sessionهای realtime فقط در حافظه نگهداری می‌شوند؛ restart همه را حذف می‌کند و اجرای چند worker باعث ناسازگاری sessionها می‌شود.
- برای sessionهای رهاشده expiration یا cleanup خودکار وجود ندارد.
- فایل‌های موقت Whisper و TTS پس از پاسخ حذف نمی‌شوند و با استفاده‌ی مداوم فضای دیسک را پر می‌کنند.
- درخواست‌های Qwen در `qwen_server.py` timeout و بررسی `raise_for_status()` ندارند.
- خطای اجرای SQL با `except:` بلعیده می‌شود و logging کافی ندارد.
- پاسخ‌های دیتابیس بدون محدودیت اندازه مستقیما داخل prompt قرار می‌گیرند.

### کیفیت و سازگاری

- در `tts_server.py` مقدار `language_id="ar"` استفاده شده، در حالی که متن و هدف پروژه فارسی است و `test.py` از `"fa"` استفاده می‌کند. این تفاوت باید با مدل واقعی ارزیابی شود.
- endpoint به نام realtime تمام buffer را برای transcription موقت دوباره پردازش می‌کند؛ streaming واقعی مدل نیست و با طولانی‌شدن صدا کندتر می‌شود.
- `orchestrator.py` تابع `poll` دارد، اما هنگام ضبط از آن استفاده نمی‌کند.
- خروجی‌های `output.wav` و `ff.wav` در اجراهای بعدی overwrite می‌شوند.
- برخی commentها و رشته‌های فارسی در فایل‌های منبع به‌شکل mojibake دیده می‌شوند و لازم است encoding آن‌ها به UTF-8 اصلاح شود.
- schema داخل prompt جدول `News` را دوبار تعریف کرده و ستون `TeacherId` در جدول `Groups` نیز تکراری است.
- `test.py` با import یا اجرا بلافاصله مدل سنگین را بارگذاری و فایل تولید می‌کند؛ ساختار تست استاندارد ندارد.

## پیشنهادهای توسعه

اولویت‌های منطقی برای آماده‌سازی پروژه:

1. تعویض credential دیتابیس و انتقال همه‌ی تنظیمات به `.env`
2. ساخت `requirements.txt` و `.gitignore`
3. افزودن health endpoint و اسکریپت اجرای همه‌ی سرویس‌ها
4. پاک‌سازی قطعی فایل‌های موقت با `BackgroundTask` یا `try/finally`
5. محدودکردن SQL به دیتابیس read-only و اعتبارسنجی ساختاری query
6. افزودن timeout، مدیریت خطا و logging یکپارچه
7. اصلاح encoding متن‌های فارسی
8. نوشتن تست واحد و integration test برای هر endpoint
9. اتصال اختیاری `PDFRAG` به prompt نهایی
10. افزودن پشتیبانی از تنظیم پورت، مسیر مدل و device بدون تغییر کد

## جمع‌بندی

این مخزن یک prototype قابل‌فهم از دستیار صوتی فارسی چندسرویسی است. بخش‌های اصلی pipeline پیاده‌سازی شده‌اند و قرارداد API میان آن‌ها مشخص است، اما برای اجرای قابل‌تکرار و استقرار واقعی هنوز به مدیریت تنظیمات، ایمن‌سازی دسترسی دیتابیس، مدیریت فایل و session، تست، logging و packaging نیاز دارد.
