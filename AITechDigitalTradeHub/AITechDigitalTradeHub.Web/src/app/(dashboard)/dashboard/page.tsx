import Link from "next/link";
import type { Route } from "next";
import { PanelSortableArea, PanelSortableItem } from "@/components/personalization/panel-sortable-area";
import {
  ArrowUpLeft,
  BadgeCheck,
  BookOpenText,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards
} from "lucide-react";

const topMetrics = [
  { id: "metric-active-projects", label: "پروژه‌های فعال", value: "۱۲", delta: "۳ مذاکره", hint: "در جریان", icon: BriefcaseBusiness, tone: "primary" },
  { id: "metric-wallet", label: "موجودی قابل استفاده", value: "۳۴.۸M", delta: "+۲۸٪", hint: "تومان", icon: WalletCards, tone: "success" },
  { id: "metric-courses", label: "جلسه‌های آموزشی", value: "۸", delta: "۲ امروز", hint: "برنامه‌ریزی شده", icon: BookOpenText, tone: "warning" },
  { id: "metric-tickets", label: "تیکت‌های باز", value: "۴", delta: "۲ ساعت", hint: "میانگین پاسخ", icon: MessageCircle, tone: "danger" }
] as const;

const focusStats = [
  { label: "پیشنهاد نیازمند پاسخ", value: "۳", icon: FileText },
  { label: "تحویل نزدیک", value: "۲", icon: Clock3 },
  { label: "جلسه امروز", value: "۲", icon: BookOpenText },
  { label: "پرداخت در انتظار", value: "۱", icon: CircleDollarSign }
];

const workQueues: Array<{ tag: string; title: string; meta: string; amount: string; href: Route; icon: typeof BriefcaseBusiness; progress: number }> = [
  { tag: "پروژه", title: "پیاده‌سازی دستیار فروش", meta: "مرحله اجرا، تحویل نسخه آزمایشی و بازبینی کارفرما", amount: "۱۸.۵M", href: "/dashboard/projects", icon: BriefcaseBusiness, progress: 78 },
  { tag: "پیشنهاد", title: "اتوماسیون تحلیل اسناد", meta: "نیازمند پاسخ به زمان‌بندی و اصلاح مبلغ پیشنهادی", amount: "۱۲.۲M", href: "/dashboard/projects", icon: FileText, progress: 52 },
  { tag: "آموزش", title: "داشبورد آموزش سازمانی", meta: "جلسه امروز، مرور تکلیف و دریافت گواهی پایان دوره", amount: "۸ جلسه", href: "/dashboard/courses", icon: BookOpenText, progress: 64 },
  { tag: "مالی", title: "برداشت و تسویه کیف پول", meta: "یک درخواست برداشت در انتظار تایید مالی پلتفرم است", amount: "۳۴.۸M", href: "/dashboard/wallet", icon: WalletCards, progress: 68 }
];

const recentActivity = [
  { title: "پیشنهاد جدید برای پروژه دریافت شد", time: "۱۲ دقیقه پیش", icon: FileText },
  { title: "جلسه آموزشی فردا تایید شد", time: "۴۵ دقیقه پیش", icon: BookOpenText },
  { title: "برداشت کیف پول در انتظار بررسی است", time: "۲ ساعت پیش", icon: WalletCards },
  { title: "تیکت مالی پاسخ اولیه گرفت", time: "۳ ساعت پیش", icon: MessageCircle }
];

const financePoints = [18, 26, 22, 36, 31, 44];
const financeMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"];

const nextActions = [
  { title: "پاسخ به پیشنهاد جدید", text: "زمان تحویل و مبلغ نهایی را تا امروز مشخص کنید.", icon: FileText },
  { title: "تکمیل پروفایل تخصصی", text: "افزودن نمونه‌کار باعث افزایش رتبه پیشنهادها می‌شود.", icon: BadgeCheck },
  { title: "بررسی تیکت مالی", text: "یک پیام جدید برای درخواست برداشت ثبت شده است.", icon: MessageCircle }
];

export default function DashboardPage() {
  return (
    <section className="grid gap-6">
      <PanelSortableArea panelKey="dashboard" className="grid gap-6 lg:grid-cols-4 2xl:grid-cols-12">
        {topMetrics.map((metric) => (
          <PanelSortableItem key={metric.id} itemId={metric.id} className="lg:col-span-1 2xl:col-span-3">
            <TopMetricCard {...metric} />
          </PanelSortableItem>
        ))}
        <PanelSortableItem itemId="dashboard-command" className="lg:col-span-3 2xl:col-span-8"><PersonalCommandCard /></PanelSortableItem>
        <PanelSortableItem itemId="dashboard-finance" className="lg:col-span-1 2xl:col-span-4"><FinancePanel /></PanelSortableItem>
        <PanelSortableItem itemId="dashboard-work-queue" className="lg:col-span-3 2xl:col-span-8"><WorkQueuePanel /></PanelSortableItem>
        <PanelSortableItem itemId="dashboard-actions" className="lg:col-span-1 2xl:col-span-4"><NextActionsPanel /></PanelSortableItem>
        <PanelSortableItem itemId="dashboard-progress" className="lg:col-span-3 2xl:col-span-8"><ProgressPanel /></PanelSortableItem>
        <PanelSortableItem itemId="dashboard-activity" className="lg:col-span-1 2xl:col-span-4"><RecentActivityPanel /></PanelSortableItem>
      </PanelSortableArea>
    </section>
  );
}

