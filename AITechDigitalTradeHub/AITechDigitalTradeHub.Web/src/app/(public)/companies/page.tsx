import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "شرکت‌ها",
  description: "پروفایل شرکت‌ها و تیم‌های فعال در حوزه هوش مصنوعی."
};

export default function CompaniesPage() {
  return (
    <PageShell title="شرکت‌ها و سازمان‌ها" description="پروفایل شرکت‌های تاییدشده، تیم‌ها، خدمات سازمانی و پروژه‌های انجام‌شده.">
      <EmptyState title="هنوز شرکتی متصل نشده" description="بعد از اتصال API سازمان‌ها، پروفایل شرکت‌ها و تیم‌های تاییدشده نمایش داده می‌شوند." />
    </PageShell>
  );
}
