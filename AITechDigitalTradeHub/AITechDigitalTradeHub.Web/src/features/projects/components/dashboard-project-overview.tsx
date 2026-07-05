import { Plus } from "lucide-react";

export function EmployerMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/70 bg-white/75 px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black text-foreground">{value.toLocaleString("fa-IR")}</div>
    </div>
  );
}

export function ProjectMiniBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="rounded-md bg-background/70 p-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold">{label}</span>
        <span className="text-muted">{normalized.toLocaleString("fa-IR")}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

export function EmptyProjectWorkspace({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-md border border-dashed border-border bg-background/45 p-6 text-center">
      <div className="max-w-md">
        <div className="text-lg font-black">پروژه‌ای انتخاب نشده است</div>
        <p className="mt-3 text-sm leading-7 text-muted">
          از فهرست سمت راست یک پروژه را انتخاب کنید تا پیشنهادها، قرارداد، مستندات، گفتگو و اختلاف‌های آن اینجا نمایش داده شود.
        </p>
        <button type="button" onClick={onCreate} className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white">
          <Plus className="size-4" />
          ثبت پروژه جدید
        </button>
      </div>
    </div>
  );
}
