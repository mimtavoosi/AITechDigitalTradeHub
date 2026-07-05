"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock3, GraduationCap, Layers3, Loader2, MonitorPlay, Users, Video } from "lucide-react";
import { getCourses } from "@/features/education/api/education-api";
import type { CourseDeliveryMode, CourseLevel, CourseSummary } from "@/features/education/types";

export function FeaturedEducationSection() {
  const coursesQuery = useQuery({
    queryKey: ["education", "courses", "home-featured"],
    queryFn: () => getCourses({ status: "Published", pageSize: 3, sortQuery: "PublishedAt desc" })
  });

  const courses = coursesQuery.data?.results ?? [];

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-right">
            <p className="mb-2 text-sm font-bold text-accent">آموزش و یادگیری</p>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">دوره‌های پیشنهادی آی نت</h2>
            <p className="mt-3 text-sm leading-7 text-muted">از دوره‌های مقدماتی تا مسیرهای پروژه‌محور، نقطه شروع مناسب خود را پیدا کنید.</p>
          </div>
          <Link href="/courses" className="inline-flex h-11 w-fit items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-bold transition hover:border-primary/40 hover:text-primary">
            مشاهده همه دوره‌ها
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        {coursesQuery.isLoading ? (
          <div className="grid min-h-56 place-items-center rounded-xl border border-border bg-background/60">
            <Loader2 className="size-6 animate-spin text-muted" />
          </div>
        ) : courses.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {courses.map((course) => <FeaturedCourseCard key={course.id} course={course} />)}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 px-6 text-center">
            <BookOpen className="size-9 text-primary" />
            <h3 className="mt-4 text-lg font-black">دوره‌های جدید در حال آماده‌سازی‌اند</h3>
            <Link href="/courses" className="mt-4 text-sm font-bold text-primary">مشاهده صفحه آموزش</Link>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCourseCard({ course }: { course: CourseSummary }) {
  const mode = getModeData(course.deliveryMode);
  const ModeIcon = mode.icon;

  return (
    <Link href={`/courses/${course.id}`} className="group overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className="flex min-h-28 items-end justify-between bg-[#17102F] p-5 text-white">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">{course.categoryName ?? "آموزش هوش مصنوعی"}</span>
        <GraduationCap className="size-8 text-[#32D4C8]" />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-bold text-primary"><ModeIcon className="size-4" />{mode.label}</span>
          <span className="rounded-md bg-background px-2.5 py-1 font-bold text-muted">{formatLevel(course.level)}</span>
        </div>
        <h3 className="mt-4 line-clamp-2 min-h-16 text-lg font-black leading-8 transition group-hover:text-primary">{course.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-14 text-sm leading-7 text-muted">{course.description || "جزئیات مسیر یادگیری و سرفصل‌های دوره را مشاهده کنید."}</p>
        <div className="mt-5 grid gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><Users className="size-4" />{course.instructorName || "مدرس آی نت"}</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="size-4" />{course.durationMinutes ? `${course.durationMinutes.toLocaleString("fa-IR")} دقیقه` : "زمان‌بندی در صفحه دوره"}</span>
          {course.estimatedWeeks ? <span className="inline-flex items-center gap-2"><Layers3 className="size-4" />حدود {course.estimatedWeeks.toLocaleString("fa-IR")} هفته</span> : null}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-black">{course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ریال` : "رایگان"}</span>
          <span className="text-xs font-bold text-primary">مشاهده دوره</span>
        </div>
      </div>
    </Link>
  );
}

function getModeData(mode: CourseDeliveryMode) {
  const value = String(mode).toLowerCase();
  if (value === "1" || value === "recorded") return { label: "ضبط‌شده", icon: Video };
  if (value === "2" || value === "liveonline") return { label: "آنلاین زنده", icon: MonitorPlay };
  if (value === "3" || value === "inperson") return { label: "حضوری", icon: Users };
  if (value === "4" || value === "hybrid") return { label: "ترکیبی", icon: Layers3 };
  return { label: "دوره آموزشی", icon: BookOpen };
}

function formatLevel(level: CourseLevel) {
  const value = String(level).toLowerCase();
  if (value === "1" || value === "beginner") return "مقدماتی";
  if (value === "2" || value === "intermediate") return "متوسط";
  if (value === "3" || value === "advanced") return "پیشرفته";
  return String(level);
}
