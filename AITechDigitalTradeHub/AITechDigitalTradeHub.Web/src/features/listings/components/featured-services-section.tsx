import Link from "next/link";
import { ArrowLeft, CheckCircle2, Cloud, Cpu, Database, Server } from "lucide-react";

const featuredServices = [
  {
    title: "پردازش GPU ابری",
    category: "زیرساخت پردازشی",
    text: "دسترسی ساعتی و پروژه‌ای به GPU برای آموزش مدل، Fine-tune و پردازش‌های سنگین.",
    icon: Cpu,
    price: "شروع از ۹۵۰٬۰۰۰ ریال",
    features: ["تحویل سریع دسترسی", "فضای ذخیره‌سازی امن", "پشتیبانی فنی"]
  },
  {
    title: "استقرار و پایش مدل",
    category: "MLOps سازمانی",
    text: "آماده‌سازی سرویس مدل، نسخه‌بندی، مانیتورینگ و مقیاس‌پذیری برای محیط عملیاتی.",
    icon: Cloud,
    price: "برآورد بر اساس پروژه",
    features: ["استقرار API", "پایش کیفیت و مصرف", "مدیریت نسخه مدل"]
  },
  {
    title: "سرور اختصاصی هوش مصنوعی",
    category: "سخت‌افزار و شبکه",
    text: "تامین و پیکربندی سرور مناسب برای تیم‌های داده، آزمایشگاه‌ها و محصولات AI.",
    icon: Server,
    price: "مشاوره و قیمت روز",
    features: ["انتخاب پیکربندی", "راه‌اندازی و تست", "پشتیبانی زیرساخت"]
  },
  {
    title: "آماده‌سازی دیتاست فارسی",
    category: "خدمات داده",
    text: "پاک‌سازی، برچسب‌گذاری و کنترل کیفیت داده متنی، تصویری و صوتی برای آموزش مدل.",
    icon: Database,
    price: "شروع از بسته ۱۰هزار رکورد",
    features: ["تعریف دستورالعمل", "کنترل کیفیت چندمرحله‌ای", "خروجی استاندارد"]
  }
];

export function FeaturedServicesSection() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-right">
            <p className="mb-2 text-sm font-bold text-accent">خدمات و زیرساخت</p>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">خدمات و زیرساخت‌های برتر</h2>
            <p className="mt-3 text-sm leading-7 text-muted">ظرفیت‌های مورد نیاز برای ساخت، آموزش و استقرار محصولات هوش مصنوعی را یکجا بررسی کنید.</p>
          </div>
          <Link href="/services" className="inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-bold transition hover:border-primary/40 hover:text-primary">
            مشاهده همه خدمات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.title} href="/services" className="group flex min-h-[330px] flex-col rounded-xl border border-border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_16px_36px_rgba(15,23,42,0.075)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-accent">{service.category}</span>
                  <Icon className="size-8 stroke-[1.7] text-primary transition group-hover:text-accent" />
                </div>
                <h3 className="mt-6 text-lg font-black leading-8">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{service.text}</p>
                <div className="mt-5 grid gap-2">
                  {service.features.map((feature) => (
                    <span key={feature} className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                      <CheckCircle2 className="size-4 text-success" />
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-auto border-t border-border pt-5">
                  <div className="text-xs text-muted">شرایط ارائه</div>
                  <div className="mt-1 font-black text-primary">{service.price}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
