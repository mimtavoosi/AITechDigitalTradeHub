import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { adminNavigation } from "@/config/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 right-0 hidden w-64 border-l border-slate-300 bg-slate-950 p-5 text-white lg:block">
        <Link href="/admin" className="flex items-center gap-3 text-base font-bold">
          <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-white">
            <Shield className="size-5" />
          </span>
          پنل مدیریت
        </Link>
        <nav className="mt-8 grid gap-1">
          {adminNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pr-64">
        <header className="border-b border-slate-300 bg-white">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div>
              <span className="text-sm font-semibold">مرکز کنترل پلتفرم</span>
              <p className="mt-1 hidden text-xs text-muted sm:block">کاربران، مالی، پروژه‌ها و گزارش‌های مدیریتی</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted">
              داشبورد کاربر
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
