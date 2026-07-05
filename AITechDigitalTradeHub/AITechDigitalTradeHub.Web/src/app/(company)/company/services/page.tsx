import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CompanyServicesPage() {
  return (
    <section>
      <DashboardPageHeader title="خدمات شرکت" description="سرویس‌های فعال، تجهیزات، اشتراک‌ها و درخواست‌های پشتیبانی سازمانی." />
      <EmptyState title="مرکز خدمات شرکتی آماده است" description="در ادامه می‌توان سرویس‌های خریداری‌شده و تمدیدها را از بک‌اند اینجا نمایش داد." />
    </section>
  );
}
