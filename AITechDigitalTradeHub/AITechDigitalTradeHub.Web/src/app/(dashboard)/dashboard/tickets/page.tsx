import { EmptyState } from "@/components/ui/empty-state";
import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";

export default function DashboardTicketsPage() {
  return (
    <>
      <DashboardPageHeader title="تیکت‌ها" description="درخواست‌های پشتیبانی و گفتگوی کاربر با تیم پشتیبانی." />
      <EmptyState title="هنوز تیکتی ثبت نشده" description="بعد از اتصال API تیکتینگ، تاریخچه و وضعیت درخواست‌ها در این بخش قرار می‌گیرد." />
    </>
  );
}
