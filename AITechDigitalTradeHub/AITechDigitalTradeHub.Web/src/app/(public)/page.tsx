import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Building2,
  BriefcaseBusiness,
  Cpu,
  Database,
  FileCheck2,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Handshake,
  LockKeyhole,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthTrigger } from "@/features/auth/components/auth-trigger";
import { FeaturedProjectsSection } from "@/features/projects/components/featured-projects-section";

const domains = [
  { title: "مشاوره", href: "/domains" as Route, icon: Handshake, text: "انتخاب مسیر، ارزیابی نیاز و طراحی نقشه راه AI." },
  { title: "آموزش", href: "/courses" as Route, icon: BookOpen, text: "دوره، کارگاه و مسیر یادگیری برای تیم‌ها و افراد." },
  { title: "پژوهش", href: "/domains" as Route, icon: FlaskConical, text: "تحقیق کاربردی، امکان‌سنجی و توسعه دانش فنی." },
  { title: "پروژه", href: "/projects" as Route, icon: FolderKanban, text: "تعریف، اجرا و مدیریت پروژه‌های هوش مصنوعی." },
  { title: "فرصت شغلی", href: "/domains" as Route, icon: BriefcaseBusiness, text: "اتصال متخصصان، تیم‌ها و سازمان‌های فعال در AI." },
  { title: "سخت افزار و زیرساخت", href: "/services" as Route, icon: Cpu, text: "GPU، سرور، ابزار پردازشی و زیرساخت داده." },
  { title: "سرمایه گذاری", href: "/investment" as Route, icon: TrendingUp, text: "معرفی فرصت‌ها و پشتیبانی از رشد کسب‌وکارهای AI." },
  { title: "تامین داده", href: "/domains" as Route, icon: Database, text: "جمع‌آوری، آماده‌سازی و تامین داده قابل اتکا." }
];

const stats = [
  { value: "۸", label: "حوزه خدماتی" },
  { value: "۱۶", label: "مسیر همکاری" },
  { value: "۱", label: "شبکه متمرکز AI" }
];

const heroChips = [
  { label: "مشاوره", href: "/domains" as Route },
  { label: "سرمایه گذاری", href: "/projects" as Route },
  { label: "فرصت شغلی", href: "/domains" as Route },
  { label: "تامین داده", href: "/domains" as Route },
  { label: "سخت افزار و زیر ساخت", href: "/domains" as Route },
 { label: "پژوهش", href: "/domains" as Route },


];

const paths = [
  { title: "کارفرما", text: "نیاز را ثبت کنید، پیشنهادها را مقایسه کنید و پروژه را مرحله‌ای جلو ببرید.", icon: BriefcaseBusiness },
  { title: "متخصص AI", text: "پروفایل بسازید، در پروژه‌ها دیده شوید و همکاری تخصصی بگیرید.", icon: Brain },
  { title: "شرکت", text: "تیم، ظرفیت تخصصی، پروژه‌ها و همکاری‌های سازمانی را مدیریت کنید.", icon: Building2 },
  { title: "سرمایه‌گذار", text: "فرصت‌های AI را با اطلاعات روشن‌تر و مسیر ارتباطی مشخص دنبال کنید.", icon: TrendingUp },
  { title: "مدرس", text: "آموزش، کارگاه و مسیر یادگیری تخصصی را به شبکه متصل کنید.", icon: GraduationCap }
];

