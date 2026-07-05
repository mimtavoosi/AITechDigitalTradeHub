import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "آی نت | شبکه تخصصی هوش مصنوعی ایران",
    template: "%s | آی نت"
  },
  description: "شبکه تخصصی هوش مصنوعی ایران برای مشاوره، آموزش، پژوهش، پروژه، فرصت شغلی، زیرساخت، سرمایه‌گذاری و تامین داده.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aitech.local")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
