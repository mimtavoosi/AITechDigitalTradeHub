"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, GraduationCap, Loader2, Star } from "lucide-react";
import { getInstructors } from "@/features/education/api/education-api";

export function InstructorListClient() {
  const instructorsQuery = useQuery({ queryKey: ["education", "instructors"], queryFn: getInstructors });
  const instructors = instructorsQuery.data?.results ?? [];

  if (instructorsQuery.isLoading) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!instructors.length) {
    return (
      <div className="rounded-lg border border-border bg-white px-6 py-12 text-center">
        <GraduationCap className="mx-auto size-9 text-muted" />
        <h2 className="mt-4 text-lg font-black">هنوز مدرس فعالی ثبت نشده است</h2>
        <p className="mt-2 text-sm leading-7 text-muted">بعد از تایید درخواست مدرس‌ها توسط مدیریت، پروفایل آن‌ها اینجا نمایش داده می‌شود.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {instructors.map((instructor) => (
        <Link key={instructor.userId} href={`/instructors/${instructor.userId}`} className="group rounded-lg border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{instructor.headline ?? "مدرس هوش مصنوعی"}</span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-700">
              <Star className="size-3.5 fill-current" />
              {Number(instructor.averageRating || 0).toLocaleString("fa-IR")}
            </span>
          </div>
          <h2 className="mt-4 line-clamp-2 text-lg font-black leading-8 group-hover:text-primary">{instructor.fullName ?? `مدرس ${instructor.userId}`}</h2>
          {instructor.bio ? <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted">{instructor.bio}</p> : null}
          <div className="mt-5 grid gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="size-4" />
              {instructor.coursesCount.toLocaleString("fa-IR")} دوره
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4" />
              {instructor.availableSlotsCount.toLocaleString("fa-IR")} زمان قابل رزرو
            </span>
          </div>
          <div className="mt-5 border-t border-border pt-4 text-sm font-black">
            {instructor.hourlyRate ? `${instructor.hourlyRate.toLocaleString("fa-IR")} ${instructor.currency ?? "IRR"}` : "قیمت توافقی"}
          </div>
        </Link>
      ))}
    </div>
  );
}
