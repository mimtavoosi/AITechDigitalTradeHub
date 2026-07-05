"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Cpu,
  Database,
  FlaskConical,
  FolderKanban,
  Handshake,
  GraduationCap,
  Home,
  Info,
  LogIn,
  Rocket,
  Sparkles,
  TrendingUp
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const domainItems = [
  { title: "مشاوره", href: "/domains" as Route, icon: Handshake, text: "نیازسنجی و مسیر AI" },
  { title: "آموزش", href: "/courses" as Route, icon: BookOpen, text: "دوره و کارگاه" },
  { title: "پژوهش", href: "/domains" as Route, icon: FlaskConical, text: "تحقیق کاربردی" },
  { title: "پروژه", href: "/projects" as Route, icon: FolderKanban, text: "تعریف و اجرا" },
  { title: "فرصت شغلی", href: "/domains" as Route, icon: BriefcaseBusiness, text: "متخصص و سازمان" },
  { title: "زیرساخت", href: "/services" as Route, icon: Cpu, text: "GPU و سرور" },
  { title: "سرمایه‌گذاری", href: "/investment" as Route, icon: TrendingUp, text: "فرصت رشد" },
  { title: "تامین داده", href: "/services" as Route, icon: Database, text: "داده قابل اتکا" }
];

const pageItems = [
  { href: "/", label: "صفحه اصلی", icon: Home, primary: true },
  { href: "/domains", label: "حوزه‌های تخصصی", icon: Sparkles, primary: false },
  { href: "/services", label: "خدمات و تجهیزات", icon: Rocket, primary: false },
  { href: "/projects", label: "پروژه‌ها", icon: BriefcaseBusiness, primary: false },
  { href: "/investment", label: "سرمایه‌گذاری", icon: TrendingUp, primary: false },
  { href: "/courses", label: "آموزش", icon: GraduationCap, primary: false },
  { href: "/about", label: "درباره", icon: Info, primary: false }
] as const;

type NavItem = {
  href?: Route;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
  onClick?: () => void;
};

