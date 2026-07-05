import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { ConversationsClient } from "@/features/conversations/components/conversations-client";

export default function DashboardMessagesPage() {
  return (
    <>
      <DashboardPageHeader title="پیام‌ها" description="گفتگوهای کاری پروژه، سفارش و پشتیبانی." />
      <ConversationsClient />
    </>
  );
}
