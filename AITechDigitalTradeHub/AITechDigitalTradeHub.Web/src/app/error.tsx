"use client";

import { useEffect } from "react";

export default function AppRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-background px-4 py-10 text-foreground">
      <section className="mx-auto max-w-xl rounded-lg border border-border bg-white p-6 shadow-panel" dir="rtl">
        <div className="text-sm font-black text-danger">خطای بارگذاری صفحه</div>
        <h1 className="mt-3 text-2xl font-black">صفحه کامل بارگذاری نشد</h1>
        <p className="mt-3 text-sm leading-7 text-muted">یک درخواست یا رندر صفحه خطا داد. می‌توانید دوباره تلاش کنید یا صفحه را رفرش کنید.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="h-10 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20">تلاش دوباره</button>
          <button type="button" onClick={() => window.location.reload()} className="h-10 rounded-md border border-border px-4 text-sm font-bold text-muted hover:text-foreground">رفرش صفحه</button>
        </div>
      </section>
    </main>
  );
}
