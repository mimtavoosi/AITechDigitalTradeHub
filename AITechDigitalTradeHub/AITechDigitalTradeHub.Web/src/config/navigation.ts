export const publicNavigation = [
  { href: "/services", label: "خدمات و تجهیزات" },
  { href: "/projects", label: "پروژه‌ها" },
  { href: "/investment", label: "سرمایه‌گذاری" },
  { href: "/courses", label: "آموزش" },
  { href: "/companies", label: "شرکت‌ها" }
] as const;

export const dashboardNavigation = [
  { href: "/dashboard", label: "نمای کلی" },
  { href: "/dashboard/projects", label: "پروژه‌ها" },
  { href: "/dashboard/services", label: "خدمات" },
  { href: "/dashboard/courses", label: "آموزش" },
  { href: "/dashboard/wallet", label: "کیف پول" },
  { href: "/dashboard/tickets", label: "تیکت‌ها" },
  { href: "/dashboard/settings", label: "تنظیمات" }
] as const;

export const adminNavigation = [
  { href: "/admin", label: "نمای کلی" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/listings", label: "لیستینگ‌ها" },
  { href: "/admin/projects", label: "پروژه‌ها" },
  { href: "/admin/finance", label: "مالی" },
  { href: "/admin/reports", label: "گزارش‌ها" }
] as const;
