import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { AdminEducationClient } from "@/features/education/components/admin-education-client";

export default function AdminEducationPage() {
  return (
    <>
      <DashboardPageHeader title="آموزش" description="مدیریت دوره‌ها، انتشار محتوا، رزروهای کلاس و کیفیت آموزشی." />
      <AdminEducationClient />
    </>
  );
}
