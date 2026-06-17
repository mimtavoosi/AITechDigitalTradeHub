import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { AdminUsersClient } from "@/features/users/components/admin-users-client";

export default function AdminUsersPage() {
  return (
    <>
      <DashboardPageHeader title="کاربران" description="مدیریت کاربران، نقش‌ها، دسترسی‌ها و وضعیت اعتبارسنجی." />
      <AdminUsersClient />
    </>
  );
}