const whyItems = [
  { title: "تمرکز تخصصی", text: "آی نت بازار عمومی نیست؛ فقط روی نیازهای واقعی اکوسیستم هوش مصنوعی تمرکز دارد.", icon: Sparkles },
  { title: "اعتماد در همکاری", text: "اعتبارسنجی، قرارداد مرحله‌ای و داوری تخصصی ریسک همکاری را کمتر می‌کند.", icon: ShieldCheck },
  { title: "اتصال چند مسیر", text: "مشاوره، آموزش، پژوهش، پروژه، فرصت شغلی، زیرساخت، سرمایه و داده در یک شبکه دیده می‌شوند.", icon: UsersRound },
  { title: "خروجی قابل پیگیری", text: "از تعریف نیاز تا انتخاب مسیر و اجرای پروژه، همه چیز شفاف‌تر و قابل ارزیابی‌تر است.", icon: FileCheck2 },
  { title: "قرارداد مرحله‌ای", text: "مراحل همکاری، زمان‌بندی و تعهدات قبل از شروع کار روشن می‌شود.", icon: FileCheck2 },
  { title: "پرداخت امن", text: "پرداخت‌ها با مسیر مشخص و قابل پیگیری انجام می‌شوند تا ریسک همکاری کمتر شود.", icon: LockKeyhole },
  { title: "داوری تخصصی", text: "اختلاف‌های فنی و اجرایی با نگاه تخصصی حوزه هوش مصنوعی بررسی می‌شوند.", icon: Scale },
  { title: "اعتبار واقعی", text: "سابقه، کیفیت همکاری و خروجی‌ها برای تصمیم‌گیری بهتر قابل ارزیابی است.", icon: Star }
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <DomainSection />
      <FeaturedProjectsSection />
      <WhySection />
      <PathSection />
      <FinalCta />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-86px)] overflow-hidden bg-[#17102F] text-white md:min-h-[calc(100svh-88px)]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/brand/banner.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,8,30,0.80)_0%,rgba(12,8,30,0.60)_48%,rgba(12,8,30,0.24)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,30,0.05)_0%,rgba(12,8,30,0.18)_62%,rgba(12,8,30,0.48)_100%)]" />

      <div className="container-page relative flex min-h-[calc(100svh-86px)] flex-col justify-center px-1 py-10 text-right md:min-h-[calc(100svh-88px)] md:px-0">
        <div className="max-w-3xl">
              <div className="relative mb-4 max-w-3xl pt-6">
                <div className="absolute right-0 top-0 z-0 inline-flex size-16 items-center justify-center rounded-2xl border border-white/40 bg-white/[0.34] p-2.5 shadow-[0_18px_52px_rgba(0,0,0,0.15)] ring-1 ring-white/24 backdrop-blur-2xl md:size-20">
                  <Image src="/brand/ainet-logo.png" alt="آی نت" width={80} height={80} className="h-full w-full object-contain" priority />
                </div>
                <h1 className="relative z-10 max-w-3xl pr-20 text-2xl font-black leading-[1.45] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.34)] md:pr-28 md:text-3xl md:leading-[1.45] xl:text-4xl">
                  شبکه تخصصی هوش مصنوعی آی نت
                </h1>
              </div>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/84 md:text-base md:leading-8">
                اتصال کسب‌وکارها، متخصصان، مدرسان و سرمایه‌گذاران برای مشاوره، آموزش، پژوهش، پروژه، زیرساخت، فرصت شغلی و تامین داده.
              </p>

              <div className="mt-7 max-w-3xl">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-full border border-white/85 bg-white/8 px-5 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/16">
                    انجام پروژه و همکاری
                  </Link>
                  <AuthTrigger mode="register" className="inline-flex h-11 items-center justify-center rounded-full border border-white/28 bg-white/12 px-5 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20">
                    مشاهده دوره‌ها و آموزش‌ها
                  </AuthTrigger>
                </div>

                <form className="mt-5 flex min-h-14 flex-col overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_16px_48px_rgba(0,0,0,0.22)] sm:flex-row" action="/services">
                  <label className="sr-only" htmlFor="hero-search">جستجو در خدمات و تجهیزات آی نت</label>
                  <input
                    id="hero-search"
                    name="q"
                    className="min-h-11 flex-1 rounded-[16px] border-0 px-5 text-right text-sm font-semibold text-foreground outline-none placeholder:text-muted md:text-base"
                    placeholder="جستجو در خدمات، تجهیزات، زیرساخت یا تامین داده..."
                  />
                  <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-[#17102F] px-6 text-sm font-black text-white transition hover:bg-primary md:text-base">
                    <Search className="size-5 text-[#32D4C8]" />
                    جستجو
                  </button>
                </form>

                <div className="mt-5 flex flex-wrap gap-3">
                  {heroChips.map((chip) => (
                    <Link key={chip.label} href={chip.href} className="inline-flex items-center gap-2 rounded-full border border-white/42 bg-white/8 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/16 md:text-sm">
                      {chip.label}
                      <ArrowLeft className="size-4" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-white/68">{item.label}</p>
                </div>
              ))}
            </div>
      </div>
    </section>
  );
}

