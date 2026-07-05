import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { OrganizationMembersClient } from "@/features/organizations/components/organization-members-client";

export default function CompanyMembersPage() {
  return (
    <section>
      <DashboardPageHeader title="اعضای سازمان" description="مدیریت اعضا و نقش‌های شرکت، دانشگاه، پژوهشگاه یا سایر سازمان‌ها." />
      <OrganizationMembersClient />
    </section>
  );
}
