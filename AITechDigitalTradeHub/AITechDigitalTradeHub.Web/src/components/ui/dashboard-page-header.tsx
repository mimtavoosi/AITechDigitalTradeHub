export function DashboardPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-black">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
    </div>
  );
}
