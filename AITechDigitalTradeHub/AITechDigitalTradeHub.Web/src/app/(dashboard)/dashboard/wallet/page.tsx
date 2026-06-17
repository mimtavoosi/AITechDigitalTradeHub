import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { WalletDashboardClient } from "@/features/finance/components/wallet-dashboard-client";

export default function DashboardWalletPage() {
  return (
    <section>
      <DashboardPageHeader title="کیف پول" description="موجودی، تراکنش‌ها، مبالغ امانی و درخواست‌های برداشت." />
      <WalletDashboardClient />
    </section>
  );
}
