import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { DashboardServicesClient } from "@/features/listings/components/dashboard-services-client";

export default function DashboardServicesPage() {
  return (
    <section>
      <DashboardPageHeader title="خدمات" description="مدیریت خدمات، تجهیزات، پکیج‌ها و سفارش‌های مارکت‌پلیس." />
      <DashboardServicesClient />
    </section>
  );
}
