"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, Loader2 } from "lucide-react";
import { getProjects } from "@/features/projects/api/projects-api";
import type { ProjectSummary } from "@/features/projects/types";

export function ProjectListClient() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", "public"],
    queryFn: getProjects
  });

  if (isLoading) {
    return <ProjectLoading />;
  }

  if (error) {
    return <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">خواندن پروژه‌ها ناموفق بود.</div>;
  }

  const projects = data?.results ?? [];

  if (!projects.length) {
    return <div className="rounded-md border border-border bg-white px-4 py-8 text-center text-sm text-muted">هنوز پروژه عمومی منتشر نشده است.</div>;
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/projects/${project.id}`} className="block rounded-lg border border-border bg-white p-4 transition hover:border-primary/40 hover:shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted">
            <BriefcaseBusiness className="size-4" />
            <span>{project.categoryName ?? "پروژه هوش مصنوعی"}</span>
          </div>
          <h2 className="mt-2 text-lg font-black text-foreground">{project.title}</h2>
          {project.description ? <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">{project.description}</p> : null}
        </div>
        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{formatBudget(project)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span>{project.employerName || "کارفرمای پلتفرم"}</span>
        <span>{project.proposalsCount ?? 0} پیشنهاد</span>
        {project.deadlineAt ? (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" />
            {new Date(project.deadlineAt).toLocaleDateString("fa-IR")}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function ProjectLoading() {
  return (
    <div className="grid place-items-center rounded-md border border-border bg-white py-10 text-muted">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export function formatBudget(project: Pick<ProjectSummary, "budgetMin" | "budgetMax" | "currency">) {
  const currency = project.currency ?? "IRR";
  if (project.budgetMin && project.budgetMax) {
    return `${project.budgetMin.toLocaleString("fa-IR")} تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMin) {
    return `از ${project.budgetMin.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMax) {
    return `تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  return "بودجه توافقی";
}
