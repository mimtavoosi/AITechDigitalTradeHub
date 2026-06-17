import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { ListingDetailClient } from "@/features/listings/components/listing-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `خدمت ${slug}`,
    description: "صفحه جزئیات خدمت هوش مصنوعی."
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listingId = Number(slug);

  return (
    <PageShell title={`خدمت: ${slug}`} description="جزئیات خدمت، پکیج‌ها، پرسش و پاسخ، امتیازها و پروفایل ارائه‌دهنده در این صفحه نمایش داده می‌شود.">
      {Number.isFinite(listingId) && listingId > 0 ? (
        <ListingDetailClient listingId={listingId} />
      ) : (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">شناسه خدمت معتبر نیست.</div>
      )}
    </PageShell>
  );
}
