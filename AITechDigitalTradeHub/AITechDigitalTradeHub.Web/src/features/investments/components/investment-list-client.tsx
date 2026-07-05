"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, FileText, Landmark, Loader2, RefreshCw, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { getInvestments } from "@/features/investments/api/investments-api";
import type { InvestmentOpportunity } from "@/features/investments/types";

const pageSize = 12;

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

export function InvestmentListClient() {
  const [searchDraft, setSearchDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [stage, setStage] = useState<number | "">("");
  const [riskLevel, setRiskLevel] = useState<number | "">("");
  const [minRequiredCapital, setMinRequiredCapital] = useState("");
  const [minExpectedRoi, setMinExpectedRoi] = useState("");

  const investmentsQuery = useQuery({
    queryKey: ["investments", "public", { searchText, stage, riskLevel, minRequiredCapital, minExpectedRoi }],
    queryFn: () =>
      getInvestments({
        searchText,
        stage: stage || undefined,
        riskLevel: riskLevel || undefined,
        minRequiredCapital: Number(minRequiredCapital) || undefined,
        minExpectedRoi: Number(minExpectedRoi) || undefined,
        pageIndex: 1,
        pageSize
      })
  });

  const investments = useMemo(() => investmentsQuery.data?.results ?? [], [investmentsQuery.data?.results]);
  const totalCount = investmentsQuery.data?.totalCount ?? investments.length;

  const stats = useMemo(
    () => ({
      required: investments.reduce((sum, item) => sum + Number(item.requiredCapital ?? 0), 0),
      raised: investments.reduce((sum, item) => sum + Number(item.raisedCapital ?? 0), 0),
      averageRoi: getAverageRoi(investments)
    }),
    [investments]
  );

  function applyFilters() {
    setSearchText(searchDraft.trim());
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchText("");
    setStage("");
    setRiskLevel("");
    setMinRequiredCapital("");
    setMinExpectedRoi("");
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,#10271F,#163A4A_54%,#33224E)] text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/18 bg-white/10 px-3 py-2 text-xs font-black text-white/82">
              <TrendingUp className="size-4 text-[#32D4C8]" />
              فرصت‌های باز جذب سرمایه
            </div>
            <h1 className="mt-4 text-2xl font-black leading-10 md:text-4xl md:leading-[1.35]">فرصت‌های سرمایه‌گذاری هوش مصنوعی را با عدد و گزارش بررسی کنید</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-white/76">
              فرصت‌های منتشرشده از API سرمایه‌گذاری خوانده می‌شوند؛ سرمایه هدف، پیشرفت جذب، ریسک، مرحله، ROI و مستندات عمومی برای تصمیم‌گیری اولیه کنار هم قرار گرفته‌اند.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroMetric label="فرصت باز" value={totalCount.toLocaleString("fa-IR")} />
              <HeroMetric label="هدف سرمایه این صفحه" value={formatMoney(stats.required)} />
              <HeroMetric label="میانگین ROI" value={stats.averageRoi ? `${stats.averageRoi.toLocaleString("fa-IR")}٪` : "ثبت نشده"} />
            </div>
          </div>
          <div className="rounded-lg border border-white/18 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <ShieldCheck className="size-5 text-[#32D4C8]" />
              مسیر کنترل‌شده سرمایه
            </div>
            <div className="mt-4 grid gap-3 text-xs font-bold leading-6 text-white/76">
              <ProcessStep title="۱. انتشار فرصت" text="مالک فرصت مستندات، مدل کسب‌وکار، roadmap و هدف جذب را ثبت می‌کند." />
              <ProcessStep title="۲. بررسی و تایید" text="ادمین فرصت را بررسی و وضعیت انتشار عمومی را کنترل می‌کند." />
              <ProcessStep title="۳. پرداخت امانی" text="تعهد سرمایه از کیف پول پرداخت و در Escrow نگهداری می‌شود." />
              <ProcessStep title="۴. گزارش‌دهی" text="گزارش مصرف سرمایه و ROI برای پیگیری شفاف ثبت می‌شود." />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-4 shadow-panel">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_190px_190px_170px_170px_auto_auto] xl:items-center">
          <form
            className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3"
            onSubmit={(event) => {
              event.preventDefault();
              applyFilters();
            }}
          >
            <Search className="size-4 shrink-0 text-muted" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="جستجو در عنوان یا خلاصه فرصت" />
          </form>
          <SearchableSelect options={stageOptions} value={stage} onChange={setStage} clearable={false} />
          <SearchableSelect options={riskOptions} value={riskLevel} onChange={setRiskLevel} clearable={false} />
          <NumberFilter label="حداقل سرمایه" value={minRequiredCapital} onChange={setMinRequiredCapital} />
          <NumberFilter label="حداقل ROI" value={minExpectedRoi} onChange={setMinExpectedRoi} />
          <button type="button" onClick={applyFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-xs font-black text-white">
            اعمال
          </button>
          <button type="button" onClick={resetFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-xs font-black">
            پاک‌سازی
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Landmark} label="سرمایه هدف" value={formatMoney(stats.required)} />
        <MetricCard icon={TrendingUp} label="سرمایه جذب‌شده" value={formatMoney(stats.raised)} />
        <MetricCard icon={BarChart3} label="فرصت‌های نمایش‌داده‌شده" value={investments.length.toLocaleString("fa-IR")} />
      </section>

      {investmentsQuery.error ? <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-bold text-danger">خواندن فرصت‌های سرمایه‌گذاری ناموفق بود.</div> : null}

      {investmentsQuery.isLoading ? <InvestmentLoading /> : null}

      {!investmentsQuery.isLoading && !investments.length ? (
        <div className="rounded-xl border border-border bg-white px-4 py-12 text-center text-sm font-bold text-muted">فرصت سرمایه‌گذاری باز با این فیلترها پیدا نشد.</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {investments.map((item) => (
          <InvestmentCard key={item.id} item={item} />
        ))}
      </div>

      {investments.length ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-xs font-bold text-muted">
          <span>{totalCount.toLocaleString("fa-IR")} فرصت مطابق فیلترها در API ثبت شده است.</span>
          <button type="button" onClick={() => investmentsQuery.refetch()} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-foreground">
            {investmentsQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            تازه‌سازی
          </button>
        </div>
      ) : null}
    </div>
  );
}

function InvestmentCard({ item }: { item: InvestmentOpportunity }) {
  const fundingPercent = Math.max(0, Math.min(100, Number(item.fundingPercent ?? 0)));

  return (
    <article className="grid gap-4 rounded-xl border border-border bg-white p-5 shadow-panel transition hover:border-primary/40 hover:shadow-[0_24px_72px_rgba(15,23,42,0.10)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{stageLabel(item.stage)}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-foreground">ریسک {riskLabel(item.riskLevel)}</span>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">{statusLabel(item.status)}</span>
      </div>

      <div>
        <h2 className="text-lg font-black leading-8 text-foreground">{item.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{item.summary || "خلاصه عمومی برای این فرصت ثبت نشده است."}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="سرمایه هدف" value={formatMoney(item.requiredCapital, item.currency)} />
        <SmallStat label="جذب‌شده" value={formatMoney(item.raisedCapital, item.currency)} />
        <SmallStat label="ROI مورد انتظار" value={item.expectedRoiPercent ? `${Number(item.expectedRoiPercent).toLocaleString("fa-IR")}٪` : "ثبت نشده"} />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span>پیشرفت جذب سرمایه</span>
          <span>{fundingPercent.toLocaleString("fa-IR")}٪</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-100">
          <div className="h-full rounded bg-primary" style={{ width: `${fundingPercent}%` }} />
        </div>
      </div>

      <div className="grid gap-2 rounded-lg border border-border bg-background p-3 text-xs font-bold text-muted sm:grid-cols-3">
        <span className="inline-flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          {item.documents?.length?.toLocaleString("fa-IR") ?? "۰"} مستند عمومی
        </span>
        <span>{item.tranches?.length?.toLocaleString("fa-IR") ?? "۰"} tranche</span>
        <span>{item.reports?.length?.toLocaleString("fa-IR") ?? "۰"} گزارش ROI/مصرف</span>
      </div>

      <div className="grid gap-2 text-xs leading-6 text-muted">
        {item.businessModel ? <p><span className="font-black text-foreground">مدل کسب‌وکار: </span>{item.businessModel}</p> : null}
        {item.roadmap ? <p><span className="font-black text-foreground">Roadmap: </span>{item.roadmap}</p> : null}
      </div>
    </article>
  );
}

function NumberFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="sr-only">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-border bg-white px-3 text-sm outline-none focus-ring" type="number" min="0" placeholder={label} />
    </label>
  );
}

function InvestmentLoading() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-xl border border-border bg-white p-5 shadow-panel">
          <div className="h-5 w-2/5 rounded bg-slate-100" />
          <div className="mt-6 h-7 w-4/5 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-8 h-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/14 bg-white/10 p-3">
      <p className="text-xs font-bold text-white/58">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-panel">
      <div className="flex items-center gap-2 text-xs font-bold text-muted">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function ProcessStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md bg-white/10 p-3">
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-white/68">{text}</p>
    </div>
  );
}

function getAverageRoi(items: InvestmentOpportunity[]) {
  const values = items.map((item) => Number(item.expectedRoiPercent ?? 0)).filter((value) => value > 0);
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatMoney(value?: number | null, currency = "IRR") {
  const amount = Number(value ?? 0);
  const suffix = currency === "IRR" ? "ریال" : currency;
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیارد ${suffix}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیون ${suffix}`;
  return `${amount.toLocaleString("fa-IR")} ${suffix}`;
}

function statusLabel(status: InvestmentOpportunity["status"]) {
  const key = String(status);
  if (key === "1" || key === "Draft") return "پیش‌نویس";
  if (key === "2" || key === "PendingReview") return "در انتظار بررسی";
  if (key === "4" || key === "Funded") return "تامین‌شده";
  if (key === "5" || key === "Closed") return "بسته";
  if (key === "6" || key === "Rejected") return "رد شده";
  return "باز";
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
