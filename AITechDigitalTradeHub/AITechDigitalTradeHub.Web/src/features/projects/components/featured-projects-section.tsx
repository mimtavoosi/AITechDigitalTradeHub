"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, Loader2 } from "lucide-react";
import { FeaturedEducationSection } from "@/features/education/components/featured-education-section";
import { FeaturedServicesSection } from "@/features/listings/components/featured-services-section";
import { getProjects } from "@/features/projects/api/projects-api";
import { formatBudget } from "@/features/projects/components/project-list-client";
import { queryKeys } from "@/lib/query-keys";

export function FeaturedProjectsSection() {
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.featured(),
    queryFn: () => getProjects({ pageSize: 3, sortQuery: "PublishedAt desc" })
  });

  return (
    <>
      <section className="bg-background py-10 md:py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="text-right">
            <p className="mb-2 text-sm font-bold text-accent">مناقصه‌ها</p>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">پروژه‌های فعال</h2>
            <p className="mt-3 text-sm leading-7 text-muted">فرصت‌های واقعی پروژه از API پلتفرم نمایش داده می‌شود.</p>
          </div>
          <Link href="/projects" className="w-fit rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold hover:border-primary/40">
            مشاهده همه پروژه‌ها
          </Link>
        </div>

        {projectsQuery.isLoading ? (
          <div className="grid place-items-center rounded-lg border border-border bg-white py-12">
            <Loader2 className="size-5 animate-spin text-muted" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {(projectsQuery.data?.results ?? []).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="dashboard-card animate-panel-in p-6 hover:border-primary/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-success">{String(project.status)}</span>
                  <BriefcaseBusiness className="size-5 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-black leading-8">{project.title}</h3>
                <p className="mt-3 line-clamp-3 min-h-20 text-sm leading-7 text-muted">{stripHtml(project.description ?? "") || "توضیح پروژه در صفحه جزئیات قابل مشاهده است."}</p>
                <div className="mt-5 rounded-xl bg-[#EDF5F2] p-4">
                  <p className="text-xs text-muted">بودجه</p>
                  <p className="mt-1 text-lg font-black text-primary">{formatBudget(project)}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-sm text-muted">
                  <span>{project.proposalsCount ?? 0} پیشنهاد</span>
                  {project.deadlineAt ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-4" />
                      {new Date(project.deadlineAt).toLocaleDateString("fa-IR")}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </section>
      <FeaturedEducationSection />
      <FeaturedServicesSection />
    </>
  );
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
