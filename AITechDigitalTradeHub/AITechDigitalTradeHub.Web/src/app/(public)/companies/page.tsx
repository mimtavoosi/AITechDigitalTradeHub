import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { OrganizationListClient } from "@/features/organizations/components/organization-list-client";

export const metadata: Metadata = {
  title: "سازمان‌ها",
  description: "پروفایل شرکت‌ها، دانشگاه‌ها، پژوهشگاه‌ها و سایر سازمان‌های فعال در حوزه هوش مصنوعی."
};

export default function CompaniesPage() {
  return (
    <PageShell title="سازمان‌ها" description="شرکت‌ها، دانشگاه‌ها، پژوهشگاه‌ها، استارتاپ‌ها و نهادهای تاییدشده اکوسیستم هوش مصنوعی.">
      <OrganizationListClient />
    </PageShell>
  );
}
