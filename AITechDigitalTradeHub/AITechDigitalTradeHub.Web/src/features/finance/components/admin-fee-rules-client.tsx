"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator, CircleDollarSign, Loader2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { TextField } from "@/components/ui/form-field";
import {
  activateFeeRule,
  calculateFee,
  createFeeRule,
  deactivateFeeRule,
  getFeeRuleContextType,
  getFeeRuleFixedAmount,
  getFeeRuleId,
  getFeeRuleIsActive,
  getFeeRulePercent,
  getFeeRules
} from "@/features/finance/api/fee-rules-api";
import type { FeeRuleSummary, PlatformFeeContextType } from "@/features/finance/types";
import { ApiRequestError } from "@/lib/api/http-client";

const contextTypeLabels: Record<string, string> = {
  Order: "سفارش خدمات/تجهیزات",
  Contract: "قرارداد پروژه",
  Course: "خرید دوره",
  TeacherBooking: "رزرو مدرس",
  Investment: "سرمایه‌گذاری",
  Payout: "برداشت وجه"
};

const contextTypeOptions: Array<SelectOption<PlatformFeeContextType>> = [
  { value: "Order", label: contextTypeLabels.Order },
  { value: "Contract", label: contextTypeLabels.Contract },
  { value: "Course", label: contextTypeLabels.Course },
  { value: "TeacherBooking", label: contextTypeLabels.TeacherBooking },
  { value: "Investment", label: contextTypeLabels.Investment },
  { value: "Payout", label: contextTypeLabels.Payout }
];

export function AdminFeeRulesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [contextType, setContextType] = useState<PlatformFeeContextType | "">("Order");
  const [calcContextType, setCalcContextType] = useState<PlatformFeeContextType | "">("Order");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcResult, setCalcResult] = useState<{ fee: number; netAmount: number } | null>(null);

  const feeRulesQuery = useQuery({ queryKey: ["fee-rules"], queryFn: getFeeRules });
  const feeRules = feeRulesQuery.data?.results ?? [];

  const createMutation = useMutation({
    mutationFn: createFeeRule,
    onSuccess: () => {
      setMessage("قانون کارمزد ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["fee-rules"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت قانون کارمزد ناموفق بود")
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => (active ? deactivateFeeRule(id) : activateFeeRule(id)),
    onSuccess: () => {
      setMessage("وضعیت قانون کارمزد به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["fee-rules"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "تغییر وضعیت ناموفق بود")
  });

  const calcMutation = useMutation({
    mutationFn: () => calculateFee(calcContextType as PlatformFeeContextType, Number(calcAmount)),
    onSuccess: (data) => setCalcResult(data),
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "محاسبه کارمزد ناموفق بود")
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contextType) {
      setMessage("نوع زمینه کارمزد را انتخاب کنید.");
      return;
    }

    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      contextType,
      percent: Number(form.get("percent") || 0),
      fixedAmount: form.get("fixedAmount") ? Number(form.get("fixedAmount")) : undefined,
      minAmount: form.get("minAmount") ? Number(form.get("minAmount")) : undefined,
      maxAmount: form.get("maxAmount") ? Number(form.get("maxAmount")) : undefined,
      isActiveRule: true
    });
    event.currentTarget.reset();
  }

  function handleCalculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!calcContextType || !calcAmount) return;
    calcMutation.mutate();
  }

  const columns = useMemo<Array<DataGridColumn<FeeRuleSummary>>>(
    () => [
      {
        key: "contextType",
        title: "زمینه",
        priority: "primary",
        searchValue: (item) => contextTypeLabels[getFeeRuleContextType(item)] ?? getFeeRuleContextType(item),
        render: (item) => (
          <div className="flex items-center gap-2 font-black">
            <CircleDollarSign className="size-4 text-primary" />
            {contextTypeLabels[getFeeRuleContextType(item)] ?? getFeeRuleContextType(item)}
          </div>
        )
      },
      {
        key: "percent",
        title: "درصد کارمزد",
        priority: "meta",
        sortValue: (item) => getFeeRulePercent(item),
        render: (item) => <span>{getFeeRulePercent(item).toLocaleString("fa-IR")}٪</span>
      },
      {
        key: "fixedAmount",
        title: "مبلغ ثابت",
        priority: "meta",
        render: (item) => {
          const fixed = getFeeRuleFixedAmount(item);
          return <span>{fixed ? Number(fixed).toLocaleString("fa-IR") : "—"}</span>;
        }
      },
      {
        key: "status",
        title: "وضعیت",
        priority: "meta",
        render: (item) => (
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${getFeeRuleIsActive(item) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted"}`}>
            {getFeeRuleIsActive(item) ? "فعال" : "غیرفعال"}
          </span>
        )
      }
    ],
    []
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="grid gap-5">
        <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">تعریف قانون کارمزد</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
            <SearchableSelect label="زمینه کارمزد" options={contextTypeOptions} value={contextType} onChange={setContextType} clearable={false} />
            <TextField label="درصد کارمزد" name="percent" type="number" step="0.1" min={0} max={100} placeholder="مثلا 5" required />
            <TextField label="مبلغ ثابت (اختیاری)" name="fixedAmount" type="number" placeholder="مبلغ ثابت به ریال" />
            <TextField label="حداقل مبلغ تراکنش (اختیاری)" name="minAmount" type="number" />
            <TextField label="حداکثر مبلغ تراکنش (اختیاری)" name="maxAmount" type="number" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              ثبت قانون
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">پیش‌نمایش محاسبه کارمزد</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCalculate}>
            <SearchableSelect label="زمینه" options={contextTypeOptions} value={calcContextType} onChange={setCalcContextType} clearable={false} />
            <TextField label="مبلغ تراکنش" type="number" value={calcAmount} onChange={(event) => setCalcAmount(event.target.value)} placeholder="مثلا 1000000" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold disabled:opacity-60" disabled={calcMutation.isPending}>
              {calcMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Calculator className="size-4" />}
              محاسبه
            </button>
          </form>
          {calcResult ? (
            <div className="mt-4 grid gap-2 rounded-md bg-slate-50 p-3 text-sm">
              <div>کارمزد: <span className="font-black">{calcResult.fee.toLocaleString("fa-IR")}</span></div>
              <div>مبلغ خالص: <span className="font-black">{calcResult.netAmount.toLocaleString("fa-IR")}</span></div>
            </div>
          ) : null}
        </section>

        {message ? <div className="rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
      </div>

      <DataGrid
        title="قوانین کارمزد پلتفرم"
        items={feeRules}
        columns={columns}
        getRowId={(item) => getFeeRuleId(item)}
        loading={feeRulesQuery.isLoading}
        searchPlaceholder="جستجو در زمینه کارمزد"
        exportFileName="platform-fee-rules"
        printTitle="قوانین کارمزد پلتفرم"
        renderRowActions={(item) => {
          const active = getFeeRuleIsActive(item);
          return (
            <button
              type="button"
              onClick={() => toggleMutation.mutate({ id: getFeeRuleId(item), active })}
              disabled={toggleMutation.isPending}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold disabled:opacity-50"
            >
              {active ? <ToggleRight className="size-3.5 text-emerald-600" /> : <ToggleLeft className="size-3.5 text-muted" />}
              {active ? "غیرفعال کردن" : "فعال کردن"}
            </button>
          );
        }}
      />
    </div>
  );
}
