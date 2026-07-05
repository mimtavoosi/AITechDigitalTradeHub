"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CircleDollarSign, Landmark, Loader2, RefreshCw, Search, ShieldCheck, WalletCards } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { TextField } from "@/components/ui/form-field";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import {
  getAdminEscrows,
  getAdminFinanceDashboard,
  getAdminPayoutRequests,
  getAdminTransactions,
  getAdminWallets
} from "@/features/finance/api/admin-finance-api";
import type { AdminEscrow, AdminPayoutRequest, AdminTransaction, AdminWallet } from "@/features/finance/types";
import { ApiRequestError } from "@/lib/api/http-client";

function isoDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

const walletOwnerOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه مالکان" },
  { value: 1, label: "کاربر" },
  { value: 2, label: "سازمان" }
];

const walletStatusOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: 1, label: "فعال" },
  { value: 2, label: "مسدود مالی" }
];

const transactionTypeOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه تراکنش‌ها" },
  { value: 1, label: "واریز" },
  { value: 2, label: "برداشت" },
  { value: 3, label: "پرداخت" },
  { value: 4, label: "نگهداری Escrow" },
  { value: 5, label: "آزادسازی" },
  { value: 6, label: "بازگشت وجه" },
  { value: 7, label: "کارمزد" }
];

const transactionStatusOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: 1, label: "در انتظار" },
  { value: 2, label: "موفق" },
  { value: 3, label: "ناموفق" }
];

const escrowStatusOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه Escrowها" },
  { value: 1, label: "نگهداری‌شده" },
  { value: 2, label: "آزادشده" },
  { value: 3, label: "برگشت‌خورده" },
  { value: 4, label: "دارای اختلاف" }
];

const payoutStatusOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه برداشت‌ها" },
  { value: 1, label: "درخواست‌شده" },
  { value: 2, label: "تاییدشده" },
  { value: 3, label: "پرداخت‌شده" },
  { value: 4, label: "ردشده" }
];

