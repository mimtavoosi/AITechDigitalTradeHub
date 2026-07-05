import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { ListingListClient } from "@/features/listings/components/listing-list-client";

export const metadata: Metadata = {
  title: "خدمات و تجهیزات AI",
  description: "جستجو و مقایسه خدمات تخصصی هوش مصنوعی، تجهیزات، زیرساخت و ظرفیت‌های قابل سفارش در آی نت."
};

export default function ServicesPage() {
  return (
    <PageShell title="خدمات و تجهیزات AI" description="لیست خدمات، تجهیزات، زیرساخت و ظرفیت‌های قابل سفارش در شبکه تخصصی هوش مصنوعی آی نت. برای مشاهده ساختار همه حوزه‌ها از صفحه حوزه‌های تخصصی استفاده کنید.">
      <ListingListClient />
    </PageShell>
  );
}
