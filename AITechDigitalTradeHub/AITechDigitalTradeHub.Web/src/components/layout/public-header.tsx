"use client";

import Link from "next/link";
import { ArrowLeft, LogOut, Sparkles, UserRound } from "lucide-react";
import { authApi } from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/store/auth-store";

export function PublicHeader() {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);

  async function handleLogout() {
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => null);
    }
    clearSession();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-2xl shadow-sm">
      <div className="container-page flex min-h-[72px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,#5B21B6,#009A9D)] text-white shadow-lg shadow-primary/20">
            <Sparkles className="size-5" />
          </span>
          <span className="hidden text-right sm:block">
            <span className="block text-sm font-black text-foreground">هاب تجارت دیجیتال هوش مصنوعی</span>
            <span className="block text-xs text-muted">AI Marketplace</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/55 p-1 text-xs font-bold text-muted shadow-sm backdrop-blur-xl lg:flex">
          <Link href="/services" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-foreground">خدمات</Link>
          <Link href="/projects" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-foreground">پروژه‌ها</Link>
          <Link href="/companies" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-foreground">شرکت‌ها</Link>
          <Link href="/about" className="rounded-full px-3 py-2 transition hover:bg-white hover:text-foreground">درباره</Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-border bg-white/70 px-3 py-2 text-sm font-bold hover:bg-white">
              <UserRound className="size-4" />
              <span className="hidden sm:inline">{user.firstName || user.username}</span>
            </Link>
            <button type="button" onClick={handleLogout} className="grid size-10 place-items-center rounded-md border border-border bg-white/70 text-muted hover:bg-white" aria-label="خروج">
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => openAuthDialog("login")} className="rounded-md border border-border bg-white/70 px-3 py-2 text-sm hover:bg-white">
              ورود
            </button>
            <button type="button" onClick={() => openAuthDialog("register")} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              <span>ثبت‌نام</span>
              <ArrowLeft className="size-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
