"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, Award, BarChart3, BriefcaseBusiness, Building2, CircleDollarSign, FileText, GraduationCap, Home, LayoutDashboard, LifeBuoy, ListChecks, LogOut, Search, Tags, TrendingUp, UsersRound } from "lucide-react";
import { AccessGate } from "@/components/auth/access-gate";
import { PanelPersonalizationMenu } from "@/components/personalization/panel-personalization-menu";
import { NotificationCenter } from "@/components/system/notification-center";
import { adminNavigation } from "@/config/navigation";
import { authApi } from "@/features/auth/api/auth-api";
import { canAccessAdminPanel, canAccessCompanyPanel, hasApprovedRole, roleNames } from "@/lib/auth/access-control";
import { useAuthStore } from "@/store/auth-store";
import { getPanelPreference, usePanelPreferencesStore } from "@/store/panel-preferences-store";

const adminIcons = {
  "/admin": LayoutDashboard,
  "/admin/users": UsersRound,
  "/admin/categories": Building2,
  "/admin/tags": Tags,
  "/admin/listings": ListChecks,
  "/admin/projects": BriefcaseBusiness,
  "/admin/investments": TrendingUp,
  "/admin/education": GraduationCap,
  "/admin/tickets": LifeBuoy,
  "/admin/badges": Award,
  "/admin/finance": CircleDollarSign,
  "/admin/reports": BarChart3
} as const;

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const canOpenCompany = canAccessCompanyPanel(user);
  const canManageAdmin = hasApprovedRole(user, [roleNames.admin, roleNames.superAdmin]);
  const supportOnly = hasApprovedRole(user, [roleNames.support]) && !canManageAdmin;
  const preference = usePanelPreferencesStore((state) => getPanelPreference(state.preferences.admin, "admin"));
  const loadPreference = usePanelPreferencesStore((state) => state.loadPreference);

  useEffect(() => {
    void loadPreference("admin");
  }, [loadPreference]);

  const sidebarOnLeft = preference.sidebarSide === "left";
  const visibleAdminNavigation = supportOnly ? adminNavigation.filter((item) => item.href === "/admin/tickets") : adminNavigation;
  const supportBlockedPath = supportOnly && pathname !== "/admin/tickets";

  async function handleLogout() {
    await authApi.logout().catch(() => null);
    clearSession();
    window.location.href = "/";
  }

  return (
    <AccessGate checkAccess={canAccessAdminPanel} fallbackHref="/dashboard" fallbackLabel="داشبورد کاربر" title="دسترسی مدیریت ندارید" description="ورود به این پنل فقط برای نقش‌های مدیریت یا پشتیبانی تاییدشده مجاز است.">
      <div className="nexa-admin-workspace ainet-admin-workspace" data-panel-key="admin" data-panel-theme={preference.themeKey} data-panel-density={preference.densityKey} data-panel-font={preference.fontScale} data-panel-family={preference.fontFamily} data-sidebar-mode={preference.sidebarMode} data-sidebar-side={preference.sidebarSide}>
        <aside className={`nexa-admin-sidebar ainet-admin-sidebar fixed inset-y-4 z-30 hidden w-[260px] overflow-hidden rounded-lg xl:block ${sidebarOnLeft ? "left-4" : "right-4"}`}>
          <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 p-4">
              <Link href={supportOnly ? "/admin/tickets" : "/admin"} className="block rounded-lg border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/[0.09]">
                <Image src="/brand/ainet-lockup-cropped.png" alt="آی نت" width={170} height={54} priority className="h-9 w-36 object-contain brightness-0 invert" />
                <span className="mt-2 block text-xs font-bold text-white/58">{supportOnly ? "مرکز پشتیبانی شبکه آی نت" : "مرکز مدیریت شبکه آی نت"}</span>
              </Link>
            </div>

            <div className="shrink-0 px-4 pb-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/58">سلامت سیستم</span>
                  <span className="inline-flex items-center gap-2 font-black text-white">
                    <span className="size-2 rounded-full bg-primary animate-soft-pulse" />
                    ۸۶٪ عالی
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-white/[0.075] p-2">
                    <div className="font-black text-white">۱۲</div>
                    <div className="mt-1 text-white/45">پروژه</div>
                  </div>
                    <div className="rounded-md bg-white/[0.075] p-2">
                    <div className="font-black text-white">۳۲</div>
                    <div className="mt-1 text-white/45">عضو</div>
                  </div>
                    <div className="rounded-md bg-white/[0.075] p-2">
                    <div className="font-black text-white">۳</div>
                    <div className="mt-1 text-white/45">پیام</div>
                  </div>
                </div>
              </div>
            </div>

            <nav className="nexa-sidebar-scroll grid min-h-0 flex-1 content-start gap-1 overflow-y-auto px-3 pb-3">
              {visibleAdminNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = adminIcons[item.href as keyof typeof adminIcons] ?? FileText;
                return (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                      active ? "border-r-2 border-[#8b5cf6] bg-white/12 text-white shadow-[0_12px_34px_rgb(139_92_246_/_0.16)]" : "border-r-2 border-transparent text-white/66 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon className={active ? "size-4 text-[#8b5cf6]" : "size-4 text-white/62 group-hover:text-[#8b5cf6]"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="shrink-0 px-4 pb-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.055] p-3">
                <div className="text-xs text-white/50">کیف پول مدیریت</div>
                <div className="mt-1 text-lg font-black text-white">۳۴۶,۸۵۰,۰۰۰</div>
                <div className="mt-1 text-xs text-white/45">تومان</div>
                <Link href="/admin/finance" className="mt-3 flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
                  بررسی مالی
                </Link>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 p-3">
              {canOpenCompany ? (
                <Link href="/company" className="mb-2 flex h-10 items-center justify-between rounded-md border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-white/76 hover:bg-white/10 hover:text-white">
                  پنل شرکت
                  <ArrowLeft className="size-4" />
                </Link>
              ) : null}
              <Link href="/dashboard" className="flex h-10 items-center justify-between rounded-md border border-white/10 px-3 text-sm font-bold text-white/68 hover:bg-white/[0.07] hover:text-white">
                داشبورد کاربر
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </aside>

        <div className={`min-w-0 ${sidebarOnLeft ? "xl:pl-[264px]" : "xl:pr-[264px]"}`}>
          <header className="nexa-admin-header ainet-admin-header sticky top-0 z-20">
            <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 md:px-6 xl:px-8">
              <div>
                <div className="text-xs font-bold text-primary">مرکز مدیریت آی نت</div>
                <h1 className="mt-1 text-base font-black md:text-xl">کنترل کاربران، پروژه‌ها، محتوا و مالی شبکه</h1>
              </div>
              <div className="hidden h-11 w-[340px] items-center gap-2 rounded-md border border-border bg-white/84 px-3 text-sm text-muted shadow-panel lg:flex">
                <Search className="size-4" />
                <span>جستجو در کاربران، پروژه‌ها، خدمات و گزارش‌ها...</span>
                <kbd className="mr-auto rounded bg-background px-2 py-1 text-[10px] text-muted">Ctrl + K</kbd>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white/86 px-3 text-sm font-bold text-muted shadow-panel hover:text-primary">
                  <Home className="size-4" />
                  صفحه اصلی
                </Link>
                <PanelPersonalizationMenu panelKey="admin" />
                <NotificationCenter label="اعلان‌های مدیریت" />
                <button type="button" onClick={handleLogout} title="خروج" className="grid size-10 place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel transition hover:border-danger/40 hover:text-danger">
                  <LogOut className="size-4" />
                </button>
                <Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white/86 px-3 text-sm font-bold text-muted shadow-panel hover:text-foreground">
                  داشبورد کاربر
                  <ArrowLeft className="size-4" />
                </Link>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto border-t border-border/60 px-4 py-2 xl:hidden">
              <Link href="/" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted">
                <Home className="size-3.5" />
                صفحه اصلی
              </Link>
              <button type="button" onClick={handleLogout} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted">
                <LogOut className="size-3.5" />
                خروج
              </button>
              {visibleAdminNavigation.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = adminIcons[item.href as keyof typeof adminIcons] ?? FileText;
                return (
                  <Link key={item.href} href={item.href as never} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-bold ${active ? "nav-item-active" : "bg-white text-muted"}`}>
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="min-w-0 px-4 py-5 md:px-6 md:py-7 xl:px-8 2xl:px-10">
            {supportBlockedPath ? (
              <div className="dashboard-card p-6">
                <h2 className="text-lg font-black">دسترسی محدود پشتیبانی</h2>
                <p className="mt-2 text-sm leading-7 text-muted">نقش پشتیبان فقط به صف تیکت‌ها و پاسخ‌گویی دسترسی دارد.</p>
                <Link href="/admin/tickets" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-bold text-white">
                  ورود به پشتیبانی
                </Link>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </AccessGate>
  );
}









