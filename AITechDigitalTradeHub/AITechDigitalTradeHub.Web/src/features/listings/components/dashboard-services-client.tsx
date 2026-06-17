"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Send } from "lucide-react";
import { createListing, getMyListings, getPurchases, getSales, publishListing } from "@/features/listings/api/listings-api";
import { ApiRequestError } from "@/lib/api/http-client";
import { useState } from "react";

export function DashboardServicesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const listingsQuery = useQuery({ queryKey: ["listings", "mine"], queryFn: getMyListings });
  const purchasesQuery = useQuery({ queryKey: ["orders", "purchases"], queryFn: getPurchases });
  const salesQuery = useQuery({ queryKey: ["orders", "sales"], queryFn: getSales });

  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      setMessage("خدمت/تجهیز ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت ناموفق بود")
  });

  const publishMutation = useMutation({
    mutationFn: publishListing,
    onSuccess: () => {
      setMessage("منتشر شد.");
      void queryClient.invalidateQueries({ queryKey: ["listings", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "انتشار ناموفق بود")
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const listingType = String(form.get("listingType") || "Service") as "Product" | "Service" | "RentalEquipment";
    createMutation.mutate({
      listingType,
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      categoryId: Number(form.get("categoryId") || 1),
      priceType: "Fixed",
      priceAmount: Number(form.get("priceAmount") || 0),
      currency: "IRR",
      serviceDetails: listingType === "Service" ? { serviceMode: "Online", hasPackages: false } : undefined,
      productDetails: listingType === "Product" ? { condition: "New", stockQty: 1 } : undefined,
      rentalDetails: listingType === "RentalEquipment" ? { billingUnit: "Hour", pricePerUnit: Number(form.get("priceAmount") || 0) } : undefined
    });
    event.currentTarget.reset();
  }

  const listings = listingsQuery.data?.results ?? [];
  const purchases = purchasesQuery.data?.results ?? [];
  const sales = salesQuery.data?.results ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">ثبت خدمت یا تجهیز</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="title" placeholder="عنوان" required />
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" name="description" placeholder="توضیحات" />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-11 rounded-md border border-border px-3 focus-ring" name="listingType">
              <option value="Service">خدمت</option>
              <option value="Product">تجهیز قابل فروش</option>
              <option value="RentalEquipment">اجاره تجهیز</option>
            </select>
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="categoryId" type="number" min="1" placeholder="شناسه دسته" required />
          </div>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="priceAmount" type="number" min="0" placeholder="قیمت" required />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            ثبت
          </button>
        </form>
        {message ? <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-lg font-black">لیستینگ‌های من</h2>
          {listingsQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
          <div className="mt-4 grid gap-3">
            {listings.map((item) => (
              <div key={item.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-1 text-xs text-muted">{String(item.status)} / {String(item.listingType)}</div>
                  </div>
                  <button type="button" onClick={() => publishMutation.mutate(Number(item.id))} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold">
                    <Send className="size-3.5" />
                    انتشار
                  </button>
                </div>
              </div>
            ))}
            {!listingsQuery.isLoading && !listings.length ? <div className="text-sm text-muted">هنوز موردی ثبت نشده است.</div> : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <OrderBox title="خریدهای من" orders={purchases} loading={purchasesQuery.isLoading} />
          <OrderBox title="فروش‌های من" orders={sales} loading={salesQuery.isLoading} />
        </div>
      </section>
    </div>
  );
}

function OrderBox({ title, orders, loading }: { title: string; orders: Array<{ id: string; listingTitle?: string | null; status: string | number; priceAmount: number }>; loading: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="font-black">{title}</h2>
      {loading ? <Loader2 className="mt-5 size-5 animate-spin text-muted" /> : null}
      <div className="mt-3 grid gap-2">
        {orders.map((order) => (
          <div key={order.id} className="rounded-md bg-slate-50 p-3 text-sm">
            <div className="font-bold">{order.listingTitle ?? `سفارش ${order.id}`}</div>
            <div className="mt-1 text-xs text-muted">{String(order.status)} / {order.priceAmount.toLocaleString("fa-IR")}</div>
          </div>
        ))}
        {!loading && !orders.length ? <div className="text-sm text-muted">موردی وجود ندارد.</div> : null}
      </div>
    </div>
  );
}
