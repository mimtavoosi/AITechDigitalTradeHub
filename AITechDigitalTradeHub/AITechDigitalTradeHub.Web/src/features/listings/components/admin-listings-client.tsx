"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PackageCheck, ShieldAlert } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { getAdminListings, getAdminOrders, updateAdminListingStatus, updateAdminOrderStatus } from "@/features/listings/api/listings-api";
import type { ListingSummary, OrderSummary } from "@/features/listings/types";
import { ApiRequestError } from "@/lib/api/http-client";

const listingStatuses = ["Draft", "Published", "Paused", "Expired", "Sold"] as const;
const orderStatuses = ["PendingPayment", "Paid", "InProgress", "Delivered", "Completed", "Cancelled", "Refunded"] as const;

const listingStatusLabels: Record<string, string> = {
  Draft: "پیش‌نویس",
  Published: "منتشر شده",
  Paused: "متوقف",
  Expired: "منقضی",
  Sold: "فروخته شده"
};

const orderStatusLabels: Record<string, string> = {
  PendingPayment: "در انتظار پرداخت",
  Paid: "پرداخت شده",
  InProgress: "در حال انجام",
  Delivered: "تحویل شده",
  Completed: "تکمیل شده",
  Cancelled: "لغو شده",
  Refunded: "مرجوع شده"
};

const listingStatusOptions: Array<SelectOption<string>> = listingStatuses.map((status) => ({ value: status, label: listingStatusLabels[status] }));
const orderStatusOptions: Array<SelectOption<string>> = orderStatuses.map((status) => ({ value: status, label: orderStatusLabels[status] }));

