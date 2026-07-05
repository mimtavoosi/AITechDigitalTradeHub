import Image from "next/image";
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
  Cpu,
  FileCheck2,
  GraduationCap,
  Layers3,
  MessageSquare,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound
} from "lucide-react";

const topMetrics = [
  { id: "admin-metric-projects", label: "پروژه‌های فعال", value: "۱۲", delta: "+۲۸٪", hint: "رشد ماهانه", icon: BriefcaseBusiness, tone: "primary" },
  { id: "admin-metric-users", label: "اعضای تاییدشده", value: "۳۲", delta: "+۱۳٪", hint: "عضو جدید", icon: UsersRound, tone: "success" },
  { id: "admin-metric-revenue", label: "درآمد ماه", value: "۳۴۸.۸M", delta: "+۲۸٪", hint: "تومان", icon: CircleDollarSign, tone: "warning" },
  { id: "admin-metric-health", label: "سلامت سیستم", value: "۸۶٪", delta: "عالی", hint: "ریسک پایین", icon: ShieldCheck, tone: "accent" }
] as const;

const operationsStats = [
  { label: "پروژه در انتظار بررسی", value: "۳", icon: BriefcaseBusiness },
  { label: "گزارش مالی جدید", value: "۲", icon: FileCheck2 },
  { label: "دوره منتظر انتشار", value: "۱", icon: GraduationCap },
  { label: "درخواست همکاری", value: "۴", icon: UsersRound }
];

const reviewQueues: Array<{ tag: string; title: string; meta: string; amount: string; href: Route; icon: typeof BriefcaseBusiness; progress: number }> = [
  { tag: "پروژه‌ها", title: "درخواست‌های پروژه در انتظار تایید", meta: "بررسی بودجه، زمان‌بندی، قرارداد و مهارت‌های لازم", amount: "۳ مورد باز", href: "/admin/projects", icon: BriefcaseBusiness, progress: 72 },
  { tag: "آموزش", title: "درخواست مدرس و انتشار دوره", meta: "رزومه مدرس، سرفصل، ظرفیت و زمان کلاس", amount: "۸ درخواست", href: "/admin/education", icon: GraduationCap, progress: 54 },
  { tag: "سرویس‌ها", title: "لیستینگ‌های GPU و خدمات جدید", meta: "کنترل قیمت، ظرفیت، SLA و وضعیت ارائه‌دهنده", amount: "۵ مورد نیازمند تایید", href: "/admin/listings", icon: Server, progress: 61 },
  { tag: "مالی", title: "گزارش‌ها و تسویه‌های در انتظار", meta: "گزارش درآمد، پرداخت‌ها، مغایرت‌ها و تسویه", amount: "۲ گزارش جدید", href: "/admin/finance", icon: FileCheck2, progress: 83 }
];

const activityMetrics = [
  { label: "پروژه‌های فعال", value: "۱۲", unit: "پروژه", delta: "+۲۸٪", points: [22, 24, 23, 27, 28, 34] },
  { label: "فرصت‌های سرمایه‌گذاری", value: "۵", unit: "فرصت", delta: "۲ مورد جدید", points: [12, 14, 16, 15, 19, 21] },
  { label: "ساعت GPU مصرفی", value: "۳۴.۸", unit: "ساعت", delta: "+۱۲.۴٪", points: [10, 14, 12, 18, 21, 26] },
  { label: "اعتبار حساب", value: "+A", unit: "سطح اعتبار", delta: "بسیار عالی", points: [18, 20, 23, 25, 24, 28] }
];

const suggestions = [
  { title: "تکمیل پروفایل شرکت‌های کلیدی", text: "سه شرکت بزرگ هنوز مدارک اعتبارسنجی کامل ندارند.", icon: Building2 },
  { title: "تصمیم‌گیری روی درخواست مدرس‌ها", text: "هشت درخواست منتظر تایید یا اصلاح برنامه آموزشی است.", icon: GraduationCap },
  { title: "بازبینی ظرفیت GPU", text: "مصرف این هفته از میانگین ماهانه جلوتر است.", icon: Cpu }
];

const recentActivity = [
  { title: "پروژه تحلیل تصویر ماهواره‌ای ثبت شد", time: "۳ دقیقه پیش", icon: BriefcaseBusiness },
  { title: "شرکت نورافزار گزارش مالی ثبت کرد", time: "۱۸ دقیقه پیش", icon: FileCheck2 },
  { title: "سرمایه‌گذار جدید به اکوسیستم اضافه شد", time: "۲۸ دقیقه پیش", icon: TrendingUp },
  { title: "خدمت GPU H100 در صف تایید قرار گرفت", time: "۴۱ دقیقه پیش", icon: Cpu },
  { title: "گواهی‌نامه دوره جدید آماده انتشار شد", time: "۱ ساعت پیش", icon: GraduationCap }
];

