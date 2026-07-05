import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { AdminFinanceLedgerClient } from "@/features/finance/components/admin-finance-ledger-client";
import { AdminFeeRulesClient } from "@/features/finance/components/admin-fee-rules-client";

export default function AdminFinancePage() {
  return (
    <>
      <DashboardPageHeader title="مالی" description="کارمزد پلتفرم، تراکنش‌ها، برداشت‌ها و مبالغ امانی." />
      <div className="grid gap-6">
        <AdminFinanceLedgerClient />
        <AdminFeeRulesClient />
      </div>
    </>
  );
}
