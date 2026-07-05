"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, Search, TrendingUp } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { getAdminInvestments, updateAdminInvestmentStatus } from "@/features/investments/api/investments-api";
import type { AdminInvestmentStatus, InvestmentOpportunity } from "@/features/investments/types";
import { ApiRequestError } from "@/lib/api/http-client";

const pageSize = 20;

const statusOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: 1, label: "پیش‌نویس" },
  { value: 2, label: "در انتظار بررسی" },
  { value: 3, label: "باز" },
  { value: 4, label: "تامین‌شده" },
  { value: 5, label: "بسته" },
  { value: 6, label: "رد شده" }
];

const stageOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه مراحل" },
  { value: 1, label: "ایده" },
  { value: 2, label: "MVP" },
  { value: 3, label: "رشد" },
  { value: 4, label: "مقیاس‌پذیری" }
];

const riskOptions: Array<SelectOption<number | "">> = [
  { value: "", label: "همه ریسک‌ها" },
  { value: 1, label: "کم" },
  { value: 2, label: "متوسط" },
  { value: 3, label: "زیاد" }
];

const adminStatusOptions: Array<{ value: AdminInvestmentStatus; label: string }> = [
  { value: "Draft", label: "پیش‌نویس" },
  { value: "PendingReview", label: "در انتظار بررسی" },
  { value: "Open", label: "باز" },
  { value: "Funded", label: "تامین‌شده" },
  { value: "Closed", label: "بسته" },
  { value: "Rejected", label: "رد شده" }
];

