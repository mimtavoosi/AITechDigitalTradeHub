export function DashboardPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <h1 className="text-2xl font-black leading-10 md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-7 text-muted">{description}</p> : null}
      </div>
      <div className="metric-chip inline-flex h-10 w-fit items-center gap-2 px-3 text-xs font-bold text-muted">
        <span className="size-2 rounded-full bg-success animate-soft-pulse" />
        به‌روزرسانی لحظه‌ای
      </div>
    </div>
  );
}
