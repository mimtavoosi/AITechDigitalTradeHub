import { EmptyState } from "@/components/ui/empty-state";
import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function AdminFinancePage() {
  return (
    <>
      <DashboardPageHeader title="مالی" description="تراکنش‌ها، برداشت‌ها، مبالغ امانی و کارمزد پلتفرم." />
      <EmptyState title="داده مالی بارگذاری نشده" description="بعد از اتصال API مالی ادمین، گزارش تراکنش‌ها و Escrow در این بخش قرار می‌گیرد." />
    </>
  );
}
