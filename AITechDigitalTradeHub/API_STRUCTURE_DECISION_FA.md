# تصمیم فنی درباره ساختار API پروژه

آخرین به‌روزرسانی: 2026-06-18

این سند برای ثبت تصمیم معماری درباره سبک طراحی API در پروژه `AITech Digital Trade Hub` نوشته شده است. هدف این است که روشن باشد ادامه توسعه بک‌اند با چه الگویی انجام شود و چرا این الگو برای این پروژه مناسب‌تر است.

## سوال اصلی

در پروژه‌های قبلی، APIها معمولاً با الگوی عملیاتی و جدول‌محور ساخته می‌شدند، مثل:

```txt
POST   /Book/GetAllBooks_Base
POST   /Book/GetBookById_Base
POST   /Book/ExistBook_Base
POST   /Book/AddBook_Base
PUT    /Book/EditBook_Base
DELETE /Book/DeleteBook_Base
```

در نسخه فعلی این پروژه، APIها بیشتر بر اساس منبع و عملیات دامنه طراحی شده‌اند، مثل:

```txt
GET    /projects
GET    /projects/{id}
POST   /projects
POST   /projects/{id}/publish
POST   /projects/{id}/proposals
POST   /projects/proposals/{proposalId}/accept
POST   /orders/{id}/pay
POST   /projects/milestones/{milestoneId}/escrow/hold
PATCH  /listings/admin/{id}/status
```

سوال این است که برای ادامه این پروژه، کدام ساختار بهتر است.

## نتیجه تصمیم

برای این پروژه، ساختار فعلی یعنی APIهای منبع‌محور و دامنه‌محور مناسب‌تر است.

با این حال، الگوی قدیمی `_Base` کاملاً کنار گذاشته نمی‌شود. برای CRUDهای ساده و جدول‌های مرجع می‌توان از یک الگوی پایه استفاده کرد، اما هسته‌های اصلی پروژه باید با APIهای دامنه‌محور ادامه پیدا کنند.

تصمیم نهایی:

```txt
Domain APIs:
/projects
/listings
/orders
/finance
/education
/tickets
/reviews
/admin/...

Reference/Admin CRUD:
/categories
/cities
/tags
/settings
/files
/roles
/permissions
```

## چرا ساختار فعلی برای این پروژه بهتر است؟

### 1. این پروژه فقط CRUD نیست

`AITech Digital Trade Hub` یک پلتفرم ساده مدیریت داده نیست. طبق پروپوزال، پروژه شامل جریان‌های جدی کسب‌وکاری است:

- پروژه و مناقصه
- ارسال و پذیرش Proposal
- قرارداد دیجیتال
- Milestone
- کیف پول
- Escrow
- سفارش خدمات و تجهیزات
- پرداخت داخلی
- داوری و حل اختلاف
- تیکتینگ
- آموزش
- سرمایه‌گذاری
- پنل شرکت‌ها
- نقش‌ها و دسترسی‌های چندگانه

در چنین پروژه‌ای، بسیاری از عملیات‌ها صرفاً `Add`، `Edit` یا `Delete` نیستند. برای مثال:

```txt
پذیرش پیشنهاد
پرداخت سفارش
نگهداری وجه در Escrow
آزادسازی وجه
درخواست قابلیت حساب
تایید یا رد نقش کاربر
انتشار لیستینگ
تحویل سفارش
ثبت اختلاف
صدور رای داوری
```

این عملیات‌ها باید در API با نام و مسیر واضح دیده شوند، نه اینکه داخل یک `Edit_Base` مبهم پنهان شوند.

### 2. API باید زبان کسب‌وکار را نشان دهد

در مدل قدیمی، API بیشتر شبیه عملیات مستقیم روی دیتابیس است:

```txt
/Proposal/EditProposal_Base
/Order/EditOrder_Base
/Milestone/EditMilestone_Base
```

اما در مدل دامنه‌محور، API دقیقاً کاری را که در سیستم اتفاق می‌افتد نشان می‌دهد:

```txt
POST /projects/proposals/{proposalId}/accept
POST /orders/{id}/pay
POST /orders/{id}/deliver
POST /orders/{id}/complete
POST /projects/milestones/{milestoneId}/escrow/hold
POST /projects/milestones/{milestoneId}/escrow/{escrowId}/release
```

این خوانایی برای توسعه‌دهنده بک‌اند، توسعه‌دهنده فرانت، تست، مستندسازی Swagger و حتی ارائه به تیم یا سرمایه‌گذار مهم است.

### 3. کنترل وضعیت‌ها امن‌تر می‌شود