function TopMetricCard({ label, value, delta, hint, icon: Icon, tone }: (typeof topMetrics)[number]) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger"
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

function PersonalCommandCard() {
  return (
    <div className="nexa-command-card overflow-hidden rounded-lg p-5 text-white md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px] xl:items-stretch">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/78">
              <Rocket className="size-3.5 text-cyan-200" />
              مرکز کارهای امروز
            </span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">۸ اقدام فعال</span>
          </div>

          <h1 className="mt-7 text-3xl font-black leading-10 md:text-4xl">پنل کاربری آی نت</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
            نمای شخصی آی نت برای مدیریت پروژه‌ها، پیشنهادها، آموزش، کیف پول و پیام‌هایی که امروز نیاز به اقدام دارند.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {focusStats.map((item) => {
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
            <div className="text-sm font-black">اولویت‌های شخصی</div>
            <Sparkles className="size-4 text-cyan-200" />
          </div>
          <div className="mt-4 grid gap-3 text-xs leading-6 text-white/72">
            {["پاسخ به ۳ پیشنهاد پروژه", "بررسی جلسه آموزشی امروز", "تکمیل نمونه‌کار جدید", "پیگیری برداشت کیف پول"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-white/[0.055] px-3 py-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Link href="/dashboard/projects" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              مدیریت پروژه‌ها
            </Link>
            <Link href="/dashboard/wallet" className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-white/78 hover:bg-white/[0.08] hover:text-white">
              کیف پول
              <ArrowUpLeft className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkQueuePanel() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">جریان کارهای فعال</h2>
          <p className="mt-1 text-xs text-muted">کارهایی که روی درآمد، اعتبار و یادگیری شما اثر مستقیم دارند.</p>
        </div>
        <Link href="/dashboard/projects" className="hidden text-xs font-black text-primary sm:block">مشاهده همه</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {workQueues.map((item) => {
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
                <span className="text-xs font-black text-muted">{item.progress}٪ پیشرفت</span>
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

function ProgressPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-black">وضعیت رشد حساب</h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">ترکیبی از تحویل پروژه، اعتبارسنجی، تکمیل پروفایل و فعالیت آموزشی.</p>
        </div>
        <div className="rounded-lg bg-accent-soft px-3 py-2 text-sm font-black text-accent">اعتبار A+</div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-gradient-to-br from-[#123447] via-[#172139] to-[#111827] p-5 text-white">
          <ShieldCheck className="size-10 text-cyan-200" />
          <div className="mt-5 text-sm text-white/58">آمادگی دریافت پروژه‌های بزرگ‌تر</div>
          <div className="mt-1 text-3xl font-black">۸۲٪</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-emerald-300" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "پروفایل تخصصی", value: "۹۰٪" },
            { label: "تحویل‌های موفق", value: "۷۸٪" },
            { label: "فعالیت آموزشی", value: "۶۴٪" },
            { label: "پاسخ‌گویی", value: "۸۶٪" }
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

function FinancePanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">درآمد و کیف پول</h2>
          <p className="mt-1 text-xs text-muted">روند شش ماه اخیر</p>
        </div>
        <span className="rounded-md bg-background px-2 py-1 text-xs font-bold text-muted">ماهانه</span>
      </div>
      <LineChart points={financePoints} labels={financeMonths} />
    </div>
  );
}

function NextActionsPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black">اقدام‌های پیشنهادی</h2>
        <Sparkles className="size-5 text-accent" />
      </div>
      <div className="mt-5 grid gap-3">
        {nextActions.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-md bg-background/70 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-accent shadow-panel"><Icon className="size-4" /></span>
              <div>
                <div className="text-sm font-black">{item.title}</div>
                <p className="mt-1 text-xs leading-6 text-muted">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivityPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black">فعالیت اخیر</h2>
        <TrendingUp className="size-5 text-primary" />
      </div>
      <div className="mt-5 grid gap-4">
        {recentActivity.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent"><Icon className="size-4" /></span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{item.title}</div>
                <div className="mt-1 text-xs text-muted">{item.time}</div>
              </div>
            </div>
          );
        })}
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
