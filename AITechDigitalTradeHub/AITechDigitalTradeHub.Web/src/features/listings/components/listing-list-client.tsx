"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageSearch } from "lucide-react";
import { getListings } from "@/features/listings/api/listings-api";
import { queryKeys } from "@/lib/query-keys";

export function ListingListClient() {
  const listingsQuery = useQuery({ queryKey: queryKeys.listings.publicList(), queryFn: getListings });
  const listings = listingsQuery.data?.results ?? [];

  if (listingsQuery.isLoading) {
    return <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white"><Loader2 className="size-6 animate-spin text-muted" /></div>;
  }

  if (!listings.length) {
    return (
      <div className="rounded-lg border border-border bg-white px-6 py-12 text-center">
        <PackageSearch className="mx-auto size-9 text-muted" />
        <h2 className="mt-4 text-lg font-black">هنوز خدمت یا تجهیزی منتشر نشده است</h2>
        <p className="mt-2 text-sm text-muted">بعد از انتشار توسط ارائه‌دهندگان، این صفحه با داده واقعی پر می‌شود.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((item) => (
        <Link key={item.id} href={`/services/${item.id}`} className="rounded-lg border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{String(item.listingType)}</span>
            <span className="text-xs text-muted">{item.categoryName ?? "AI"}</span>
          </div>
          <h2 className="mt-4 line-clamp-2 text-lg font-black leading-8">{item.title}</h2>
          {item.description ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{item.description}</p> : null}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-black">{formatPrice(item.priceAmount ?? item.priceMin, item.currency)}</span>
            <span className="text-xs text-muted">{item.ownerName ?? `کاربر ${item.ownerUserId}`}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function formatPrice(value: number | null | undefined, currency: string) {
  return value && value > 0 ? `${value.toLocaleString("fa-IR")} ${currency}` : "توافقی";
}
