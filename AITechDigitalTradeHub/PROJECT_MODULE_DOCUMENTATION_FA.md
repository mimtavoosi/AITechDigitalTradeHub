# مستند بخش پروژه و مناقصه

این سند وضعیت و مسیرهای دسترسی ماژول پروژه در AITech Digital Trade Hub را توضیح می‌دهد.

## مسیرهای فرانت‌اند

- `/projects`: لیست عمومی پروژه‌ها و مناقصه‌ها، همراه با جستجو، فیلتر دسته‌بندی، مهارت مورد نیاز، نوع پروژه، محل اجرا، بودجه و مرتب‌سازی. این صفحه پروژه‌ها را مرحله‌ای و ۹تایی بارگذاری می‌کند تا با زیاد شدن تعداد پروژه‌ها صفحه سنگین نشود.
- `/projects/[id]`: جزئیات پروژه، بودجه، مهارت‌های مورد نیاز، توضیحات، مراحل قرارداد، مستندات عمومی و فرم ارسال پیشنهاد.
- `/dashboard/projects`: داشبورد کاربر برای ثبت پروژه با دسته‌بندی، مهارت‌های مورد نیاز، انتشار پروژه، پذیرش پیشنهاد، مدیریت قرارداد، Milestone، Escrow، Deliverable، Timesheet، مستندات، گفتگو، اختلاف، اختتام و امتیازدهی.
- `/dashboard/projects` - میز کار مجری: مشاهده پیشنهادهای ارسال‌شده، پاسخ به پیشنهاد اصلاح قیمت/زمان کارفرما، ورود به مسیر قرارداد، گفتگو، ثبت تحویل و تایم‌شیت.
- `/dashboard/settings`: مدیریت پروفایل پروژه‌ای کاربر شامل مهارت‌های فردی و رزومه عمومی مجری.
- `/admin/projects`: پنل ادمین برای مدیریت وضعیت پروژه‌ها، مشاهده اختلاف‌ها، ثبت رأی داوری، مسدودسازی پروژه و خاتمه قرارداد فعال.
- `/admin/categories`: پنل ادمین برای ساخت و حذف دسته‌بندی‌های پروژه، خدمت و محصول.
- `/admin/tags`: پنل ادمین برای ساخت و حذف مهارت‌های قابل انتخاب در پروژه‌ها.
- `/company/projects`: مشاهده پروژه‌های یک سازمان توسط مالک یا عضو مجاز سازمان.

## نقش‌ها و دسترسی‌ها

- کارفرما: ثبت پروژه، انتشار، مشاهده پیشنهادها، پذیرش پیشنهاد، ایجاد قرارداد، نگهداری وجه Escrow، تایید Deliverable، درخواست اصلاح، تایید Timesheet، اختتام پروژه و ثبت امتیاز.
- مجری: ارسال پیشنهاد، پیوست رزومه/نمونه‌کار، ثبت Deliverable، ثبت Timesheet، گفتگو با کارفرما و ثبت اختلاف.
- ادمین: مدیریت پروژه‌ها، تغییر وضعیت، مسدودسازی پروژه، خاتمه قرارداد فعال، مدیریت دسته‌بندی‌ها، مدیریت مهارت‌های پروژه، مشاهده اختلاف‌ها و ثبت رأی داوری.
- داور: مشاهده پرونده‌های اختلاف و ثبت رأی داوری.
- سازمان: مشاهده پروژه‌های سازمانی از پنل شرکت.

## جریان اصلی پروژه

1. کارفرما از `/dashboard/projects` پروژه را با دسته‌بندی واقعی، مهارت‌های مورد نیاز، توضیح Rich Text و تاریخ شمسی ثبت می‌کند.
2. پروژه منتشر می‌شود و در `/projects` نمایش داده می‌شود.
3. مجری از `/projects/[id]` پیشنهاد ثبت می‌کند و می‌تواند فایل رزومه یا نمونه‌کار پیوست کند.
4. کارفرما در لیست پیشنهادها می‌تواند پروفایل مجری، رزومه عمومی، مهارت‌ها، تعداد پروژه‌های موفق و نمونه‌کارهای ثبت‌شده او را ببیند.
5. مجری از `/dashboard/projects` در میز کار مجری، پیشنهادهای ارسال‌شده و وضعیت آن‌ها را می‌بیند.
6. اگر کارفرما با قیمت یا زمان مشکل داشته باشد، از پنل پیشنهادها `counter-offer` ثبت می‌کند.
7. مجری پیشنهاد اصلاحی را در میز کار مجری قبول یا رد می‌کند. در صورت قبول، قیمت و زمان نهایی پیشنهاد به عدد توافق‌شده تغییر می‌کند.
8. کارفرما پیشنهاد نهایی را می‌پذیرد؛ قرارداد و Milestone ساخته می‌شود.
9. بعد از قرارداد، مجری از میز کار مجری پروژه را باز می‌کند و گفتگو، ثبت Deliverable و Timesheet را انجام می‌دهد.
10. کارفرما برای هر Milestone وجه را در Escrow نگهداری می‌کند.
11. مجری Deliverable ثبت می‌کند.
12. کارفرما Deliverable را تایید می‌کند یا درخواست اصلاح می‌دهد.
13. در صورت تایید همه مراحل، پروژه مختومه می‌شود و نمونه‌کار مجری ثبت می‌شود.
14. طرفین بعد از اتمام قرارداد می‌توانند امتیاز ثبت کنند.

