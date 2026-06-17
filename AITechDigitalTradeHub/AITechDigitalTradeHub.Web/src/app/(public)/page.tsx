import Link from "next/link";
import type { Route } from "next";
import { SmartSearchPanel } from "@/components/marketing/smart-search-panel";
import { AuthTrigger } from "@/features/auth/components/auth-trigger";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  FileText,
  GraduationCap,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  Scale,
  Server,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const searchSuggestions = [
  "طراحی چت‌بات فارسی",
  "اجاره GPU A100",
  "پروژه بینایی ماشین",
  "تحلیل داده فروش",
  "مدرس یادگیری ماشین"
];

const serviceCards = [
  {
    title: "طراحی مدل یادگیری ماشین",
    description: "مدل‌های پیش‌بینی، دسته‌بندی و تحلیل داده برای محصولات واقعی.",
    provider: "دکتر امیر محمدی",
    rating: "۴.۹",
    reviews: "۱۲۳",
    price: "از ۵۰۰,۰۰۰ تومان",
    time: "۳ تا ۵ روز",
    tags: ["Python", "TensorFlow", "ML"]
  },
  {
    title: "پردازش تصویر و تشخیص اشیا",
    description: "سیستم تشخیص تصویر، کنترل کیفیت و پایش ویدئویی با OpenCV.",
    provider: "شرکت هوش‌پردازان",
    rating: "۴.۸",
    reviews: "۸۷",
    price: "از ۸۰۰,۰۰۰ تومان",
    time: "۵ تا ۷ روز",
    tags: ["Vision", "OpenCV", "CNN"]
  },
  {
    title: "ساخت چت‌بات سازمانی",
    description: "چت‌بات فارسی برای پشتیبانی، فروش و اتوماسیون پاسخ‌گویی.",
    provider: "مهندس سارا احمدی",
    rating: "۴.۷",
    reviews: "۶۵",
    price: "از ۱,۲۰۰,۰۰۰ تومان",
    time: "۷ تا ۱۰ روز",
    tags: ["NLP", "Rasa", "Bot"]
  },
  {
    title: "اجاره سرور GPU",
    description: "زیرساخت پردازشی برای آموزش مدل‌های عمیق و پردازش سنگین.",
    provider: "شرکت ابر داده",
    rating: "۴.۹",
    reviews: "۱۵۶",
    price: "از ۲۰۰,۰۰۰ تومان/ماه",
    time: "فوری",
    tags: ["GPU", "A100", "Cloud"]
  }
];

const projectCards = [
  {
    title: "سیستم تشخیص چهره برای امنیت",
    company: "شرکت امن‌پرداز",
    budget: "۲۰ تا ۳۰ میلیون تومان",
    proposals: "۱۵ پیشنهاد",
    days: "۱۵ روز باقی‌مانده",
    skills: ["بینایی ماشین", "Python", "OpenCV"]
  },
  {
    title: "پیش‌بینی قیمت املاک",
    company: "املاک هوشمند",
    budget: "۱۵ تا ۲۵ میلیون تومان",
    proposals: "۲۳ پیشنهاد",
    days: "۱۰ روز باقی‌مانده",
    skills: ["Regression", "scikit-learn", "تحلیل داده"]
  },
  {
    title: "چت‌بات پشتیبانی فارسی",
    company: "فروشگاه دیجیتال",
    budget: "۸ تا ۱۲ میلیون تومان",
    proposals: "۱۸ پیشنهاد",
    days: "۲۰ روز باقی‌مانده",
    skills: ["NLP", "Rasa", "فارسی"]
  }
];

const categories = [
  { label: "یادگیری ماشین", icon: Brain },
  { label: "بینایی ماشین", icon: Eye },
  { label: "پردازش زبان طبیعی", icon: MessageSquareText },
  { label: "علم داده", icon: Database },
  { label: "GPU و زیرساخت", icon: Server },
  { label: "چت‌بات و اتوماسیون", icon: Bot },
  { label: "تحلیل داده", icon: BarChart3 },
  { label: "هوش مصنوعی سازمانی", icon: Building2 }
];

const paths = [
  { title: "کارفرما", text: "پروژه تعریف کنید و پیشنهادهای متخصصان را مقایسه کنید.", icon: BriefcaseBusiness, cta: "شروع کنید" },
  { title: "متخصص AI", text: "خدمات ارائه دهید، پروژه بگیرید و درآمد خود را مدیریت کنید.", icon: Brain, cta: "ثبت‌نام متخصص" },
  { title: "شرکت", text: "تیم، خدمات، پروژه‌ها و کیف پول سازمانی را یکجا کنترل کنید.", icon: Building2, cta: "ایجاد پروفایل" },
  { title: "سرمایه‌گذار", text: "فرصت‌های سرمایه‌گذاری AI را با گزارش شفاف بررسی کنید.", icon: TrendingUp, cta: "کشف فرصت‌ها" },
  { title: "مدرس", text: "دوره تخصصی بسازید و دانش AI را به بازار وصل کنید.", icon: GraduationCap, cta: "ایجاد دوره" }
];

