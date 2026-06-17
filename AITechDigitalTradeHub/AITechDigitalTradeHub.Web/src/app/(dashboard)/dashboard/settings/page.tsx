import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { AccountCapabilitiesClient } from "@/features/users/components/account-capabilities-client";

export default function DashboardSettingsPage() {
  return (
    <section>
      <DashboardPageHeader title="تنظیمات" description="پروفایل، امنیت، اعلان‌ها، ترجیحات و قابلیت‌های حساب کاربری." />
      <AccountCapabilitiesClient />
    </section>
  );
}
