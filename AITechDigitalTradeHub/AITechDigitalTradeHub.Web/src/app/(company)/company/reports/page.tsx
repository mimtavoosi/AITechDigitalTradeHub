import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CompanyReportsPage() {
  return (
    <section>
      <DashboardPageHeader title="گزارش‌های شرکت" description="گزارش‌های مالی، عملکرد پروژه‌ها، مصرف خدمات و فعالیت اعضا." />
      <EmptyState title="گزارش‌های مدیریتی در این بخش قرار می‌گیرد" description="بعد از اتصال داده واقعی، خروجی‌های قابل دانلود و نمودارهای دوره‌ای اضافه می‌شوند." />
    </section>
  );
}
