"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, CircleDollarSign, GraduationCap, Loader2, RefreshCw, ShieldAlert, TrendingUp, UsersRound } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { TextField } from "@/components/ui/form-field";
import { getActivityLogs } from "@/features/admin/api/admin-access-api";
import { getAdminBiDashboard } from "@/features/admin/api/admin-reports-api";
import type { AdminActivityLog, MetricPoint } from "@/features/admin/types";
import { ApiRequestError } from "@/lib/api/http-client";

function isoDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function AdminReportsClient() {
  const [fromDraft, setFromDraft] = useState(() => isoDate(30));
  const [toDraft, setToDraft] = useState(() => isoDate(0));
  const [range, setRange] = useState({ from: fromDraft, to: toDraft });

  const dashboardQuery = useQuery({
    queryKey: ["admin", "reports", "bi-dashboard", range],
    queryFn: () => getAdminBiDashboard(range)
  });

  const logsQuery = useQuery({
    queryKey: ["admin", "activity-logs", "reports", range],
    queryFn: () => getActivityLogs({ ...range, pageIndex: 1, pageSize: 12 })
  });

  const dashboard = dashboardQuery.data;
  const accessError = dashboardQuery.error instanceof ApiRequestError && [401, 403].includes(dashboardQuery.error.statusCode);
  const dailyActivity = dashboard?.dailyActivity ?? [];

  const logColumns = useMemo<Array<DataGridColumn<AdminActivityLog>>>(
    () => [
      { key: "source", title: "منبع", render: (item) => sourceLabel(item.source), exportValue: (item) => item.source },
      { key: "action", title: "عملیات", priority: "primary", render: (item) => <span className="font-black">{item.action}</span> },
      { key: "userId", title: "کاربر", render: (item) => (item.userId ? item.userId.toLocaleString("fa-IR") : "—") },
      { key: "entity", title: "موجودیت", render: (item) => item.entityType ? `${item.entityType} #${item.entityId ?? ""}` : "—" },
      { key: "createDate", title: "زمان", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  return (
    <div className="space-y-5">
      <section className="dashboard-card p-5">
        <form
          className="grid gap-3 md:grid-cols-[repeat(2,minmax(180px,240px))_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setRange({ from: fromDraft, to: toDraft });
          }}
        >
          <TextField label="از تاریخ" type="date" value={fromDraft} onChange={(event) => setFromDraft(event.target.value)} />
          <TextField label="تا تاریخ" type="date" value={toDraft} onChange={(event) => setToDraft(event.target.value)} />
          <button className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-bold text-white">
            {dashboardQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            اعمال بازه
          </button>
        </form>
      </section>

      {accessError ? (
        <div className="dashboard-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-black">دسترسی گزارش مدیریتی فعال نیست</h2>
              <p className="mt-2 text-sm leading-7 text-muted">برای مشاهده داشبورد BI باید با نقش Admin یا SuperAdmin وارد شوید.</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetric icon={UsersRound} label="کل کاربران" value={dashboard?.users.totalUsers} subLabel={`${formatNumber(dashboard?.users.newUsers)} کاربر جدید`} />
        <ReportMetric icon={CircleDollarSign} label="حجم تراکنش" value={dashboard?.finance.transactionVolume} money subLabel={`${formatNumber(dashboard?.finance.platformFeeRevenue)} کارمزد`} />
        <ReportMetric icon={BarChart3} label="پروژه‌ها" value={dashboard?.projects.totalProjects} subLabel={`${formatNumber(dashboard?.projects.activeContracts)} قرارداد فعال`} />
        <ReportMetric icon={TrendingUp} label="سرمایه جذب‌شده" value={dashboard?.investments.raisedCapital} money subLabel={`${formatNumber(dashboard?.investments.openOpportunities)} فرصت باز`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ReportPanel title="مالی و فروش خدمات" rows={[
          ["تعداد تراکنش", dashboard?.finance.transactionCount],
          ["پرداخت‌ها", dashboard?.finance.paymentVolume, true],
          ["مبلغ امانی نگهداری‌شده", dashboard?.finance.heldEscrowAmount, true],
          ["سفارش تکمیل‌شده", dashboard?.services.completedOrders],
          ["فروش تکمیل‌شده", dashboard?.services.completedSalesVolume, true]
        ]} />
        <ReportPanel title="پروژه، آموزش و اختلافات" rows={[
          ["پروژه‌های منتشرشده", dashboard?.projects.publishedProjects],
          ["پیشنهادهای ثبت‌شده", dashboard?.projects.submittedProposals],
          ["دوره‌های منتشرشده", dashboard?.education.publishedCourses],
          ["درآمد آموزش", dashboard?.education.enrollmentRevenue, true],
          ["اختلافات باز", dashboard?.disputes.openDisputes]
        ]} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <section className="dashboard-card p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            <h2 className="text-lg font-black">فعالیت روزانه</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {dailyActivity.map((point) => <ActivityBar key={point.label} point={point} max={Math.max(...dailyActivity.map((item) => item.count), 1)} />)}
            {!dashboardQuery.isLoading && !dailyActivity.length ? <div className="rounded-md border border-border p-4 text-sm text-muted">در این بازه فعالیتی ثبت نشده است.</div> : null}
          </div>
        </section>

        <section className="dashboard-card p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-primary" />
            <h2 className="text-lg font-black">سرمایه‌گذاری</h2>
          </div>
          <ReportPanel compact rows={[
            ["کل فرصت‌ها", dashboard?.investments.totalOpportunities],
            ["فرصت‌های تامین‌شده", dashboard?.investments.fundedOpportunities],
            ["سرمایه مورد نیاز", dashboard?.investments.requiredCapital, true],
            ["میانگین ROI مورد انتظار", dashboard?.investments.averageExpectedRoiPercent],
            ["تعهدهای تامین‌شده", dashboard?.investments.fundedCommitments]
          ]} />
        </section>
      </section>

      <DataGrid
        title="آخرین سوابق فعالیت"
        items={logsQuery.data?.results ?? []}
        columns={logColumns}
        getRowId={(item) => `${item.source}-${item.id}`}
        loading={logsQuery.isLoading}
        defaultPageSize={12}
        searchPlaceholder="جستجو در عملیات و منبع"
        exportFileName="admin-activity-logs"
        printTitle="سوابق فعالیت پنل مدیریت"
      />
    </div>
  );
}

function ReportMetric({ icon: Icon, label, value, subLabel, money }: { icon: typeof UsersRound; label: string; value?: number; subLabel: string; money?: boolean }) {
  return (
    <div className="dashboard-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-muted">{label}</div>
          <div className="mt-2 text-2xl font-black">{money ? formatMoney(value) : formatNumber(value)}</div>
          <div className="mt-1 text-xs text-muted">{subLabel}</div>
        </div>
        <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function ReportPanel({ title, rows, compact }: { title?: string; rows: Array<[string, number | undefined, boolean?]>; compact?: boolean }) {
  return (
    <section className={compact ? "mt-4" : "dashboard-card p-5"}>
      {title ? <h2 className="text-lg font-black">{title}</h2> : null}
      <div className={title ? "mt-4 divide-y divide-border/70" : "divide-y divide-border/70"}>
        {rows.map(([label, value, money]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="text-muted">{label}</span>
            <span className="font-black">{money ? formatMoney(value) : formatNumber(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityBar({ point, max }: { point: MetricPoint; max: number }) {
  const width = Math.max(4, Math.round((point.count / max) * 100));
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)_48px] items-center gap-3 text-xs">
      <span className="truncate text-muted">{point.label}</span>
      <span className="h-2 overflow-hidden rounded bg-slate-100">
        <span className="block h-full rounded bg-primary" style={{ width: `${width}%` }} />
      </span>
      <span className="text-left font-black">{formatNumber(point.count)}</span>
    </div>
  );
}

function formatNumber(value?: number) {
  return Number(value ?? 0).toLocaleString("fa-IR");
}

function formatMoney(value?: number) {
  return `${formatNumber(value)} ریال`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function sourceLabel(source: string) {
  if (source === "analytics") return "تحلیل رفتار";
  if (source === "project") return "پروژه";
  if (source === "system") return "سیستم";
  return source;
}
