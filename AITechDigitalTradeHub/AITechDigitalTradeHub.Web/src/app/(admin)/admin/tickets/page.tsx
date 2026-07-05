import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { TicketsClient } from "@/features/tickets/components/tickets-client";

export default function AdminTicketsPage() {
  return (
    <>
      <DashboardPageHeader title="پشتیبانی" description="صف تیکت‌ها، ارجاع به پشتیبان، پاسخ‌گویی، SLA و تغییر وضعیت پرونده‌ها." />
      <TicketsClient mode="admin" />
    </>
  );
}
