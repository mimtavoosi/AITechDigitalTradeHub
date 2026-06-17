import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { CourseDetailClient } from "@/features/education/components/course-detail-client";

export const metadata: Metadata = {
  title: "جزئیات دوره",
  description: "مشاهده سرفصل‌ها، مدرس و ثبت‌نام در دوره آموزشی."
};

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const courseId = Number(slug);

  return (
    <PageShell title="جزئیات دوره" description="اطلاعات دوره، سرفصل‌ها، مدرس و ثبت‌نام.">
      {Number.isFinite(courseId) && courseId > 0 ? (
        <CourseDetailClient courseId={courseId} />
      ) : (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">شناسه دوره معتبر نیست.</div>
      )}
    </PageShell>
  );
}
