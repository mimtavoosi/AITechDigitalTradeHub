"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarClock, Check, Loader2, Lock, PlayCircle, Star, Unlock, WalletCards } from "lucide-react";
import { bookTeacherSlot, createEducationReview, enrollCourse, getCourse, getCourseAccess, getInstructorSlots, getReviewAggregate } from "@/features/education/api/education-api";
import { getMyWallet, payCourseFromWallet, payTeacherBookingFromWallet } from "@/features/finance/api/finance-api";
import { AuthTrigger } from "@/features/auth/components/auth-trigger";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";

export function CourseDetailClient({ courseId }: { courseId: number }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const [message, setMessage] = useState("");
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);

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

  const accessQuery = useQuery({
    queryKey: ["education", "course", courseId, "access"],
    queryFn: () => getCourseAccess(courseId),
    enabled: isAuthenticated
  });

  const reviewAggregateQuery = useQuery({
    queryKey: ["reviews", "Course", courseId],
    queryFn: () => getReviewAggregate("Course", courseId)
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

  const bookingMutation = useMutation({
    mutationFn: (slotId: number) => bookTeacherSlot(slotId, { subject: bookingSubject, studentNotes: bookingNote }),
    onSuccess: (result) => {
      const bookingId = Number(result.id ?? 0);
      setPendingBookingId(bookingId || null);
      setMessage("رزرو کلاس ثبت شد. اگر جلسه پولی است، پرداخت را تکمیل کنید.");
      setBookingSubject("");
      setBookingNote("");
      void queryClient.invalidateQueries({ queryKey: ["education", "slots", instructorId] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "رزرو کلاس ناموفق بود")
  });

  const payBookingMutation = useMutation({
    mutationFn: (bookingId: number) => payTeacherBookingFromWallet(bookingId, walletId),
    onSuccess: () => {
      setPendingBookingId(null);
      setMessage("پرداخت رزرو کلاس انجام شد.");
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "پرداخت رزرو ناموفق بود")
  });

  const reviewMutation = useMutation({
    mutationFn: (form: FormData) => {
      const access = accessQuery.data?.result;
      return createEducationReview({
        targetType: "Course",
        targetId: courseId,
        contextType: "Course",
        contextId: Number(access?.enrollmentId ?? 0),
        rating: Number(form.get("rating") || 5),
        comment: String(form.get("comment") || "")
      });
    },
    onSuccess: () => {
      setMessage("امتیاز شما ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["reviews", "Course", courseId] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت امتیاز ناموفق بود")
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
  const access = accessQuery.data?.result;
  const reviewAggregate = reviewAggregateQuery.data?.result;

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
        {reviewAggregate ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            <Star className="size-4 fill-current" />
            امتیاز {Number(reviewAggregate.averageRating || 0).toLocaleString("fa-IR")} از {Number(reviewAggregate.reviewsCount || 0).toLocaleString("fa-IR")} نظر
          </div>
        ) : null}

        <div className="mt-7">
          <h2 className="font-black">سرفصل‌ها</h2>
          <div className="mt-3 grid gap-2">
            {course.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  {lesson.isPreview ? <PlayCircle className="size-4 text-accent" /> : access?.canAccessPaidLessons ? <Unlock className="size-4 text-primary" /> : <Lock className="size-4 text-muted" />}
                  {lesson.title}
                </span>
                <span className="text-xs text-muted">{lesson.durationMinutes ? `${lesson.durationMinutes} دقیقه` : String(lesson.contentType)}</span>
                {lesson.externalUrl && (lesson.isPreview || access?.canAccessPaidLessons) ? (
                  <a className="text-xs font-bold text-primary" href={lesson.externalUrl} target="_blank" rel="noreferrer">مشاهده</a>
                ) : null}
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

        {access?.canDownloadCertificate && access.enrollmentId ? (
          <form
            className="rounded-lg border border-border bg-white p-5"
            onSubmit={(event) => {
              event.preventDefault();
              reviewMutation.mutate(new FormData(event.currentTarget));
            }}
          >
            <h2 className="font-black">امتیازدهی به دوره</h2>
            <select className="mt-3 h-10 w-full rounded-md border border-border px-3 text-sm focus-ring" name="rating" defaultValue="5">
              <option value="5">۵ ستاره</option>
              <option value="4">۴ ستاره</option>
              <option value="3">۳ ستاره</option>
              <option value="2">۲ ستاره</option>
              <option value="1">۱ ستاره</option>
            </select>
            <textarea className="mt-2 min-h-20 w-full rounded-md border border-border px-3 py-2 text-sm focus-ring" name="comment" placeholder="تجربه شما از این دوره" />
            <button className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Star className="size-4" />}
              ثبت امتیاز
            </button>
          </form>
        ) : null}

        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="font-black">زمان‌های قابل رزرو مدرس</h2>
          {isAuthenticated ? (
            <div className="mt-3 grid gap-2">
              <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" value={bookingSubject} onChange={(event) => setBookingSubject(event.target.value)} placeholder="موضوع کلاس یا سوال اصلی" />
              <textarea className="min-h-20 rounded-md border border-border px-3 py-2 text-sm focus-ring" value={bookingNote} onChange={(event) => setBookingNote(event.target.value)} placeholder="توضیح کوتاه برای مدرس" />
            </div>
          ) : null}
          <div className="mt-3 grid gap-2">
            {slots.map((slot) => (
              <div key={slot.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="font-bold">{new Date(slot.startsAt).toLocaleString("fa-IR")}</div>
                <div className="mt-1 text-xs text-muted">{slot.priceAmount > 0 ? `${slot.priceAmount.toLocaleString("fa-IR")} ${slot.currency}` : "رایگان"} / {String(slot.mode)}</div>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => bookingMutation.mutate(Number(slot.id))}
                    disabled={bookingMutation.isPending}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-60"
                  >
                    {bookingMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
                    رزرو این کلاس
                  </button>
                ) : null}
              </div>
            ))}
            {!slots.length ? <div className="text-sm text-muted">زمان آزادی ثبت نشده است.</div> : null}
          </div>
          {pendingBookingId ? (
            <button
              type="button"
              onClick={() => payBookingMutation.mutate(pendingBookingId)}
              disabled={payBookingMutation.isPending || walletId <= 0}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-3 text-xs font-bold text-white disabled:opacity-60"
            >
              {payBookingMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <WalletCards className="size-4" />}
              پرداخت رزرو با کیف پول
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
