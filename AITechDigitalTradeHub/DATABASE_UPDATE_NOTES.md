# Database Update Notes

این فایل مرجع تغییرات دستی دیتابیس است. هر بار که نقش، Permission، PermissionRole، Seed یا Migration جدید لازم باشد، اینجا اضافه می‌شود تا بعد از تغییر کد بتوانی دیتابیس را هماهنگ کنی.

## روش استفاده

1. ابتدا migrationهای EF را اجرا کن، اگر در همان بخش ذکر شده باشد.
2. بعد اسکریپت‌های `Permissions`، `Roles` و `PermissionRoles` همان بخش را اجرا کن.
3. اگر اسکریپت‌ها `MERGE` هستند، چند بار اجرا شدنشان مشکلی ایجاد نمی‌کند.

---

## 2026-06-17 - Multi Role + User Capability Admin

### EF Migration

برای ایجاد جدول `UserRoles`:

```powershell
dotnet ef database update --project AITechDigitalTradeHub.Data --startup-project AITechDigitalTradeHub.Api
```

Migration مربوط:

```txt
20260617111812_AddMultiRoleAssignments
```

### Roles

```sql
MERGE INTO Roles AS target
USING (VALUES
    (N'User', N'کاربر عادی'),
    (N'Employer', N'کارفرما / پروژه‌گذار'),
    (N'Freelancer', N'مجری پروژه / پروژه‌گیر'),
    (N'ServiceProvider', N'ارائه‌دهنده خدمات یا تجهیزات'),
    (N'Instructor', N'مدرس'),
    (N'OrganizationAdmin', N'مدیر سازمان'),
    (N'Investor', N'سرمایه‌گذار'),
    (N'Fundraiser', N'سرمایه‌پذیر'),
    (N'Support', N'پشتیبان'),
    (N'Arbitrator', N'داور'),
    (N'Admin', N'مدیر'),
    (N'SuperAdmin', N'مدیر کل')
) AS source (Name, Description)
ON target.Name = source.Name
WHEN MATCHED THEN
    UPDATE SET
        Description = source.Description,
        IsActive = 1,
        DeleteDate = NULL,
        UpdateDate = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
    INSERT (Name, Description, CreateDate, UpdateDate, IsActive)
    VALUES (source.Name, source.Description, SYSUTCDATETIME(), SYSUTCDATETIME(), 1);
```

### Permissions

```sql
MERGE INTO Permissions AS target
USING (VALUES
    (N'users.manage', N'مدیریت کاربران و قابلیت‌های حساب'),
    (N'categories.manage', N'مدیریت دسته‌بندی‌ها'),
    (N'listings.create', N'ثبت آگهی و خدمت'),
    (N'listings.manage-own', N'مدیریت آگهی‌های خود'),
    (N'projects.create', N'ثبت پروژه'),
    (N'projects.manage-own', N'مدیریت پروژه‌های خود'),
    (N'projects.proposals.submit', N'ارسال پیشنهاد پروژه'),
    (N'projects.proposals.manage', N'مدیریت پیشنهادهای پروژه'),
    (N'finance.wallet.use', N'استفاده از کیف پول'),
    (N'tickets.manage', N'مدیریت تیکت‌ها'),
    (N'reviews.create', N'ثبت نظر و امتیاز'),
    (N'education.courses.read', N'مشاهده دوره‌ها'),
    (N'education.courses.manage', N'مدیریت دوره‌های آموزشی'),
    (N'education.instructors.manage', N'مدیریت پروفایل مدرس'),
    (N'education.bookings.create', N'رزرو جلسه آموزشی'),
    (N'education.bookings.manage', N'مدیریت رزروهای آموزشی')
) AS source ([Key], [Name])
ON target.[Key] = source.[Key]
WHEN MATCHED THEN
    UPDATE SET
        [Name] = source.[Name],
        [Description] = source.[Name],
        PermissionType = N'Api',
        IsActive = 1,
        DeleteDate = NULL,
        UpdateDate = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
    INSERT ([Key], [Name], PermissionType, [Description], IsActive, CreateDate, UpdateDate)
    VALUES (source.[Key], source.[Name], N'Api', source.[Name], 1, SYSUTCDATETIME(), SYSUTCDATETIME());
```

### PermissionRoles