export function AdminInvestmentsClient() {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<number | "">("");
  const [stage, setStage] = useState<number | "">("");
  const [riskLevel, setRiskLevel] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const investmentsQuery = useQuery({
    queryKey: ["admin", "investments", { searchText, status, stage, riskLevel }],
    queryFn: () => getAdminInvestments({ searchText, status, stage, riskLevel, pageIndex: 1, pageSize })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: AdminInvestmentStatus }) => updateAdminInvestmentStatus(id, nextStatus),
    onSuccess: () => {
      setMessage("وضعیت فرصت سرمایه‌گذاری به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "investments"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی وضعیت ناموفق بود")
  });

  const investments = useMemo(() => investmentsQuery.data?.results ?? [], [investmentsQuery.data?.results]);
  const accessError = investmentsQuery.error instanceof ApiRequestError && [401, 403].includes(investmentsQuery.error.statusCode);

  const stats = useMemo(
    () => ({
      total: investmentsQuery.data?.totalCount ?? 0,
      pageItems: investments.length,
      raised: investments.reduce((sum, item) => sum + Number(item.raisedCapital ?? 0), 0),
      required: investments.reduce((sum, item) => sum + Number(item.requiredCapital ?? 0), 0)
    }),
    [investments, investmentsQuery.data?.totalCount]
  );

  const columns = useMemo<Array<DataGridColumn<InvestmentOpportunity>>>(
    () => [
      {
        key: "title",
        title: "فرصت",
        priority: "primary",
        render: (item) => (
          <div>
            <div className="font-black">{item.title}</div>
            <div className="mt-1 text-xs text-muted">{item.slug || "—"}</div>
          </div>
        )
      },
      { key: "status", title: "وضعیت", render: (item) => <StatusBadge status={item.status} /> },
      { key: "stage", title: "مرحله", render: (item) => stageLabel(item.stage) },
      { key: "risk", title: "ریسک", render: (item) => riskLabel(item.riskLevel) },
      { key: "required", title: "سرمایه هدف", sortValue: (item) => item.requiredCapital, render: (item) => formatMoney(item.requiredCapital) },
      { key: "raised", title: "جذب‌شده", sortValue: (item) => item.raisedCapital, render: (item) => formatMoney(item.raisedCapital) },
      { key: "funding", title: "پیشرفت", sortValue: (item) => item.fundingPercent, render: (item) => <FundingBar value={item.fundingPercent} /> },
      { key: "roi", title: "ROI", render: (item) => (item.expectedRoiPercent ? `${Number(item.expectedRoiPercent).toLocaleString("fa-IR")}٪` : "—") }
    ],
    []
  );

  function applyFilters() {
    setSearchText(searchDraft.trim());
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchText("");
    setStatus("");
    setStage("");
    setRiskLevel("");
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="کل فرصت‌ها" value={stats.total.toLocaleString("fa-IR")} />
        <Metric label="فرصت‌های این صفحه" value={stats.pageItems.toLocaleString("fa-IR")} />
        <Metric label="هدف سرمایه" value={formatMoney(stats.required)} />
        <Metric label="جذب‌شده" value={formatMoney(stats.raised)} />
      </section>

      {message ? <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-primary">{message}</div> : null}

      {accessError ? (
        <div className="dashboard-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-black">دسترسی مدیریت سرمایه‌گذاری فعال نیست</h2>
              <p className="mt-2 text-sm leading-7 text-muted">برای مشاهده و تغییر وضعیت فرصت‌ها باید نقش Admin یا SuperAdmin داشته باشید.</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="dashboard-card p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(160px,220px))_auto_auto]">
          <form
            className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <Search className="size-4 shrink-0 text-muted" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="جستجو در عنوان، خلاصه یا slug" />
          </form>
          <SearchableSelect options={statusOptions} value={status} onChange={setStatus} clearable={false} />
          <SearchableSelect options={stageOptions} value={stage} onChange={setStage} clearable={false} />
          <SearchableSelect options={riskOptions} value={riskLevel} onChange={setRiskLevel} clearable={false} />
          <button type="button" onClick={applyFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-3 text-xs font-bold text-white">
            اعمال
          </button>
          <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-xs font-bold">
            پاک‌سازی
          </button>
        </div>
      </section>

      <DataGrid
        title="مدیریت فرصت‌های سرمایه‌گذاری"
        items={investments}
        columns={columns}
        getRowId={(item) => item.id}
        loading={investmentsQuery.isLoading}
        defaultPageSize={20}
        searchPlaceholder="جستجو در جدول"
        exportFileName="admin-investments"
        printTitle="فرصت‌های سرمایه‌گذاری"
        toolbarActions={
          <button type="button" onClick={() => investmentsQuery.refetch()} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold">
            {investmentsQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            تازه‌سازی
          </button>
        }
        renderRowActions={(item) => (
          <label className="flex min-w-40 items-center gap-2">
            <span className="sr-only">تغییر وضعیت</span>
            <select
              className="h-9 rounded-md border border-border bg-white px-2 text-xs font-bold outline-none"
              defaultValue={statusKey(item.status)}
              disabled={updateStatusMutation.isPending}
              onChange={(event) => updateStatusMutation.mutate({ id: item.id, nextStatus: event.target.value as AdminInvestmentStatus })}
            >
              {adminStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        )}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-card p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-muted">
        <TrendingUp className="size-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-xl font-black">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: InvestmentOpportunity["status"] }) {
  return <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-foreground">{statusLabel(status)}</span>;
}

function FundingBar({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, Number(value ?? 0)));
  return (
    <div className="grid min-w-28 gap-1">
      <div className="h-2 overflow-hidden rounded bg-slate-100">
        <div className="h-full rounded bg-primary" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-bold">{percent.toLocaleString("fa-IR")}٪</span>
    </div>
  );
}

function statusKey(status: InvestmentOpportunity["status"]): AdminInvestmentStatus {
  const key = String(status);
  if (key === "1" || key === "Draft") return "Draft";
  if (key === "2" || key === "PendingReview") return "PendingReview";
  if (key === "4" || key === "Funded") return "Funded";
  if (key === "5" || key === "Closed") return "Closed";
  if (key === "6" || key === "Rejected") return "Rejected";
  return "Open";
}

function statusLabel(status: InvestmentOpportunity["status"]) {
  return adminStatusOptions.find((item) => item.value === statusKey(status))?.label ?? String(status);
}

function stageLabel(stage: InvestmentOpportunity["stage"]) {
  const key = String(stage);
  if (key === "1" || key === "Idea") return "ایده";
  if (key === "2" || key === "MVP") return "MVP";
  if (key === "3" || key === "Growth") return "رشد";
  if (key === "4" || key === "Scale") return "مقیاس‌پذیری";
  return key;
}

function riskLabel(risk: InvestmentOpportunity["riskLevel"]) {
  const key = String(risk);
  if (key === "1" || key === "Low") return "کم";
  if (key === "2" || key === "Medium") return "متوسط";
  if (key === "3" || key === "High") return "زیاد";
  return key;
}

function formatMoney(value?: number) {
  return `${Number(value ?? 0).toLocaleString("fa-IR")} ریال`;
}
