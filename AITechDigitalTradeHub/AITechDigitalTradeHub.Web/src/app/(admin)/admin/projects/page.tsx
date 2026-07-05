import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { LazyAdminProjectsClient } from "@/components/system/lazy-route-clients";

export default function AdminProjectsPage() {
  return (
    <>
      <DashboardPageHeader title="پروژه‌ها" description="نظارت بر مناقصه‌ها، قراردادها، مراحل پروژه و اختلافات." />
      <LazyAdminProjectsClient />
    </>
  );
}
