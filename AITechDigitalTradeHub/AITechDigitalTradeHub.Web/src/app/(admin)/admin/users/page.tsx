import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { LazyAdminAccessClient, LazyAdminUsersClient } from "@/components/system/lazy-route-clients";

export default function AdminUsersPage() {
  return (
    <>
      <DashboardPageHeader title="کاربران" description="مدیریت کاربران، نقش‌ها، دسترسی‌ها و وضعیت اعتبارسنجی." />
      <LazyAdminUsersClient />
      <LazyAdminAccessClient />
    </>
  );
}
