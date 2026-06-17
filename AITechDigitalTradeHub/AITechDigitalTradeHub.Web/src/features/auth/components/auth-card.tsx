"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/features/auth/api/auth-api";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";

type AuthCardProps = {
  mode: "login" | "register";
  compact?: boolean;
  onModeChange?: (mode: "login" | "register") => void;
  onSuccess?: () => void;
};

export function AuthCard({ mode, compact = false, onModeChange, onSuccess }: AuthCardProps) {
  const isLogin = mode === "login";
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pendingMobileNumber, setPendingMobileNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      if (pendingMobileNumber) {
        const result = await authApi.verifyMobile({
          mobileNumber: pendingMobileNumber,
          code: String(formData.get("code") ?? "")
        });

        if (!result.status || !result.accessToken || !result.refreshToken || !result.user) {
          setError(result.errorMessage ?? "کد تایید معتبر نیست");
          return;
        }

        setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        });
        onSuccess?.();
        return;
      }

      const result = isLogin
        ? await authApi.login({
            usernameOrEmail: String(formData.get("usernameOrEmail") ?? ""),
            password: String(formData.get("password") ?? "")
          })
        : await authApi.register({
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            email: String(formData.get("email") ?? ""),
            nationalCode: String(formData.get("nationalCode") ?? ""),
            mobileNumber: String(formData.get("mobileNumber") ?? ""),
            username: String(formData.get("username") ?? ""),
            password: String(formData.get("password") ?? "")
          });

      if (result.requiresMobileVerification && result.mobileNumber) {
        setPendingMobileNumber(result.mobileNumber);
        return;
      }

      if (!result.status || !result.accessToken || !result.refreshToken || !result.user) {
        setError(result.errorMessage ?? "عملیات ناموفق بود");
        return;
      }

      setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "ارتباط با سرور برقرار نشد");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (!pendingMobileNumber) {
      return;
    }

    setError("");
    setIsResending(true);
    try {
      const result = await authApi.resendMobileCode(pendingMobileNumber);
      if (!result.status) {
        setError(result.errorMessage ?? "ارسال دوباره کد ناموفق بود");
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "ارتباط با سرور برقرار نشد");
    } finally {
      setIsResending(false);
    }
  }

  const switchMode = () => onModeChange?.(isLogin ? "register" : "login");
  const title = pendingMobileNumber ? "تایید شماره موبایل" : isLogin ? "ورود به حساب" : "ایجاد حساب کاربری";

  return (
    <main className={compact ? "" : "flex min-h-screen items-center justify-center bg-background p-6"}>
      <section className={compact ? "w-full" : "w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-panel"}>
        <div className="mb-6 grid size-11 place-items-center rounded-lg bg-primary text-sm font-bold text-white">AI</div>
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-muted">
          {pendingMobileNumber
            ? `کد ارسال‌شده به ${pendingMobileNumber} را وارد کنید.`
            : isLogin
              ? "برای مدیریت پروژه‌ها، خدمات و کیف پول وارد شوید."
              : "حساب خود را بسازید و نقش مناسب را در پلتفرم انتخاب کنید."}
        </p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {pendingMobileNumber ? (
            <label className="grid gap-2 text-sm">
              کد تایید
              <input className="h-11 rounded-md border border-border px-3 text-center tracking-[0.4em] focus-ring" name="code" inputMode="numeric" required minLength={4} maxLength={8} autoFocus />
            </label>
          ) : null}

          {!pendingMobileNumber && !isLogin && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                نام
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="firstName" required />
              </label>
              <label className="grid gap-2 text-sm">
                نام خانوادگی
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="lastName" required />
              </label>
            </div>
          )}

          {!pendingMobileNumber ? (
            <label className="grid gap-2 text-sm">
              {isLogin ? "نام کاربری، ایمیل یا موبایل" : "ایمیل"}
              <input className="h-11 rounded-md border border-border px-3 focus-ring" name={isLogin ? "usernameOrEmail" : "email"} type={isLogin ? "text" : "email"} required />
            </label>
          ) : null}

          {!pendingMobileNumber && !isLogin && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                نام کاربری
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="username" required minLength={3} />
              </label>
              <label className="grid gap-2 text-sm">
                کد ملی
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="nationalCode" />
              </label>
            </div>
          )}

          {!pendingMobileNumber && !isLogin ? (
            <label className="grid gap-2 text-sm">
              شماره موبایل
              <input className="h-11 rounded-md border border-border px-3 text-left focus-ring" name="mobileNumber" type="tel" inputMode="tel" dir="ltr" placeholder="09123456789" required />
            </label>
          ) : null}

          {!pendingMobileNumber ? (
            <label className="grid gap-2 text-sm">
              رمز عبور
              <span className="relative block">
                <input className="h-11 w-full rounded-md border border-border px-3 pl-11 focus-ring" name="password" type={showPassword ? "text" : "password"} required minLength={8} />
                <button
                  className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-slate-100"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
          ) : null}

          {error ? <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</div> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            <span>{pendingMobileNumber ? "تایید و ورود" : isLogin ? "ورود" : "ثبت‌نام"}</span>
          </button>
        </form>
        {pendingMobileNumber ? (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button type="button" onClick={handleResendCode} disabled={isResending} className="text-sm font-bold text-accent disabled:opacity-60">
              {isResending ? "در حال ارسال" : "ارسال دوباره کد"}
            </button>
            <button type="button" onClick={() => setPendingMobileNumber(null)} className="text-sm font-bold text-muted">
              ویرایش اطلاعات
            </button>
          </div>
        ) : (
          <button type="button" onClick={switchMode} className="mt-5 block text-sm font-bold text-accent">
            {isLogin ? "حساب ندارید؟ ثبت‌نام کنید" : "حساب دارید؟ وارد شوید"}
          </button>
        )}
      </section>
    </main>
  );
}
