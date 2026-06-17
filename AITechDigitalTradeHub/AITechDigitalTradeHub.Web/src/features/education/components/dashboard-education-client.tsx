"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookPlus, Loader2, Plus, Send } from "lucide-react";
import { createCourse, createCourseLesson, createTeacherSlot, getMyCourses, getMyEnrollments, publishCourse } from "@/features/education/api/education-api";
import { ApiRequestError } from "@/lib/api/http-client";

export function DashboardEducationClient() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const coursesQuery = useQuery({ queryKey: ["education", "courses", "mine"], queryFn: getMyCourses });
  const enrollmentsQuery = useQuery({ queryKey: ["education", "enrollments", "mine"], queryFn: getMyEnrollments });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      setMessage("دوره ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["education", "courses", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت دوره ناموفق بود")
  });

  const publishMutation = useMutation({
    mutationFn: publishCourse,
    onSuccess: () => {
      setMessage("دوره منتشر شد.");
      void queryClient.invalidateQueries({ queryKey: ["education", "courses", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "انتشار دوره ناموفق بود")
  });

  const lessonMutation = useMutation({
    mutationFn: (courseId: number) =>
      createCourseLesson(courseId, {
        title: "جلسه مقدماتی",
        contentType: "Video",
        sortOrder: 1,
        isPreview: true
      }),
    onSuccess: () => {
      setMessage("درس نمونه اضافه شد.");
      void queryClient.invalidateQueries({ queryKey: ["education", "courses", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "افزودن درس ناموفق بود")
  });

  const slotMutation = useMutation({
    mutationFn: createTeacherSlot,
    onSuccess: () => setMessage("زمان آزاد مدرس ثبت شد."),
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت زمان آزاد ناموفق بود")
  });

  function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      categoryId: Number(form.get("categoryId") || 1),
      level: String(form.get("level") || "Beginner") as "Beginner",
      deliveryMode: String(form.get("deliveryMode") || "Recorded") as "Recorded",
      priceAmount: Number(form.get("priceAmount") || 0),
      currency: "IRR",
      durationMinutes: Number(form.get("durationMinutes") || 0) || undefined
    });
    event.currentTarget.reset();
  }

  function handleCreateSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    slotMutation.mutate({
      startsAt: String(form.get("startsAt") || ""),
      endsAt: String(form.get("endsAt") || ""),
      mode: "Online",
      priceAmount: Number(form.get("priceAmount") || 0),
      currency: "IRR",
      notes: String(form.get("notes") || "")
    });
    event.currentTarget.reset();
  }

  const courses = coursesQuery.data?.results ?? [];
  const enrollments = enrollmentsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-lg font-black">ثبت دوره جدید</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreateCourse}>
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="title" placeholder="عنوان دوره" required />
            <textarea className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" name="description" placeholder="توضیح دوره" />
            <div className="grid grid-cols-2 gap-3">
              <input className="h-11 rounded-md border border-border px-3 focus-ring" name="categoryId" type="number" min="1" placeholder="شناسه دسته" required />
              <input className="h-11 rounded-md border border-border px-3 focus-ring" name="durationMinutes" type="number" min="1" placeholder="مدت دقیقه" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="h-11 rounded-md border border-border px-3 focus-ring" name="level">
                <option value="Beginner">مقدماتی</option>
                <option value="Intermediate">متوسط</option>
                <option value="Advanced">پیشرفته</option>
              </select>
              <select className="h-11 rounded-md border border-border px-3 focus-ring" name="deliveryMode">
                <option value="Recorded">ضبط‌شده</option>
                <option value="LiveOnline">آنلاین زنده</option>
                <option value="InPerson">حضوری</option>
                <option value="Hybrid">ترکیبی</option>
              </select>
            </div>
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="priceAmount" type="number" min="0" placeholder="قیمت" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <BookPlus className="size-4" />}
              ثبت دوره
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="text-lg font-black">زمان آزاد مدرس</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreateSlot}>
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="startsAt" type="datetime-local" required />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="endsAt" type="datetime-local" required />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="priceAmount" type="number" min="0" placeholder="قیمت جلسه" />
            <textarea className="min-h-20 rounded-md border border-border px-3 py-2 focus-ring" name="notes" placeholder="یادداشت" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold disabled:opacity-60" disabled={slotMutation.isPending}>
              {slotMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              ثبت زمان
            </button>
          </form>
        </div>

        {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">دوره‌های من</h2>
        {coursesQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 grid gap-3">
          {courses.map((course) => (
            <div key={course.id} className={`rounded-md border p-3 ${selectedCourseId === Number(course.id) ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setSelectedCourseId(Number(course.id))} className="text-right font-bold">
                  {course.title}
                </button>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-muted">{String(course.status)}</span>
                  <button type="button" onClick={() => publishMutation.mutate(Number(course.id))} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold hover:bg-slate-50">
                    <Send className="size-3.5" />
                    انتشار
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                <span>{course.lessonsCount} درس</span>
                <span>{course.enrollmentsCount} دانشجو</span>
              </div>
              <button type="button" onClick={() => lessonMutation.mutate(Number(course.id))} className="mt-3 inline-flex h-8 items-center gap-1 rounded-md bg-accent px-2 text-xs font-bold text-white">
                <Plus className="size-3.5" />
                افزودن درس نمونه
              </button>
            </div>
          ))}
          {!coursesQuery.isLoading && !courses.length ? <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted">هنوز دوره‌ای ثبت نکرده‌اید.</div> : null}
        </div>

        <div className="mt-8 border-t border-border pt-5">
          <h2 className="text-lg font-black">دوره‌های ثبت‌نام‌شده</h2>
          <div className="mt-3 grid gap-2">
            {enrollments.map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="font-bold">{item.courseTitle ?? `دوره ${item.courseId}`}</div>
                <div className="mt-1 text-xs text-muted">{String(item.status)} / پیشرفت {item.progressPercent}%</div>
              </div>
            ))}
            {!enrollments.length ? <div className="text-sm text-muted">ثبت‌نامی وجود ندارد.</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
