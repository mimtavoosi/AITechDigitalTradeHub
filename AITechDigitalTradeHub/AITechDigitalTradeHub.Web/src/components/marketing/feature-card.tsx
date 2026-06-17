import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
  tone?: "primary" | "accent" | "green" | "amber";
};

const toneClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  green: "bg-green-50 text-success",
  amber: "bg-amber-50 text-warning"
};

export function FeatureCard({ icon: Icon, title, description, meta, tone = "accent" }: FeatureCardProps) {
  return (
    <article className="card-3d elevated-card rounded-xl p-5 transition hover:border-accent/30">
      <div className="mb-5 flex items-start justify-between gap-4">
        {meta ? <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-muted">{meta}</span> : null}
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="size-6" />
        </span>
      </div>
      <h3 className="text-lg font-black leading-8 text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </article>
  );
}
