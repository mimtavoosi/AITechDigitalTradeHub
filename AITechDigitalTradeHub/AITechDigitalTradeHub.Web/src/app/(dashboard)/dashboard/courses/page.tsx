import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { DashboardEducationClient } from "@/features/education/components/dashboard-education-client";

export default function DashboardCoursesPage() {
  return (
    <section>
      <DashboardPageHeader title="آموزش" description="مدیریت دوره‌های مدرس، ثبت سرفصل، انتشار دوره و مشاهده ثبت‌نام‌ها." />
      <DashboardEducationClient />
    </section>
  );
}
