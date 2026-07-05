"use client";

import { useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, MessageSquareText, ShieldCheck, UserPlus } from "lucide-react";
import { authApi } from "@/features/auth/api/auth-api";
import type { AuthResult } from "@/features/auth/types";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";

type AuthCardProps = {
  mode: "login" | "register";
  compact?: boolean;
  onModeChange?: (mode: "login" | "register") => void;
  onSuccess?: () => void;
};

type AuthStep = "password-login" | "otp-login" | "register" | "verify";

type PendingVerification = {
  mobileNumber: string;
  origin: "register" | "login" | "otp";
};

export function AuthCard({ mode, compact = false, onModeChange, onSuccess }: AuthCardProps) {
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<AuthStep>(mode === "register" ? "register" : "password-login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setStep(mode === "register" ? "register" : "password-login");
    setPendingVerification(null);
    setError("");
    setNotice("");
  }, [mode]);

  const content = useMemo(() => {
    if (step === "verify") {
      return {
        icon: ShieldCheck,
        title: "تایید شماره موبایل",
        subtitle: pendingVerification
          ? `کد تایید ارسال‌شده به ${pendingVerification.mobileNumber} را وارد کنید.`
          : "کد تایید را وارد کنید تا حساب فعال شود.",
        action: "تایید و ورود"
      };
    }

    if (step === "otp-login") {
      return {
        icon: MessageSquareText,
        title: "ورود با کد یکبار مصرف",
        subtitle: "شماره موبایلی که قبلاً با آن ثبت‌نام کرده‌اید را وارد کنید.",
        action: "ارسال کد ورود"
      };
    }

    if (step === "register") {
      return {
        icon: UserPlus,
        title: "ایجاد حساب کاربری",
        subtitle: "ابتدا اطلاعات پایه را ثبت کنید؛ سپس با کد موبایل حساب فعال می‌شود.",
        action: "ثبت‌نام و دریافت کد"
      };
    }

    return {
      icon: KeyRound,
      title: "ورود به حساب",
      subtitle: "با نام کاربری، ایمیل یا شماره موبایل وارد شوید.",
      action: "ورود"
    };
  }, [pendingVerification, step]);

  const Icon = content.icon;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (step === "verify") {
        await verifyCode(String(formData.get("code") ?? ""));
        return;
      }

      if (step === "otp-login") {
        const mobileNumber = String(formData.get("otpMobileNumber") ?? "").trim();
        await beginVerification(mobileNumber, "otp", true);
        return;
      }

      if (step === "register") {
        const result = await authApi.register({
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          nationalCode: String(formData.get("nationalCode") ?? "").trim(),
          mobileNumber: String(formData.get("mobileNumber") ?? "").trim(),
          username: String(formData.get("username") ?? "").trim(),
          password: String(formData.get("password") ?? "")
        });

        if (result.requiresMobileVerification && result.mobileNumber) {
          setPendingVerification({ mobileNumber: result.mobileNumber, origin: "register" });
          setStep("verify");
          setNotice("ثبت‌نام انجام شد. برای فعال‌سازی حساب، کد موبایل را وارد کنید.");
          return;
        }

        await completeAuth(result);
        return;
      }

      const result = await authApi.login({
        usernameOrEmail: String(formData.get("usernameOrEmail") ?? "").trim(),
        password: String(formData.get("password") ?? "")
      });

      await completeAuth(result);
    } catch (err) {
      await handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function beginVerification(mobileNumber: string, origin: PendingVerification["origin"], resend: boolean) {
    if (!mobileNumber) {
      setError("شماره موبایل را وارد کنید");
      return;
    }

    setPendingVerification({ mobileNumber, origin });
    setStep("verify");

    if (!resend) {
      return;
    }

    const result = await authApi.resendMobileCode(mobileNumber);
    if (!result.status) {
      setError(result.errorMessage ?? "ارسال کد تایید ناموفق بود");
      return;
    }

    setNotice(origin === "otp" ? "کد ورود ارسال شد." : "کد فعال‌سازی ارسال شد.");
  }

  async function verifyCode(code: string) {
    if (!pendingVerification) {
      setError("شماره موبایل برای تایید مشخص نیست");
      return;
    }

    const result = await authApi.verifyMobile({
      mobileNumber: pendingVerification.mobileNumber,
      code
    });

    await completeAuth(result);
  }

  async function completeAuth(result: AuthResult) {
    if (result.requiresMobileVerification && result.mobileNumber) {
      await beginVerification(result.mobileNumber, "login", true);
      return;
    }

    if (!result.status || !result.accessToken || !result.user) {
      setError(result.errorMessage ?? "عملیات ناموفق بود");
      return;
    }

    setSession({
      accessToken: result.accessToken,
      user: result.user
    });
    onSuccess?.();
  }

  async function handleAuthError(err: unknown) {
    if (err instanceof ApiRequestError) {
      const payload = err.payload as Partial<AuthResult> | null;
      if (payload?.requiresMobileVerification && payload.mobileNumber) {
        await beginVerification(payload.mobileNumber, "login", true);
        return;
      }

      setError(err.message);
      return;
    }

    setError("ارتباط با سرور برقرار نشد");
  }

  async function handleResendCode() {
    if (!pendingVerification) {
      return;
    }

    setError("");
    setNotice("");
    setIsResending(true);
    try {
      const result = await authApi.resendMobileCode(pendingVerification.mobileNumber);
      if (!result.status) {
        setError(result.errorMessage ?? "ارسال دوباره کد ناموفق بود");
        return;
      }
      setNotice("کد جدید ارسال شد.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "ارتباط با سرور برقرار نشد");
    } finally {
      setIsResending(false);
    }
  }

  function switchExternalMode(nextMode: "login" | "register") {
    onModeChange?.(nextMode);
    if (!onModeChange) {
      setStep(nextMode === "register" ? "register" : "password-login");
      setPendingVerification(null);
      setError("");
      setNotice("");
    }
  }

  function switchInternalStep(nextStep: AuthStep) {
    setStep(nextStep);
    setPendingVerification(null);
    setError("");
    setNotice("");
  }

  return (
    <main className={compact ? "" : "flex min-h-screen items-center justify-center bg-background p-4 md:p-6"}>
      <section className={compact ? "w-full" : "w-full max-w-[980px] overflow-hidden rounded-lg border border-border bg-white shadow-panel"}>
        <div className={compact ? "w-full" : "grid min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]"}>
          {!compact ? (
            <aside className="hidden border-l border-border bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="inline-flex size-12 items-center justify-center rounded-lg bg-white/10 text-sm font-black">AI</div>
                <h2 className="mt-7 text-2xl font-black leading-10">ورود امن به اکوسیستم تجارت هوش مصنوعی</h2>
                <p className="mt-4 text-sm leading-8 text-slate-300">حساب کاربری، نقش‌ها، کیف پول و دسترسی‌های پروژه از همین نقطه مدیریت می‌شوند.</p>
              </div>
              <div className="grid gap-3 text-sm text-slate-300">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">تایید موبایل برای فعال‌سازی حساب</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">ورود با رمز یا کد یکبار مصرف</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">آماده برای نقش‌های کارفرما، مجری، مدرس و شرکت</div>
              </div>
            </aside>
          ) : null}

          <div className={compact ? "w-full" : "p-5 md:p-8"}>
            <div className="mb-6 flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-black md:text-2xl">{content.title}</h1>
                <p className="mt-2 text-sm leading-7 text-muted">{content.subtitle}</p>
              </div>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              {step === "verify" ? (
                <label className="grid gap-2 text-sm">
                  <span className="font-bold">کد تایید</span>
                  <input className="h-12 rounded-md border border-border px-3 text-center text-lg font-black tracking-[0.45em] focus-ring" name="code" inputMode="numeric" required minLength={4} maxLength={8} autoFocus />
                </label>
              ) : null}

              {step === "otp-login" ? (
                <label className="grid gap-2 text-sm">
                  <span className="font-bold">شماره موبایل</span>
                  <input className="h-12 rounded-md border border-border px-3 text-left focus-ring" name="otpMobileNumber" type="tel" inputMode="tel" dir="ltr" placeholder="09123456789" required />
                </label>
              ) : null}

              {step === "register" ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AuthInput label="نام" name="firstName" required />
                    <AuthInput label="نام خانوادگی" name="lastName" required />
                  </div>
                  <AuthInput label="ایمیل" name="email" type="email" required dir="ltr" />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <AuthInput label="نام کاربری" name="username" required minLength={3} dir="ltr" />
                    <AuthInput label="کد ملی" name="nationalCode" inputMode="numeric" dir="ltr" />
                  </div>
                  <AuthInput label="شماره موبایل" name="mobileNumber" type="tel" inputMode="tel" dir="ltr" placeholder="09123456789" required />
                </>
              ) : null}

              {step === "password-login" ? <AuthInput label="نام کاربری، ایمیل یا موبایل" name="usernameOrEmail" required /> : null}

              {step === "password-login" || step === "register" ? (
                <label className="grid gap-2 text-sm">
                  <span className="font-bold">رمز عبور</span>
                  <span className="relative block">
                    <input className="h-12 w-full rounded-md border border-border px-3 pl-11 focus-ring" name="password" type={showPassword ? "text" : "password"} required minLength={8} dir="ltr" />
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

              {notice ? <div className="rounded-md border border-success/25 bg-success/5 px-3 py-2 text-sm leading-7 text-success">{notice}</div> : null}
              {error ? <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm leading-7 text-danger">{error}</div> : null}

              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/15 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                <span>{content.action}</span>
                {!isSubmitting ? <ArrowLeft className="size-4" /> : null}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              {step === "verify" ? (
                <>
                  <button type="button" onClick={handleResendCode} disabled={isResending} className="font-bold text-accent disabled:opacity-60">
                    {isResending ? "در حال ارسال" : "ارسال دوباره کد"}
                  </button>
                  <button type="button" onClick={() => switchInternalStep(pendingVerification?.origin === "register" ? "register" : "password-login")} className="font-bold text-muted">
                    بازگشت و ویرایش اطلاعات
                  </button>
                </>
              ) : null}

              {step === "password-login" ? (
                <>
                  <button type="button" onClick={() => switchInternalStep("otp-login")} className="font-bold text-accent">
                    ورود با کد یکبار مصرف
                  </button>
                  <button type="button" onClick={() => switchExternalMode("register")} className="font-bold text-muted">
                    حساب ندارید؟ ثبت‌نام کنید
                  </button>
                </>
              ) : null}

              {step === "otp-login" ? (
                <button type="button" onClick={() => switchInternalStep("password-login")} className="font-bold text-muted">
                  ورود با رمز عبور
                </button>
              ) : null}

              {step === "register" ? (
                <button type="button" onClick={() => switchExternalMode("login")} className="font-bold text-accent">
                  حساب دارید؟ وارد شوید
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthInput({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-bold">{label}</span>
      <input className={`h-12 rounded-md border border-border px-3 focus-ring ${className}`} {...props} />
    </label>
  );
}
