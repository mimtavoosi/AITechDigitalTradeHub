import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { LazyAdminReportsClient } from "@/components/system/lazy-route-clients";

export default function AdminReportsPage() {
  return (
    <>
      <DashboardPageHeader title="گزارش‌ها" description="گزارش‌های مدیریتی، درآمد پلتفرم، عملکرد پروژه‌ها و بازده سرمایه." />
      <LazyAdminReportsClient />
    </>
  );
}
