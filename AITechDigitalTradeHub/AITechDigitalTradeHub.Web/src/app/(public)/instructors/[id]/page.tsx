import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { InstructorDetailClient } from "@/features/education/components/instructor-detail-client";

export const metadata: Metadata = {
  title: "پروفایل مدرس",
  description: "رزومه آموزشی، دوره‌ها و زمان‌های قابل رزرو مدرس."
};

export default async function InstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructorUserId = Number(id);

  return (
    <PageShell title="پروفایل مدرس" description="رزومه آموزشی، امتیازها، دوره‌ها و زمان‌های قابل رزرو مدرس.">
      <InstructorDetailClient instructorUserId={instructorUserId} />
    </PageShell>
  );
}