در این پروژه وضعیت‌ها حساس هستند. مثلاً سفارش، پروژه، قرارداد، milestone، escrow و transaction نباید آزادانه با یک endpoint عمومی ویرایش شوند.

مثال خطرناک در مدل CRUD:

```txt
PUT /Order/EditOrder_Base
```

اگر این endpoint مستقیم وضعیت سفارش را تغییر دهد، ممکن است کاربر یا حتی باگ فرانت باعث شود سفارش بدون پرداخت واقعی `Paid` شود یا milestone بدون تایید آزاد شود.

در مدل فعلی، هر تغییر مهم یک endpoint جدا دارد:

```txt
POST /orders/{id}/pay
POST /orders/{id}/start
POST /orders/{id}/deliver
POST /orders/{id}/complete
POST /orders/{id}/cancel
```

این باعث می‌شود برای هر عملیات، validation، permission، مالکیت منبع، transaction مالی و event log جداگانه کنترل شود.

### 4. برای مالی و Escrow ساختار دامنه‌ای ضروری است

بخش مالی پروژه از حساس‌ترین بخش‌هاست. در Wallet، Transaction، Escrow، Payout و Invoice نباید CRUD خام مبنای اصلی باشد.

مثلاً این مدل مناسب نیست:

```txt
POST /Transaction/AddTransaction_Base
PUT  /Wallet/EditWallet_Base
PUT  /Escrow/EditEscrow_Base
```

چون تراکنش مالی باید اتمیک، قابل رهگیری و وابسته به رویداد واقعی باشد.

مدل بهتر:

```txt
POST /finance/wallets/{id}/deposit
POST /orders/{id}/pay
POST /finance/course-enrollments/{courseId}/pay
POST /finance/teacher-bookings/{bookingId}/pay
POST /projects/milestones/{milestoneId}/escrow/hold
POST /projects/milestones/{milestoneId}/escrow/{escrowId}/release
POST /projects/milestones/{milestoneId}/escrow/{escrowId}/refund
```

در این حالت، تراکنش از دل یک سناریوی واقعی ایجاد می‌شود، نه با ثبت مستقیم یک رکورد.

### 5. Swagger حرفه‌ای‌تر و قابل فهم‌تر می‌شود

در مدل قدیمی، Swagger معمولاً پر از endpointهایی شبیه این می‌شود:

```txt
/Book/GetAllBooks_Base
/Book/GetBookById_Base
/Book/ExistBook_Base
/Book/AddBook_Base
/Book/EditBook_Base
/Book/DeleteBook_Base
```

برای پروژه‌ای با این حجم ماژول، این سبک به سرعت شلوغ، تکراری و سخت‌خوان می‌شود.

در مدل فعلی، Swagger به ماژول‌ها و use-caseها نزدیک‌تر است:

```txt
Auth
Users
Listings
Orders
Projects
Finance
Education
Tickets
Notifications
Reviews
Categories
```

این برای توسعه فرانت، تست API و ارائه پروژه بهتر است.

### 6. با Next.js و React Query بهتر هماهنگ است

فرانت فعلی با Next.js، TypeScript و React Query ساخته شده است. React Query معمولاً با query keyهای منبع‌محور و use-case محور بهتر کار می‌کند:

```txt
["projects"]
["projects", id]
["listings", "mine"]
["orders", "purchases"]
["finance", "wallet", "me"]
["education", "courses", "mine"]
```

اگر APIها به شکل `_Base` و action-heavy باشند، نام‌گذاری queryها، cache invalidation و خوانایی feature APIها سخت‌تر می‌شود.

### 7. Permission و مالکیت منبع دقیق‌تر اعمال می‌شود

در پروژه فعلی، نقش‌ها و permissionها مهم‌اند:

- کاربر عادی
- کارفرما
- مجری پروژه
- ارائه‌دهنده خدمات
- مدرس
- سرمایه‌گذار
- سرمایه‌پذیر
- پشتیبان
- داور
- ادمین
- سوپرادمین

در مدل دامنه‌ای، می‌توان برای هر عملیات permission مشخص گذاشت:

```txt
projects.create
projects.manage-own
projects.proposals.submit
projects.proposals.manage
listings.create
listings.manage-own
finance.wallet.use
education.courses.manage
users.manage
```

این بهتر از آن است که همه چیز زیر `Add_Base` و `Edit_Base` قرار بگیرد و بعد مجبور شویم داخل متدها تشخیص بدهیم کاربر دقیقاً مجاز به چه کاری هست.

### 8. تست‌پذیری سناریوها بهتر می‌شود

برای MVP باید سناریوهای کامل تست شوند:

