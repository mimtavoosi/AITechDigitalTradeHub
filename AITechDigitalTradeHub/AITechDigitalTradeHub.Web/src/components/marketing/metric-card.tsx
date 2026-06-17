type MetricCardProps = {
  value: string;
  label: string;
  description?: string;
};

export function MetricCard({ value, label, description }: MetricCardProps) {
  return (
    <article className="card-3d rounded-xl border border-border/80 bg-white p-5 text-right shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <p className="text-3xl font-black text-primary">{value}</p>
      <h3 className="mt-2 text-sm font-extrabold text-foreground">{label}</h3>
      {description ? <p className="mt-2 text-xs leading-6 text-muted">{description}</p> : null}
    </article>
  );
}
