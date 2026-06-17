"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarClock, Check, Loader2, Lock, PlayCircle } from "lucide-react";
import { enrollCourse, getCourse, getInstructorSlots } from "@/features/education/api/education-api";
import { getMyWallet, payCourseFromWallet } from "@/features/finance/api/finance-api";
import { AuthTrigger } from "@/features/auth/components/auth-trigger";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";

export function CourseDetailClient({ courseId }: { courseId: number }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const [message, setMessage] = useState("");

  const courseQuery = useQuery({
    queryKey: ["education", "course", courseId],
    queryFn: () => getCourse(courseId)
  });

  const instructorId = Number(courseQuery.data?.result?.instructorUserId ?? 0);
  const slotsQuery = useQuery({
    queryKey: ["education", "slots", instructorId],
    queryFn: () => getInstructorSlots(instructorId),
    enabled: instructorId > 0
  });

  const walletQuery = useQuery({
    queryKey: ["finance", "wallet", "me"],
    queryFn: getMyWallet,
    enabled: isAuthenticated
  });

  const walletId = Number(walletQuery.data?.result?.id ?? walletQuery.data?.result?.iD ?? 0);

  const enrollMutation = useMutation({
    mutationFn: () => {
      const price = courseQuery.data?.result?.priceAmount ?? 0;
      return price > 0 ? payCourseFromWallet(courseId, walletId) : enrollCourse(courseId);
    },
    onSuccess: () => {
      setMessage("ثبت‌نام شما ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["education", "course", courseId] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت‌نام ناموفق بود")
  });

  if (courseQuery.isLoading) {
    return (
      <div className="grid min-h-72 place-items-center rounded-lg border border-border bg-white">
        <Loader2 className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  const course = courseQuery.data?.result;
  if (!course) {
    return <div className="rounded-lg border border-border bg-white p-8 text-center text-sm text-muted">دوره پیدا نشد.</div>;
  }

  const slots = slotsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{course.categoryName ?? "آموزش هوش مصنوعی"}</span>
          <span>•</span>
          <span>{String(course.deliveryMode)}</span>
          <span>•</span>
          <span>{String(course.level)}</span>
        </div>
        <h1 className="mt-4 text-2xl font-black leading-10 md:text-3xl">{course.title}</h1>
        {course.description ? <p className="mt-4 leading-8 text-muted">{course.description}</p> : null}

        <div className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm md:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            {course.lessonsCount} درس
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            {course.durationMinutes ? `${course.durationMinutes} دقیقه` : "مدت آزاد"}
          </span>
          <span className="font-bold">{course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ${course.currency}` : "رایگان"}</span>
        </div>

        <div className="mt-7">
          <h2 className="font-black">سرفصل‌ها</h2>
          <div className="mt-3 grid gap-2">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  {lesson.isPreview ? <PlayCircle className="size-4 text-accent" /> : <Lock className="size-4 text-muted" />}
                  {lesson.title}
                </span>
                <span className="text-xs text-muted">{lesson.durationMinutes ? `${lesson.durationMinutes} دقیقه` : String(lesson.contentType)}</span>
              </div>
            ))}
            {!course.lessons.length ? <div className="rounded-md border border-border p-4 text-sm text-muted">هنوز درسی برای این دوره ثبت نشده است.</div> : null}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="text-sm text-muted">مدرس</div>
          <div className="mt-2 font-black">{course.instructorName ?? `مدرس ${course.instructorUserId}`}</div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending || (course.priceAmount > 0 && walletId <= 0)}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {enrollMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {course.priceAmount > 0 ? "خرید با کیف پول" : "ثبت‌نام در دوره"}
            </button>
          ) : (
            <div className="mt-5">
              <AuthTrigger mode="login" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-white">
                ورود برای ثبت‌نام
              </AuthTrigger>
            </div>
          )}
          {message ? <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-muted">{message}</div> : null}
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="font-black">زمان‌های قابل رزرو مدرس</h2>
          <div className="mt-3 grid gap-2">
            {slots.map((slot) => (
              <div key={slot.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="font-bold">{new Date(slot.startsAt).toLocaleString("fa-IR")}</div>
                <div className="mt-1 text-xs text-muted">{slot.priceAmount > 0 ? `${slot.priceAmount.toLocaleString("fa-IR")} ${slot.currency}` : "رایگان"} / {String(slot.mode)}</div>
              </div>
            ))}
            {!slots.length ? <div className="text-sm text-muted">زمان آزادی ثبت نشده است.</div> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
