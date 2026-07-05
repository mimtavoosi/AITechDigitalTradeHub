"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Loader2, Mail, MessageSquareText, Moon, Save, type LucideIcon } from "lucide-react";
import { getNotificationPreferences, updateNotificationPreferences } from "@/features/notifications/api/notifications-api";
import type { NotificationPreferences } from "@/features/notifications/types";
import { ApiRequestError } from "@/lib/api/http-client";

const defaultPreferences: NotificationPreferences = {
  inAppEnabled: true,
  emailEnabled: false,
  smsEnabled: false,
  financialEnabled: true,
  projectEnabled: true,
  disputeEnabled: true,
  educationEnabled: true,
  supportEnabled: true,
  marketingEnabled: false,
  digestFrequency: "instant",
  quietHoursStart: "",
  quietHoursEnd: ""
};

const categoryOptions = [
  { key: "financialEnabled", label: "مالی", text: "کیف پول، Escrow، فاکتور و تسویه" },
  { key: "projectEnabled", label: "پروژه", text: "پیشنهاد، قرارداد، Milestone و تحویل" },
  { key: "disputeEnabled", label: "داوری", text: "اختلاف، مستندات و رأی داور" },
  { key: "educationEnabled", label: "آموزش", text: "ثبت‌نام، جلسه، پیشرفت و گواهی" },
  { key: "supportEnabled", label: "پشتیبانی", text: "تیکت، پاسخ پشتیبان و SLA" },
  { key: "marketingEnabled", label: "اطلاع‌رسانی", text: "خبرها و پیشنهادهای عمومی پلتفرم" }
] as const;

export function NotificationPreferencesClient() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NotificationPreferences>(defaultPreferences);
  const [message, setMessage] = useState("");

  const preferencesQuery = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: getNotificationPreferences
  });

  useEffect(() => {
    if (preferencesQuery.data) {
      setDraft({ ...defaultPreferences, ...preferencesQuery.data });
    }
  }, [preferencesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (result) => {
      setMessage("تنظیمات اعلان ذخیره شد.");
      setDraft({ ...defaultPreferences, ...result });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
    onError: (error) => setMessage(error instanceof ApiRequestError ? error.message : "ذخیره تنظیمات اعلان ناموفق بود")
  });

  const updateBoolean = (key: keyof NotificationPreferences, value: boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">تنظیمات اعلان‌ها</h2>
          <p className="mt-2 text-sm leading-7 text-muted">کانال و موضوع اعلان‌ها را برای پیام‌های کاری، مالی، آموزشی و پشتیبانی مدیریت کنید.</p>
        </div>
        {preferencesQuery.isLoading ? <Loader2 className="size-5 animate-spin text-muted" /> : <Bell className="size-5 text-primary" />}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <ChannelToggle icon={Bell} title="داخل پنل" text="نمایش در مرکز اعلان و بروزرسانی زنده" checked={draft.inAppEnabled} onChange={(value) => updateBoolean("inAppEnabled", value)} />
        <ChannelToggle icon={Mail} title="ایمیل" text="ارسال خلاصه یا اعلان مهم به ایمیل" checked={draft.emailEnabled} onChange={(value) => updateBoolean("emailEnabled", value)} />
        <ChannelToggle icon={MessageSquareText} title="پیامک" text="ارسال اعلان‌های حساس با SMS" checked={draft.smsEnabled} onChange={(value) => updateBoolean("smsEnabled", value)} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categoryOptions.map((option) => (
          <label key={option.key} className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-white/78 p-3 shadow-panel">
            <input
              type="checkbox"
              checked={Boolean(draft[option.key])}
              onChange={(event) => updateBoolean(option.key, event.target.checked)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-black">{option.label}</span>
              <span className="mt-1 block text-xs leading-6 text-muted">{option.text}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-border bg-background/60 p-4 md:grid-cols-3">
        <label className="grid gap-2 text-xs font-bold text-muted">
          خلاصه‌سازی
          <select
            value={draft.digestFrequency}
            onChange={(event) => setDraft((current) => ({ ...current, digestFrequency: event.target.value }))}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm text-foreground focus-ring"
          >
            <option value="instant">فوری</option>
            <option value="daily">روزانه</option>
            <option value="weekly">هفتگی</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-bold text-muted">
          شروع سکوت
          <input
            type="time"
            value={draft.quietHoursStart ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, quietHoursStart: event.target.value }))}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm text-foreground focus-ring"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold text-muted">
          پایان سکوت
          <input
            type="time"
            value={draft.quietHoursEnd ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, quietHoursEnd: event.target.value }))}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm text-foreground focus-ring"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-xs text-muted">
          <Moon className="size-4" />
          ساعات سکوت فعلاً برای زمان‌بندی ارسال ایمیل و پیامک نگهداری می‌شود.
        </div>
        <button
          type="button"
          onClick={() => saveMutation.mutate(draft)}
          disabled={saveMutation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-white disabled:opacity-60"
        >
          {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          ذخیره اعلان‌ها
        </button>
      </div>
      {message ? <div className="mt-4 rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{message}</div> : null}
    </section>
  );
}

function ChannelToggle({
  icon: Icon,
  title,
  text,
  checked,
  onChange
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-md border p-4 text-right transition ${checked ? "border-primary bg-primary/5" : "border-border bg-white/78 hover:border-primary/30"}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-primary shadow-panel">
          <Icon className="size-4" />
        </span>
        {checked ? <CheckCheck className="size-4 text-success" /> : null}
      </span>
      <span className="mt-3 block text-sm font-black">{title}</span>
      <span className="mt-2 block text-xs leading-6 text-muted">{text}</span>
    </button>
  );
}
