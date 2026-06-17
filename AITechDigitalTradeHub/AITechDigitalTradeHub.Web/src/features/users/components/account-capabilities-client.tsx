"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { getMyCapabilities, requestCapability } from "@/features/users/api/users-api";
import { ApiRequestError } from "@/lib/api/http-client";
import { useState } from "react";

const requestableRoles = [
  { name: "Instructor", label: "مدرس", description: "ساخت دوره، انتشار محتوا و مدیریت زمان‌های کلاس" },
  { name: "ServiceProvider", label: "خدمات‌دهنده", description: "ثبت خدمات یا تجهیزات برای ارائه در بازارگاه" },
  { name: "Fundraiser", label: "سرمایه‌پذیر", description: "ثبت فرصت سرمایه‌گذاری بعد از تایید" },
  { name: "OrganizationAdmin", label: "مدیر سازمان", description: "مدیریت سازمان و درخواست‌های پرداخت شرکتی" },
  { name: "Arbitrator", label: "داور", description: "بررسی پرونده‌های اختلاف پس از تایید مدیریت" }
];

export function AccountCapabilitiesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const capabilitiesQuery = useQuery({
    queryKey: ["users", "me", "capabilities"],
    queryFn: getMyCapabilities
  });

  const requestMutation = useMutation({
    mutationFn: requestCapability,
    onSuccess: () => {
      setMessage("درخواست ثبت شد و در انتظار بررسی مدیریت است.");
      void queryClient.invalidateQueries({ queryKey: ["users", "me", "capabilities"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت درخواست ناموفق بود")
  });

  const capabilities = capabilitiesQuery.data ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">درخواست قابلیت‌های حساب</h2>
        <p className="mt-2 text-sm leading-7 text-muted">قابلیت‌های عمومی حساب فعال هستند. موارد حساس مثل مدرس شدن یا سرمایه‌پذیر شدن بعد از تایید مدیریت فعال می‌شوند.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {requestableRoles.map((role) => {
            const current = capabilities.find((item) => item.roleName === role.name);
            return (
              <div key={role.name} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{role.label}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted">{role.description}</p>
                  </div>
                  {current ? <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-muted">{String(current.status)}</span> : null}
                </div>
                <button
                  type="button"
                  disabled={requestMutation.isPending || String(current?.status).toLowerCase() === "approved" || String(current?.status).toLowerCase() === "pending"}
                  onClick={() => requestMutation.mutate(role.name)}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60"
                >
                  {requestMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  درخواست فعال‌سازی
                </button>
              </div>
            );
          })}
        </div>
        {message ? <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <aside className="rounded-lg border border-border bg-white p-5">
        <h2 className="font-black">قابلیت‌های فعلی</h2>
        {capabilitiesQuery.isLoading ? <Loader2 className="mt-5 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 grid gap-2">
          {capabilities.map((item) => (
            <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-bold">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item.roleDescription ?? item.roleName}
                </span>
                <span className="text-xs text-muted">{String(item.status)}</span>
              </div>
              {item.adminNote ? <p className="mt-2 text-xs leading-6 text-muted">{item.adminNote}</p> : null}
            </div>
          ))}
          {!capabilitiesQuery.isLoading && !capabilities.length ? <div className="text-sm text-muted">قابلیتی ثبت نشده است.</div> : null}
        </div>
      </aside>
    </div>
  );
}
