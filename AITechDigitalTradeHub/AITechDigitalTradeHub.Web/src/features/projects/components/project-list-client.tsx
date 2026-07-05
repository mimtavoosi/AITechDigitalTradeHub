"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, Loader2, MapPin, Search, SlidersHorizontal, Sparkles, WalletCards } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getCategories, getCategoryDescription, getCategoryId, getCategoryName, isProjectCategory } from "@/features/categories/api/categories-api";
import { getTagId, getTagName, getTags } from "@/features/tags/api/tags-api";
import { getProjects } from "@/features/projects/api/projects-api";
import type { ProjectSummary } from "@/features/projects/types";
import { queryKeys } from "@/lib/query-keys";

const projectTypeOptions = [
  { value: "Fixed", label: "ثابت" },
  { value: "Hourly", label: "ساعتی" }
];

const locationOptions = [
  { value: "Remote", label: "دورکاری" },
  { value: "OnSite", label: "حضوری" },
  { value: "Hybrid", label: "ترکیبی" }
];

const sortOptions = [
  { value: "PublishedAt desc", label: "جدیدترین" },
  { value: "BudgetMax desc", label: "بودجه بیشتر" },
  { value: "DeadlineAt asc", label: "نزدیک‌ترین مهلت" }
];

const budgetLimit = 1_000_000_000;
const budgetStep = 5_000_000;
const pageSize = 9;

