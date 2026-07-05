"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, Plus } from "lucide-react";
import { depositToWallet, getMyWallet, getWalletTransactions } from "@/features/finance/api/finance-api";
import { ApiRequestError } from "@/lib/api/http-client";

function getEntityId(value: { id?: string | number; iD?: string | number }) {
  return Number(value.id ?? value.iD ?? 0);
}

export function WalletDashboardClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const walletQuery = useQuery({
    queryKey: ["finance", "wallet", "me"],
    queryFn: getMyWallet
  });

  const wallet = walletQuery.data?.result;
  const walletId = wallet ? getEntityId(wallet) : 0;

  const transactionsQuery = useQuery({
    queryKey: ["finance", "wallet", walletId, "transactions"],
    queryFn: () => getWalletTransactions(walletId),
    enabled: walletId > 0
  });

  const depositMutation = useMutation({
    mutationFn: (amount: number) => depositToWallet(walletId, amount),
    onSuccess: () => {
      setMessage("شارژ تستی کیف پول ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["finance", "wallet"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "شارژ کیف پول ناموفق بود")
  });

  function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount") || 0);
    if (amount > 0 && walletId > 0) {
      depositMutation.mutate(amount);
    }
    event.currentTarget.reset();
  }

  const transactions = transactionsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="dashboard-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </span>
          <div>
            <div className="text-sm text-muted">موجودی کیف پول</div>
            <div className="mt-1 text-2xl font-black">
              {walletQuery.isLoading ? "..." : `${(wallet?.balance ?? 0).toLocaleString("fa-IR")} ${wallet?.currency ?? "IRR"}`}
            </div>
          </div>
        </div>

        <form className="mt-6 grid gap-3" onSubmit={handleDeposit}>
          <label className="text-sm font-bold">شارژ تستی تا زمان اتصال درگاه</label>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="amount" type="number" min="1000" placeholder="مبلغ" required />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={depositMutation.isPending || walletId <= 0}>
            {depositMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            شارژ تستی
          </button>
        </form>
        {message ? <div className="mt-4 rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="dashboard-card p-5">
        <h2 className="text-lg font-black">تاریخچه تراکنش‌ها</h2>
        {transactionsQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-right text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="px-3 py-2">نوع</th>
                <th className="px-3 py-2">مبلغ</th>
                <th className="px-3 py-2">مرجع</th>
                <th className="px-3 py-2">وضعیت</th>
                <th className="px-3 py-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={String(tx.id ?? tx.iD)} className="bg-background/78 shadow-panel">
                  <td className="rounded-r-md px-3 py-3">{String(tx.txType)}</td>
                  <td className={`px-3 py-3 font-bold ${tx.amount >= 0 ? "text-primary" : "text-danger"}`}>{tx.amount.toLocaleString("fa-IR")}</td>
                  <td className="px-3 py-3 text-xs text-muted">{tx.referenceType ?? "-"} {tx.referenceId ? `#${tx.referenceId}` : ""}</td>
                  <td className="px-3 py-3 text-xs text-muted">{String(tx.status)}</td>
                  <td className="rounded-l-md px-3 py-3 text-xs text-muted">{tx.createDate ? new Date(tx.createDate).toLocaleString("fa-IR") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transactionsQuery.isLoading && !transactions.length ? <div className="rounded-md border border-border p-5 text-center text-sm text-muted">تراکنشی ثبت نشده است.</div> : null}
        </div>
      </section>
    </div>
  );
}
