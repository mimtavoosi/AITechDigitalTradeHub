"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Loader2, Users } from "lucide-react";
import { getCourses } from "@/features/education/api/education-api";

export function CourseListClient() {
  const coursesQuery = useQuery({
    queryKey: ["education", "courses", "published"],
    queryFn: () => getCourses({ status: "Published" })
  });

  const courses = coursesQuery.data?.results ?? [];

  if (coursesQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-white">
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <Link key={course.id} href={`/courses/${course.id}`} className="group rounded-lg border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{String(course.level)}</span>
            <span className="text-xs text-muted">{course.categoryName ?? "آموزش AI"}</span>
          </div>
          <h2 className="mt-4 line-clamp-2 text-lg font-black leading-8 group-hover:text-primary">{course.title}</h2>
          {course.description ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{course.description}</p> : null}
          <div className="mt-5 grid gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <Users className="size-4" />
              {course.instructorName ?? `مدرس ${course.instructorUserId}`}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4" />
              {course.durationMinutes ? `${course.durationMinutes} دقیقه` : "مدت دوره ثبت نشده"}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-black">{course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ${course.currency}` : "رایگان"}</span>
            <span className="text-xs text-muted">{course.lessonsCount} درس</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
