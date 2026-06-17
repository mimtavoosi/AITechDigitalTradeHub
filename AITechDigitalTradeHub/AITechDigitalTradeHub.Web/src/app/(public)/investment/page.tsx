import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "فرصت‌های سرمایه‌گذاری",
  description: "فرصت‌های سرمایه‌گذاری و سرمایه‌پذیری در پروژه‌ها و استارتاپ‌های هوش مصنوعی."
};

export default function InvestmentPage() {
  return (
    <PageShell title="فرصت‌های سرمایه‌گذاری" description="پروفایل‌های آماده سرمایه‌گذاری، مستندات Pitch، گزارش بازده و وضعیت جذب سرمایه در این بخش قرار می‌گیرد.">
      <EmptyState title="هنوز فرصتی متصل نشده" description="بعد از پیاده‌سازی ماژول سرمایه‌گذاری در بک‌اند، فرصت‌ها و گزارش‌های ROI از API خوانده می‌شوند." />
    </PageShell>
  );
}
