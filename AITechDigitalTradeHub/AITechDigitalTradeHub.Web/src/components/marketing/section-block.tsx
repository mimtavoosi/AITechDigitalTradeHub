import Link from "next/link";
import type { Route } from "next";

type SectionBlockProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: Route;
  tone?: "white" | "soft";
  children: React.ReactNode;
};

export function SectionBlock({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  tone = "white",
  children
}: SectionBlockProps) {
  return (
    <section className={tone === "soft" ? "bg-background py-10 md:py-16" : "bg-white py-10 md:py-16"}>
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl text-right">
            {eyebrow ? <p className="mb-2 text-sm font-extrabold text-accent">{eyebrow}</p> : null}
            <h2 className="text-2xl font-black leading-10 text-foreground md:text-3xl">{title}</h2>
            {description ? <p className="mt-3 text-sm leading-8 text-muted md:text-base">{description}</p> : null}
          </div>
          {actionHref && actionLabel ? (
            <Link href={actionHref} className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-bold text-foreground transition hover:border-accent/40 hover:text-accent">
              {actionLabel}
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
