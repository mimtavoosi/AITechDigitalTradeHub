"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  BriefcaseBusiness,
  CircleHelp,
  CircleUserRound,
  Home,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Store,
  WalletCards
} from "lucide-react";
import { AccessGate } from "@/components/auth/access-gate";
import { PanelPersonalizationMenu } from "@/components/personalization/panel-personalization-menu";
import { NotificationCenter } from "@/components/system/notification-center";
import { dashboardNavigation } from "@/config/navigation";
import { authApi } from "@/features/auth/api/auth-api";
import { canAccessAdminPanel, canAccessCompanyPanel, canAccessDashboard } from "@/lib/auth/access-control";
import { useAuthStore } from "@/store/auth-store";
import { getPanelPreference, usePanelPreferencesStore } from "@/store/panel-preferences-store";

const navigationIcons = {
  "/dashboard": LayoutGrid,
  "/dashboard/projects": BriefcaseBusiness,
  "/dashboard/services": Store,
  "/dashboard/courses": BookOpenText,
  "/dashboard/wallet": WalletCards,
  "/dashboard/messages": MessageCircle,
  "/dashboard/tickets": CircleHelp,
  "/dashboard/settings": Settings
} as const;

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const canOpenCompany = canAccessCompanyPanel(user);
  const canOpenAdmin = canAccessAdminPanel(user);
  const preference = usePanelPreferencesStore((state) => getPanelPreference(state.preferences.dashboard, "dashboard"));
  const loadPreference = usePanelPreferencesStore((state) => state.loadPreference);
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : "کاربر آی نت";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("");
  const activeRoles =
    user?.roles
      ?.filter((role) => String(role.status) === "2" || String(role.status).toLowerCase() === "approved")
      .map((role) => role.description || role.roleName)
      .slice(0, 2)
      .join("، ") || "عضو پلتفرم";

  useEffect(() => {
    void loadPreference("dashboard");
  }, [loadPreference]);

  const sidebarOnLeft = preference.sidebarSide === "left";

  async function handleLogout() {
    await authApi.logout().catch(() => null);
    clearSession();
    window.location.href = "/";
  }

  return (
    <AccessGate checkAccess={canAccessDashboard} fallbackHref="/" fallbackLabel="سایت عمومی" title="حساب شما امکان ورود به داشبورد را ندارد" description="برای ورود به داشبورد باید حساب فعال داشته باشید. اگر حساب تعلیق یا مسدود شده، از پشتیبانی پیگیری کنید.">
    <div className="nexa-admin-workspace ainet-user-workspace" data-panel-key="dashboard" data-panel-theme={preference.themeKey} data-panel-density={preference.densityKey} data-panel-font={preference.fontScale} data-panel-family={preference.fontFamily} data-sidebar-mode={preference.sidebarMode} data-sidebar-side={preference.sidebarSide}>
      <aside className={`nexa-admin-sidebar ainet-user-sidebar fixed inset-y-4 z-30 hidden w-[260px] overflow-hidden rounded-lg xl:block ${sidebarOnLeft ? "left-4" : "right-4"}`}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-white/10 p-4">
            <Link href="/dashboard" className="block rounded-lg border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/[0.09]">
              <Image src="/brand/ainet-lockup-cropped.png" alt="آی نت" width={170} height={54} priority className="h-9 w-36 object-contain brightness-0 invert" />
              <span className="mt-2 block text-xs font-bold text-white/58">پنل کاربری شبکه تخصصی هوش مصنوعی</span>
            </Link>
          </div>

          <div className="shrink-0 p-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-sm font-black text-foreground">{initials || "آ"}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black">{displayName}</div>
                    <div className="mt-1 truncate text-xs text-white/58">{activeRoles}</div>
                  </div>
                </div>
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-white/[0.075] p-2">
                  <div className="text-white/54">اعتبار</div>
                  <div className="mt-1 font-black">{user?.trustScore ?? 0}</div>
                </div>
                <div className="rounded-md bg-white/[0.075] p-2">
                  <div className="text-white/54">تایید</div>
                  <div className="mt-1 font-black">{user?.isVerified ? "فعال" : "در انتظار"}</div>
                </div>
              </div>
            </div>
          </div>

          <nav className="nexa-sidebar-scroll grid min-h-0 flex-1 content-start gap-1 overflow-y-auto px-3 pb-3">
            {dashboardNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = navigationIcons[item.href as keyof typeof navigationIcons] ?? Home;
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                    active ? "border-r-2 border-[#2dd4bf] bg-white/12 text-white shadow-[0_12px_34px_rgb(45_212_191_/_0.14)]" : "border-r-2 border-transparent text-white/66 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon className={`size-4 ${active ? "text-[#2dd4bf]" : "text-white/62 group-hover:text-[#2dd4bf]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-white/10 p-3">
            {canOpenAdmin ? (
              <Link href="/admin" className="mb-2 flex h-9 items-center justify-between rounded-md border border-white/10 bg-primary px-3 text-sm font-bold text-white hover:bg-primary/90">
                پنل مدیریت
                <ArrowLeft className="size-4" />
              </Link>
            ) : null}
            {canOpenCompany ? (
              <Link href="/company" className="mb-2 flex h-9 items-center justify-between rounded-md border border-white/10 bg-white/[0.055] px-3 text-sm font-bold text-white/76 hover:bg-white/10 hover:text-white">
                پنل شرکت
                <ArrowLeft className="size-4" />
              </Link>
            ) : null}
            <Link href="/" className="flex h-9 items-center justify-between rounded-md border border-white/10 px-3 text-sm font-bold text-white/68 hover:bg-white/[0.07] hover:text-white">
              سایت عمومی
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      <div className={`min-w-0 ${sidebarOnLeft ? "xl:pl-[284px]" : "xl:pr-[284px]"}`}>
        <header className="nexa-admin-header ainet-user-header sticky top-0 z-20">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 md:px-6 xl:px-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="size-4 text-primary" />
                پنل کاربری آی نت
              </div>
              <h1 className="mt-1 truncate text-base font-black md:text-xl">مدیریت پروژه‌ها، خدمات، آموزش و پرداخت‌های شما</h1>
            </div>

            <div className="hidden h-11 w-[320px] items-center gap-2 rounded-md border border-border bg-white/78 px-3 text-sm text-muted shadow-panel lg:flex">
              <Search className="size-4" />
              <span>جستجو در پروژه‌ها، خدمات و آموزش من</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/" className="hidden h-10 items-center gap-2 rounded-md border border-border bg-white/86 px-3 text-sm font-bold text-muted shadow-panel transition hover:border-primary/35 hover:text-primary md:inline-flex">
                <Home className="size-4" />
                صفحه اصلی
              </Link>
              <PanelPersonalizationMenu panelKey="dashboard" />
              <NotificationCenter />
              <button type="button" onClick={handleLogout} title="خروج" className="grid size-10 place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel transition hover:border-danger/40 hover:text-danger">
                <LogOut className="size-4" />
              </button>
              <button type="button" title="حساب کاربری" className="grid size-10 place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel hover:text-foreground">
                <CircleUserRound className="size-4" />
              </button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-border/60 px-4 py-2 xl:hidden">
            <Link href="/" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted">
              <Home className="size-3.5" />
              صفحه اصلی
            </Link>
            {dashboardNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = navigationIcons[item.href as keyof typeof navigationIcons] ?? Home;
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-bold ${
                    active ? "nav-item-active" : "bg-white text-muted"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 px-4 py-5 md:px-6 md:py-7 xl:px-8 2xl:px-10">{children}</main>
      </div>
    </div>
    </AccessGate>
  );
}



