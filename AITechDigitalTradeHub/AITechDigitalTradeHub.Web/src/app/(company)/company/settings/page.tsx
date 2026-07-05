import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { OrganizationSettingsClient } from "@/features/organizations/components/organization-settings-client";

export default function CompanySettingsPage() {
  return (
    <section>
      <DashboardPageHeader title="تنظیمات سازمان" description="ثبت و ویرایش شرکت، دانشگاه، پژوهشگاه، استارتاپ یا سایر انواع سازمان." />
      <OrganizationSettingsClient />
    </section>
  );
}
