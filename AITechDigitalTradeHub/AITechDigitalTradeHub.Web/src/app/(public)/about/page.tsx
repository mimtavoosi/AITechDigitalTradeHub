import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Brain,
  Building2,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  Network,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";
import { FeatureCard } from "@/components/marketing/feature-card";
import { MetricCard } from "@/components/marketing/metric-card";
import { ProcessStepCard } from "@/components/marketing/process-step-card";
import { SectionBlock } from "@/components/marketing/section-block";
import { SmartSearchPanel } from "@/components/marketing/smart-search-panel";

export const metadata: Metadata = {
  title: "درباره آی نت",
  description: "شبکه اکوسیستم هوش مصنوعی، بستری هوشمند برای اتصال متخصصان، شرکت‌ها، دانشگاه‌ها، سرمایه‌گذاران و متقاضیان خدمات هوش مصنوعی است. این سامانه با هدف توسعه اکوسیستم هوش مصنوعی، تسهیل همکاری‌های تخصصی و تسریع اجرای پروژه‌های نوآورانه طراحی شده است. آی نت تلاش می‌کند زیرساختی یکپارچه برای رشد اقتصاد دانش‌بنیان و تحول دیجیتال در سطح ملی و بین‌المللی فراهم آورد."
};


const searchSuggestions = ["متخصص بینایی ماشین", "قرارداد امن AI", "سرمایه‌گذاری هوش مصنوعی", "آموزش NLP"];

