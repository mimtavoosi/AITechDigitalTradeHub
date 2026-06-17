# Frontend Components Guide

این فایل مرجع کامپوننت‌های داخلی فرانت است. هدف این است که صفحه‌های جدید با قطعات تکرارشونده ساخته شوند و هر ماژول دوباره جدول، ورودی، دراپ‌داون یا تاریخ شمسی خودش را ننویسد.

## مسیر کامپوننت‌های عمومی

```txt
AITechDigitalTradeHub.Web/src/components/ui
```

## کامپوننت‌های فعلی

### DataGrid

مسیر:

```txt
src/components/ui/data-grid.tsx
```

قابلیت‌ها:

- جستجوی داخلی
- مرتب‌سازی ستونی
- مخفی/نمایش کردن ستون‌ها
- حالت فشرده و عادی
- انتخاب ردیف‌ها
- pagination داخلی
- نمایش card در موبایل
- ستون عملیات برای actionهای صفحه
- خروجی CSV
- خروجی Excel ساده
- چاپ داده‌های فیلترشده یا انتخاب‌شده
- فعال/غیرفعال کردن قابلیت‌ها از داخل کد

نمونه:

```tsx
<DataGrid
  title="مدیریت کاربران"
  items={users}
  columns={columns}
  getRowId={(item) => item.id}
  loading={isLoading}
  enableSelection
  enableColumnVisibility
  enableDensityToggle
  enableExport
  enablePrint
  exportFileName="users"
  printTitle="گزارش کاربران"
  renderRowActions={(item) => <button>ویرایش {item.id}</button>}
/>
```

برای خاموش کردن هر قابلیت:

```tsx
<DataGrid
  items={items}
  columns={columns}
  getRowId={(item) => item.id}
  searchable={false}
  enableSelection={false}
  enableColumnVisibility={false}
  enableDensityToggle={false}
  enableExport={false}
  enablePrint={false}
/>
```

برای عملیات داخل هر ردیف:

```tsx
renderRowActions={(item) => (
  <button onClick={() => editItem(item)}>ویرایش</button>
)}
```

برای نمایش سفارشی داخل یک ستون و مقدار مناسب خروجی:

```tsx
const columns = [
  {
    key: "status",
    title: "وضعیت",
    render: (item) => <StatusPill value={item.status} />,
    exportValue: (item) => statusLabels[item.status],
    sortable: true,
    sortValue: (item) => item.status,
    searchValue: (item) => statusLabels[item.status]
  }
];
```

### TextField / TextAreaField

مسیر:

```txt
src/components/ui/form-field.tsx
```

برای ورودی‌های متنی استاندارد با label، hint، error و icon.

### SearchableSelect

مسیر:

```txt
src/components/ui/searchable-select.tsx
```

برای دراپ‌داون جستجودار. مناسب فیلترها، انتخاب نقش، دسته‌بندی، وضعیت و شهر.

### MultiSelect

مسیر:

```txt
src/components/ui/searchable-select.tsx
```

برای انتخاب چند گزینه با جستجو، tagهای انتخاب‌شده، انتخاب همه و پاک کردن.

نمونه:

```tsx
<MultiSelect
  label="مهارت‌ها"
  options={skillOptions}
  value={selectedSkillIds}
  onChange={setSelectedSkillIds}
/>
```

### PersianDateTimeInput

مسیر:

```txt
src/components/ui/persian-date-time-input.tsx
```

ورودی تاریخ/ساعت شمسی با popup تقویم داخلی، دکمه امروز/اکنون، پاک کردن و انتخاب ساعت.

### PersianCalendar

مسیر:

```txt
src/components/ui/persian-calendar.tsx
```

تقویم شمسی ماهانه مستقل با تبدیل داخلی جلالی/میلادی. برای استفاده مستقیم در فیلترها، modalها یا date rangeهای آینده.

### RichTextEditor

مسیر:

```txt
src/components/ui/rich-text-editor.tsx
```

ویرایشگر HTML سبک بدون dependency خارجی. قابلیت‌ها:

- Bold / Italic / Underline / Strike
- لیست عددی و بولت
- Heading و Paragraph
- تراز راست، وسط، چپ
- رنگ متن و highlight
- نقل‌قول و code block
- لینک امن
- آپلود/پیست تصویر با فشرده‌سازی base64
- Undo / Redo

نمونه:

```tsx
<RichTextEditor
  label="توضیحات"
  value={descriptionHtml}
  onChange={setDescriptionHtml}
/>
```

## قاعده استفاده

- جدول‌های admin و dashboard باید از `DataGrid` استفاده کنند مگر اینکه layout خاصی نیاز باشد.
- فرم‌های جدید باید از `TextField`، `TextAreaField` و `SearchableSelect` شروع شوند.
- اگر کامپوننت جدید عمومی ساخته شد، اول در `src/components/ui` قرار بگیرد، بعد در featureها مصرف شود.
- اگر کامپوننت فقط مخصوص یک دامنه است، داخل همان `src/features/{feature}/components` بماند.
