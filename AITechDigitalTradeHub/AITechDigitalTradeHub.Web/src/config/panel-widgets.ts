import type { PanelKey } from "@/store/panel-preferences-store";

export type PanelWidgetDefinition = {
  id: string;
  label: string;
  group: "کارت‌ها" | "بخش‌ها";
};

export const panelWidgets: Record<PanelKey, PanelWidgetDefinition[]> = {
  dashboard: [
    { id: "metric-active-projects", label: "پروژه‌های فعال", group: "کارت‌ها" },
    { id: "metric-wallet", label: "موجودی قابل استفاده", group: "کارت‌ها" },
    { id: "metric-courses", label: "جلسه‌های آموزشی", group: "کارت‌ها" },
    { id: "metric-tickets", label: "تیکت‌های باز", group: "کارت‌ها" },
    { id: "dashboard-command", label: "مرکز کارهای امروز", group: "بخش‌ها" },
    { id: "dashboard-work-queue", label: "جریان کارهای فعال", group: "بخش‌ها" },
    { id: "dashboard-progress", label: "وضعیت رشد حساب", group: "بخش‌ها" },
    { id: "dashboard-finance", label: "درآمد و کیف پول", group: "بخش‌ها" },
    { id: "dashboard-actions", label: "اقدام‌های پیشنهادی", group: "بخش‌ها" },
    { id: "dashboard-activity", label: "فعالیت اخیر", group: "بخش‌ها" }
  ],
  admin: [
    { id: "admin-metric-projects", label: "پروژه‌های فعال", group: "کارت‌ها" },
    { id: "admin-metric-users", label: "اعضای تاییدشده", group: "کارت‌ها" },
    { id: "admin-metric-revenue", label: "درآمد ماه", group: "کارت‌ها" },
    { id: "admin-metric-health", label: "سلامت سیستم", group: "کارت‌ها" },
    { id: "admin-command", label: "مرکز عملیات", group: "بخش‌ها" },
    { id: "admin-review-queue", label: "صف‌های بررسی", group: "بخش‌ها" },
    { id: "admin-activity-metrics", label: "شاخص‌های فعالیت", group: "بخش‌ها" },
    { id: "admin-ecosystem", label: "نقشه اکوسیستم", group: "بخش‌ها" },
    { id: "admin-revenue", label: "درآمد و جریان نقدی", group: "بخش‌ها" },
    { id: "admin-suggestions", label: "اقدام‌های پیشنهادی", group: "بخش‌ها" },
    { id: "admin-activity", label: "فعالیت‌های اخیر", group: "بخش‌ها" }
  ],
  company: [
    { id: "company-metric-members", label: "اعضای فعال", group: "کارت‌ها" },
    { id: "company-metric-projects", label: "پروژه‌های شرکتی", group: "کارت‌ها" },
    { id: "company-metric-payments", label: "پرداخت‌های در انتظار", group: "کارت‌ها" },
    { id: "company-metric-services", label: "خدمات فعال", group: "کارت‌ها" },
    { id: "company-command", label: "مرکز عملیات شرکت", group: "بخش‌ها" },
    { id: "company-approvals", label: "صف تاییدهای شرکت", group: "بخش‌ها" },
    { id: "company-health", label: "سلامت عملیاتی", group: "بخش‌ها" },
    { id: "company-revenue", label: "جریان مالی شرکت", group: "بخش‌ها" },
    { id: "company-credit", label: "اعتبار شرکت", group: "بخش‌ها" },
    { id: "company-actions", label: "عملیات سریع", group: "بخش‌ها" }
  ]
};