export default function AboutPage() {
  return (
    <>
      <section className="hero-grid-bg relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#F8FAFC_0%,#F1F8F7_52%,#FFFFFF_100%)]">
        <div className="container-page relative grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
          <div className="text-right">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/78 px-4 py-2 text-xs font-extrabold text-accent shadow-sm backdrop-blur-xl">
              <Sparkles className="size-4" />
              شبکه تخصصی هوش مصنوعی ایران
            </div>
            <h1 className="max-w-3xl text-3xl font-black leading-[1.35] text-foreground md:text-5xl md:leading-[1.28]">
              درباره آی نت
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-9 text-muted md:text-lg">
              آی نت برای اتصال کسب‌وکار، متخصص، شرکت، مدرس و سرمایه‌گذار در اکوسیستم هوش مصنوعی ایران طراحی شده؛ جایی که مشاوره، آموزش، پژوهش، پروژه، فرصت شغلی، زیرساخت، سرمایه‌گذاری و تامین داده در یک مسیر تخصصی دیده می‌شود.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/domains" className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20">
                مشاهده حوزه‌ها
              </Link>
              <Link href="/projects" className="rounded-lg border border-border bg-white/75 px-5 py-3 text-sm font-black text-foreground hover:bg-white">
                پروژه‌های فعال
              </Link>
            </div>
            <SmartSearchPanel suggestions={searchSuggestions} className="mt-8 max-w-2xl" />
          </div>

          <div className="glass-strong relative mx-auto w-full max-w-[460px] rounded-2xl p-4 md:p-5">
            <div className="rounded-xl border border-white/80 bg-white/80 p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">مدل پلتفرم</span>
                <span className="grid size-12 place-items-center rounded-xl bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-white">
                  <Network className="size-6" />
                </span>
              </div>
              <div className="space-y-3">
                {[
                  ["کارفرما", "تعریف پروژه و پرداخت مرحله‌ای"],
                  ["متخصص", "ارائه خدمت و دریافت پروژه"],
                  ["شرکت", "تیم، قرارداد و کیف پول سازمانی"],
                  ["سرمایه‌گذار", "بررسی فرصت‌های AI با گزارش شفاف"]
                ].map(([title, text]) => (
                  <div key={title} className="flex items-center justify-between rounded-lg border border-border/70 bg-white px-4 py-3">
                    <span className="text-sm text-muted">{text}</span>
                    <span className="font-black text-foreground">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-8">
        <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard value="۵" label="نقش اصلی کاربران" description="کارفرما، متخصص، شرکت، مدرس و سرمایه‌گذار" />
          <MetricCard value="۳" label="لایه اعتماد" description="احراز هویت، قرارداد دیجیتال و پرداخت امن" />
          <MetricCard value="۱" label="مسیر یکپارچه" description="از جستجو تا اجرا، داوری و تسویه" />
          <MetricCard value="AI" label="تمرکز تخصصی" description="بازار عمومی نیست؛ مخصوص اکوسیستم هوش مصنوعی است" />
        </div>
      </section>

      <SectionBlock eyebrow="ماموریت" title="مسئله‌ای که حل می‌کنیم" description="بازار AI بدون اعتماد، قرارداد شفاف و پرداخت امن سخت رشد می‌کند. هدف این محصول تبدیل همکاری‌های پراکنده به یک جریان قابل کنترل است.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Brain} title="کشف تخصص دقیق" description="کارفرما به جای جستجوی عمومی، متخصص یا خدمت مرتبط با مسئله AI خود را پیدا می‌کند." tone="primary" />
          <FeatureCard icon={LockKeyhole} title="پرداخت امن" description="مبلغ همکاری تا تایید خروجی در حساب امانی نگهداری می‌شود و مرحله‌ای آزاد می‌شود." />
          <FeatureCard icon={Scale} title="داوری تخصصی" description="در اختلافات فنی و مالی، مسیر بررسی و تصمیم‌گیری در خود پلتفرم قابل پیگیری است." tone="green" />
          <FeatureCard icon={BadgeCheck} title="اعتبار واقعی" description="امتیازدهی و رتبه‌بندی بر اساس همکاری واقعی و سفارش تکمیل‌شده شکل می‌گیرد." tone="amber" />
        </div>
      </SectionBlock>

      <SectionBlock tone="soft" eyebrow="فرایند" title="همکاری در پلتفرم چطور جلو می‌رود؟" description="فرایند طوری طراحی شده که برای پروژه‌های کوچک، خدمات آماده و قراردادهای سازمانی قابل استفاده باشد.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ProcessStepCard step="۱" title="تعریف نیاز" description="کارفرما پروژه یا خدمت مورد نیاز را با مهارت، بودجه و زمان‌بندی مشخص می‌کند." />
          <ProcessStepCard step="۲" title="انتخاب و قرارداد" description="پیشنهادها مقایسه می‌شوند و قرارداد دیجیتال با مراحل اجرایی ثبت می‌شود." />
          <ProcessStepCard step="۳" title="پرداخت و اجرا" description="وجه در کیف پول/اسکرو نگهداری می‌شود و متخصص خروجی مرحله‌ای تحویل می‌دهد." />
          <ProcessStepCard step="۴" title="تایید و اعتبار" description="بعد از تایید خروجی، تسویه انجام می‌شود و امتیاز واقعی برای طرفین ثبت می‌شود." />
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="ماژول‌ها" title="بخش‌های اصلی محصول" description="پلتفرم فقط صفحه معرفی نیست؛ هر بخش برای یک جریان کاری واقعی در اکوسیستم AI طراحی شده است.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Users} title="خدمات و تجهیزات تخصصی" description="خدمات، تجهیزات، اجاره GPU و پروفایل متخصصان قابل جستجو و مقایسه است." />
          <FeatureCard icon={Building2} title="سازمان‌ها و تیم‌ها" description="شرکت‌ها می‌توانند اعضا، پروژه‌ها، کیف پول و قراردادهای سازمانی را مدیریت کنند." tone="primary" />
          <FeatureCard icon={WalletCards} title="مالی و Escrow" description="کیف پول، تراکنش، پرداخت مرحله‌ای، فاکتور و درخواست تسویه در بک‌اند پیش‌بینی شده است." tone="green" />
          <FeatureCard icon={GraduationCap} title="آموزش تخصصی" description="مدرس، دوره، جلسه آموزشی و مسیر یادگیری برای ورود به بازار AI پوشش داده می‌شود." tone="amber" />
          <FeatureCard icon={TrendingUp} title="سرمایه‌گذاری" description="فرصت‌های سرمایه‌گذاری، گزارش پیشرفت، تعهد سرمایه و قرارداد سرمایه‌گذاری مدل‌سازی شده‌اند." />
          <FeatureCard icon={FileCheck2} title="پشتیبانی و رسیدگی" description="تیکت، اعلان، گزارش، داوری و مستندات اختلاف برای کنترل چرخه همکاری وجود دارد." tone="primary" />
        </div>
      </SectionBlock>

      <section className="bg-[linear-gradient(135deg,#151923,#203A43_55%,#009A9D)] py-16 text-white">
        <div className="container-page grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="text-right">
            <p className="text-sm font-black text-white/70">قدم بعدی</p>
            <h2 className="mt-2 text-2xl font-black md:text-4xl">اکوسیستم AI را از بازار قابل اعتماد شروع می‌کنیم</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78">
              صفحه‌ها و APIهای پایه آماده شده‌اند؛ از اینجا به بعد می‌شود هر ماژول را به داده واقعی، داشبورد و جریان‌های عملیاتی کامل وصل کرد.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/services" className="rounded-lg bg-white px-5 py-3 text-sm font-black text-foreground">
              مشاهده خدمات و تجهیزات
            </Link>
            <Link href="/investment" className="rounded-lg border border-white/60 px-5 py-3 text-sm font-black text-white">
              فرصت‌های سرمایه‌گذاری
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
