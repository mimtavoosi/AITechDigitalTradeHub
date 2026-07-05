"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Loader2, Star, Video } from "lucide-react";
import { getCourses, getInstructor, getInstructorSlots } from "@/features/education/api/education-api";
import { BadgeList } from "@/features/badges/components/badge-list";

export function InstructorDetailClient({ instructorUserId }: { instructorUserId: number }) {
  const instructorQuery = useQuery({ queryKey: ["education", "instructor", instructorUserId], queryFn: () => getInstructor(instructorUserId) });
  const slotsQuery = useQuery({ queryKey: ["education", "slots", instructorUserId], queryFn: () => getInstructorSlots(instructorUserId) });
  const coursesQuery = useQuery({ queryKey: ["education", "courses", "instructor", instructorUserId], queryFn: () => getCourses({ status: "Published" }) });

  if (instructorQuery.isLoading) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-border bg-white">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  const instructor = instructorQuery.data?.result;
  if (!instructor) {
    return <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-muted">مدرس پیدا نشد.</div>;
  }

  const courses = (coursesQuery.data?.results ?? []).filter((course) => Number(course.instructorUserId) === instructorUserId);
  const slots = slotsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-primary">{instructor.headline ?? "مدرس هوش مصنوعی"}</div>
            <h1 className="mt-3 text-2xl font-black leading-10 md:text-3xl">{instructor.fullName ?? `مدرس ${instructor.userId}`}</h1>
            <div className="mt-3">
              <BadgeList targetType="User" targetId={instructorUserId} />
            </div>
          </div>
          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-current" />
              {Number(instructor.averageRating || 0).toLocaleString("fa-IR")} از {Number(instructor.reviewsCount || 0).toLocaleString("fa-IR")} نظر
            </span>
          </div>
        </div>
        {instructor.bio ? <p className="mt-5 leading-8 text-muted">{instructor.bio}</p> : null}
        {instructor.expertise ? <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-7 text-muted">{instructor.expertise}</div> : null}

        <div className="mt-7">
          <h2 className="font-black">دوره‌های مدرس</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="rounded-md border border-border p-4 transition hover:border-primary/40">
                <div className="font-bold">{course.title}</div>
                <div className="mt-2 text-xs text-muted">{course.lessonsCount} درس / {course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ${course.currency}` : "رایگان"}</div>
              </Link>
            ))}
            {!courses.length ? <div className="text-sm text-muted">دوره منتشرشده‌ای برای این مدرس وجود ندارد.</div> : null}
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-white p-5">
        <h2 className="font-black">زمان‌های رزرو</h2>
        <div className="mt-3 grid gap-2">
          {slots.map((slot) => (
            <Link key={slot.id} href={`/courses/${courses[0]?.id ?? ""}`} className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="font-bold">{new Date(slot.startsAt).toLocaleString("fa-IR")}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted">
                {String(slot.mode) === "Online" ? <Video className="size-3.5" /> : <CalendarClock className="size-3.5" />}
                {slot.priceAmount > 0 ? `${slot.priceAmount.toLocaleString("fa-IR")} ${slot.currency}` : "رایگان"}
              </div>
            </Link>
          ))}
          {!slots.length ? <div className="text-sm text-muted">زمان آزادی برای رزرو ثبت نشده است.</div> : null}
        </div>
      </aside>
    </div>
  );
}
