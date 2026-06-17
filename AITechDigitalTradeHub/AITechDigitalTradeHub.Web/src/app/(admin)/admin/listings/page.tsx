import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { AdminListingsClient } from "@/features/listings/components/admin-listings-client";

export default function AdminListingsPage() {
  return (
    <>
      <DashboardPageHeader title="لیستینگ‌ها" description="تایید، رد و نظارت بر خدمات، تجهیزات و محتوای مارکت‌پلیس." />
      <AdminListingsClient />
    </>
  );
}
