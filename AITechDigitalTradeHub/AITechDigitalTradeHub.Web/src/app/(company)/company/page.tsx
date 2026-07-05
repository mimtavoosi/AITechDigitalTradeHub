import Link from "next/link";
import type { Route } from "next";
import { PanelSortableArea, PanelSortableItem } from "@/components/personalization/panel-sortable-area";
import {
  ArrowUpLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Landmark,
  Layers3,
  ShieldCheck,
  Store,
  UsersRound
} from "lucide-react";

const topMetrics = [
  { id: "company-metric-members", label: "اعضای فعال", value: "۱۸", delta: "۴ نقش", hint: "سازمانی", icon: UsersRound, tone: "primary" },
  { id: "company-metric-projects", label: "پروژه‌های شرکتی", value: "۷", delta: "۳ اجرا", hint: "فعال", icon: BriefcaseBusiness, tone: "success" },
  { id: "company-metric-payments", label: "پرداخت‌های در انتظار", value: "۵", delta: "نیازمند تایید", hint: "مالی", icon: CircleDollarSign, tone: "warning" },
  { id: "company-metric-services", label: "خدمات فعال", value: "۱۲", delta: "اشتراک و تجهیزات", hint: "در دسترس", icon: Store, tone: "accent" }
] as const;

const operationStats = [
  { label: "پرداخت نیازمند تایید", value: "۵", icon: CircleDollarSign },
  { label: "قرارداد در بازبینی", value: "۲", icon: FileCheck2 },
  { label: "عضو جدید در صف", value: "۳", icon: UsersRound },
  { label: "سرویس فعال", value: "۱۲", icon: Store }
];

const approvalQueues: Array<{ tag: string; title: string; meta: string; amount: string; href: Route; icon: typeof BriefcaseBusiness; progress: number }> = [
  { tag: "مالی", title: "پرداخت فاکتور سرویس ابری", meta: "درخواست نرگس احمدی، نیازمند تایید مدیر مالی", amount: "۸.۴M", href: "/company/payments", icon: CircleDollarSign, progress: 72 },
  { tag: "پروژه", title: "تسویه مرحله دوم پروژه", meta: "درخواست مهدی کرمی، سند تحویل باید بررسی شود", amount: "۱۲.۸M", href: "/company/projects", icon: BriefcaseBusiness, progress: 58 },
  { tag: "خرید", title: "خرید تجهیزات آموزشی", meta: "قابل تایید، بودجه در سقف ماهانه قرار دارد", amount: "۳.۶M", href: "/company/payments", icon: Store, progress: 86 },
  { tag: "عضویت", title: "دعوت اعضای تیم محصول", meta: "سه عضو جدید منتظر تعیین نقش و دسترسی هستند", amount: "۳ نفر", href: "/company/members", icon: UsersRound, progress: 64 }
];

const roadmap = [
  { title: "تکمیل مدارک حقوقی", done: true },
  { title: "تعریف نقش‌های مالی", done: true },
  { title: "اتصال حساب تسویه", done: false },
  { title: "فعال‌سازی گزارش ماهانه", done: false }
];

const quickActions = [
  { label: "دعوت عضو جدید", href: "/company/members" },
  { label: "ثبت پروژه شرکتی", href: "/company/projects" },
  { label: "ثبت درخواست پرداخت", href: "/company/payments" },
  { label: "آپلود سند قرارداد", href: "/company/reports" }
] as const;

const revenuePoints = [22, 31, 29, 42, 38, 55];
const revenueMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"];

export default function CompanyPage() {
  return (
    <section className="grid gap-6">
      <PanelSortableArea panelKey="company" className="grid gap-6 lg:grid-cols-4 2xl:grid-cols-12">
        {topMetrics.map((metric) => (
          <PanelSortableItem key={metric.id} itemId={metric.id} className="lg:col-span-1 2xl:col-span-3">
            <TopMetricCard {...metric} />
          </PanelSortableItem>
        ))}
        <PanelSortableItem itemId="company-command" className="lg:col-span-3 2xl:col-span-8"><CompanyCommandCard /></PanelSortableItem>
        <PanelSortableItem itemId="company-revenue" className="lg:col-span-1 2xl:col-span-4"><RevenuePanel /></PanelSortableItem>
        <PanelSortableItem itemId="company-approvals" className="lg:col-span-3 2xl:col-span-8"><ApprovalQueuePanel /></PanelSortableItem>
        <PanelSortableItem itemId="company-credit" className="lg:col-span-1 2xl:col-span-4"><CreditPanel /></PanelSortableItem>
        <PanelSortableItem itemId="company-health" className="lg:col-span-3 2xl:col-span-8"><CompanyHealthPanel /></PanelSortableItem>
        <PanelSortableItem itemId="company-actions" className="lg:col-span-1 2xl:col-span-4"><QuickActionsPanel /></PanelSortableItem>
      </PanelSortableArea>
    </section>
  );
}