export function PublicNavigationDock() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const pathname = usePathname();
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [dockVisible, setDockVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const shouldShow = window.scrollY > 120;
      setDockVisible(shouldShow);
      if (!shouldShow) {
        setDomainsOpen(false);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mobileItems: NavItem[] = [
    { href: "/", label: "خانه", icon: Home, primary: pathname === "/" },
    { label: "حوزه‌ها", icon: Sparkles, primary: pathname.startsWith("/domains"), onClick: () => setDomainsOpen((open) => !open) },
    { href: "/projects", label: "پروژه‌ها", icon: BriefcaseBusiness, primary: pathname.startsWith("/projects") },
    { href: "/courses", label: "آموزش", icon: GraduationCap, primary: pathname.startsWith("/courses") },
    !hasHydrated
      ? { label: "حساب", icon: LogIn }
      : user
      ? { href: "/dashboard", label: "داشبورد", icon: LogIn, primary: pathname.startsWith("/dashboard") }
      : { label: "ورود", icon: LogIn, onClick: () => openAuthDialog("login") }
  ];

  return (
    <>
      {domainsOpen && dockVisible ? (
        <button
          type="button"
          aria-label="بستن انتخاب حوزه‌ها"
          className="fixed inset-0 z-40 bg-slate-950/10 backdrop-blur-[1px]"
          onClick={() => setDomainsOpen(false)}
        />
      ) : null}

      {domainsOpen && dockVisible ? (
        <div className="fixed inset-x-3 bottom-[86px] z-50 rounded-2xl border border-white/70 bg-white/88 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.18)] ring-1 ring-white/40 backdrop-blur-2xl md:hidden">
          <DomainChooser onClose={() => setDomainsOpen(false)} compact />
        </div>
      ) : null}

      <nav className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/56 bg-white/[0.50] px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-18px_55px_rgba(15,23,42,0.14)] ring-1 ring-white/28 backdrop-blur-2xl transition duration-300 ease-out md:hidden ${dockVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileItems.map((item) => (
            <MobileNavButton key={item.label} item={item} />
          ))}
        </div>
      </nav>

      <nav className={`fixed inset-x-0 bottom-4 z-50 hidden px-3 transition duration-300 ease-out md:block ${dockVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"}`}>
        <div className="relative mx-auto w-fit max-w-[calc(100vw-24px)]">
          {domainsOpen && dockVisible ? (
            <div className="absolute bottom-[calc(100%+12px)] right-0 w-[720px] max-w-[calc(100vw-24px)] rounded-xl border border-white/70 bg-white/88 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.18)] ring-1 ring-white/40 backdrop-blur-2xl">
              <DomainChooser onClose={() => setDomainsOpen(false)} />
            </div>
          ) : null}
          <div className="flex w-fit max-w-[calc(100vw-24px)] items-center gap-1 overflow-x-auto rounded-lg border border-white/56 bg-white/[0.50] p-1.5 shadow-[0_18px_58px_rgba(15,23,42,0.16)] ring-1 ring-white/28 backdrop-blur-2xl">
        {pageItems.map((item) => (
          item.href === "/domains" ? (
            <button
              key={item.href}
              type="button"
              onClick={() => setDomainsOpen((open) => !open)}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md border px-3.5 text-sm font-bold shadow-[0_1px_0_rgba(255,255,255,0.42)_inset] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/64 ${
                domainsOpen || pathname.startsWith("/domains")
                  ? "border-primary/30 bg-white/76 text-primary"
                  : "border-white/52 bg-white/[0.34] text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.primary
                  ? "inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-white shadow-panel"
                  : "inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/52 bg-white/[0.34] px-3.5 text-sm font-bold text-foreground shadow-[0_1px_0_rgba(255,255,255,0.42)_inset] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/64"
              }
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        ))}
        {!hasHydrated ? (
          <span className="inline-flex h-11 w-24 shrink-0 animate-pulse rounded-md border border-border/70 bg-white/58" aria-label="در حال آماده‌سازی حساب" />
        ) : user ? (
          <Link className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/52 bg-white/[0.34] px-3.5 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/64" href="/dashboard">
            <LogIn className="size-4" />
            <span>داشبورد</span>
          </Link>
        ) : (
          <>
            <button type="button" onClick={() => openAuthDialog("login")} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/52 bg-white/[0.34] px-3.5 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/64">
              <LogIn className="size-4" />
              <span>ورود</span>
            </button>
            <button type="button" onClick={() => openAuthDialog("register")} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-white/52 bg-white/[0.34] px-3.5 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/64">
              <Rocket className="size-4" />
              <span>ثبت‌نام</span>
            </button>
          </>
        )}
          </div>
        </div>
      </nav>
    </>
  );
}

function DomainChooser({ onClose, compact = false }: { onClose: () => void; compact?: boolean }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/70 pb-3 text-right">
        <Link href="/domains" onClick={onClose} className="inline-flex shrink-0 items-center rounded-md bg-primary px-3 py-2 text-xs font-black text-white">
          همه حوزه‌ها
        </Link>
        <div>
          <p className="text-sm font-black text-foreground">انتخاب حوزه تخصصی</p>
          <p className="mt-1 text-xs font-bold text-muted">مسیر مورد نیازتان را سریع انتخاب کنید.</p>
        </div>
      </div>
      <div className={compact ? "grid max-h-[52svh] gap-2 overflow-y-auto sm:grid-cols-2" : "grid gap-2 sm:grid-cols-2 lg:grid-cols-4"}>
        {domainItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            onClick={onClose}
            className="group flex min-h-20 items-center gap-3 rounded-lg border border-border bg-white p-3 text-right transition hover:border-accent/50 hover:bg-background hover:shadow-sm"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
              <item.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-foreground">{item.title}</span>
              <span className="mt-1 block truncate text-xs font-bold text-muted">{item.text}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileNavButton({ item }: { item: NavItem }) {
  const className = item.primary
    ? "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
    : "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-muted transition hover:bg-white hover:text-foreground";

  const content = (
    <>
      <item.icon className="size-5 shrink-0" />
      <span className="max-w-full truncate text-[11px] font-extrabold leading-none">{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={className}>
      {content}
    </button>
  );
}