function DomainSection() {
  return (
    <SectionShell eyebrow="حوزه‌ها" title="حوزه‌های تخصصی آی نت" description="ساختار سایت بر اساس نیازهای اصلی اکوسیستم هوش مصنوعی ایران مرتب شده است.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {domains.map((domain) => (
          <DomainCard key={domain.title} {...domain} />
        ))}
      </div>
    </SectionShell>
  );
}

function PathSection() {
  return (
    <SectionShell eyebrow="مسیر کاربران" title="مسیر شما در آی نت" description="هر نقش مسیر مشخص خودش را دارد، اما همه در یک شبکه تخصصی به هم وصل می‌شوند.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {paths.map((path) => (
          <DomainCard key={path.title} {...path} />
        ))}
      </div>
    </SectionShell>
  );
}

function WhySection() {
  return (
    <SectionShell tone="muted" eyebrow="اهمیت آی نت" title="چرا آی نت؟" description="پلتفرم باید فقط زیبا نباشد؛ باید اعتماد، مسیر و تمرکز تخصصی بسازد.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {whyItems.map((item) => (
          <DomainCard key={item.title} {...item} />
        ))}
      </div>
    </SectionShell>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#17102F] py-16 text-white">
      <div className="container-page flex flex-col gap-6 text-right md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-white/60">آی نت</p>
          <h2 className="mt-2 text-2xl font-black md:text-4xl">به شبکه تخصصی هوش مصنوعی ایران بپیوندید</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <PremiumLink href="/projects" variant="light">ثبت نیاز</PremiumLink>
          <PremiumLink href="/courses" variant="dark">مسیر آموزش</PremiumLink>
        </div>
      </div>
    </section>
  );
}

function SectionShell({
  eyebrow,
  title,
  description,
  children,
  tone = "white"
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  tone?: "white" | "muted";
}) {
  return (
    <section className={tone === "muted" ? "bg-background py-12 md:py-16" : "bg-white py-12 md:py-16"}>
      <div className="container-page">
        <div className="mb-8 max-w-2xl text-right">
          <p className="mb-2 text-sm font-bold text-accent">{eyebrow}</p>
          <h2 className="text-2xl font-black text-foreground md:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function DomainCard({ icon: Icon, title, text, href }: { icon: LucideIcon; title: string; text: string; href?: Route }) {
  const content = (
    <>
      <span className="grid size-14 place-items-center text-accent transition group-hover:text-primary">
        <Icon className="size-8 stroke-[1.8]" />
      </span>
      <h3 className="mt-8 text-lg font-black leading-7 text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group relative block min-h-56 rounded-xl border border-[#DAD5E8] bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBFF_100%)] p-6 shadow-[0_6px_18px_rgba(15,23,42,0.035)] ring-1 ring-white transition-all duration-200 after:pointer-events-none after:absolute after:inset-[7px] after:rounded-lg after:border after:border-primary/0 after:opacity-0 after:content-[''] hover:-translate-y-1 hover:border-[#17102F] hover:shadow-[0_10px_24px_rgba(15,23,42,0.055)] hover:after:border-accent/70 hover:after:opacity-100">
        {content}
      </Link>
    );
  }

  return (
    <article className="group relative min-h-56 rounded-xl border border-[#DAD5E8] bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBFF_100%)] p-6 shadow-[0_6px_18px_rgba(15,23,42,0.035)] ring-1 ring-white transition-all duration-200 after:pointer-events-none after:absolute after:inset-[7px] after:rounded-lg after:border after:border-primary/0 after:opacity-0 after:content-[''] hover:-translate-y-1 hover:border-[#17102F] hover:shadow-[0_10px_24px_rgba(15,23,42,0.055)] hover:after:border-accent/70 hover:after:opacity-100">
      {content}
    </article>
  );
}

function PremiumLink({ href, variant, children }: { href: Route; variant: "primary" | "outline" | "light" | "dark"; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-border bg-white text-foreground hover:border-primary/40",
    light: "bg-white text-primary hover:bg-white/90",
    dark: "border border-white/20 bg-white/5 text-white hover:bg-white/10"
  };

  return (
    <Link href={href} className={`inline-flex h-12 items-center justify-center rounded-md px-5 text-sm font-black transition ${styles[variant]}`}>
      {children}
    </Link>
  );
}