function TopMetricCard({ label, value, delta, hint, icon: Icon, tone }: (typeof topMetrics)[number]) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent"
  }[tone];

  return (
    <div className="dashboard-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-muted">{label}</div>
          <div className="mt-3 text-3xl font-black">{value}</div>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-md ${toneClass}`}>
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-foreground px-2 py-1 font-black text-white">{delta}</span>
        <span className="text-muted">{hint}</span>
      </div>
    </div>
  );
}

function CompanyCommandCard() {
  return (
    <div className="nexa-command-card overflow-hidden rounded-lg p-5 text-white md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-stretch">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/78">
              <Building2 className="size-3.5 text-cyan-200" />
              مرکز عملیات شرکت
            </span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">۵ تصمیم مالی باز</span>
          </div>

          <h1 className="mt-7 text-3xl font-black leading-10 md:text-4xl">پنل شرکت عضو آی نت</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
            نمای سازمانی آی نت برای کنترل اعضا، پروژه‌های شرکتی، پرداخت‌ها، خدمات و اعتبار لازم برای قراردادهای بزرگ‌تر.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operationStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.07] p-4">
                  <Icon className="size-5 text-cyan-200" />
                  <div className="mt-3 text-3xl font-black">{item.value}</div>
                  <div className="mt-1 text-xs leading-5 text-white/58">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-full flex-col rounded-lg border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">اولویت‌های سازمانی</div>
            <Landmark className="size-4 text-cyan-200" />
          </div>
          <div className="mt-4 grid gap-3 text-xs leading-6 text-white/72">
            {["تایید ۵ پرداخت اعضا", "بررسی ۲ سند قرارداد", "تعیین نقش برای ۳ عضو", "فعال‌سازی گزارش ماهانه"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-white/[0.055] px-3 py-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Link href="/company/payments" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              بررسی پرداخت‌ها
            </Link>
            <Link href="/company/reports" className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-white/78 hover:bg-white/[0.08] hover:text-white">
              گزارش شرکت
              <ArrowUpLeft className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovalQueuePanel() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">صف تاییدهای شرکت</h2>
          <p className="mt-1 text-xs text-muted">درخواست‌هایی که روی نقدینگی، دسترسی اعضا و تعهدات پروژه اثر دارند.</p>
        </div>
        <Link href="/company/payments" className="hidden text-xs font-black text-primary sm:block">مشاهده همه</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {approvalQueues.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="dashboard-card group p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-primary">{item.tag}</span>
                    <h3 className="mt-1 text-base font-black leading-7 group-hover:text-primary">{item.title}</h3>
                  </div>
                </div>
                <ArrowUpLeft className="size-4 shrink-0 text-muted group-hover:text-primary" />
              </div>
              <p className="mt-3 text-xs leading-6 text-muted">{item.meta}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-sm font-black">{item.amount}</span>
                <span className="text-xs font-black text-muted">{item.progress}٪ تکمیل بررسی</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CompanyHealthPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-black">سلامت عملیاتی شرکت</h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">پوشش نقش‌ها، اسناد مالی، ظرفیت خدمات و آمادگی قراردادهای جدید.</p>
        </div>
        <div className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-black text-accent">اعتبار A+</div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-gradient-to-br from-[#17324A] via-[#172139] to-[#111827] p-5 text-white">
          <Layers3 className="size-10 text-cyan-200" />
          <div className="mt-5 text-sm text-white/58">آمادگی قرارداد سازمانی</div>
          <div className="mt-1 text-3xl font-black">۸۲٪</div>
          <p className="mt-3 text-xs leading-6 text-white/62">دو مرحله باقی‌مانده: اتصال حساب تسویه و فعال‌سازی گزارش ماهانه.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "مدارک حقوقی", value: "۹۵٪" },
            { label: "نقش‌های مالی", value: "۸۲٪" },
            { label: "کنترل پروژه", value: "۷۴٪" },
            { label: "کیفیت سرویس‌ها", value: "۸۸٪" }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black">{item.label}</span>
                <span className="text-xs font-black text-primary">{item.value}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: item.value }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenuePanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">جریان مالی شرکت</h2>
          <p className="mt-1 text-xs text-muted">درآمد و هزینه شش ماه اخیر</p>
        </div>
        <span className="rounded-md bg-background px-2 py-1 text-xs font-bold text-muted">ماهانه</span>
      </div>
      <LineChart points={revenuePoints} labels={revenueMonths} />
    </div>
  );
}

function CreditPanel() {
  return (
    <section className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black">اعتبار شرکت</h2>
          <p className="mt-1 text-xs text-muted">آمادگی برای قراردادهای بزرگ‌تر</p>
        </div>
        <ShieldCheck className="size-6 text-primary" />
      </div>
      <div className="mt-6 text-4xl font-black">A+</div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-accent-soft">
        <div className="h-full w-[82%] rounded-full bg-primary" />
      </div>
      <div className="mt-5 grid gap-2">
        {roadmap.map((item) => (
          <div key={item.title} className="flex items-center gap-2 text-xs">
            {item.done ? <CheckCircle2 className="size-4 text-success" /> : <Clock3 className="size-4 text-warning" />}
            <span className={item.done ? "font-bold text-foreground" : "text-muted"}>{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActionsPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-black">عملیات سریع</h2>
        <BadgeCheck className="size-5 text-primary" />
      </div>
      <div className="grid gap-2">
        {quickActions.map((item) => (
          <Link key={item.label} href={item.href} className="flex h-10 items-center justify-between rounded-md border border-border bg-white px-3 text-sm font-bold text-muted hover:text-primary">
            {item.label}
            <ArrowUpLeft className="size-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function LineChart({ points, labels }: { points: number[]; labels: string[] }) {
  const max = Math.max(...points);
  const polyline = points.map((point, index) => `${(index / (points.length - 1)) * 100},${100 - (point / max) * 82}`).join(" ");
  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 72" className="h-56 w-full overflow-visible" preserveAspectRatio="none">
        {[18, 36, 54, 72].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgb(var(--color-border))" strokeWidth="0.6" />)}
        <polyline points={polyline} fill="none" stroke="rgb(var(--color-accent))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <circle key={index} cx={(index / (points.length - 1)) * 100} cy={100 - (point / max) * 82} r="2.1" fill="rgb(var(--color-accent))" />
        ))}
      </svg>
      <div className="grid grid-cols-6 gap-2 text-center text-[10px] text-muted">
        {labels.map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
}