const ecosystem = [
  { label: "متخصصان", value: "۱۴,۸۶۲", icon: UsersRound, share: 86 },
  { label: "شرکت‌ها", value: "۷۴۶", icon: Building2, share: 54 },
  { label: "پروژه‌ها", value: "۱,۳۳۴", icon: BriefcaseBusiness, share: 68 },
  { label: "سرمایه‌گذاران", value: "۴۴۱", icon: TrendingUp, share: 42 },
  { label: "خدمات و منابع", value: "۱۸۵", icon: Cpu, share: 35 },
  { label: "آموزش و مدرس", value: "۹۸", icon: GraduationCap, share: 28 }
];

const revenuePoints = [24, 39, 34, 52, 46, 66];
const revenueMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"];

export default function AdminPage() {
  return (
    <section className="nexa-admin-dashboard grid gap-6">
      <PanelSortableArea panelKey="admin" className="grid gap-6 lg:grid-cols-4 2xl:grid-cols-12">
        {topMetrics.map((metric) => (
          <PanelSortableItem key={metric.id} itemId={metric.id} className="lg:col-span-1 2xl:col-span-3">
            <TopMetricCard {...metric} />
          </PanelSortableItem>
        ))}
        <PanelSortableItem itemId="admin-command" className="lg:col-span-3 2xl:col-span-8"><CommandCenterCard /></PanelSortableItem>
        <PanelSortableItem itemId="admin-revenue" className="lg:col-span-1 2xl:col-span-4"><RevenuePanel /></PanelSortableItem>
        <PanelSortableItem itemId="admin-review-queue" className="lg:col-span-3 2xl:col-span-8"><ReviewQueuePanel /></PanelSortableItem>
        <PanelSortableItem itemId="admin-suggestions" className="lg:col-span-1 2xl:col-span-4"><SuggestionsPanel /></PanelSortableItem>
        <PanelSortableItem itemId="admin-activity-metrics" className="lg:col-span-3 2xl:col-span-8">
          <section className="grid gap-4 lg:grid-cols-4">
            {activityMetrics.map((item) => <ActivityMetric key={item.label} {...item} />)}
          </section>
        </PanelSortableItem>
        <PanelSortableItem itemId="admin-activity" className="lg:col-span-1 2xl:col-span-4"><RecentActivityPanel /></PanelSortableItem>
        <PanelSortableItem itemId="admin-ecosystem" className="lg:col-span-4 2xl:col-span-12"><EcosystemPanel /></PanelSortableItem>
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
          <div className="mt-3 text-3xl font-black tracking-normal">{value}</div>
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

function CommandCenterCard() {
  return (
    <div className="nexa-command-card overflow-hidden rounded-lg p-5 text-white md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-stretch">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/78">
              <Radio className="size-3.5 text-primary" />
              اتاق فرمان زنده
            </span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">۴ جریان نیازمند تصمیم</span>
          </div>

          <div className="mt-7 flex items-start gap-5">
            <div className="grid size-20 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.075] shadow-[0_0_44px_rgb(126_87_245_/_0.30)]">
              <Image src="/brand/ainet-logo.png" alt="آی نت" width={76} height={76} className="h-14 w-14 object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-10 md:text-4xl">مرکز عملیات آی نت</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
                نمای یکپارچه مدیریت آی نت برای تایید پروژه‌ها، کنترل آموزش، پایش سرویس‌ها و رسیدگی به گزارش‌های مالی اکوسیستم.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {operationsStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.07] p-4">
                  <Icon className="size-5 text-primary" />
                  <div className="mt-3 text-3xl font-black">{item.value}</div>
                  <div className="mt-1 text-xs leading-5 text-white/58">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-full flex-col rounded-lg border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">اولویت‌های امروز</div>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="mt-4 grid gap-3 text-xs leading-6 text-white/72">
            {["تایید ۳ پروژه با بودجه بالا", "بررسی ۸ درخواست مدرس", "بازبینی ۲ گزارش مالی", "پاسخ به ۴ تیکت با اولویت بالا"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md bg-white/[0.055] px-3 py-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <Link href="/admin/projects" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              بررسی پروژه‌ها
            </Link>
            <Link href="/admin/reports" className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-white/78 hover:bg-white/[0.08] hover:text-white">
              گزارش مدیریتی
              <ArrowUpLeft className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewQueuePanel() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">صف‌های بررسی مدیریت</h2>
          <p className="mt-1 text-xs text-muted">جریان‌هایی که مستقیما روی کیفیت و درآمد اکوسیستم اثر دارند.</p>
        </div>
        <Link href="/admin/reports" className="hidden text-xs font-black text-primary sm:block">مشاهده همه</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reviewQueues.map((item) => {
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

function RevenuePanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">درآمد و جریان نقدی</h2>
          <p className="mt-1 text-xs text-muted">روند شش ماه اخیر</p>
        </div>
        <span className="rounded-md bg-background px-2 py-1 text-xs font-bold text-muted">ماهانه</span>
      </div>
      <RevenueChart />
    </div>
  );
}

function SuggestionsPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black">اقدام‌های پیشنهادی</h2>
        <Sparkles className="size-5 text-accent" />
      </div>
      <div className="mt-5 grid gap-3">
        {suggestions.map((item) => {
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
      <Link href="/admin/reports" className="mt-4 flex h-10 items-center justify-center rounded-md bg-accent-soft text-sm font-black text-accent">مشاهده پیشنهادها</Link>
    </div>
  );
}

function EcosystemPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-black">نقشه اکوسیستم آی نت</h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">ترکیب کاربران، شرکت‌ها، پروژه‌ها و منابعی که تیم مدیریت باید رشد و کیفیت آن‌ها را دنبال کند.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm font-black text-accent">
          <Image src="/brand/ainet-logo.png" alt="آی نت" width={28} height={28} className="h-7 w-7 object-contain" />
          ۱۷,۶۶۶ عضو قابل مدیریت
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-gradient-to-br from-[#182B4F] via-[#172139] to-[#111827] p-5 text-white">
          <div className="grid size-20 place-items-center rounded-full bg-white/10 ring-1 ring-white/10">
            <Layers3 className="size-9 text-cyan-200" />
          </div>
          <div className="mt-5 text-sm text-white/58">وضعیت پوشش مدیریت</div>
          <div className="mt-1 text-3xl font-black">۷۴٪</div>
          <p className="mt-3 text-xs leading-6 text-white/62">پوشش ترکیبی از تایید هویت، وضعیت مالی، کیفیت پروژه و فعال بودن سرویس‌ها محاسبه شده است.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ecosystem.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-border bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></span>
                    <div>
                      <div className="text-sm font-black">{item.label}</div>
                      <div className="mt-1 text-xs text-muted">{item.value}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary">{item.share}٪</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent-soft">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.share}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecentActivityPanel() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black">فعالیت‌های اخیر</h2>
        <MessageSquare className="size-5 text-primary" />
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
      <Link href="/admin/reports" className="mt-5 flex h-10 items-center justify-center rounded-md bg-accent-soft text-sm font-black text-accent">مشاهده همه فعالیت‌ها</Link>
    </div>
  );
}

function ActivityMetric({ label, value, unit, delta, points }: { label: string; value: string; unit: string; delta: string; points: number[] }) {
  const max = Math.max(...points);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${(index / (points.length - 1)) * 100} ${100 - (point / max) * 82}`).join(" ");
  return (
    <div className="dashboard-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-muted">{label}</div>
          <div className="mt-2 text-2xl font-black">{value}</div>
          <div className="text-xs text-muted">{unit}</div>
        </div>
        <BadgeCheck className="size-5 text-primary" />
      </div>
      <svg viewBox="0 0 100 42" className="mt-3 h-10 w-full overflow-visible" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-2 text-xs font-bold text-primary">{delta}</div>
    </div>
  );
}

function RevenueChart() {
  const max = Math.max(...revenuePoints);
  const points = revenuePoints.map((point, index) => `${(index / (revenuePoints.length - 1)) * 100},${100 - (point / max) * 82}`).join(" ");
  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 72" className="h-56 w-full overflow-visible" preserveAspectRatio="none">
        {[18, 36, 54, 72].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgb(var(--color-border))" strokeWidth="0.6" />)}
        <polyline points={points} fill="none" stroke="rgb(var(--color-accent))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        {revenuePoints.map((point, index) => (
          <circle key={index} cx={(index / (revenuePoints.length - 1)) * 100} cy={100 - (point / max) * 82} r="2.1" fill="rgb(var(--color-accent))" />
        ))}
      </svg>
      <div className="grid grid-cols-6 gap-2 text-center text-[10px] text-muted">
        {revenueMonths.map((month) => <span key={month}>{month}</span>)}
      </div>
    </div>
  );
}
