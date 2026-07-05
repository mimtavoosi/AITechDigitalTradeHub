"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, ChevronLeft, ChevronRight, Clock, Filter, Layers3, Loader2, MapPin, MonitorPlay, Search, Users, Video } from "lucide-react";
import { getCourses } from "@/features/education/api/education-api";
import type { CourseDeliveryMode, CourseLevel, CourseSummary } from "@/features/education/types";

const pageSize = 6;

export function CourseListClient() {
  const [searchText, setSearchText] = useState("");
  const [level, setLevel] = useState("all");
  const [mode, setMode] = useState("all");
  const [price, setPrice] = useState("all");
  const [track, setTrack] = useState("all");
  const [pageIndex, setPageIndex] = useState(1);
  const coursesQuery = useQuery({
    queryKey: ["education", "courses", "published"],
    queryFn: () => getCourses({ status: "Published" })
  });

  const courses = useMemo(() => coursesQuery.data?.results ?? [], [coursesQuery.data?.results]);
  const filteredCourses = useMemo(
    () => filterCourses(courses, { searchText, level, mode, price, track }),
    [courses, level, mode, price, searchText, track]
  );
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount);
  const visibleCourses = filteredCourses.slice((safePageIndex - 1) * pageSize, safePageIndex * pageSize);

  function updateFilter(updater: () => void) {
    updater();
    setPageIndex(1);
  }

  if (coursesQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-white">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="rounded-lg border border-border bg-white px-6 py-12 text-center">
        <BookOpen className="mx-auto size-9 text-muted" />
        <h2 className="mt-4 text-lg font-black">هنوز دوره منتشرشده‌ای وجود ندارد</h2>
        <p className="mt-2 text-sm leading-7 text-muted">بعد از انتشار دوره توسط مدرس‌ها، این بخش با داده واقعی پر می‌شود.</p>
      </div>
    );
  }

  return (
    <section className="grid gap-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_16px_48px_rgba(15,23,42,0.055)]">
        <div className="grid gap-5 bg-[linear-gradient(135deg,#17102F_0%,#3D2E84_58%,#1A7C7A_100%)] p-5 text-white lg:grid-cols-[minmax(0,1fr)_360px] lg:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black text-white/85">
              <BookOpen className="size-4" />
              دوره‌ها و کلاس‌های آی نت
            </div>
            <h2 className="mt-4 text-2xl font-black leading-10 md:text-3xl">مسیر مناسب را پیدا کنید و وارد یادگیری شوید</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
              دوره‌های ضبط‌شده، کلاس آنلاین، حضوری و مسیرهای ترکیبی را با فیلتر سطح، مدل برگزاری و نیاز به منتور بررسی کنید.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/16 bg-white/10 p-4 backdrop-blur-md">
            <MiniStat label="دوره" value={courses.length} />
            <MiniStat label="نمایش" value={filteredCourses.length} />
            <MiniStat label="صفحه" value={pageCount} />
          </div>
        </div>

        <div className="grid gap-3 border-b border-border bg-white p-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={searchText}
              onChange={(event) => updateFilter(() => setSearchText(event.target.value))}
              className="h-11 w-full rounded-md border border-border bg-white pr-10 pl-3 text-sm focus-ring"
              placeholder="جستجو در عنوان، توضیح یا مدرس"
            />
          </label>
          <FilterSelect value={level} onChange={(value) => updateFilter(() => setLevel(value))} label="سطح" options={[["all", "همه سطح‌ها"], ["Beginner", "مقدماتی"], ["Intermediate", "متوسط"], ["Advanced", "پیشرفته"]]} />
          <FilterSelect value={mode} onChange={(value) => updateFilter(() => setMode(value))} label="نوع برگزاری" options={[["all", "همه مدل‌ها"], ["Recorded", "ضبط‌شده"], ["LiveOnline", "آنلاین"], ["InPerson", "حضوری"], ["Hybrid", "ترکیبی"]]} />
          <FilterSelect value={price} onChange={(value) => updateFilter(() => setPrice(value))} label="قیمت" options={[["all", "همه قیمت‌ها"], ["free", "رایگان"], ["paid", "غیررایگان"]]} />
          <FilterSelect value={track} onChange={(value) => updateFilter(() => setTrack(value))} label="مسیر" options={[["all", "همه مسیرها"], ["project", "پروژه‌محور"], ["mentor", "همراه منتور"]]} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          {filteredCourses.length.toLocaleString("fa-IR")} دوره پیدا شد
        </div>
        <button
          type="button"
          onClick={() => {
            setSearchText("");
            setLevel("all");
            setMode("all");
            setPrice("all");
            setTrack("all");
            setPageIndex(1);
          }}
          className="h-9 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted transition hover:border-primary/40 hover:text-primary"
        >
          پاک کردن فیلترها
        </button>
      </div>

      {visibleCourses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
          <Filter className="mx-auto size-9 text-muted" />
          <h2 className="mt-4 text-lg font-black">دوره‌ای با این فیلترها پیدا نشد</h2>
          <p className="mt-2 text-sm leading-7 text-muted">فیلترها را سبک‌تر کنید یا عبارت جستجو را تغییر دهید.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-white p-3">
        <button type="button" onClick={() => setPageIndex((value) => Math.max(1, value - 1))} disabled={safePageIndex <= 1} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-45">
          <ChevronRight className="size-4" />
          قبلی
        </button>
        <span className="px-3 text-sm text-muted">
          صفحه {safePageIndex.toLocaleString("fa-IR")} از {pageCount.toLocaleString("fa-IR")}
        </span>
        <button type="button" onClick={() => setPageIndex((value) => Math.min(pageCount, value + 1))} disabled={safePageIndex >= pageCount} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-45">
          بعدی
          <ChevronLeft className="size-4" />
        </button>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link key={course.id} href={`/courses/${course.id}`} className="group rounded-xl border border-border bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <CourseModeBadge mode={course.deliveryMode} />
        <span className="text-xs text-muted">{course.categoryName ?? "آموزش AI"}</span>
      </div>
      <h2 className="mt-4 line-clamp-2 text-lg font-black leading-8 group-hover:text-primary">{course.title}</h2>
      {course.description ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{course.description}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-md bg-background px-2 py-1 text-xs font-bold text-muted">{formatLevel(course.level)}</span>
        {course.projectBased ? <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent">پروژه‌محور</span> : null}
        {course.requiresMentor ? <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">همراه منتور</span> : null}
      </div>
      <div className="mt-5 grid gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <Users className="size-4" />
          {course.instructorName ?? `مدرس ${course.instructorUserId}`}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4" />
          {course.durationMinutes ? `${course.durationMinutes.toLocaleString("fa-IR")} دقیقه` : "مدت دوره ثبت نشده"}
        </span>
        {course.startsAt ? (
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4" />
            شروع: {new Date(course.startsAt).toLocaleDateString("fa-IR")}
          </span>
        ) : null}
        {course.estimatedWeeks ? (
          <span className="inline-flex items-center gap-2">
            <Layers3 className="size-4" />
            حدود {Number(course.estimatedWeeks).toLocaleString("fa-IR")} هفته
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-black">{course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ریال` : "رایگان"}</span>
        <span className="text-xs text-muted">{course.lessonsCount.toLocaleString("fa-IR")} درس</span>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/12 p-3 text-center">
      <div className="text-2xl font-black">{value.toLocaleString("fa-IR")}</div>
      <div className="mt-1 text-xs text-white/70">{label}</div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-md border border-border bg-white px-3 text-sm focus-ring">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CourseModeBadge({ mode }: { mode: CourseDeliveryMode }) {
  const data = getModeData(mode);
  const Icon = data.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-black ${data.className}`}>
      <Icon className="size-4" />
      {data.label}
    </span>
  );
}

function getModeData(mode: CourseDeliveryMode) {
  const normalized = String(mode).toLowerCase();
  if (normalized === "1" || normalized === "recorded") {
    return { label: "ویدیویی ضبط‌شده", icon: Video, className: "bg-primary/10 text-primary" };
  }
  if (normalized === "2" || normalized === "liveonline") {
    return { label: "کلاس آنلاین", icon: MonitorPlay, className: "bg-accent/10 text-accent" };
  }
  if (normalized === "3" || normalized === "inperson") {
    return { label: "حضوری", icon: MapPin, className: "bg-warning/10 text-warning" };
  }
  if (normalized === "4" || normalized === "hybrid") {
    return { label: "ترکیبی", icon: Layers3, className: "bg-success/10 text-success" };
  }
  return { label: String(mode), icon: BookOpen, className: "bg-background text-muted" };
}

function formatLevel(level: CourseLevel) {
  const normalized = String(level).toLowerCase();
  if (normalized === "1" || normalized === "beginner") return "مقدماتی";
  if (normalized === "2" || normalized === "intermediate") return "متوسط";
  if (normalized === "3" || normalized === "advanced") return "پیشرفته";
  return String(level);
}

function filterCourses(courses: CourseSummary[], filters: { searchText: string; level: string; mode: string; price: string; track: string }) {
  const query = filters.searchText.trim().toLowerCase();
  return courses.filter((course) => {
    const searchable = [course.title, course.description, course.instructorName, course.categoryName].filter(Boolean).join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (filters.level !== "all" && normalizeLevelValue(course.level) !== filters.level) return false;
    if (filters.mode !== "all" && normalizeModeValue(course.deliveryMode) !== filters.mode) return false;
    if (filters.price === "free" && Number(course.priceAmount || 0) > 0) return false;
    if (filters.price === "paid" && Number(course.priceAmount || 0) <= 0) return false;
    if (filters.track === "project" && !course.projectBased) return false;
    if (filters.track === "mentor" && !course.requiresMentor) return false;
    return true;
  });
}

function normalizeLevelValue(level: CourseLevel) {
  const normalized = String(level).toLowerCase();
  if (normalized === "1" || normalized === "beginner") return "Beginner";
  if (normalized === "2" || normalized === "intermediate") return "Intermediate";
  if (normalized === "3" || normalized === "advanced") return "Advanced";
  return String(level);
}

function normalizeModeValue(mode: CourseDeliveryMode) {
  const normalized = String(mode).toLowerCase();
  if (normalized === "1" || normalized === "recorded") return "Recorded";
  if (normalized === "2" || normalized === "liveonline") return "LiveOnline";
  if (normalized === "3" || normalized === "inperson") return "InPerson";
  if (normalized === "4" || normalized === "hybrid") return "Hybrid";
  return String(mode);
}