export function AdminListingsClient() {
  const queryClient = useQueryClient();
  const [listingStatus, setListingStatus] = useState<string | "">("");
  const [orderStatus, setOrderStatus] = useState<string | "">("");
  const [message, setMessage] = useState("");

  const listingsQuery = useQuery({
    queryKey: ["admin", "listings", listingStatus],
    queryFn: () => getAdminListings({ status: listingStatus, pageSize: 100 })
  });

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", orderStatus],
    queryFn: () => getAdminOrders({ status: orderStatus, pageSize: 100 })
  });

  const listingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateAdminListingStatus(id, status),
    onSuccess: () => {
      setMessage("وضعیت لیستینگ به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی لیستینگ ناموفق بود")
  });

  const orderMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateAdminOrderStatus(id, status),
    onSuccess: () => {
      setMessage("وضعیت سفارش به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی سفارش ناموفق بود")
  });

  const listings = useMemo(() => listingsQuery.data?.results ?? [], [listingsQuery.data?.results]);
  const orders = useMemo(() => ordersQuery.data?.results ?? [], [ordersQuery.data?.results]);

  const stats = useMemo(
    () => ({
      listings: listingsQuery.data?.totalCount ?? listings.length,
      published: listings.filter((item) => String(item.status) === "Published").length,
      orders: ordersQuery.data?.totalCount ?? orders.length,
      paidOrders: orders.filter((item) => String(item.status) === "Paid").length
    }),
    [listings, listingsQuery.data?.totalCount, orders, ordersQuery.data?.totalCount]
  );

  const listingColumns = useMemo<Array<DataGridColumn<ListingSummary>>>(
    () => [
      {
        key: "title",
        title: "لیستینگ",
        priority: "primary",
        sortable: true,
        searchValue: (item) => `${item.title} ${item.description ?? ""}`,
        sortValue: (item) => item.title,
        exportValue: (item) => item.title,
        render: (item) => (
          <div>
            <div className="flex items-center gap-2 font-black">
              <PackageCheck className="size-4 text-primary" />
              {item.title}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-muted">{item.description ?? "بدون توضیح"}</div>
          </div>
        )
      },
      {
        key: "owner",
        title: "مالک",
        priority: "meta",
        sortable: true,
        searchValue: (item) => `${item.ownerName ?? ""} ${item.ownerUserId}`,
        sortValue: (item) => item.ownerName ?? "",
        exportValue: (item) => item.ownerName || `کاربر ${item.ownerUserId}`,
        render: (item) => <span className="text-xs text-muted">{item.ownerName || `کاربر ${item.ownerUserId}`}</span>
      },
      {
        key: "price",
        title: "قیمت",
        priority: "meta",
        sortable: true,
        sortValue: (item) => item.priceAmount ?? item.priceMin ?? 0,
        exportValue: (item) => `${formatPrice(item.priceAmount ?? item.priceMin)} ${item.currency}`,
        render: (item) => <span className="text-xs text-muted">{formatPrice(item.priceAmount ?? item.priceMin)} {item.currency}</span>
      },
      {
        key: "status",
        title: "وضعیت",
        sortable: true,
        sortValue: (item) => String(item.status),
        exportValue: (item) => listingStatusLabels[String(item.status)] ?? String(item.status),
        render: (item) => <StatusPill value={String(item.status)} labels={listingStatusLabels} />
      }
    ],
    []
  );

  const orderColumns = useMemo<Array<DataGridColumn<OrderSummary>>>(
    () => [
      {
        key: "listing",
        title: "سفارش",
        priority: "primary",
        sortable: true,
        searchValue: (item) => `${item.listingTitle ?? ""} ${item.id}`,
        sortValue: (item) => item.listingTitle ?? "",
        exportValue: (item) => item.listingTitle ?? `لیستینگ ${item.listingId}`,
        render: (item) => (
          <div>
            <div className="font-black">{item.listingTitle ?? `لیستینگ ${item.listingId}`}</div>
            <div className="mt-1 text-xs text-muted">شماره سفارش {item.id}</div>
          </div>
        )
      },
      {
        key: "buyer",
        title: "خریدار",
        priority: "meta",
        searchValue: (item) => `${item.buyerName ?? ""} ${item.buyerUserId}`,
        exportValue: (item) => item.buyerName || `کاربر ${item.buyerUserId}`,
        render: (item) => <span className="text-xs text-muted">{item.buyerName || `کاربر ${item.buyerUserId}`}</span>
      },
      {
        key: "seller",
        title: "فروشنده",
        priority: "meta",
        searchValue: (item) => `${item.sellerName ?? ""} ${item.sellerUserId}`,
        exportValue: (item) => item.sellerName || `کاربر ${item.sellerUserId}`,
        render: (item) => <span className="text-xs text-muted">{item.sellerName || `کاربر ${item.sellerUserId}`}</span>
      },
      {
        key: "amount",
        title: "مبلغ",
        sortable: true,
        sortValue: (item) => item.priceAmount * item.qty,
        exportValue: (item) => `${formatPrice(item.priceAmount * item.qty)} IRR`,
        render: (item) => <span className="text-xs text-muted">{formatPrice(item.priceAmount * item.qty)} IRR</span>
      },
      {
        key: "status",
        title: "وضعیت",
        sortable: true,
        sortValue: (item) => String(item.status),
        exportValue: (item) => orderStatusLabels[String(item.status)] ?? String(item.status),
        render: (item) => <StatusPill value={String(item.status)} labels={orderStatusLabels} />
      }
    ],
    []
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="کل لیستینگ‌ها" value={stats.listings.toLocaleString("fa-IR")} />
        <Metric label="منتشر شده در صفحه" value={stats.published.toLocaleString("fa-IR")} />
        <Metric label="کل سفارش‌ها" value={stats.orders.toLocaleString("fa-IR")} />
        <Metric label="پرداخت شده در صفحه" value={stats.paidOrders.toLocaleString("fa-IR")} />
      </section>

      {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}

      <DataGrid
        title="مدیریت لیستینگ‌ها"
        items={listings}
        columns={listingColumns}
        getRowId={(item) => item.id}
        loading={listingsQuery.isLoading}
        enableSelection
        exportFileName="marketplace-listings"
        printTitle="گزارش لیستینگ‌های مارکت‌پلیس"
        searchPlaceholder="جستجو در عنوان، توضیح یا مالک"
        filters={<SearchableSelect className="w-full sm:w-64" options={listingStatusOptions} value={listingStatus} onChange={setListingStatus} placeholder="همه وضعیت‌های لیستینگ" />}
        renderRowActions={(item) => (
          <div className="flex flex-wrap gap-2">
            {listingStatuses.map((status) => (
              <button key={status} type="button" disabled={listingMutation.isPending || String(item.status) === status} onClick={() => listingMutation.mutate({ id: Number(item.id), status })} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-45">
                {status === "Published" ? <CheckCircle2 className="size-3.5" /> : null}
                {listingStatusLabels[status]}
              </button>
            ))}
          </div>
        )}
      />

      <DataGrid
        title="نظارت سفارش‌ها"
        items={orders}
        columns={orderColumns}
        getRowId={(item) => item.id}
        loading={ordersQuery.isLoading}
        exportFileName="marketplace-orders"
        printTitle="گزارش سفارش‌های مارکت‌پلیس"
        searchPlaceholder="جستجو در سفارش، خریدار یا فروشنده"
        filters={<SearchableSelect className="w-full sm:w-64" options={orderStatusOptions} value={orderStatus} onChange={setOrderStatus} placeholder="همه وضعیت‌های سفارش" />}
        renderRowActions={(item) => (
          <div className="flex flex-wrap gap-2">
            {orderStatuses.map((status) => (
              <button key={status} type="button" disabled={orderMutation.isPending || String(item.status) === status} onClick={() => orderMutation.mutate({ id: Number(item.id), status })} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-45">
                {status === "Cancelled" ? <ShieldAlert className="size-3.5" /> : null}
                {orderStatusLabels[status]}
              </button>
            ))}
          </div>
        )}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function StatusPill({ value, labels }: { value: string; labels: Record<string, string> }) {
  return <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-muted">{labels[value] ?? value}</span>;
}

function formatPrice(value?: number | null) {
  if (!value) return "توافقی";
  return Number(value).toLocaleString("fa-IR");
}
