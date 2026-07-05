"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Cpu,
  Database,
  FlaskConical,
  FolderKanban,
  Handshake,
  LogOut,
  TrendingUp,
  UserRound
} from "lucide-react";
import { authApi } from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/store/auth-store";

const domainItems = [
  { title: "مشاوره", href: "/domains" as Route, icon: Handshake, text: "نیازسنجی و نقشه راه AI" },
  { title: "آموزش", href: "/courses" as Route, icon: BookOpen, text: "دوره، کارگاه و مسیر یادگیری" },
  { title: "پژوهش", href: "/domains" as Route, icon: FlaskConical, text: "تحقیق کاربردی و امکان‌سنجی" },
  { title: "پروژه", href: "/projects" as Route, icon: FolderKanban, text: "تعریف و اجرای پروژه" },
  { title: "فرصت شغلی", href: "/domains" as Route, icon: BriefcaseBusiness, text: "اتصال متخصص و سازمان" },
  { title: "سخت‌افزار و زیرساخت", href: "/services" as Route, icon: Cpu, text: "GPU، سرور و ابزار پردازشی" },
  { title: "سرمایه‌گذاری", href: "/investment" as Route, icon: TrendingUp, text: "فرصت رشد کسب‌وکارهای AI" },
  { title: "تامین داده", href: "/domains" as Route, icon: Database, text: "آماده‌سازی و برچسب‌گذاری داده" }
];

export function PublicHeader() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const shouldHide = window.scrollY > 120;
      setHiddenByScroll(shouldHide);
      if (shouldHide) {
        setDomainsOpen(false);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await authApi.logout().catch(() => null);
    clearSession();
  }

  return (
    <header className={`sticky top-0 z-40 border-b border-border/70 bg-white/94 backdrop-blur-2xl transition-transform duration-300 ease-out ${hiddenByScroll ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="container-page flex min-h-[76px] items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/ainet-lockup-cropped.png"
            alt="آی نت"
            width={213}
            height={68}
            className="h-10 w-32 object-contain sm:h-12 sm:w-40 md:w-48"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-extrabold text-muted lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setDomainsOpen(true)}
            onMouseLeave={() => setDomainsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDomainsOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground"
              aria-expanded={domainsOpen}
              aria-haspopup="true"
            >
              حوزه‌های تخصصی
              <ChevronDown className={`size-4 transition ${domainsOpen ? "rotate-180" : ""}`} />
            </button>
            {domainsOpen ? (
              <div className="absolute right-0 top-full z-50 w-[760px] max-w-[calc(100vw-32px)] pt-3">
                <div className="rounded-xl border border-border/80 bg-white p-3 text-right shadow-[0_28px_90px_rgba(15,23,42,0.18)] ring-1 ring-white">
                  <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-3">
                    <Link href="/domains" onClick={() => setDomainsOpen(false)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-black text-white">
                      همه حوزه‌ها
                      <ArrowLeft className="size-4" />
                    </Link>
                    <div>
                      <p className="text-sm font-black text-foreground">انتخاب حوزه تخصصی</p>
                      <p className="mt-1 text-xs font-bold text-muted">از اینجا وارد مسیر مناسب آی نت شوید.</p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {domainItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setDomainsOpen(false)}
                        className="group min-h-24 rounded-lg border border-border bg-white p-3 transition hover:border-accent/50 hover:bg-background hover:shadow-sm"
                      >
                        <span className="mb-3 inline-grid size-9 place-items-center rounded-md bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                          <item.icon className="size-5" />
                        </span>
                        <h3 className="text-sm font-black text-foreground">{item.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/services" className="rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground">خدمات و تجهیزات</Link>
          <Link href="/projects" className="rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground">پروژه‌های فعال</Link>
          <Link href="/courses" className="rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground">آموزش</Link>
          <Link href="/investment" className="rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground">سرمایه‌گذاری</Link>
          <Link href="/about" className="rounded-md px-3 py-2 transition hover:bg-background hover:text-foreground">درباره</Link>
        </nav>
        {!hasHydrated ? (
          <div className="flex items-center gap-2" aria-label="در حال آماده‌سازی حساب">
            <span className="h-10 w-28 animate-pulse rounded-md border border-border bg-white/76 shadow-panel" />
            <span className="hidden h-10 w-10 animate-pulse rounded-md border border-border bg-white/76 shadow-panel sm:block" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-border bg-white/76 px-3 py-2 text-sm font-bold shadow-panel hover:bg-white">
              <UserRound className="size-4" />
              <span className="hidden sm:inline">{user.firstName || user.username}</span>
            </Link>
            <button type="button" onClick={handleLogout} className="grid size-10 place-items-center rounded-md border border-border bg-white/76 text-muted shadow-panel hover:bg-white" aria-label="خروج">
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => openAuthDialog("login")} className="rounded-md border border-border bg-white/76 px-3 py-2 text-sm shadow-panel hover:bg-white">
              ورود
            </button>
            <button type="button" onClick={() => openAuthDialog("register")} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-panel hover:bg-primary/90">
              <span>ثبت‌نام</span>
              <ArrowLeft className="size-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
