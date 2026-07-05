"use client";

import React from "react";

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("App render error", error, info);
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground">
        <section className="mx-auto max-w-xl rounded-lg border border-border bg-white p-6 shadow-panel" dir="rtl">
          <div className="text-sm font-black text-danger">خطای موقت در نمایش صفحه</div>
          <h1 className="mt-3 text-2xl font-black">بخشی از رابط کاربری درست بارگذاری نشد</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            خطای سمت سرور یا پاسخ نامعتبر API باعث شد یکی از بخش‌های صفحه از کار بیفتد. داده‌های شما حذف نشده‌اند؛ صفحه را دوباره بارگذاری کنید.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => this.setState({ error: null })} className="h-10 rounded-md border border-border px-4 text-sm font-bold text-muted hover:text-foreground">
              تلاش دوباره
            </button>
            <button type="button" onClick={() => window.location.reload()} className="h-10 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20">
              بارگذاری مجدد
            </button>
          </div>
        </section>
      </main>
    );
  }
}