export function ProjectListClient() {
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [skillTagId, setSkillTagId] = useState<number | "">("");
  const [projectType, setProjectType] = useState<string | "">("");
  const [locationMode, setLocationMode] = useState<string | "">("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortQuery, setSortQuery] = useState<string | "">("PublishedAt desc");

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.publicProjects(),
    queryFn: () => getCategories({ pageSize: 200 })
  });

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags.publicProjects(),
    queryFn: () => getTags({ pageSize: 300 })
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const projectsQuery = useInfiniteQuery({
    queryKey: queryKeys.projects.publicList({ searchText, categoryId: Number(categoryId) || undefined, skillTagId: Number(skillTagId) || undefined, projectType: projectType || undefined, locationMode: locationMode || undefined, minBudget: Number(minBudget) || undefined, maxBudget: Number(maxBudget) || undefined, sortQuery: sortQuery || undefined }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProjects({
        searchText,
        categoryId: Number(categoryId) || undefined,
        skillTagId: Number(skillTagId) || undefined,
        projectType: projectType || undefined,
        locationMode: locationMode || undefined,
        minBudget: Number(minBudget) || undefined,
        maxBudget: Number(maxBudget) || undefined,
        sortQuery: sortQuery || undefined,
        pageIndex: Number(pageParam),
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + (page.results?.length ?? 0), 0);
      const totalCount = lastPage.totalCount ?? loadedCount;
      if (loadedCount >= totalCount) return undefined;
      return allPages.length + 1;
    }
  });

  const categories = useMemo(
    () => {
      const items = categoriesQuery.data?.results ?? [];
      const projectItems = items.filter(isProjectCategory);
      return (projectItems.length ? projectItems : items)
        .map((item) => ({ value: getCategoryId(item), label: getCategoryName(item), description: getCategoryDescription(item) }))
        .filter((item) => item.value > 0);
    },
    [categoriesQuery.data?.results]
  );

  const skillOptions = useMemo(
    () => (tagsQuery.data?.results ?? []).map((item) => ({ value: getTagId(item), label: getTagName(item) })).filter((item) => item.value > 0),
    [tagsQuery.data?.results]
  );

  const projects = projectsQuery.data?.pages.flatMap((page) => page.results ?? []) ?? [];
  const totalProjects = projectsQuery.data?.pages[0]?.totalCount ?? projects.length;
  const hasNextPage = Boolean(projectsQuery.hasNextPage);
  const isInitialLoading = projectsQuery.isLoading && !projects.length;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !projectsQuery.isFetchingNextPage) {
          projectsQuery.fetchNextPage();
        }
      },
      { rootMargin: "360px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, projectsQuery]);

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,#17102F,#21444B)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:p-6">
        <div className="absolute -left-16 -top-20 size-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 right-16 size-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black text-white/80">
              <Sparkles className="size-4 text-[#32D4C8]" />
              فرصت‌های فعال هوش مصنوعی
            </div>
            <h1 className="mt-4 text-2xl font-black leading-10 md:text-4xl md:leading-[1.35]">پروژه مناسب بعدی‌تان را پیدا کنید</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-white/76">
              فرصت‌های فعال را بر اساس مهارت، بودجه و مدل همکاری بررسی کنید؛ از صفحه جزئیات پروژه می‌توانید شرایط را ببینید و پیشنهادتان را ارسال کنید.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/dashboard/projects" className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-[#17102F] transition hover:bg-white/90">
                ثبت پروژه جدید
              </Link>
              <a href="#project-results" className="inline-flex h-11 items-center justify-center rounded-lg border border-white/24 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15">
                مشاهده فرصت‌ها
              </a>
            </div>
          </div>
          <div className="grid gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-bold text-white/58">فرصت قابل بررسی</p>
              <p className="mt-1 text-3xl font-black">{totalProjects.toLocaleString("fa-IR")}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-white/74">
              <span className="rounded-lg bg-white/10 px-3 py-2">فیلتر مهارت</span>
              <span className="rounded-lg bg-white/10 px-3 py-2">ارسال پیشنهاد</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-4 shadow-panel">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_auto] lg:items-center">
          <label className="flex h-11 items-center gap-2 rounded-md border border-border bg-white px-3">
            <Search className="size-4 text-muted" />
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="جستجو در عنوان و توضیح پروژه" />
          </label>
          <SearchableSelect options={sortOptions} value={sortQuery} onChange={setSortQuery} placeholder="مرتب‌سازی" clearable={false} />
          <span className="rounded-md bg-background px-3 py-2 text-center text-xs font-bold text-muted">{totalProjects.toLocaleString("fa-IR")} پروژه</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-border bg-white p-4 shadow-panel lg:sticky lg:top-24">
          <div className="mb-4 flex items-center gap-2 font-black">
            <SlidersHorizontal className="size-5 text-primary" />
            فیلتر پروژه‌ها
          </div>
          <div className="grid gap-3">
          <SearchableSelect options={categories} value={categoryId} onChange={setCategoryId} placeholder="دسته‌بندی" />
          <SearchableSelect options={skillOptions} value={skillTagId} onChange={setSkillTagId} placeholder="مهارت مورد نیاز" />
          <SearchableSelect options={projectTypeOptions} value={projectType} onChange={setProjectType} placeholder="نوع پروژه" />
          <SearchableSelect options={locationOptions} value={locationMode} onChange={setLocationMode} placeholder="محل اجرا" />

            <BudgetControl label="حداقل بودجه" value={minBudget} onChange={setMinBudget} />
            <BudgetControl label="حداکثر بودجه" value={maxBudget} onChange={setMaxBudget} />
          </div>
        </aside>

        <main id="project-results" className="scroll-mt-24 grid gap-4">
          {isInitialLoading ? <ProjectLoading /> : null}

          {projectsQuery.error ? <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">خواندن پروژه‌ها ناموفق بود.</div> : null}

          {!isInitialLoading && !projects.length ? (
            <div className="rounded-xl border border-border bg-white px-4 py-10 text-center text-sm text-muted">پروژه‌ای با این فیلترها پیدا نشد.</div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div ref={loadMoreRef} className="min-h-2" />

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => projectsQuery.fetchNextPage()}
              disabled={projectsQuery.isFetchingNextPage}
              className="mx-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-black text-foreground shadow-panel transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
            >
              {projectsQuery.isFetchingNextPage ? <Loader2 className="size-4 animate-spin" /> : <ArrowLeft className="size-4" />}
              {projectsQuery.isFetchingNextPage ? "در حال دریافت پروژه‌های بعدی" : "نمایش پروژه‌های بیشتر"}
            </button>
          ) : projects.length ? (
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-center text-xs font-bold text-muted">
              همه پروژه‌های این فیلتر نمایش داده شد.
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function BudgetControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const numericValue = Math.min(Number(value) || 0, budgetLimit);

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <label className="grid gap-2">
        <span className="text-xs font-bold text-muted">{label}</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-border bg-white px-3 text-sm focus-ring" type="number" min="0" placeholder={label} />
      </label>
      <input
        value={numericValue}
        onChange={(event) => onChange(event.target.value === "0" ? "" : event.target.value)}
        className="mt-3 h-2 w-full cursor-pointer accent-primary"
        type="range"
        min="0"
        max={budgetLimit}
        step={budgetStep}
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>۰</span>
        <span>{numericValue ? numericValue.toLocaleString("fa-IR") : "تعیین نشده"}</span>
        <span>{budgetLimit.toLocaleString("fa-IR")}</span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link href={`/projects/${project.id}`} className="group relative block overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-panel transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
      <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7E57F5,#32D4C8)] opacity-70 transition group-hover:opacity-100" />
      <div className="grid h-full gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-bold text-primary">
              <BriefcaseBusiness className="size-4" />
              {project.categoryName ?? "پروژه هوش مصنوعی"}
            </span>
            <span>{statusLabel(project.status)}</span>
          </div>
          <h2 className="mt-3 text-lg font-black leading-8 text-foreground group-hover:text-primary md:text-xl">{project.title}</h2>
          {project.description ? <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">{stripHtml(project.description)}</p> : null}
          {project.skills?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.slice(0, 6).map((skill) => (
                <span key={String(skill.id)} className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
                  {skill.name}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span>{project.employerName || "کارفرمای پلتفرم"}</span>
            <span>{project.proposalsCount ?? 0} پیشنهاد</span>
            {project.publishedAt ? (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-4" />
                {publishedAgeLabel(project.publishedAt)}
              </span>
            ) : null}
            {project.deadlineAt ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" />
                {new Date(project.deadlineAt).toLocaleDateString("fa-IR")}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {locationLabel(project)}
            </span>
          </div>
        </div>
        <div className="mt-auto rounded-xl border border-border bg-[linear-gradient(180deg,#F8FAFC,#FFFFFF)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <WalletCards className="size-4" />
                بودجه پروژه
              </div>
              <div className="mt-2 text-lg font-black text-primary">{formatBudget(project)}</div>
            </div>
            <div className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-bold text-muted shadow-sm">{project.timelineDays ? `${project.timelineDays.toLocaleString("fa-IR")} روز` : "توافقی"}</div>
          </div>
        </div>
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
  const currency = currencyLabel(project.currency);
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

function currencyLabel(value?: string | null) {
  const normalized = String(value ?? "IRR").toUpperCase();
  if (normalized === "IRR" || normalized === "ریال") return "ریال";
  if (normalized === "IRT" || normalized === "TOMAN" || normalized === "تومان") return "تومان";
  return value ?? "ریال";
}

function statusLabel(value: string | number) {
  const labels: Record<string, string> = {
    Draft: "پیش‌نویس",
    Published: "منتشر شده",
    Bidding: "در مناقصه",
    Assigned: "واگذار شده",
    InProgress: "در حال اجرا",
    Done: "تمام شده",
    Cancelled: "لغو شده",
    Disputed: "دارای اختلاف"
  };
  return labels[String(value)] ?? String(value);
}

function locationLabel(project: ProjectSummary) {
  const value = String(project.locationMode ?? "");
  if (value === "OnSite" || Number(value) === 2) return "حضوری";
  if (value === "Hybrid" || Number(value) === 3) return "ترکیبی";
  return "دورکاری";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function publishedAgeLabel(value: string) {
  const publishedAt = new Date(value);
  if (Number.isNaN(publishedAt.getTime())) return "تاریخ انتشار نامعتبر";

  const diffMs = Date.now() - publishedAt.getTime();
  if (diffMs < 0) return "انتشار زمان‌بندی شده";

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "امروز منتشر شده";
  if (diffDays === 1) return "۱ روز از انتشار گذشته";
  return `${diffDays.toLocaleString("fa-IR")} روز از انتشار گذشته`;
}