```sql
DECLARE @RolePermissions TABLE
(
    RoleName NVARCHAR(100) NOT NULL,
    PermissionKey NVARCHAR(200) NOT NULL
);

INSERT INTO @RolePermissions (RoleName, PermissionKey)
VALUES
(N'User', N'listings.create'),
(N'User', N'listings.manage-own'),
(N'User', N'projects.create'),
(N'User', N'projects.manage-own'),
(N'User', N'projects.proposals.submit'),
(N'User', N'projects.proposals.manage'),
(N'User', N'finance.wallet.use'),
(N'User', N'tickets.manage'),
(N'User', N'reviews.create'),
(N'User', N'education.courses.read'),
(N'User', N'education.bookings.create'),

(N'Employer', N'projects.create'),
(N'Employer', N'projects.manage-own'),
(N'Employer', N'projects.proposals.manage'),
(N'Employer', N'finance.wallet.use'),
(N'Employer', N'tickets.manage'),
(N'Employer', N'reviews.create'),
(N'Employer', N'education.courses.read'),
(N'Employer', N'education.bookings.create'),

(N'Freelancer', N'projects.proposals.submit'),
(N'Freelancer', N'finance.wallet.use'),
(N'Freelancer', N'tickets.manage'),
(N'Freelancer', N'reviews.create'),
(N'Freelancer', N'education.courses.read'),
(N'Freelancer', N'education.bookings.create'),

(N'ServiceProvider', N'listings.create'),
(N'ServiceProvider', N'listings.manage-own'),
(N'ServiceProvider', N'finance.wallet.use'),
(N'ServiceProvider', N'tickets.manage'),
(N'ServiceProvider', N'reviews.create'),
(N'ServiceProvider', N'education.courses.read'),
(N'ServiceProvider', N'education.bookings.create'),

(N'Instructor', N'education.courses.read'),
(N'Instructor', N'education.courses.manage'),
(N'Instructor', N'education.instructors.manage'),
(N'Instructor', N'education.bookings.create'),
(N'Instructor', N'education.bookings.manage'),
(N'Instructor', N'finance.wallet.use'),
(N'Instructor', N'tickets.manage'),
(N'Instructor', N'reviews.create'),

(N'OrganizationAdmin', N'listings.create'),
(N'OrganizationAdmin', N'listings.manage-own'),
(N'OrganizationAdmin', N'projects.create'),
(N'OrganizationAdmin', N'projects.manage-own'),
(N'OrganizationAdmin', N'projects.proposals.manage'),
(N'OrganizationAdmin', N'finance.wallet.use'),
(N'OrganizationAdmin', N'tickets.manage'),
(N'OrganizationAdmin', N'reviews.create'),
(N'OrganizationAdmin', N'education.courses.read'),
(N'OrganizationAdmin', N'education.bookings.create'),

(N'Investor', N'finance.wallet.use'),
(N'Investor', N'tickets.manage'),
(N'Investor', N'reviews.create'),
(N'Investor', N'education.courses.read'),
(N'Investor', N'education.bookings.create'),

(N'Fundraiser', N'finance.wallet.use'),
(N'Fundraiser', N'tickets.manage'),
(N'Fundraiser', N'reviews.create'),
(N'Fundraiser', N'education.courses.read'),
(N'Fundraiser', N'education.bookings.create'),

(N'Support', N'tickets.manage'),
(N'Support', N'education.courses.read'),

(N'Arbitrator', N'tickets.manage'),
(N'Arbitrator', N'reviews.create'),
(N'Arbitrator', N'education.courses.read'),

(N'Admin', N'users.manage'),
(N'Admin', N'categories.manage'),
(N'Admin', N'listings.create'),
(N'Admin', N'listings.manage-own'),
(N'Admin', N'projects.create'),
(N'Admin', N'projects.manage-own'),
(N'Admin', N'projects.proposals.submit'),
(N'Admin', N'projects.proposals.manage'),
(N'Admin', N'finance.wallet.use'),
(N'Admin', N'tickets.manage'),
(N'Admin', N'reviews.create'),
(N'Admin', N'education.courses.read'),
(N'Admin', N'education.courses.manage'),
(N'Admin', N'education.instructors.manage'),
(N'Admin', N'education.bookings.create'),
(N'Admin', N'education.bookings.manage'),

(N'SuperAdmin', N'users.manage'),
(N'SuperAdmin', N'categories.manage'),
(N'SuperAdmin', N'listings.create'),
(N'SuperAdmin', N'listings.manage-own'),
(N'SuperAdmin', N'projects.create'),
(N'SuperAdmin', N'projects.manage-own'),
(N'SuperAdmin', N'projects.proposals.submit'),
(N'SuperAdmin', N'projects.proposals.manage'),
(N'SuperAdmin', N'finance.wallet.use'),
(N'SuperAdmin', N'tickets.manage'),
(N'SuperAdmin', N'reviews.create'),
(N'SuperAdmin', N'education.courses.read'),
(N'SuperAdmin', N'education.courses.manage'),
(N'SuperAdmin', N'education.instructors.manage'),
(N'SuperAdmin', N'education.bookings.create'),
(N'SuperAdmin', N'education.bookings.manage');

;WITH SourceRows AS
(
    SELECT DISTINCT
        r.ID AS RoleId,
        p.ID AS PermissionId
    FROM @RolePermissions rp
    INNER JOIN Roles r ON r.Name = rp.RoleName
    INNER JOIN Permissions p ON p.[Key] = rp.PermissionKey
)
MERGE INTO PermissionRoles AS target
USING SourceRows AS source
ON target.RoleId = source.RoleId
AND target.PermissionId = source.PermissionId
WHEN MATCHED THEN
    UPDATE SET
        IsActive = 1,
        OwnerOnly = 0,
        DeleteDate = NULL,
        UpdateDate = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
    INSERT (RoleId, PermissionId, IsActive, OwnerOnly, CreateDate, UpdateDate)
    VALUES (source.RoleId, source.PermissionId, 1, 0, SYSUTCDATETIME(), SYSUTCDATETIME());
```

