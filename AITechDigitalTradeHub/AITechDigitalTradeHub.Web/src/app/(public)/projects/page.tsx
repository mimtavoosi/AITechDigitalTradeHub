import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { ProjectListClient } from "@/features/projects/components/project-list-client";

export const metadata: Metadata = {
  title: "پروژه‌ها و مناقصه‌ها",
  description: "مشاهده پروژه‌ها و فرصت‌های اجرای هوش مصنوعی."
};

export default function ProjectsPage() {
  return (
    <PageShell title="پروژه‌ها و مناقصه‌ها" description="فرصت‌های عمومی پروژه با بودجه، وضعیت، مهارت‌های مورد نیاز و مهلت ارسال پیشنهاد نمایش داده می‌شود.">
      <ProjectListClient />
    </PageShell>
  );
}