export function AdminFinanceLedgerClient() {
  const [fromDraft, setFromDraft] = useState(() => isoDate(30));
  const [toDraft, setToDraft] = useState(() => isoDate(0));
  const [range, setRange] = useState({ from: fromDraft, to: toDraft });
  const [walletSearch, setWalletSearch] = useState("");
  const [walletOwnerType, setWalletOwnerType] = useState<number | "">("");
  const [walletStatus, setWalletStatus] = useState<number | "">("");
  const [txType, setTxType] = useState<number | "">("");
  const [txStatus, setTxStatus] = useState<number | "">(2);
  const [escrowStatus, setEscrowStatus] = useState<number | "">(1);
  const [payoutStatus, setPayoutStatus] = useState<number | "">(1);

  const dashboardQuery = useQuery({
    queryKey: ["admin", "finance", "dashboard", range],
    queryFn: () => getAdminFinanceDashboard(range)
  });

  const walletsQuery = useQuery({
    queryKey: ["admin", "finance", "wallets", walletSearch, walletOwnerType, walletStatus],
    queryFn: () => getAdminWallets({ searchText: walletSearch, ownerType: walletOwnerType, status: walletStatus, pageIndex: 1, pageSize: 80 })
  });

  const transactionsQuery = useQuery({
    queryKey: ["admin", "finance", "transactions", range, txType, txStatus],
    queryFn: () => getAdminTransactions({ ...range, txType, status: txStatus, pageIndex: 1, pageSize: 80 })
  });

  const escrowsQuery = useQuery({
    queryKey: ["admin", "finance", "escrows", escrowStatus],
    queryFn: () => getAdminEscrows({ status: escrowStatus, pageIndex: 1, pageSize: 80 })
  });

  const payoutsQuery = useQuery({
    queryKey: ["admin", "finance", "payout-requests", payoutStatus],
    queryFn: () => getAdminPayoutRequests({ status: payoutStatus, pageIndex: 1, pageSize: 80 })
  });

  const dashboard = dashboardQuery.data;
  const accessError = dashboardQuery.error instanceof ApiRequestError && [401, 403].includes(dashboardQuery.error.statusCode);
  const isRefreshing = dashboardQuery.isFetching || walletsQuery.isFetching || transactionsQuery.isFetching || escrowsQuery.isFetching || payoutsQuery.isFetching;

  const walletColumns = useMemo<Array<DataGridColumn<AdminWallet>>>(
    () => [
      { key: "ownerName", title: "مالک", priority: "primary", render: (item) => <span className="font-black">{item.ownerName || "—"}</span> },
      { key: "ownerType", title: "نوع مالک", render: (item) => walletOwnerLabel(item.ownerType) },
      { key: "balance", title: "موجودی", sortValue: (item) => item.balance, render: (item) => formatMoney(item.balance, item.currency) },
      { key: "status", title: "وضعیت", render: (item) => walletStatusLabel(item.status) },
      { key: "createDate", title: "ایجاد", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  const transactionColumns = useMemo<Array<DataGridColumn<AdminTransaction>>>(
    () => [
      { key: "walletOwnerName", title: "کیف پول", priority: "primary", render: (item) => <span className="font-black">{item.walletOwnerName || `#${item.walletId}`}</span> },
      { key: "txType", title: "نوع", render: (item) => transactionTypeLabel(item.txType) },
      { key: "amount", title: "مبلغ", sortValue: (item) => Math.abs(item.amount), render: (item) => <Amount value={item.amount} /> },
      { key: "reference", title: "مرجع", render: (item) => item.referenceType ? `${item.referenceType} #${item.referenceId ?? ""}` : "—" },
      { key: "gatewayRef", title: "پیگیری", render: (item) => item.gatewayRef || "—" },
      { key: "status", title: "وضعیت", render: (item) => transactionStatusLabel(item.status) },
      { key: "createDate", title: "زمان", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  const escrowColumns = useMemo<Array<DataGridColumn<AdminEscrow>>>(
    () => [
      { key: "payer", title: "پرداخت‌کننده", priority: "primary", render: (item) => <span className="font-black">{item.payerOwnerName || `#${item.payerWalletId}`}</span> },
      { key: "payee", title: "دریافت‌کننده", render: (item) => item.payeeOwnerName || `#${item.payeeWalletId}` },
      { key: "amount", title: "مبلغ", sortValue: (item) => item.amount, render: (item) => formatMoney(item.amount) },
      { key: "context", title: "زمینه", render: (item) => `${item.contextType} #${item.contextId}` },
      { key: "status", title: "وضعیت", render: (item) => escrowStatusLabel(item.status) },
      { key: "createDate", title: "زمان", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  const payoutColumns = useMemo<Array<DataGridColumn<AdminPayoutRequest>>>(
    () => [
      { key: "walletOwnerName", title: "مالک کیف پول", priority: "primary", render: (item) => <span className="font-black">{item.walletOwnerName || `#${item.walletId}`}</span> },
      { key: "amount", title: "مبلغ", sortValue: (item) => item.amount, render: (item) => formatMoney(item.amount) },
      { key: "bank", title: "حساب", render: (item) => item.bankAccountMasked || "—" },
      { key: "status", title: "وضعیت", render: (item) => payoutStatusLabel(item.status) },
      { key: "paidAt", title: "پرداخت", render: (item) => formatDate(item.paidAt) },
      { key: "createDate", title: "درخواست", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  function applyRange() {
    setRange({ from: fromDraft, to: toDraft });
  }

  return (
    <div className="space-y-5">
      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <form
            className="grid flex-1 gap-3 md:grid-cols-[repeat(2,minmax(180px,240px))_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              applyRange();
            }}
          >
            <TextField label="از تاریخ" type="date" value={fromDraft} onChange={(event) => setFromDraft(event.target.value)} />
            <TextField label="تا تاریخ" type="date" value={toDraft} onChange={(event) => setToDraft(event.target.value)} />
            <button className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-bold text-white">
              {dashboardQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              اعمال بازه
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              void dashboardQuery.refetch();
              void walletsQuery.refetch();
              void transactionsQuery.refetch();
              void escrowsQuery.refetch();
              void payoutsQuery.refetch();
            }}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold"
          >
            {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            تازه‌سازی همه
          </button>
        </div>
      </section>

      {accessError ? (
        <div className="dashboard-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-black">دسترسی گزارش مالی ادمین فعال نیست</h2>
              <p className="mt-2 text-sm leading-7 text-muted">برای دیدن این بخش باید با نقش Admin یا SuperAdmin وارد شوید.</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={WalletCards} label="کیف‌پول‌ها" value={formatNumber(dashboard?.walletsCount)} subLabel={`${formatMoney(dashboard?.walletsBalance)} موجودی`} />
        <Metric icon={CircleDollarSign} label="حجم تراکنش" value={formatMoney(dashboard?.transactionVolume)} subLabel={`${formatNumber(dashboard?.transactionCount)} تراکنش موفق`} />
        <Metric icon={ShieldCheck} label="Escrow نگهداری‌شده" value={formatMoney(dashboard?.heldEscrowsAmount)} subLabel={`${formatNumber(dashboard?.heldEscrowsCount)} مورد باز`} />
        <Metric icon={Landmark} label="برداشت در انتظار" value={formatMoney(dashboard?.requestedPayoutsAmount)} subLabel={`${formatNumber(dashboard?.requestedPayoutsCount)} درخواست`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Breakdown title="جریان تراکنش‌ها" rows={[
          ["واریز", dashboard?.depositVolume],
          ["پرداخت", dashboard?.paymentVolume],
          ["برداشت", dashboard?.withdrawVolume],
          ["نگهداری Escrow", dashboard?.holdVolume],
          ["آزادسازی", dashboard?.releaseVolume],
          ["بازگشت وجه", dashboard?.refundVolume],
          ["کارمزد", dashboard?.feeVolume]
        ]} />
        <section className="dashboard-card p-5">
          <h2 className="text-lg font-black">فیلتر کیف‌پول‌ها</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3 md:col-span-3">
              <Search className="size-4 shrink-0 text-muted" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70" value={walletSearch} onChange={(event) => setWalletSearch(event.target.value)} placeholder="جستجوی نام کاربر، ایمیل، نام کاربری یا سازمان" />
            </label>
            <SearchableSelect options={walletOwnerOptions} value={walletOwnerType} onChange={setWalletOwnerType} clearable={false} />
            <SearchableSelect options={walletStatusOptions} value={walletStatus} onChange={setWalletStatus} clearable={false} />
            <button type="button" onClick={() => walletsQuery.refetch()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-xs font-bold">
              {walletsQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              اعمال
            </button>
          </div>
        </section>
      </section>

      <DataGrid
        title="کیف‌پول‌ها"
        items={walletsQuery.data?.results ?? []}
        columns={walletColumns}
        getRowId={(item) => item.id}
        loading={walletsQuery.isLoading}
        defaultPageSize={12}
        searchPlaceholder="جستجو در کیف‌پول‌ها"
        exportFileName="admin-wallets"
        printTitle="کیف‌پول‌های پلتفرم"
      />

      <DataGrid
        title="دفتر تراکنش‌ها"
        items={transactionsQuery.data?.results ?? []}
        columns={transactionColumns}
        getRowId={(item) => item.id}
        loading={transactionsQuery.isLoading}
        defaultPageSize={12}
        filters={
          <div className="grid gap-2 md:grid-cols-2">
            <SearchableSelect options={transactionTypeOptions} value={txType} onChange={setTxType} clearable={false} />
            <SearchableSelect options={transactionStatusOptions} value={txStatus} onChange={setTxStatus} clearable={false} />
          </div>
        }
        searchPlaceholder="جستجو در تراکنش‌ها"
        exportFileName="admin-transactions"
        printTitle="دفتر تراکنش‌های مالی"
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <DataGrid
          title="Escrowها"
          items={escrowsQuery.data?.results ?? []}
          columns={escrowColumns}
          getRowId={(item) => item.id}
          loading={escrowsQuery.isLoading}
          defaultPageSize={10}
          filters={<SearchableSelect options={escrowStatusOptions} value={escrowStatus} onChange={setEscrowStatus} clearable={false} />}
          searchPlaceholder="جستجو در Escrow"
          exportFileName="admin-escrows"
          printTitle="Escrowهای پلتفرم"
        />
        <DataGrid
          title="درخواست‌های برداشت"
          items={payoutsQuery.data?.results ?? []}
          columns={payoutColumns}
          getRowId={(item) => item.id}
          loading={payoutsQuery.isLoading}
          defaultPageSize={10}
          filters={<SearchableSelect options={payoutStatusOptions} value={payoutStatus} onChange={setPayoutStatus} clearable={false} />}
          searchPlaceholder="جستجو در برداشت‌ها"
          exportFileName="admin-payout-requests"
          printTitle="درخواست‌های برداشت"
        />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, subLabel }: { icon: typeof WalletCards; label: string; value: string; subLabel: string }) {
  return (
    <div className="dashboard-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-muted">{label}</div>
          <div className="mt-2 text-xl font-black">{value}</div>
          <div className="mt-1 text-xs text-muted">{subLabel}</div>
        </div>
        <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<[string, number | undefined]> }) {
  return (
    <section className="dashboard-card p-5">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-4 divide-y divide-border/70">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="text-muted">{label}</span>
            <span className="font-black">{formatMoney(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Amount({ value }: { value: number }) {
  const positive = Number(value) >= 0;
  return <span className={positive ? "font-black text-emerald-700" : "font-black text-danger"}>{formatMoney(value)}</span>;
}

function formatNumber(value?: number) {
  return Number(value ?? 0).toLocaleString("fa-IR");
}

function formatMoney(value?: number, currency = "IRR") {
  return `${formatNumber(value)} ${currency}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function walletOwnerLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "User") return "کاربر";
  if (key === "2" || key === "Organization") return "سازمان";
  return key;
}

function walletStatusLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "Active") return "فعال";
  if (key === "2" || key === "Frozen") return "مسدود مالی";
  return key;
}

function transactionTypeLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "Deposit") return "واریز";
  if (key === "2" || key === "Withdraw") return "برداشت";
  if (key === "3" || key === "Payment") return "پرداخت";
  if (key === "4" || key === "Hold") return "نگهداری Escrow";
  if (key === "5" || key === "Release") return "آزادسازی";
  if (key === "6" || key === "Refund") return "بازگشت وجه";
  if (key === "7" || key === "Fee") return "کارمزد";
  return key;
}

function transactionStatusLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "Pending") return "در انتظار";
  if (key === "2" || key === "Success") return "موفق";
  if (key === "3" || key === "Failed") return "ناموفق";
  return key;
}

function escrowStatusLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "Held") return "نگهداری‌شده";
  if (key === "2" || key === "Released") return "آزادشده";
  if (key === "3" || key === "Refunded") return "برگشت‌خورده";
  if (key === "4" || key === "Disputed") return "دارای اختلاف";
  return key;
}

function payoutStatusLabel(value: string | number) {
  const key = String(value);
  if (key === "1" || key === "Requested") return "درخواست‌شده";
  if (key === "2" || key === "Approved") return "تاییدشده";
  if (key === "3" || key === "Paid") return "پرداخت‌شده";
  if (key === "4" || key === "Rejected") return "ردشده";
  return key;
}