### Give SuperAdmin To First Admin User

`@UserId` را با شناسه کاربر مدیر خودت عوض کن.

```sql
DECLARE @UserId BIGINT = 1;

MERGE INTO UserRoles AS target
USING (
    SELECT @UserId AS UserId, ID AS RoleId
    FROM Roles
    WHERE Name = N'SuperAdmin'
) AS source
ON target.UserId = source.UserId AND target.RoleId = source.RoleId
WHEN MATCHED THEN
    UPDATE SET
        Status = 2,
        IsActive = 1,
        ApprovedAt = SYSUTCDATETIME(),
        UpdateDate = SYSUTCDATETIME(),
        DeleteDate = NULL
WHEN NOT MATCHED THEN
    INSERT (UserId, RoleId, Status, RequestedAt, ApprovedAt, CreateDate, UpdateDate, IsActive)
    VALUES (source.UserId, source.RoleId, 2, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(), 1);
```

---

## 2026-06-17 - Internal Wallet Payments

این مرحله migration جدید ندارد و از جدول‌های موجود `Wallets`، `Transactions`، `CourseEnrollments` و `TeacherBookings` استفاده می‌کند.

### Backend Behavior

- `GET /api/finance/wallets/me` کیف پول کاربر را برمی‌گرداند یا اگر وجود نداشته باشد می‌سازد.
- `POST /api/finance/wallets/{id}/deposit` فعلا شارژ تستی کیف پول است تا زمان اتصال درگاه.
- `POST /api/finance/course-enrollments/{courseId}/pay` دوره پولی را از کیف پول پرداخت و enrollment را `Active` می‌کند.
- `POST /api/finance/teacher-bookings/{bookingId}/pay` رزرو کلاس را از کیف پول پرداخت و booking را `Confirmed` می‌کند.
- برای پرداخت داخلی، یک transaction منفی برای پرداخت‌کننده و یک transaction مثبت برای مدرس ثبت می‌شود.

### Database Action

نیازی به اسکریپت دیتابیس نیست.

---

## 2026-06-17 - Marketplace Listings and Wallet Orders

این مرحله migration جدید ندارد و از جدول‌های موجود `Listings`، `Orders`، `OrderEvents`، `Wallets` و `Transactions` استفاده می‌کند.

### Backend Behavior

- `GET /api/listings` و `GET /api/listings/{id}` خروجی DTO پایدار برای فرانت می‌دهند.
- `GET /api/listings/mine`، `POST /api/listings` و `POST /api/listings/{id}/publish` برای پنل خدمات‌دهنده استفاده می‌شوند.
- `POST /api/orders` سفارش را با وضعیت `PendingPayment` می‌سازد.
- `POST /api/orders/{id}/pay` سفارش را از کیف پول خریدار پرداخت می‌کند، برای فروشنده transaction مثبت ثبت می‌کند و سفارش را `Paid` می‌کند.

### Database Action

نیازی به اسکریپت دیتابیس نیست.

---

## 2026-06-17 - Admin Marketplace Moderation

این مرحله migration جدید ندارد و فقط از وضعیت‌های فعلی `ListingStatus` و `OrderStatus` استفاده می‌کند.

### Backend Behavior

- `GET /api/listings/admin` لیستینگ‌ها را برای ادمین با فیلتر وضعیت، نوع، دسته‌بندی، قیمت و متن جستجو برمی‌گرداند.
- `PATCH /api/listings/admin/{id}/status` وضعیت لیستینگ را توسط `Admin` یا `SuperAdmin` تغییر می‌دهد.
- `GET /api/orders/admin` سفارش‌ها را برای ادمین با فیلتر وضعیت، لیستینگ و متن جستجو برمی‌گرداند.
- `PATCH /api/orders/admin/{id}/status` وضعیت سفارش را تغییر می‌دهد و یک `OrderEvent` مدیریتی ثبت می‌کند.
- صفحه `/admin/listings` در فرانت به این APIها وصل شده است.

### Database Action

نیازی به اسکریپت دیتابیس نیست.
