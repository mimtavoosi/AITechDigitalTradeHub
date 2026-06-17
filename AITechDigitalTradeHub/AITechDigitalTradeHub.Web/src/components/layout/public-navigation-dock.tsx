"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
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

const pageItems = [
  { href: "/", label: "صفحه اصلی", icon: Home, primary: true },
  { href: "/services", label: "خدمات", icon: Sparkles, primary: false },
  { href: "/projects", label: "پروژه‌ها", icon: BriefcaseBusiness, primary: false },
  { href: "/investment", label: "سرمایه‌گذاری", icon: TrendingUp, primary: false },
  { href: "/courses", label: "آموزش", icon: GraduationCap, primary: false },
  { href: "/companies", label: "شرکت‌ها", icon: Building2, primary: false },
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
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const pathname = usePathname();

  const mobileItems: NavItem[] = [
    { href: "/", label: "خانه", icon: Home, primary: pathname === "/" },
    { href: "/services", label: "خدمات", icon: Sparkles, primary: pathname.startsWith("/services") },
    { href: "/projects", label: "پروژه‌ها", icon: BriefcaseBusiness, primary: pathname.startsWith("/projects") },
    { href: "/about", label: "درباره", icon: Info, primary: pathname.startsWith("/about") },
    user
      ? { href: "/dashboard", label: "داشبورد", icon: LogIn, primary: pathname.startsWith("/dashboard") }
      : { label: "ورود", icon: LogIn, onClick: () => openAuthDialog("login") }
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/75 bg-white/78 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-18px_55px_rgba(15,23,42,0.14)] backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileItems.map((item) => (
            <MobileNavButton key={item.label} item={item} />
          ))}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-5 z-50 hidden px-3 md:block">
        <div className="mx-auto flex w-fit max-w-[calc(100vw-24px)] items-center gap-1 overflow-x-auto rounded-2xl border border-white/75 bg-white/72 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.20)] backdrop-blur-2xl">
        {pageItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              item.primary
                ? "inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white shadow-lg shadow-primary/25"
                : "inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-white/48 px-4 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white"
            }
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        ))}
        {user ? (
          <Link className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-white/48 px-4 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white" href="/dashboard">
            <LogIn className="size-4" />
            <span>داشبورد</span>
          </Link>
        ) : (
          <>
            <button type="button" onClick={() => openAuthDialog("login")} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-white/48 px-4 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white">
              <LogIn className="size-4" />
              <span>ورود</span>
            </button>
            <button type="button" onClick={() => openAuthDialog("register")} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-white/48 px-4 text-sm font-bold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white">
              <Rocket className="size-4" />
              <span>ثبت‌نام</span>
            </button>
          </>
        )}
        </div>
      </nav>
    </>
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
