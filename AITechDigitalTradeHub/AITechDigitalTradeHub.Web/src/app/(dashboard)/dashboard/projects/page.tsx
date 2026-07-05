import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { LazyDashboardProjectsClient } from "@/components/system/lazy-route-clients";

export default function DashboardProjectsPage() {
  return (
    <>
      <DashboardPageHeader title="پروژه‌ها" description="مدیریت پروژه‌های تعریف‌شده، پیشنهادها، قراردادها و مراحل پرداخت." />
      <LazyDashboardProjectsClient />
    </>
  );
}
