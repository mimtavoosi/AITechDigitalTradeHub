import Link from "next/link";
import { ArrowLeft, Bell, CircleUserRound } from "lucide-react";
import { dashboardNavigation } from "@/config/navigation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 right-0 hidden w-64 border-l border-border bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 text-base font-bold text-primary">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-sm text-white">AI</span>
          پنل کاربری
        </Link>
        <nav className="mt-8 grid gap-1">
          {dashboardNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-muted hover:bg-background hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pr-64">
        <header className="border-b border-border bg-white">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div>
              <span className="text-sm font-semibold">داشبورد عملیاتی</span>
              <p className="mt-1 hidden text-xs text-muted sm:block">پروژه‌ها، خدمات، مالی و پشتیبانی</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid size-9 place-items-center rounded-md border border-border bg-white text-muted">
                <Bell className="size-4" />
              </button>
              <button className="grid size-9 place-items-center rounded-md border border-border bg-white text-muted">
                <CircleUserRound className="size-4" />
              </button>
            </div>
            <Link href="/" className="hidden items-center gap-2 text-sm text-muted md:inline-flex">
              سایت عمومی
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
