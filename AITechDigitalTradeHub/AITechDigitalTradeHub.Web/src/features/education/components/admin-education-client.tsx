"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { getAdminEducationBookings, getAdminEducationCourses, updateAdminCourseStatus } from "@/features/education/api/education-api";
import type { CourseStatus } from "@/features/education/types";
import { ApiRequestError } from "@/lib/api/http-client";

export function AdminEducationClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const coursesQuery = useQuery({ queryKey: ["admin", "education", "courses"], queryFn: getAdminEducationCourses });
  const bookingsQuery = useQuery({ queryKey: ["admin", "education", "bookings"], queryFn: getAdminEducationBookings });

  const statusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: number; status: CourseStatus }) => updateAdminCourseStatus(courseId, status),
    onSuccess: () => {
      setMessage("وضعیت دوره به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "education"] });
      void queryClient.invalidateQueries({ queryKey: ["education"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی دوره ناموفق بود")
  });

  const courses = coursesQuery.data?.results ?? [];
  const bookings = bookingsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5">
      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">کنترل محتوای آموزشی</h2>
            <p className="mt-2 text-sm leading-7 text-muted">دوره‌های در انتظار بررسی، منتشرشده و آرشیوشده را از اینجا مدیریت کنید.</p>
          </div>
          <ShieldCheck className="size-6 text-primary" />
        </div>
        {message ? <div className="mt-4 rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="dashboard-card overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-black">دوره‌ها</h2>
        </div>
        {coursesQuery.isLoading ? <Loader2 className="m-5 size-5 animate-spin text-muted" /> : null}
        <div className="divide-y divide-border">
          {courses.map((course) => (
            <div key={course.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <div className="font-bold">{course.title}</div>
                <div className="mt-1 text-xs text-muted">{course.instructorName ?? `مدرس ${course.instructorUserId}`} / {String(course.status)} / {course.lessonsCount} درس</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ courseId: Number(course.id), status: "Published" })}>
                  <CheckCircle2 className="size-3.5" />
                  انتشار
                </button>
                <button className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-60" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ courseId: Number(course.id), status: "Archived" })}>
                  <Archive className="size-3.5" />
                  آرشیو
                </button>
              </div>
            </div>
          ))}
          {!coursesQuery.isLoading && !courses.length ? <div className="p-5 text-sm text-muted">دوره‌ای برای مدیریت وجود ندارد.</div> : null}
        </div>
      </section>

      <section className="dashboard-card overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-black">رزروهای کلاس خصوصی</h2>
        </div>
        {bookingsQuery.isLoading ? <Loader2 className="m-5 size-5 animate-spin text-muted" /> : null}
        <div className="divide-y divide-border">
          {bookings.map((booking) => (
            <div key={booking.id} className="grid gap-2 p-4 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <div className="font-bold">{booking.subject || "جلسه آموزشی"}</div>
                <div className="mt-1 text-xs text-muted">{booking.studentName ?? `کاربر ${booking.studentUserId}`} با {booking.instructorName ?? `مدرس ${booking.instructorUserId}`}</div>
              </div>
              <div className="text-xs text-muted">{new Date(booking.startsAt).toLocaleString("fa-IR")} / {String(booking.status)}</div>
            </div>
          ))}
          {!bookingsQuery.isLoading && !bookings.length ? <div className="p-5 text-sm text-muted">رزروی ثبت نشده است.</div> : null}
        </div>
      </section>
    </div>
  );
}
