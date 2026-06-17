type ProcessStepCardProps = {
  step: string;
  title: string;
  description: string;
};

export function ProcessStepCard({ step, title, description }: ProcessStepCardProps) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
      <span className="absolute left-4 top-4 text-5xl font-black leading-none text-primary/10">{step}</span>
      <span className="relative grid size-10 place-items-center rounded-lg bg-foreground text-sm font-black text-white">{step}</span>
      <h3 className="relative mt-5 text-lg font-black text-foreground">{title}</h3>
      <p className="relative mt-3 text-sm leading-7 text-muted">{description}</p>
    </article>
  );
}
