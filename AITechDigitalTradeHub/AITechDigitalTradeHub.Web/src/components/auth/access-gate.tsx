"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/store/auth-store";
import { useAuthStore } from "@/store/auth-store";

type AccessGateProps = {
  children: React.ReactNode;
  checkAccess: (user: AuthUser | null) => boolean;
  fallbackHref?: Route;
  fallbackLabel?: string;
  title?: string;
  description?: string;
};

export function AccessGate({
  children,
  checkAccess,
  fallbackHref = "/",
  fallbackLabel = "بازگشت",
  title = "دسترسی به این بخش مجاز نیست",
  description = "برای مشاهده این صفحه باید وارد حساب مناسب شوید یا نقش تاییدشده لازم را داشته باشید."
}: AccessGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allowed = useMemo(() => checkAccess(user), [checkAccess, user]);

  useEffect(() => {
    if (!mounted || !hasHydrated || accessToken) return;
    openAuthDialog("login");
  }, [accessToken, hasHydrated, mounted, openAuthDialog]);

  useEffect(() => {
    if (!mounted || !hasHydrated || !accessToken || allowed) return;
    const target = fallbackHref === pathname ? "/" : fallbackHref;
    const timer = window.setTimeout(() => router.replace(target), 900);
    return () => window.clearTimeout(timer);
  }, [accessToken, allowed, fallbackHref, hasHydrated, mounted, pathname, router]);

  if (!mounted || !hasHydrated) {
    return <AccessGateShell title="در حال بررسی دسترسی..." description="چند لحظه صبر کنید." loading />;
  }

  if (!accessToken) {
    return (
      <AccessGateShell
        title="ورود لازم است"
        description="برای ورود به پنل باید ابتدا وارد حساب کاربری شوید."
        action={<button type="button" onClick={() => openAuthDialog("login")} className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-black text-white">ورود به حساب</button>}
      />
    );
  }

  if (!allowed) {
    return (
      <AccessGateShell
        title={title}
        description={description}
        action={<Link href={fallbackHref} className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-black text-white">{fallbackLabel}</Link>}
      />
    );
  }

  return <>{children}</>;
}

function AccessGateShell({ title, description, loading = false, action }: { title: string; description: string; loading?: boolean; action?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#F8FAFC,#EEF5F3)] px-4 text-foreground">
      <div className="w-full max-w-md rounded-lg border border-border bg-white/86 p-6 text-center shadow-floating backdrop-blur-2xl">
        <div className="mx-auto grid size-14 place-items-center rounded-lg bg-slate-950 text-white">
          {loading ? <LockKeyhole className="size-6 animate-soft-pulse" /> : <ShieldAlert className="size-6" />}
        </div>
        <h1 className="mt-5 text-xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
