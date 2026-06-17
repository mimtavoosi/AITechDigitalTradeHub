import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { ListingListClient } from "@/features/listings/components/listing-list-client";

export const metadata: Metadata = {
  title: "خدمات و تجهیزات هوش مصنوعی",
  description: "جستجو و مقایسه خدمات، تجهیزات و زیرساخت‌های هوش مصنوعی."
};

export default function ServicesPage() {
  return (
    <PageShell title="خدمات و تجهیزات هوش مصنوعی" description="لیست خدمات، فروش تجهیزات، اجاره سرور GPU و زیرساخت‌های پردازشی اینجا با رندر مناسب سئو نمایش داده می‌شود.">
      <ListingListClient />
    </PageShell>
  );
}
