import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { NotificationPreferencesClient } from "@/features/notifications/components/notification-preferences-client";
import { AccountCapabilitiesClient } from "@/features/users/components/account-capabilities-client";

export default function DashboardSettingsPage() {
  return (
    <section>
      <DashboardPageHeader title="تنظیمات" description="پروفایل، امنیت، اعلان‌ها، ترجیحات و قابلیت‌های حساب کاربری." />
      <div className="grid gap-5">
        <NotificationPreferencesClient />
        <AccountCapabilitiesClient />
      </div>
    </section>
  );
}
