export const publicNavigation = [
  { href: "/domains", label: "حوزه‌ها" },
  { href: "/services", label: "خدمات و تجهیزات" },
  { href: "/projects", label: "پروژه‌ها" },
  { href: "/investment", label: "سرمایه‌گذاری" },
  { href: "/courses", label: "آموزش" },
  { href: "/instructors", label: "مدرس‌ها" },
  { href: "/companies", label: "شرکت‌ها" }
] as const;

export const dashboardNavigation = [
  { href: "/dashboard", label: "خانه پنل" },
  { href: "/dashboard/projects", label: "پروژه‌های من" },
  { href: "/dashboard/services", label: "خدمات من" },
  { href: "/dashboard/courses", label: "آموزش من" },
  { href: "/dashboard/wallet", label: "کیف پول" },
  { href: "/dashboard/messages", label: "پیام‌ها" },
  { href: "/dashboard/tickets", label: "پشتیبانی" },
  { href: "/dashboard/settings", label: "حساب کاربری" }
] as const;

export const adminNavigation = [
  { href: "/admin", label: "مرکز مدیریت" },
  { href: "/admin/users", label: "کاربران و نقش‌ها" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/tags", label: "مهارت‌ها و برچسب‌ها" },
  { href: "/admin/listings", label: "خدمات و لیستینگ‌ها" },
  { href: "/admin/projects", label: "پروژه‌ها و قراردادها" },
  { href: "/admin/investments", label: "سرمایه‌گذاری‌ها" },
  { href: "/admin/education", label: "آموزش و مدرس‌ها" },
  { href: "/admin/tickets", label: "پشتیبانی" },
  { href: "/admin/badges", label: "نشان‌ها و رتبه‌بندی" },
  { href: "/admin/finance", label: "مالی و تسویه" },
  { href: "/admin/reports", label: "گزارش مدیریتی" }
] as const;

export const companyNavigation = [
  { href: "/company", label: "خانه شرکت" },
  { href: "/company/members", label: "اعضا و دسترسی‌ها" },
  { href: "/company/projects", label: "پروژه‌های شرکت" },
  { href: "/company/services", label: "خدمات سازمانی" },
  { href: "/company/payments", label: "پرداخت و تسویه" },
  { href: "/company/reports", label: "گزارش شرکت" },
  { href: "/company/settings", label: "تنظیمات شرکت" }
] as const;
