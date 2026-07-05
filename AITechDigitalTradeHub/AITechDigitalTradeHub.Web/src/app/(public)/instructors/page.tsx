import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { InstructorListClient } from "@/features/education/components/instructor-list-client";

export const metadata: Metadata = {
  title: "مدرس‌های هوش مصنوعی",
  description: "فهرست مدرس‌های تاییدشده، دوره‌ها و زمان‌های قابل رزرو."
};

export default function InstructorsPage() {
  return (
    <PageShell title="مدرس‌های هوش مصنوعی" description="مدرس‌های تاییدشده، کلاس خصوصی، دوره‌های منتشرشده و زمان‌های قابل رزرو.">
      <InstructorListClient />
    </PageShell>
  );
}
