import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Cpu,
  Database,
  FlaskConical,
  FolderKanban,
  Handshake,
  Search,
  TrendingUp
} from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "حوزه‌های تخصصی آی نت",
  description: "هاب حوزه‌های تخصصی آی نت برای مشاوره، آموزش، پژوهش، پروژه، فرصت شغلی، زیرساخت، سرمایه‌گذاری و تامین داده."
};

const domains = [
  {
    title: "مشاوره",
    href: "/services" as Route,
    icon: Handshake,
    text: "ارزیابی نیاز، انتخاب مسیر AI، امکان‌سنجی فنی و طراحی نقشه راه اجرایی."
  },
  {
    title: "آموزش",
    href: "/courses" as Route,
    icon: BookOpen,
    text: "دوره، کارگاه، کلاس خصوصی و مسیر یادگیری برای افراد، تیم‌ها و سازمان‌ها."
  },
  {
    title: "پژوهش",
    href: "/services" as Route,
    icon: FlaskConical,
    text: "تحقیق کاربردی، توسعه دانش فنی، نمونه‌سازی و بررسی راهکارهای نوآورانه."
  },
  {
    title: "پروژه",
    href: "/projects" as Route,
    icon: FolderKanban,
    text: "تعریف، مناقصه، اجرای مرحله‌ای، قرارداد دیجیتال و تحویل قابل پیگیری پروژه‌های AI."
  },
  {
    title: "فرصت شغلی",
    href: "/services" as Route,
    icon: BriefcaseBusiness,
    text: "اتصال متخصصان، تیم‌ها و سازمان‌های فعال در اکوسیستم هوش مصنوعی."
  },
  {
    title: "سخت افزار و زیرساخت",
    href: "/services" as Route,
    icon: Cpu,
    text: "GPU، سرور، ابزار پردازشی، اجاره منابع و زیرساخت داده برای اجرای پروژه‌ها."
  },
  {
    title: "سرمایه گذاری",
    href: "/investment" as Route,
    icon: TrendingUp,
    text: "معرفی فرصت‌های سرمایه‌گذاری و مسیر رشد کسب‌وکارهای هوش مصنوعی."
  },
  {
    title: "تامین داده",
    href: "/services" as Route,
    icon: Database,
    text: "جمع‌آوری، پاک‌سازی، برچسب‌گذاری و آماده‌سازی داده قابل اتکا برای مدل‌های AI."
  }
];

const quickLinks = [
  { title: "خدمات و تجهیزات", href: "/services" as Route, text: "خدمات، تجهیزات و ظرفیت‌های قابل سفارش" },
  { title: "پروژه‌های فعال", href: "/projects" as Route, text: "نیازهای واقعی کارفرماها و سازمان‌ها" },
  { title: "آموزش", href: "/courses" as Route, text: "دوره‌ها، مدرس‌ها و مسیرهای یادگیری" },
  { title: "سرمایه‌گذاری", href: "/investment" as Route, text: "فرصت‌های رشد و جذب سرمایه" }
];

export default function DomainsPage() {
  return (
    <PageShell
      title="حوزه‌های تخصصی آی نت"
      description="این صفحه هاب ورود به ۸ حوزه اصلی آی نت است. خدمات و تجهیزات در مسیر جداگانه `/services` باقی می‌ماند و اینجا ساختار کلی اکوسیستم را نشان می‌دهد."
    >
      <section className="rounded-2xl border border-border bg-[linear-gradient(135deg,#17102F,#21444B)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="text-sm font-black text-white/62">هاب آی نت</p>
            <h2 className="mt-2 text-2xl font-black leading-10 md:text-4xl md:leading-[1.4]">
              از انتخاب حوزه شروع کنید، بعد وارد مسیر اجرایی شوید
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/76">
              حوزه‌ها برای جهت‌دهی محصول و تجربه کاربر هستند. بعد از انتخاب حوزه، کاربر به مسیر عملی مربوط می‌رسد: خدمات و تجهیزات، پروژه‌ها، آموزش یا سرمایه‌گذاری.
            </p>
          </div>
          <form action="/services" className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
            <label className="sr-only" htmlFor="domain-search">جستجو در خدمات و تجهیزات</label>
            <div className="flex min-h-12 items-center gap-2 rounded-lg bg-white px-3 text-foreground">
              <Search className="size-5 text-accent" />
              <input
                id="domain-search"
                name="q"
                className="min-w-0 flex-1 border-0 bg-transparent text-right text-sm font-bold outline-none placeholder:text-muted"
                placeholder="جستجو در خدمات، تجهیزات یا زیرساخت..."
              />
            </div>
            <button type="submit" className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-[#17102F] transition hover:bg-white/90">
              مشاهده خدمات و تجهیزات
              <ArrowLeft className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {domains.map((domain) => (
          <Link key={domain.title} href={domain.href} className="group min-h-56 rounded-xl border-[3px] border-[#C8C1DA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFAFF_100%)] p-6 shadow-[0_18px_46px_rgba(15,23,42,0.09)] ring-1 ring-white transition hover:-translate-y-1 hover:border-accent/75 hover:shadow-[0_36px_96px_rgba(23,15,48,0.18)]">
            <span className="grid size-14 place-items-center rounded-lg border border-accent/20 bg-white text-accent shadow-[0_14px_34px_rgba(126,87,245,0.12)] transition group-hover:bg-accent/5">
              <domain.icon className="size-8 stroke-[1.8]" />
            </span>
            <h3 className="mt-8 text-lg font-black leading-7 text-foreground">{domain.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{domain.text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-accent">
              مشاهده مسیر
              <ArrowLeft className="size-4" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-border bg-background p-5 md:p-6">
        <div className="mb-5 text-right">
          <p className="text-sm font-black text-accent">دسترسی سریع</p>
          <h2 className="mt-2 text-xl font-black text-foreground">مسیرهای عملی بعد از انتخاب حوزه</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl border border-border bg-white p-4 transition hover:border-accent/50 hover:shadow-sm">
              <h3 className="text-sm font-black text-foreground">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
