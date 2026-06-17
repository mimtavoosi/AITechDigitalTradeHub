import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: {
    default: "هاب تجارت دیجیتال هوش مصنوعی",
    template: "%s | هاب تجارت دیجیتال هوش مصنوعی"
  },
  description: "پلتفرم جامع خدمات، پروژه‌ها، آموزش، مالی و سرمایه‌گذاری هوش مصنوعی.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitech.local")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
