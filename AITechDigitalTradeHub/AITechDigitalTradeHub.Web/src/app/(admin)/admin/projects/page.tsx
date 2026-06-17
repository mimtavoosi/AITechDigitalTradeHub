import { EmptyState } from "@/components/ui/empty-state";
import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function AdminProjectsPage() {
  return (
    <>
      <DashboardPageHeader title="پروژه‌ها" description="نظارت بر مناقصه‌ها، قراردادها، مراحل پروژه و اختلافات." />
      <EmptyState title="پروژه‌ای بارگذاری نشده" description="بعد از اتصال API ادمین پروژه، وضعیت پروژه‌ها و قراردادها اینجا نمایش داده می‌شود." />
    </>
  );
}
