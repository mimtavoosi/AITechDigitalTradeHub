import { LazyAdminInvestmentsClient } from "@/components/system/lazy-route-clients";
import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function AdminInvestmentsPage() {
  return (
    <>
      <DashboardPageHeader title="سرمایه‌گذاری‌ها" description="بررسی فرصت‌های جذب سرمایه، وضعیت انتشار، سرمایه جذب‌شده و گزارش‌های فرصت‌ها." />
      <LazyAdminInvestmentsClient />
    </>
  );
}
