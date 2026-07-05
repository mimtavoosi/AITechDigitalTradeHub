import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { LazyDashboardEducationClient } from "@/components/system/lazy-route-clients";

export default function DashboardCoursesPage() {
  return (
    <section>
      <DashboardPageHeader title="آموزش" description="مدیریت دوره‌های مدرس، ثبت سرفصل، انتشار دوره و مشاهده ثبت‌نام‌ها." />
      <LazyDashboardEducationClient />
    </section>
  );
}