export default function HomePage() {
  return (
    <>
      <section className="hero-grid-bg relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF6F4_46%,#FFFFFF_100%)]">
        <div className="container-page relative py-4 md:py-8">
          <TopMarketBanner />
          <div className="grid gap-8 py-8 md:py-12 lg:min-h-[690px] lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center">
            <div className="text-right">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur-xl">
                <Sparkles className="size-4 text-accent" />
                بازار کار، خدمات و زیرساخت هوش مصنوعی
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-[1.35] text-foreground sm:text-4xl md:text-6xl md:leading-[1.25]">
                متخصص، پروژه و زیرساخت AI را سریع‌تر پیدا کنید
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
                از تعریف پروژه تا انتخاب متخصص، اجاره GPU، پرداخت امن و داوری مرحله‌ای؛ همه چیز در یک محیط شفاف و حرفه‌ای مدیریت می‌شود.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <PremiumLink href="/projects" variant="primary">تعریف پروژه</PremiumLink>
                <PremiumLink href="/services" variant="teal">مشاهده خدمات</PremiumLink>
                <PremiumAuthButton mode="register" variant="outline">ارائه خدمت</PremiumAuthButton>
                <PremiumLink href="/investment" variant="outline">جذب سرمایه</PremiumLink>
              </div>
              <SearchCommandBanner />
              <TrustStrip />
            </div>
            <HeroPreview />
          </div>
        </div>
      </section>

      <StatsSection />
      <CategorySection />
      <FeaturedServices />
      <ActiveProjects />
      <TrustSection />
      <UserPaths />
      <InvestmentPreview />
      <EducationPreview />
      <FinalCta />
    </>
  );
}

function TopMarketBanner() {
  return (
    <div className="glass-strong flex flex-col justify-between gap-4 rounded-2xl p-3 md:flex-row md:items-center md:p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
          <Landmark className="size-5" />
        </span>
        <div>
          <p className="text-sm font-black text-foreground">مارکت‌پلیس تخصصی هوش مصنوعی برای کسب‌وکارها</p>
          <p className="mt-1 text-xs leading-6 text-muted">متخصصان تاییدشده، پرداخت امن و قرارداد مرحله‌ای در یک محیط شفاف.</p>
        </div>
      </div>
      <AuthTrigger mode="register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 md:w-auto">
        شروع کنید
        <ArrowLeft className="size-4" />
      </AuthTrigger>
    </div>
  );
}

function SearchCommandBanner() {
  return <SmartSearchPanel suggestions={searchSuggestions} className="mt-8 max-w-3xl" />;
}