## مستندات و فایل‌ها

- API آپلود فایل: `POST /api/files`
- فایل‌ها در `wwwroot/uploads/{entityType}` ذخیره می‌شوند.
- مستندات پروژه با `EntityType=Project` به پروژه وصل می‌شوند.
- فایل پیام با `EntityType=ProjectMessage` ذخیره می‌شود.
- مستند اختلاف با `EntityType=ProjectDispute` ذخیره می‌شود.
- رزومه پیشنهاد با `EntityType=ProposalResume` به شناسه Proposal وصل می‌شود.
- رزومه عمومی کاربر با `EntityType=UserResume` به شناسه User وصل می‌شود.
- مهارت‌های مورد نیاز پروژه در `ProjectSkills` و مهارت‌های پروفایل کاربر در `UserSkills` ذخیره می‌شوند.

## گفتگو

- گفتگوی پروژه از `Conversation` و `Message` استفاده می‌کند.
- مسیر API: `GET /api/projects/{id}/conversation`
- ارسال پیام: `POST /api/projects/{id}/messages`
- پیام می‌تواند متن یا فایل داشته باشد.

## اختلاف و داوری

- ثبت اختلاف: `POST /api/projects/{id}/disputes`
- مشاهده اختلاف‌های پروژه: `GET /api/projects/{id}/disputes`
- مشاهده اختلاف‌ها برای ادمین/داور: `GET /api/projects/admin/disputes`
- ثبت مستند اختلاف: `POST /api/projects/disputes/{disputeId}/evidence`
- ثبت رأی داوری: `POST /api/projects/disputes/{disputeId}/decision`

اگر اختلاف برای یک Milestone ثبت شود، Escrowهای Held همان Milestone به `Disputed` تغییر می‌کنند و آزادسازی یا برگشت عادی وجه متوقف می‌شود.

## انواع رأی داوری

- `ReleasePayment`: آزادسازی کامل وجه به مجری
- `RefundPayment`: بازگشت کامل وجه به کارفرما
- `PartialRelease`: تقسیم مبلغ بین کارفرما و مجری
- `ReviseWork`: بازگشت کار به اصلاح بدون اقدام مالی
- `NoAction`: بستن پرونده بدون اقدام مالی

رأی مالی روی `Escrow` و `Transaction` اجرا می‌شود.

## APIهای اصلی پروژه

- `GET /api/projects`
- `GET /api/projects?skillTagId={tagId}`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `POST /api/projects/{id}/publish`
- `GET /api/projects/mine`
- `GET /api/projects/{id}/proposals`
- `POST /api/projects/{id}/proposals`
- `GET /api/projects/my-proposals`
- `POST /api/projects/proposals/{proposalId}/counter-offer`
- `POST /api/projects/proposals/{proposalId}/counter-offer/respond`
- `POST /api/projects/proposals/{proposalId}/accept`
- `POST /api/projects/milestones/{milestoneId}/escrow/hold`
- `POST /api/projects/milestones/{milestoneId}/deliverables`
- `POST /api/projects/deliverables/{deliverableId}/approve`
- `POST /api/projects/deliverables/{deliverableId}/request-revision`
- `POST /api/projects/contracts/{contractId}/timesheets`
- `PATCH /api/projects/timesheets/{timesheetId}/status`
- `POST /api/projects/contracts/{contractId}/complete`
- `GET /api/projects/{id}/activity`
- `GET /api/tags`
- `POST /api/tags`
- `PUT /api/tags/{id}`
- `DELETE /api/tags/{id}`

## وضعیت فعلی

بخش پروژه برای دمو و استفاده عملیاتی اولیه کامل است. کارهای باقی‌مانده بیشتر مربوط به کیفیت است: تست‌های Integration، تست دسترسی نقش‌ها، و polish بیشتر برای مقایسه پیشنهادها و گزارش‌های مدیریتی.

## یادداشت UI

- صفحه عمومی `/projects` بازطراحی بصری شد و کارت‌های پروژه، هدر داخلی، آمار تعداد پروژه‌ها و نمایش مرحله‌ای نتایج دارد.
- بودجه پروژه‌ها در UI عمومی با برچسب فارسی `ریال` نمایش داده می‌شود.
- بارگذاری پروژه‌ها با `pageIndex/pageSize` انجام می‌شود و هنگام رسیدن کاربر به انتهای لیست، صفحه بعدی پروژه‌ها دریافت می‌شود.
