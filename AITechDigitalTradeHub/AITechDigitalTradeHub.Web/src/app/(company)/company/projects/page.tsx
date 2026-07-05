import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { CompanyProjectsClient } from "@/features/projects/components/company-projects-client";

export default function CompanyProjectsPage() {
  return (
    <section>
      <DashboardPageHeader title="پروژه‌های سازمان" description="پروژه‌های ثبت‌شده، وضعیت مذاکره، قراردادها و پیشرفت اجرایی سازمان." />
      <CompanyProjectsClient />
    </section>
  );
}
