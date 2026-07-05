import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { TicketsClient } from "@/features/tickets/components/tickets-client";

export default function DashboardTicketsPage() {
  return (
    <>
      <DashboardPageHeader title="تیکت‌ها" description="درخواست‌های پشتیبانی، گفتگوی کاربر با تیم پشتیبانی و پیوست‌های هر پرونده." />
      <TicketsClient />
    </>
  );
}