```txt
ثبت‌نام کاربر
ایجاد پروژه
ارسال پیشنهاد
پذیرش پیشنهاد
ایجاد قرارداد
تعریف milestone
پرداخت/escrow
تحویل
تایید
آزادسازی وجه
ثبت نظر
```

اگر APIها سناریو محور باشند، نوشتن integration test روشن‌تر است. هر endpoint نماینده یک قدم واقعی در جریان کسب‌وکار است.

در مدل CRUD خام، تست‌ها مجبورند چندین `Edit_Base` را با وضعیت‌های مختلف صدا بزنند و منطق اصلی از بیرون API مشخص نیست.

## کجا می‌توان از الگوی Base استفاده کرد؟

الگوی Base برای بخش‌هایی که واقعاً CRUD ساده هستند هنوز مفید است. مثال:

- شهرها
- دسته‌بندی‌ها
- برچسب‌ها
- تنظیمات عمومی
- فایل‌ها
- تصاویر
- Role و Permission در پنل ادمین
- برخی گزارش‌های ساده

برای این بخش‌ها می‌توان یک الگوی پایه داشت، ولی بهتر است routeها همچنان تمیز و استاندارد باشند:

```txt
GET    /categories
GET    /categories/{id}
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}
```

نه:

```txt
POST /Category/GetAllCategories_Base
POST /Category/GetCategoryById_Base
POST /Category/AddCategory_Base
PUT  /Category/EditCategory_Base
```

## پیشنهاد عملی برای ادامه توسعه

### 1. ساختار فعلی حفظ شود

برای ماژول‌های اصلی پروژه ساختار فعلی ادامه پیدا کند:

```txt
/auth
/users
/listings
/orders
/projects
/finance
/education
/tickets
/notifications
/reviews
/admin
```

### 2. برای CRUDهای ساده یک الگوی داخلی استاندارد ساخته شود

می‌توان برای کاهش تکرار، در لایه کد از Base Service یا Base Repository استفاده کرد، اما خروجی API همچنان REST/domain-friendly بماند.

یعنی داخل کد می‌توانیم abstraction داشته باشیم، ولی route عمومی API نباید الزاماً `_Base` باشد.

### 3. Response model یکپارچه شود

برای ادامه کار، بهتر است همه APIها خروجی یکدست داشته باشند:

```json
{
  "status": true,
  "message": "...",
  "result": {}
}
```

یا برای لیست‌ها:

```json
{
  "status": true,
  "totalCount": 120,
  "pageIndex": 1,
  "pageSize": 20,
  "result": []
}
```

### 4. Pagination، filtering و sorting استاندارد شود

برای لیست‌ها باید قرارداد واحد داشته باشیم:

```txt
GET /listings?pageIndex=1&pageSize=20&searchText=...&sort=...
GET /projects?pageIndex=1&pageSize=20&status=Open&minBudget=...
```

### 5. مسیرهای admin از مسیرهای کاربر جدا بماند

برای عملیات مدیریتی بهتر است مسیرها روشن باشند:

```txt
GET   /listings/admin
PATCH /listings/admin/{id}/status
GET   /orders/admin
PATCH /orders/admin/{id}/status
```

بعداً می‌توان این‌ها را به شکل زیر هم منظم‌تر کرد:

```txt
/admin/listings
/admin/orders
/admin/projects
/admin/finance
/admin/reports
```

## جمع‌بندی نهایی

برای پروژه‌های کوچک، CRUD محور یا پنل‌های ساده، سبک قدیمی `_Base` سریع و قابل قبول است.

اما برای این پروژه، به دلیل وجود مالی، Escrow، پروژه، مناقصه، قرارداد، milestone، داوری، آموزش، سرمایه‌گذاری، چندنقشی و پنل‌های مختلف، ساختار فعلی منطقی‌تر و کم‌ریسک‌تر است.

تصمیم پیشنهادی:

```txt
هسته‌های اصلی پروژه: API دامنه‌محور
CRUDهای ساده: الگوی پایه داخلی، با route استاندارد و تمیز
```

این تصمیم روی ادامه کار اثر مستقیم دارد. اگر پروژه به سمت `_Base` کامل برگردد، توسعه اولیه شاید سریع‌تر به نظر برسد، اما در فازهای مالی، داوری، Escrow، سرمایه‌گذاری و تست سناریوهای واقعی پیچیدگی و ریسک بیشتری ایجاد می‌کند.

بنابراین مسیر بهتر برای ادامه پروژه، حفظ ساختار فعلی و تکمیل استانداردهای مشترک API است:

- Response یکپارچه
- Error model یکپارچه
- Pagination/Filtering/Sorting واحد
- Permission policy دقیق
- تست‌های integration برای جریان‌های MVP
- مستندسازی Swagger تمیز
