import { ApiRequestError } from "@/lib/api/http-client";

export function resolveErrorMessage(error: unknown, fallback = "عملیات با خطا مواجه شد") {
  if (error instanceof ApiRequestError) {
    if (error.statusCode >= 500) return "خطای موقت سرور رخ داد. چند لحظه بعد دوباره تلاش کنید.";
    if (error.statusCode === 401) return "برای ادامه باید وارد حساب کاربری شوید.";
    if (error.statusCode === 403) return "شما دسترسی لازم برای این عملیات را ندارید.";
    if (error.statusCode === 404) return "اطلاعات مورد نظر پیدا نشد.";
    if (error.statusCode === 409) return "این عملیات با وضعیت فعلی داده‌ها سازگار نیست.";
    return error.message || fallback;
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return "ارتباط با سرور برقرار نشد. اتصال شبکه یا وضعیت API را بررسی کنید.";
  }

  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function resolveErrorTitle(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.statusCode >= 500) return "خطای سرور";
    if (error.statusCode === 401) return "نیاز به ورود";
    if (error.statusCode === 403) return "دسترسی غیرمجاز";
    if (error.statusCode === 404) return "یافت نشد";
    return "خطای درخواست";
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) return "خطای ارتباط";
  return "خطا";
}
