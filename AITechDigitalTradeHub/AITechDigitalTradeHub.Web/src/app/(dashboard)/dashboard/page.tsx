import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function DashboardPage() {
  const cards = [
    { label: "پروژه‌های فعال", value: "۰", hint: "در انتظار اتصال API" },
    { label: "موجودی کیف پول", value: "۰ تومان", hint: "قابل برداشت و در تعهد" },
    { label: "تیکت‌های باز", value: "۰", hint: "پاسخ‌گویی پشتیبانی" }
  ];

  return (
    <section>
      <DashboardPageHeader title="نمای کلی" description="خلاصه فعالیت کاربر، پروژه‌ها، خدمات، سفارش‌ها و وضعیت مالی." />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="surface rounded-lg p-5">
            <div className="text-sm text-muted">{item.label}</div>
            <div className="mt-3 text-2xl font-bold">{item.value}</div>
            <div className="mt-2 text-xs text-muted">{item.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
