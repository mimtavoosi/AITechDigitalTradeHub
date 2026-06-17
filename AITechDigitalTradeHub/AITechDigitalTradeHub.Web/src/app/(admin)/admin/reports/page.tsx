import { EmptyState } from "@/components/ui/empty-state";
import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function AdminReportsPage() {
  return (
    <>
      <DashboardPageHeader title="گزارش‌ها" description="گزارش‌های مدیریتی، درآمد پلتفرم، عملکرد پروژه‌ها و بازده سرمایه." />
      <EmptyState title="گزارشی بارگذاری نشده" description="بعد از اتصال API تحلیل داده و BI، گزارش‌های کلان مدیریتی اینجا نمایش داده می‌شوند." />
    </>
  );
}
