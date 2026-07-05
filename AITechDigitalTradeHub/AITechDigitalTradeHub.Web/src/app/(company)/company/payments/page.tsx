import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CompanyPaymentsPage() {
  return (
    <section>
      <DashboardPageHeader title="پرداخت‌های سازمان" description="درخواست‌های برداشت، تسویه اعضا، فاکتورها و تاییدهای مالی." />
      <EmptyState title="گردش مالی سازمان اینجا مدیریت می‌شود" description="این صفحه برای صف تایید پرداخت، فاکتورها و وضعیت تسویه آماده شده است." />
    </section>
  );
}
