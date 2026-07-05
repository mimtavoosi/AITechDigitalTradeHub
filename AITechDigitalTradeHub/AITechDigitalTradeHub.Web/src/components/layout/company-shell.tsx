"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UsersRound
} from "lucide-react";
import { AccessGate } from "@/components/auth/access-gate";
import { PanelPersonalizationMenu } from "@/components/personalization/panel-personalization-menu";
import { NotificationCenter } from "@/components/system/notification-center";
import { companyNavigation } from "@/config/navigation";
import { authApi } from "@/features/auth/api/auth-api";
import { canAccessCompanyPanel } from "@/lib/auth/access-control";
import { useAuthStore } from "@/store/auth-store";
import { getPanelPreference, usePanelPreferencesStore } from "@/store/panel-preferences-store";

const companyIcons = {
  "/company": LayoutDashboard,
  "/company/members": UsersRound,
  "/company/projects": BriefcaseBusiness,
  "/company/services": Store,
  "/company/payments": CircleDollarSign,
  "/company/reports": BarChart3,
  "/company/settings": Settings
} as const;

function isActivePath(pathname: string, href: string) {
  return href === "/company" ? pathname === href : pathname.startsWith(href);
}

export function CompanyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clearSession = useAuthStore((state) => state.clearSession);
  const preference = usePanelPreferencesStore((state) => getPanelPreference(state.preferences.company, "company"));
  const loadPreference = usePanelPreferencesStore((state) => state.loadPreference);

  useEffect(() => {
    void loadPreference("company");
  }, [loadPreference]);

  const sidebarOnLeft = preference.sidebarSide === "left";

  async function handleLogout() {
    await authApi.logout().catch(() => null);
    clearSession();
    window.location.href = "/";
  }

  return (
    <AccessGate checkAccess={canAccessCompanyPanel} fallbackHref="/dashboard" fallbackLabel="داشبورد کاربر" title="دسترسی سازمانی ندارید" description="برای ورود به پنل سازمان باید نقش OrganizationAdmin تاییدشده داشته باشید یا مدیر سیستم باشید.">
    <div className="nexa-admin-workspace ainet-company-workspace" data-panel-key="company" data-panel-theme={preference.themeKey} data-panel-density={preference.densityKey} data-panel-font={preference.fontScale} data-panel-family={preference.fontFamily} data-sidebar-mode={preference.sidebarMode} data-sidebar-side={preference.sidebarSide}>
      <aside className={`nexa-admin-sidebar ainet-company-sidebar fixed inset-y-4 z-30 hidden w-[260px] overflow-hidden rounded-lg xl:block ${sidebarOnLeft ? "left-4" : "right-4"}`}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-white/10 p-4">
            <Link href="/company" className="block rounded-lg border border-white/10 bg-white/[0.06] p-3 transition hover:bg-white/[0.09]">
              <Image src="/brand/ainet-lockup-cropped.png" alt="آی نت" width={170} height={54} priority className="h-9 w-36 object-contain brightness-0 invert" />
              <span className="mt-2 block text-xs font-bold text-white/58">پنل شرکت‌ها و سازمان‌های آی نت</span>
            </Link>
          </div>

          <div className="shrink-0 p-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black">سازمان عضو آی نت</div>
                  <div className="mt-1 text-xs text-white/58">حساب سازمانی</div>
                </div>
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-white/10 p-2">
                  <div className="text-white/54">اعضا</div>
                  <div className="mt-1 font-black">۱۸ نفر</div>
                </div>
                <div className="rounded-md bg-white/10 p-2">
                  <div className="text-white/54">اعتبار</div>
                  <div className="mt-1 font-black">A+</div>
                </div>
              </div>
            </div>
          </div>

          <nav className="nexa-sidebar-scroll grid min-h-0 flex-1 content-start gap-1 overflow-y-auto px-3 pb-3">
            {companyNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = companyIcons[item.href as keyof typeof companyIcons] ?? FileText;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                    active ? "border-r-2 border-[#14b8a6] bg-white/12 text-white shadow-[0_12px_34px_rgb(20_184_166_/_0.16)]" : "border-r-2 border-transparent text-white/66 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon className={`size-4 ${active ? "text-[#14b8a6]" : "text-white/62 group-hover:text-[#14b8a6]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="grid shrink-0 gap-2 border-t border-white/10 p-3">
            <Link href="/dashboard" className="flex h-9 items-center justify-between rounded-md border border-white/10 px-3 text-sm font-bold text-white/68 hover:bg-white/[0.07] hover:text-white">
              پنل کاربری
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      <div className={`min-w-0 ${sidebarOnLeft ? "xl:pl-[284px]" : "xl:pr-[284px]"}`}>
        <header className="nexa-admin-header ainet-company-header sticky top-0 z-20">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 md:px-6 xl:px-8">
            <div className="min-w-0">
              <div className="text-xs font-bold text-primary">پنل سازمان آی نت</div>
              <h1 className="mt-1 truncate text-base font-black md:text-xl">مدیریت اعضا، پروژه‌های سازمانی، خدمات و تسویه‌ها</h1>
            </div>

            <div className="hidden h-11 w-[320px] items-center gap-2 rounded-md border border-border bg-white/80 px-3 text-sm text-muted shadow-panel lg:flex">
              <Search className="size-4" />
              <span>جستجو در اعضا، پروژه‌ها و پرداخت‌های سازمان</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="hidden h-10 items-center gap-2 rounded-md border border-border bg-white/86 px-3 text-sm font-bold text-muted shadow-panel transition hover:border-primary/35 hover:text-primary md:inline-flex">
                <Home className="size-4" />
                صفحه اصلی
              </Link>
              <PanelPersonalizationMenu panelKey="company" />
              <NotificationCenter label="اعلان‌های سازمان" />
              <button type="button" onClick={handleLogout} title="خروج" className="grid size-10 place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel transition hover:border-danger/40 hover:text-danger">
                <LogOut className="size-4" />
              </button>
              <Link href="/dashboard" className="hidden h-10 items-center gap-2 rounded-md border border-border bg-white/86 px-3 text-sm font-bold text-muted shadow-panel hover:text-foreground md:inline-flex">
                پنل کاربری
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
            {companyNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = companyIcons[item.href as keyof typeof companyIcons] ?? FileText;
              return (
                <Link key={item.href} href={item.href} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-bold ${active ? "nav-item-active" : "bg-white text-muted"}`}>
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