function HeroPreview() {
  return (
    <div className="relative mx-auto min-h-[470px] w-full max-w-[540px] [perspective:1400px] sm:min-h-[540px] lg:min-h-[580px]">
      <div className="glass-strong absolute inset-x-1 bottom-4 top-8 rounded-[24px] border-white/80 sm:inset-x-4 sm:rounded-[28px]" />
      <div className="card-3d glass-strong absolute right-0 top-5 w-[92%] rotate-1 rounded-2xl p-4 sm:right-2 sm:p-5 md:right-4">
        <div className="mb-4 flex items-center justify-between">
          <BadgeTone tone="teal">تاییدشده</BadgeTone>
          <span className="grid size-12 place-items-center rounded-xl bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-white">
            <Brain className="size-6" />
          </span>
        </div>
        <h3 className="text-base font-black sm:text-lg">طراحی مدل یادگیری ماشین</h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Star className="size-4 fill-warning text-warning" />
          ۴.۹ از ۱۲۳ نظر
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/70 pt-4">
          <span className="text-sm text-muted">۳ تا ۵ روز کاری</span>
          <span className="font-black text-primary">از ۵۰۰,۰۰۰ تومان</span>
        </div>
      </div>

      <div className="card-3d elevated-card absolute left-0 top-40 w-[94%] -rotate-1 rounded-2xl p-4 sm:top-44 sm:w-[90%] sm:p-5 md:left-2">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-black leading-7 sm:text-lg">توسعه سیستم تشخیص چهره برای امنیت</h3>
            <p className="mt-2 text-sm text-muted">شرکت امن‌پرداز</p>
          </div>
          <BadgeTone tone="green">فعال</BadgeTone>
        </div>
        <div className="rounded-xl bg-[#F5F3FF] p-4">
          <p className="text-xs text-muted">بودجه</p>
          <p className="mt-1 text-lg font-black text-primary sm:text-xl">۲۰ تا ۳۰ میلیون تومان</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Deep Learning", "Python", "OpenCV"].map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">{tag}</span>
          ))}
        </div>
      </div>

      <div className="card-3d glass absolute bottom-8 right-3 w-[88%] rounded-2xl bg-[linear-gradient(135deg,rgba(20,184,166,0.94),rgba(15,23,42,0.92))] p-4 text-white sm:bottom-10 sm:right-6 sm:w-[82%] sm:p-6 md:right-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletCards className="size-6" />
            <span className="font-bold">کیف پول امن</span>
          </div>
          <CheckCircle2 className="size-6" />
        </div>
        <p className="text-2xl font-black sm:text-3xl">۱۲,۵۰۰,۰۰۰ تومان</p>
        <p className="mt-2 text-sm text-white/85">پرداخت Escrow، قرارداد دیجیتال و آزادسازی مرحله‌ای</p>
      </div>

      <div className="card-3d glass-strong absolute left-8 top-6 hidden w-44 rounded-2xl p-4 lg:block">
        <p className="text-xs text-muted">تطبیق هوشمند</p>
        <p className="mt-1 text-2xl font-black text-foreground">۹۲٪</p>
        <div className="mt-3 h-2 rounded-full bg-white">
          <div className="h-2 w-[72%] rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { label: "پرداخت امن مرحله‌ای", icon: LockKeyhole },
    { label: "قرارداد دیجیتال", icon: FileText },
    { label: "داوری تخصصی", icon: Scale },
    { label: "متخصصان تاییدشده", icon: BadgeCheck },
    { label: "رتبه‌بندی واقعی", icon: Star }
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 text-sm font-medium text-accent">
          <item.icon className="size-4" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function StatsSection() {
  const stats = [
    ["۳۴۰+", "خدمت تخصصی"],
    ["۸۶+", "پروژه فعال"],
    ["۱۲۰+", "متخصص تاییدشده"],
    ["۴۵+", "شرکت آماده همکاری"],
    ["۱۰۰٪", "پرداخت امن Escrow"]
  ];

  return (
    <section className="border-y border-border bg-white py-8 md:py-10">
      <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([value, label]) => (
          <div key={label} className="card-3d rounded-xl border border-border bg-white p-5 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <p className="text-3xl font-black text-primary">{value}</p>
            <p className="mt-2 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <SectionShell eyebrow="دسته‌بندی‌ها" title="حوزه‌های تخصصی هوش مصنوعی" description="خدمات و پروژه‌ها را بر اساس تخصص دقیق پیدا کنید.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <InfoCard key={category.label} icon={category.icon} title={category.label} />
        ))}
      </div>
    </SectionShell>
  );
}

function FeaturedServices() {
  return (
    <SectionShell eyebrow="مارکت‌پلیس" title="خدمات برگزیده" description="بهترین خدمات هوش مصنوعی از متخصصان و شرکت‌های تاییدشده.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {serviceCards.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </SectionShell>
  );
}

function ActiveProjects() {
  return (
    <SectionShell tone="muted" eyebrow="مناقصه‌ها" title="پروژه‌های فعال" description="فرصت‌های جدید برای متخصصان و شرکت‌های AI.">
      <div className="grid gap-5 lg:grid-cols-3">
        {projectCards.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </SectionShell>
  );
}

function TrustSection() {
  const items = [
    { title: "پرداخت امن Escrow", text: "وجه پروژه تا تایید مرحله‌ای خروجی در حساب امانی نگهداری می‌شود.", icon: LockKeyhole, tone: "teal" },
    { title: "قرارداد دیجیتال", text: "تعهدات، مراحل، زمان‌بندی و پرداخت‌ها قبل از شروع کار شفاف می‌شود.", icon: FileText, tone: "purple" },
    { title: "داوری تخصصی", text: "اختلافات فنی و مالی توسط داوران مستقل حوزه AI بررسی می‌شود.", icon: Scale, tone: "green" },
    { title: "امتیازدهی واقعی", text: "امتیازها فقط بعد از تراکنش و همکاری واقعی ثبت می‌شوند.", icon: Star, tone: "amber" },
    { title: "احراز هویت", text: "کاربران، شرکت‌ها و متخصصان برای اعتماد بیشتر اعتبارسنجی می‌شوند.", icon: Users, tone: "teal" },
    { title: "گزارش مالی شفاف", text: "تراکنش‌ها، کارمزد، تسویه و پرداخت‌های مرحله‌ای قابل رهگیری هستند.", icon: BarChart3, tone: "purple" }
  ] satisfies Array<{ title: string; text: string; icon: LucideIcon; tone: string }>;

  return (
    <SectionShell eyebrow="اعتماد" title="چرا به این پلتفرم اعتماد کنید؟" description="امنیت، شفافیت و کنترل حرفه‌ای در هر مرحله همکاری.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <InfoCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
        ))}
      </div>
    </SectionShell>
  );
}

