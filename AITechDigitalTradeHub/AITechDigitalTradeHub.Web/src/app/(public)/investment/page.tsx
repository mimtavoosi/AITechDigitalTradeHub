import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { InvestmentListClient } from "@/features/investments/components/investment-list-client";

export const metadata: Metadata = {
  title: "فرصت‌های سرمایه‌گذاری",
  description: "فرصت‌های سرمایه‌گذاری و سرمایه‌پذیری در پروژه‌ها و استارتاپ‌های هوش مصنوعی."
};

export default function InvestmentPage() {
  return (
    <PageShell title="فرصت‌های سرمایه‌گذاری" description="پروفایل‌های آماده سرمایه‌گذاری، مستندات Pitch، گزارش بازده و وضعیت جذب سرمایه از API سرمایه‌گذاری خوانده می‌شود.">
      <InvestmentListClient />
    </PageShell>
  );
}
