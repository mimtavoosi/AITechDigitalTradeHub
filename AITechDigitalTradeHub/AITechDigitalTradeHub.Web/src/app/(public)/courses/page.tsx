import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { CourseListClient } from "@/features/education/components/course-list-client";

export const metadata: Metadata = {
  title: "آموزش هوش مصنوعی",
  description: "دوره‌ها، کلاس‌ها و محتوای آموزشی هوش مصنوعی."
};

export default function CoursesPage() {
  return (
    <PageShell title="آموزش هوش مصنوعی" description="دوره‌ها، مدرس‌ها، کلاس زنده، محتوای ضبط‌شده و مسیر پیشرفت آموزشی کاربران.">
      <CourseListClient />
    </PageShell>
  );
}