function UserPaths() {
  return (
    <SectionShell tone="muted" eyebrow="مسیر کاربران" title="مسیر شما در پلتفرم" description="هر نقش، جریان کاری و ابزارهای خودش را دارد.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {paths.map((path) => (
          <div key={path.title} className="card-3d elevated-card rounded-xl p-5">
            <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-white shadow-lg shadow-primary/15">
              <path.icon className="size-7" />
            </span>
            <h3 className="text-lg font-black">{path.title}</h3>
            <p className="mt-3 min-h-20 text-sm leading-7 text-muted">{path.text}</p>
            <button className="mt-5 w-full rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold hover:border-primary/40">
              {path.cta}
            </button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function InvestmentPreview() {
  const items = [
    ["پلتفرم تحلیل هوشمند بورس", "MVP", "۵۰۰ میلیون تومان", "۳۰۰٪", "متوسط", "۶۵٪"],
    ["سیستم تشخیص بیماری با AI", "رشد", "۱ میلیارد تومان", "۴۵۰٪", "کم", "۸۵٪"],
    ["ربات‌های خدماتی هوشمند", "ایده", "۲۰۰ میلیون تومان", "۲۵٪", "بالا", "۲۵٪"]
  ];

  return (
    <SectionShell eyebrow="سرمایه‌گذاری" title="فرصت‌های سرمایه‌گذاری" description="پروژه‌ها و استارتاپ‌های AI با گزارش مرحله، سرمایه و بازده مورد انتظار.">
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map(([title, stage, capital, roi, risk, progress]) => (
          <div key={title} className="card-3d elevated-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <BadgeTone tone="teal">{stage}</BadgeTone>
              <h3 className="text-lg font-black">{title}</h3>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label="سرمایه مورد نیاز" value={capital} />
              <Metric label="بازده مورد انتظار" value={roi} />
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted">سطح ریسک</span>
              <span className="font-bold text-warning">{risk}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-background">
              <div className="h-2 rounded-full bg-[linear-gradient(90deg,#5B21B6,#009A9D)]" style={{ width: progress }} />
            </div>
            <button className="mt-6 w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-primary/40">بررسی فرصت</button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function EducationPreview() {
  const courses = [
    ["یادگیری ماشین با Python", "دکتر علی محمدی", "مقدماتی", "۱,۲۰۰,۰۰۰ تومان"],
    ["یادگیری عمیق و شبکه‌های عصبی", "مهندس سارا احمدی", "متوسط", "۲,۵۰۰,۰۰۰ تومان"],
    ["پردازش زبان طبیعی فارسی", "دکتر رضا کریمی", "پیشرفته", "۳,۲۰۰,۰۰۰ تومان"],
    ["بینایی ماشین و OpenCV", "مهندس مهدی نوری", "متوسط", "۱,۸۰۰,۰۰۰ تومان"]
  ];

  return (
    <SectionShell tone="muted" eyebrow="آموزش" title="آموزش هوش مصنوعی" description="دوره‌های تخصصی از مقدماتی تا پیشرفته برای ورود به بازار AI.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {courses.map(([title, instructor, level, price]) => (
          <div key={title} className="card-3d elevated-card rounded-xl p-5">
            <div className="mb-5 flex items-center justify-between">
              <BadgeTone tone="purple">{level}</BadgeTone>
              <GraduationCap className="size-5 text-muted" />
            </div>
            <h3 className="min-h-14 text-lg font-black leading-7">{title}</h3>
            <p className="mt-2 text-sm text-muted">{instructor}</p>
            <div className="mt-5 flex items-center gap-2 text-sm">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-bold">۴.۸</span>
              <span className="text-muted">۲۴ ساعت</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="font-black text-primary">{price}</span>
              <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">مشاهده دوره</button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function FinalCta() {
  return (
    <section className="bg-[linear-gradient(135deg,#5B21B6,#3B1A84_45%,#009A9D)] py-20 text-white">
      <div className="container-page text-center">
        <h2 className="text-3xl font-black md:text-5xl">از اولین پروژه AI خود شروع کنید</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85">
          در چند دقیقه پروژه تعریف کنید، خدمات تخصصی پیدا کنید یا به عنوان متخصص وارد بازار شوید.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/projects" className="rounded-lg bg-white px-6 py-3 text-sm font-black text-primary">تعریف پروژه</Link>
          <AuthTrigger mode="register" className="rounded-lg border border-white/70 px-6 py-3 text-sm font-black text-white">ثبت‌نام متخصص</AuthTrigger>
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
    <section className={tone === "muted" ? "bg-background py-10 md:py-16" : "bg-white py-10 md:py-16"}>
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="text-right">
            <p className="mb-2 text-sm font-bold text-accent">{eyebrow}</p>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          </div>
          <Link href="/services" className="w-fit rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold hover:border-primary/40">
            مشاهده همه
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

function ServiceCard(props: (typeof serviceCards)[number]) {
  return (
    <article className="card-3d elevated-card flex min-h-[320px] flex-col rounded-xl p-5 transition hover:-translate-y-1 hover:shadow-2xl md:min-h-[370px]">
      <h3 className="text-lg font-black leading-7">{props.title}</h3>
      <p className="mt-3 min-h-16 text-sm leading-7 text-muted">{props.description}</p>
      <div className="mt-5 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-xs font-bold text-white">{props.provider.slice(0, 1)}</span>
        <span className="text-sm font-semibold">{props.provider}</span>
        <CheckCircle2 className="size-4 text-accent" />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Star className="size-4 fill-warning text-warning" />
        <span className="font-black">{props.rating}</span>
        <span className="text-muted">({props.reviews} نظر)</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {props.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-background px-2 py-1 text-xs text-muted">{tag}</span>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between border-t border-border pt-5">
        <div>
          <p className="flex items-center gap-1 text-xs text-muted"><Clock3 className="size-3" />{props.time}</p>
          <p className="mt-2 font-black text-foreground">{props.price}</p>
        </div>
        <button className="rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:border-primary/40">جزئیات</button>
      </div>
    </article>
  );
}

function ProjectCard(props: (typeof projectCards)[number]) {
  return (
    <article className="card-3d elevated-card rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <BadgeTone tone="green">فعال</BadgeTone>
        <div className="text-right">
          <h3 className="text-xl font-black leading-8">{props.title}</h3>
          <p className="mt-2 text-sm text-muted">{props.company}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-[#F5F3FF] p-4">
        <p className="text-xs text-muted">بودجه</p>
        <p className="mt-1 text-xl font-black text-primary">{props.budget}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {props.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-border bg-white px-3 py-1 text-xs">{skill}</span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-sm text-muted">
        <span>{props.proposals}</span>
        <span>{props.days}</span>
      </div>
      <button className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">ارسال پیشنهاد</button>
    </article>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <article className="card-3d elevated-card rounded-xl p-6 transition hover:-translate-y-1 hover:border-primary/30">
      <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-white shadow-lg shadow-primary/15">
        <Icon className="size-7" />
      </span>
      <h3 className="text-lg font-black">{title}</h3>
      {text ? <p className="mt-3 text-sm leading-7 text-muted">{text}</p> : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

function BadgeTone({ children, tone }: { children: React.ReactNode; tone: "teal" | "purple" | "green" | "amber" }) {
  const styles = {
    teal: "bg-[#E6FAFA] text-accent",
    purple: "bg-[#F5F3FF] text-primary",
    green: "bg-green-50 text-success",
    amber: "bg-amber-50 text-warning"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

function PremiumLink({ href, variant, children }: { href: Route; variant: "primary" | "teal" | "outline"; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary text-white shadow-lg shadow-primary/25",
    teal: "bg-accent text-white shadow-lg shadow-accent/20",
    outline: "border border-border bg-white/70 text-foreground hover:bg-white"
  };

  return (
    <Link href={href} className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-black ${styles[variant]}`}>
      {children}
    </Link>
  );
}

function PremiumAuthButton({ mode, variant, children }: { mode: "login" | "register"; variant: "primary" | "teal" | "outline"; children: React.ReactNode }) {
  const styles = {
    primary: "bg-primary text-white shadow-lg shadow-primary/25",
    teal: "bg-accent text-white shadow-lg shadow-accent/20",
    outline: "border border-border bg-white/70 text-foreground hover:bg-white"
  };

  return (
    <AuthTrigger mode={mode} className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-black ${styles[variant]}`}>
      {children}
    </AuthTrigger>
  );
}
