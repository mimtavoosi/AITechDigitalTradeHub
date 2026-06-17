import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { DashboardProjectsClient } from "@/features/projects/components/dashboard-projects-client";

export default function DashboardProjectsPage() {
  return (
    <>
      <DashboardPageHeader title="پروژه‌ها" description="مدیریت پروژه‌های تعریف‌شده، پیشنهادها، قراردادها و مراحل پرداخت." />
      <DashboardProjectsClient />
    </>
  );
}
