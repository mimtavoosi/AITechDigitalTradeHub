"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { createOrder, getListing, payOrder } from "@/features/listings/api/listings-api";
import { getMyWallet } from "@/features/finance/api/finance-api";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";
import { AuthTrigger } from "@/features/auth/components/auth-trigger";
import { useState } from "react";

export function ListingDetailClient({ listingId }: { listingId: number }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const [message, setMessage] = useState("");

  const listingQuery = useQuery({ queryKey: ["listings", listingId], queryFn: () => getListing(listingId) });
  const walletQuery = useQuery({ queryKey: ["finance", "wallet", "me"], queryFn: getMyWallet, enabled: isAuthenticated });
  const walletId = Number(walletQuery.data?.result?.id ?? walletQuery.data?.result?.iD ?? 0);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const listing = listingQuery.data?.result;
      if (!listing) throw new Error("Listing not loaded");
      const createResult = await createOrder({
        listingId,
        qty: 1,
        priceAmount: listing.priceAmount ?? listing.priceMin ?? undefined
      });
      if (!createResult.status || !createResult.id) {
        throw new ApiRequestError(createResult.errorMessage ?? "ثبت سفارش ناموفق بود", 400);
      }
      return payOrder(createResult.id, walletId);
    },
    onSuccess: () => {
      setMessage("سفارش ثبت و از کیف پول پرداخت شد.");
      void queryClient.invalidateQueries({ queryKey: ["finance", "wallet"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت یا پرداخت سفارش ناموفق بود")
  });

  if (listingQuery.isLoading) {
    return <div className="grid min-h-72 place-items-center rounded-lg border border-border bg-white"><Loader2 className="size-6 animate-spin text-muted" /></div>;
  }

  const listing = listingQuery.data?.result;
  if (!listing) {
    return <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-muted">خدمت یا تجهیز پیدا نشد.</div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{listing.categoryName ?? "Marketplace"}</span>
          <span>•</span>
          <span>{String(listing.listingType)}</span>
          <span>•</span>
          <span>{String(listing.status)}</span>
        </div>
        <h1 className="mt-4 text-2xl font-black leading-10 md:text-3xl">{listing.title}</h1>
        {listing.description ? <p className="mt-4 leading-8 text-muted">{listing.description}</p> : null}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
          <div className="font-black">{formatPrice(listing.priceAmount ?? listing.priceMin, listing.currency)}</div>
          <div className="mt-2 text-muted">ارائه‌دهنده: {listing.ownerName ?? `کاربر ${listing.ownerUserId}`}</div>
        </div>
        {listing.serviceDetails?.packages?.length ? (
          <div className="mt-7">
            <h2 className="font-black">پکیج‌های خدمت</h2>
            <div className="mt-3 grid gap-2">
              {listing.serviceDetails.packages.map((pack) => (
                <div key={pack.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{pack.title}</span>
                    <span>{pack.priceAmount.toLocaleString("fa-IR")} {listing.currency}</span>
                  </div>
                  {pack.description ? <p className="mt-2 text-xs leading-6 text-muted">{pack.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="rounded-lg border border-border bg-white p-5">
        <div className="text-sm text-muted">پرداخت از کیف پول</div>
        <div className="mt-2 text-2xl font-black">{formatPrice(listing.priceAmount ?? listing.priceMin, listing.currency)}</div>
        {isAuthenticated ? (
          <button
            type="button"
            disabled={orderMutation.isPending || walletId <= 0}
            onClick={() => orderMutation.mutate()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            {orderMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
            سفارش و پرداخت
          </button>
        ) : (
          <div className="mt-5">
            <AuthTrigger mode="login" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-white">
              ورود برای سفارش
            </AuthTrigger>
          </div>
        )}
        {message ? <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-muted"><Check className="ml-2 inline size-4 text-primary" />{message}</div> : null}
      </aside>
    </div>
  );
}

function formatPrice(value: number | null | undefined, currency: string) {
  return value && value > 0 ? `${value.toLocaleString("fa-IR")} ${currency}` : "توافقی";
}
