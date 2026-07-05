"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BarChart3, BookOpenCheck, BookPlus, CalendarClock, CheckCircle2, Clock3, ExternalLink, GraduationCap, ListChecks, Loader2, Plus, Send, Users, Wallet, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PersianDateTimeInput, persianDateTimeToLocalIso } from "@/components/ui/persian-date-time-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getCategories, getCategoryDescription, getCategoryId, getCategoryName, isProjectCategory } from "@/features/categories/api/categories-api";
import { createCourse, createCourseLesson, createTeacherSlot, getCourse, getCourseCertificate, getCourseStudents, getInstructorBookings, getInstructorRevenue, getLessonProgress, getMyCourses, getMyEnrollments, getMyTeacherBookings, publishCourse, updateLessonProgress, updateTeacherBookingStatus } from "@/features/education/api/education-api";
import type { CourseDetail, CourseStudentEnrollment, CourseSummary, TeacherBooking, TeacherBookingStatus } from "@/features/education/types";
import { ApiRequestError } from "@/lib/api/http-client";
import { hasApprovedRole, roleNames } from "@/lib/auth/access-control";
import { useAuthStore } from "@/store/auth-store";

type EducationTab = "learner" | "instructor";

export function DashboardEducationClient() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canUseInstructorPanel = hasApprovedRole(user, [roleNames.instructor]);
  const [activeTab, setActiveTab] = useState<EducationTab>("learner");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [slotStartsAt, setSlotStartsAt] = useState("");
  const [slotEndsAt, setSlotEndsAt] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const coursesQuery = useQuery({ queryKey: ["education", "courses", "mine"], queryFn: getMyCourses, enabled: canUseInstructorPanel });
  const enrollmentsQuery = useQuery({ queryKey: ["education", "enrollments", "mine"], queryFn: getMyEnrollments });
  const myBookingsQuery = useQuery({ queryKey: ["education", "bookings", "mine"], queryFn: getMyTeacherBookings });
  const instructorBookingsQuery = useQuery({ queryKey: ["education", "bookings", "instructor"], queryFn: getInstructorBookings, enabled: canUseInstructorPanel });
  const revenueQuery = useQuery({ queryKey: ["education", "instructor", "revenue"], queryFn: getInstructorRevenue, enabled: canUseInstructorPanel });
  const categoriesQuery = useQuery({ queryKey: ["categories", "education-form"], queryFn: () => getCategories({ pageSize: 200 }), enabled: canUseInstructorPanel });

  useEffect(() => {
    if (!canUseInstructorPanel && activeTab === "instructor") {
      setActiveTab("learner");
    }
  }, [activeTab, canUseInstructorPanel]);

  const refreshEducation = () => {
    void queryClient.invalidateQueries({ queryKey: ["education"] });
  };

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      setMessage("دوره ثبت شد.");
      setCategoryId("");
      refreshEducation();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت دوره ناموفق بود"))
  });

  const publishMutation = useMutation({
    mutationFn: publishCourse,
    onSuccess: () => {
      setMessage("دوره منتشر شد.");
      refreshEducation();
    },
    onError: (err) => setMessage(getErrorMessage(err, "انتشار دوره ناموفق بود"))
  });

  const lessonMutation = useMutation({
    mutationFn: ({ courseId, form }: { courseId: number; form: FormData }) =>
      createCourseLesson(courseId, {
        title: String(form.get("title") || ""),
        description: String(form.get("description") || ""),
        contentType: String(form.get("contentType") || "Video") as "Video" | "Text" | "File" | "LiveSession" | "Quiz",
        sortOrder: Number(form.get("sortOrder") || 1),
        durationMinutes: Number(form.get("durationMinutes") || 0) || undefined,
        externalUrl: String(form.get("externalUrl") || "") || undefined,
        isPreview: form.get("isPreview") === "on"
      }),
    onSuccess: () => {
      setMessage("درس به دوره اضافه شد.");
      refreshEducation();
    },
    onError: (err) => setMessage(getErrorMessage(err, "افزودن درس ناموفق بود"))
  });

  const slotMutation = useMutation({
    mutationFn: createTeacherSlot,
    onSuccess: () => {
      setMessage("زمان آزاد مدرس ثبت شد.");
      refreshEducation();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت زمان آزاد ناموفق بود"))
  });

  const bookingStatusMutation = useMutation({
    mutationFn: ({ bookingId, status, meetingUrl }: { bookingId: number; status: TeacherBookingStatus; meetingUrl?: string }) => updateTeacherBookingStatus(bookingId, { status, meetingUrl }),
    onSuccess: () => {
      setMessage("وضعیت رزرو به‌روزرسانی شد.");
      refreshEducation();
    },
    onError: (err) => setMessage(getErrorMessage(err, "به‌روزرسانی رزرو ناموفق بود"))
  });

  const certificateMutation = useMutation({
    mutationFn: getCourseCertificate,
    onSuccess: (data) => {
      const certificate = data.result;
      setMessage(certificate ? `گواهی ${certificate.certificateNumber} برای ${certificate.courseTitle} آماده است.` : "گواهی در دسترس نیست.");
    },
    onError: (err) => setMessage(getErrorMessage(err, "دریافت گواهی ناموفق بود"))
  });

  function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!categoryId) {
      setMessage("دسته دوره را انتخاب کنید.");
      return;
    }
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      categoryId: Number(categoryId),
      level: String(form.get("level") || "Beginner") as "Beginner" | "Intermediate" | "Advanced",
      deliveryMode: String(form.get("deliveryMode") || "Recorded") as "Recorded" | "LiveOnline" | "InPerson" | "Hybrid",
      priceAmount: Number(form.get("priceAmount") || 0),
      currency: "IRR",
      durationMinutes: Number(form.get("durationMinutes") || 0) || undefined
    });
    event.currentTarget.reset();
  }

  function handleCreateSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const startsAt = persianDateTimeToLocalIso(slotStartsAt);
    const endsAt = persianDateTimeToLocalIso(slotEndsAt);
    if (!startsAt || !endsAt) {
      setMessage("تاریخ شروع و پایان را به‌صورت شمسی وارد کنید.");
      return;
    }

    const form = new FormData(event.currentTarget);
    slotMutation.mutate({
      startsAt,
      endsAt,
      mode: String(form.get("mode") || "Online") as "Online" | "InPerson" | "Hybrid",
      priceAmount: Number(form.get("priceAmount") || 0),
      currency: "IRR",
      locationTitle: String(form.get("locationTitle") || "") || undefined,
      notes: String(form.get("notes") || "")
    });
    setSlotStartsAt("");
    setSlotEndsAt("");
    event.currentTarget.reset();
  }

  const courses = coursesQuery.data?.results ?? [];
  const enrollments = enrollmentsQuery.data?.results ?? [];
  const myBookings = myBookingsQuery.data?.results ?? [];
  const instructorBookings = instructorBookingsQuery.data?.results ?? [];
  const revenue = revenueQuery.data?.result;
  const selectedCourse = courses.find((item) => Number(item.id) === selectedCourseId) ?? courses[0];
  const selectedCourseNumericId = selectedCourse ? Number(selectedCourse.id) : 0;
  const selectedCourseDetailQuery = useQuery({
    queryKey: ["education", "course", selectedCourseNumericId],
    queryFn: () => getCourse(selectedCourseNumericId),
    enabled: canUseInstructorPanel && activeTab === "instructor" && selectedCourseNumericId > 0
  });
  const courseStudentsQuery = useQuery({
    queryKey: ["education", "course", selectedCourseNumericId, "students"],
    queryFn: () => getCourseStudents(selectedCourseNumericId),
    enabled: canUseInstructorPanel && activeTab === "instructor" && selectedCourseNumericId > 0
  });
  const categoryItems = categoriesQuery.data?.results ?? [];
  const categoryOptions = categoryItems
    .filter((item) => !isProjectCategory(item))
    .concat(categoryItems.filter(isProjectCategory))
    .map((item) => ({ value: getCategoryId(item), label: getCategoryName(item), description: getCategoryDescription(item) }))
    .filter((item) => item.value > 0);
  const stats = getEducationStats(courses, enrollments, myBookings, instructorBookings);
  const selectedCourseDetail = selectedCourseDetailQuery.data?.result ?? undefined;
  const selectedCourseStudents = courseStudentsQuery.data?.results ?? [];

  return (
    <div className="grid gap-5">
      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">میز کار آموزش</h2>
            <p className="mt-2 text-sm leading-7 text-muted">ثبت‌نام‌ها، کلاس‌های رزروشده و ابزارهای مدرس در دو مسیر جدا مدیریت می‌شوند.</p>
          </div>
          <BarChart3 className="size-6 text-primary" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <EducationMetric label="دوره‌های ثبت‌نامی" value={stats.enrollments} />
          <EducationMetric label="رزروهای من" value={myBookings.length} />
          {canUseInstructorPanel ? <EducationMetric label="دوره‌های مدرس" value={stats.courses} /> : null}
          {canUseInstructorPanel ? <EducationMetric label="رزروهای دریافتی" value={instructorBookings.length} /> : null}
        </div>
        {canUseInstructorPanel && revenue ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <EducationMoneyMetric label="درآمد دوره‌ها" value={revenue.courseRevenue} currency={revenue.currency} />
            <EducationMoneyMetric label="درآمد کلاس خصوصی" value={revenue.bookingRevenue} currency={revenue.currency} />
            <EducationMoneyMetric label="کل درآمد آموزش" value={revenue.totalRevenue} currency={revenue.currency} />
          </div>
        ) : null}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <MiniBar label="میانگین پیشرفت" value={stats.progressAverage} />
          {canUseInstructorPanel ? <MiniBar label="انتشار دوره" value={stats.publishedPercent} /> : null}
          {canUseInstructorPanel ? <MiniBar label="رزروهای تاییدشده" value={stats.confirmedBookingPercent} /> : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 rounded-lg border border-border/70 bg-white/70 p-2">
          <TabButton active={activeTab === "learner"} icon={BookOpenCheck} label="یادگیرنده" onClick={() => setActiveTab("learner")} />
          {canUseInstructorPanel ? <TabButton active={activeTab === "instructor"} icon={GraduationCap} label="مدرس" onClick={() => setActiveTab("instructor")} /> : null}
        </div>
      </section>

      {message ? <div className="rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{message}</div> : null}

      {activeTab === "learner" ? (
        <section className="grid gap-5 lg:grid-cols-2">
          <EnrollmentPanel enrollments={enrollments} loading={enrollmentsQuery.isLoading} pending={certificateMutation.isPending} onCertificate={(enrollmentId) => certificateMutation.mutate(enrollmentId)} />
          <BookingsPanel title="رزروهای کلاس من" items={myBookings} loading={myBookingsQuery.isLoading} emptyText="رزروی برای شما ثبت نشده است." />
        </section>
      ) : null}

      {activeTab === "instructor" && canUseInstructorPanel ? (
        <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="space-y-5">
            <div className="dashboard-card p-5">
              <h2 className="text-lg font-black">ثبت دوره جدید</h2>
              <form className="mt-4 grid gap-3" onSubmit={handleCreateCourse}>
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="title" placeholder="عنوان دوره" required />
                <textarea className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" name="description" placeholder="توضیح دوره، خروجی یادگیری و مخاطب هدف" />
                <SearchableSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder={categoriesQuery.isLoading ? "در حال خواندن دسته‌ها" : "دسته دوره"} clearable={false} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="h-11 rounded-md border border-border px-3 focus-ring" name="durationMinutes" type="number" min="1" placeholder="مدت دقیقه" />
                  <input className="h-11 rounded-md border border-border px-3 focus-ring" name="priceAmount" type="number" min="0" placeholder="قیمت" />
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
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <BookPlus className="size-4" />}
                  ثبت دوره
                </button>
              </form>
            </div>

            <div className="dashboard-card p-5">
              <h2 className="text-lg font-black">زمان آزاد مدرس</h2>
              <form className="mt-4 grid gap-3" onSubmit={handleCreateSlot}>
                <PersianDateTimeInput label="شروع" value={slotStartsAt} onChange={setSlotStartsAt} includeTime />
                <PersianDateTimeInput label="پایان" value={slotEndsAt} onChange={setSlotEndsAt} includeTime />
                <select className="h-11 rounded-md border border-border px-3 focus-ring" name="mode">
                  <option value="Online">آنلاین</option>
                  <option value="InPerson">حضوری</option>
                  <option value="Hybrid">ترکیبی</option>
                </select>
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="priceAmount" type="number" min="0" placeholder="قیمت جلسه" />
                <input className="h-11 rounded-md border border-border px-3 focus-ring" name="locationTitle" placeholder="لینک/محل برگزاری" />
                <textarea className="min-h-20 rounded-md border border-border px-3 py-2 focus-ring" name="notes" placeholder="یادداشت" />
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold disabled:opacity-60" disabled={slotMutation.isPending}>
                  {slotMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  ثبت زمان
                </button>
              </form>
            </div>
          </section>

          <section className="grid gap-5">
            <div className="dashboard-card p-5">
              <h2 className="text-lg font-black">دوره‌های مدرس</h2>
              {coursesQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
              <div className="mt-4 grid gap-3">
                {courses.map((course) => (
                  <CourseRow key={course.id} course={course} selected={Number(course.id) === Number(selectedCourse?.id)} onSelect={() => setSelectedCourseId(Number(course.id))} onPublish={() => publishMutation.mutate(Number(course.id))} publishing={publishMutation.isPending} />
                ))}
                {!coursesQuery.isLoading && !courses.length ? <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted">هنوز دوره‌ای ثبت نکرده‌اید.</div> : null}
              </div>
            </div>

            {selectedCourse ? (
              <InstructorCourseWorkspace
                course={selectedCourse}
                detail={selectedCourseDetail}
                students={selectedCourseStudents}
                loadingDetail={selectedCourseDetailQuery.isLoading}
                loadingStudents={courseStudentsQuery.isLoading}
                lessonPending={lessonMutation.isPending}
                onAddLesson={(courseId, form) => lessonMutation.mutate({ courseId, form })}
              />
            ) : null}

            <BookingsPanel
              title="رزروهای دریافتی مدرس"
              items={instructorBookings}
              loading={instructorBookingsQuery.isLoading}
              emptyText="هنوز کسی زمان‌های شما را رزرو نکرده است."
              manage
              pending={bookingStatusMutation.isPending}
              onStatus={(bookingId, status, meetingUrl) => bookingStatusMutation.mutate({ bookingId, status, meetingUrl })}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function InstructorCourseWorkspace({
  course,
  detail,
  students,
  loadingDetail,
  loadingStudents,
  lessonPending,
  onAddLesson
}: {
  course: CourseSummary;
  detail?: CourseDetail;
  students: CourseStudentEnrollment[];
  loadingDetail: boolean;
  loadingStudents: boolean;
  lessonPending: boolean;
  onAddLesson: (courseId: number, form: FormData) => void;
}) {
  const lessons = detail?.lessons ?? [];
  const completedStudents = students.filter((item) => Number(item.progressPercent) >= 100 || item.completedAt).length;
  const averageProgress = students.length ? students.reduce((sum, item) => sum + Number(item.progressPercent || 0), 0) / students.length : 0;
  const publicHref = `/courses/${course.slug || course.id}`;

  return (
    <div className="grid gap-5">
      <div className="dashboard-card overflow-hidden">
        <div className="border-b border-border/70 bg-gradient-to-l from-primary/10 via-white to-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-primary">دوره انتخاب‌شده</div>
              <h2 className="mt-2 text-xl font-black">{course.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full bg-white px-3 py-1">{getCourseStatusLabel(course.status)}</span>
                <span className="rounded-full bg-white px-3 py-1">{getDeliveryModeLabel(course.deliveryMode)}</span>
                <span className="rounded-full bg-white px-3 py-1">{getCourseLevelLabel(course.level)}</span>
                {course.categoryName ? <span className="rounded-full bg-white px-3 py-1">{course.categoryName}</span> : null}
              </div>
            </div>
            <a href={publicHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-bold hover:bg-background">
              <ExternalLink className="size-4" />
              مشاهده عمومی
            </a>
          </div>
          {course.description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{course.description}</p> : null}
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-4">
          <EducationMetric label="دانش‌آموز" value={students.length || Number(course.enrollmentsCount || 0)} />
          <EducationMetric label="درس" value={lessons.length || Number(course.lessonsCount || 0)} />
          <EducationMetric label="تکمیل‌شده" value={completedStudents} />
          <EducationMoneyMetric label="قیمت دوره" value={Number(course.priceAmount || 0)} currency={course.currency} />
        </div>
        <div className="px-5 pb-5">
          <MiniBar label="میانگین پیشرفت دانش‌آموزها" value={averageProgress} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <CourseStudentsPanel students={students} loading={loadingStudents} lessonsCount={lessons.length || Number(course.lessonsCount || 0)} />
        <CourseLessonsPanel lessons={lessons} loading={loadingDetail} />
      </div>

      <div className="dashboard-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">افزودن درس</h2>
          <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{course.title}</span>
        </div>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onAddLesson(Number(course.id), new FormData(event.currentTarget));
            event.currentTarget.reset();
          }}
        >
          <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" name="title" placeholder="عنوان درس" required />
          <select className="h-10 rounded-md border border-border px-3 text-sm focus-ring" name="contentType">
            <option value="Video">ویدئو</option>
            <option value="Text">متن</option>
            <option value="File">فایل</option>
            <option value="LiveSession">جلسه زنده</option>
            <option value="Quiz">آزمون</option>
          </select>
          <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" name="sortOrder" type="number" min="1" placeholder="ترتیب نمایش" />
          <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" name="durationMinutes" type="number" min="1" placeholder="مدت دقیقه" />
          <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring md:col-span-2" name="externalUrl" placeholder="لینک ویدئو، فایل یا جلسه" />
          <textarea className="min-h-20 rounded-md border border-border px-3 py-2 text-sm focus-ring md:col-span-2" name="description" placeholder="توضیح درس" />
          <label className="inline-flex items-center gap-2 text-sm text-muted">
            <input name="isPreview" type="checkbox" />
            پیش‌نمایش رایگان
          </label>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-bold text-white disabled:opacity-60" disabled={lessonPending}>
            {lessonPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            ثبت درس
          </button>
        </form>
      </div>
    </div>
  );
}

function CourseStudentsPanel({ students, loading, lessonsCount }: { students: CourseStudentEnrollment[]; loading: boolean; lessonsCount: number }) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">دانش‌آموزهای این دوره</h2>
        <Users className="size-5 text-primary" />
      </div>
      <div className="mt-4 grid gap-3">
        {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
        {students.map((student) => (
          <div key={student.id} className="rounded-lg border border-border/70 bg-white/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-bold">{student.studentName || student.studentUsername || `کاربر ${student.studentUserId}`}</div>
                <div className="mt-1 text-xs text-muted">
                  {student.studentUsername ? `@${student.studentUsername}` : "نام کاربری ثبت نشده"} {student.enrolledAt ? ` / ثبت‌نام ${new Date(student.enrolledAt).toLocaleDateString("fa-IR")}` : ""}
                </div>
              </div>
              <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{getEnrollmentStatusLabel(student.status)}</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <MiniValue icon={ListChecks} label="پیشرفت" value={`${Number(student.progressPercent || 0).toLocaleString("fa-IR")}%`} />
              <MiniValue icon={Wallet} label="پرداخت" value={formatMoney(student.paidAmount, "IRR")} />
              <MiniValue icon={CheckCircle2} label="درس‌های ثبت‌شده" value={`${student.lessonProgresses?.length ?? 0} از ${lessonsCount}`} />
            </div>
            {student.lessonProgresses?.length ? (
              <div className="mt-3 grid gap-2">
                {student.lessonProgresses.map((progress) => (
                  <div key={progress.id} className="grid gap-2 rounded-md bg-background/75 p-2 text-xs md:grid-cols-[minmax(0,1fr)_80px]">
                    <span className="truncate font-bold">{progress.lessonTitle ?? `درس ${progress.courseLessonId}`}</span>
                    <span className="text-muted">{Number(progress.progressPercent || 0).toLocaleString("fa-IR")}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-md bg-background/75 px-3 py-2 text-xs text-muted">برای این دانش‌آموز هنوز پیشرفت درس ثبت نشده است.</div>
            )}
          </div>
        ))}
        {!loading && !students.length ? <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">هنوز دانش‌آموزی در این دوره ثبت‌نام نکرده است.</div> : null}
      </div>
    </div>
  );
}

function CourseLessonsPanel({ lessons, loading }: { lessons: NonNullable<CourseDetail["lessons"]>; loading: boolean }) {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">درس‌ها و محتوای دوره</h2>
        <BookOpenCheck className="size-5 text-primary" />
      </div>
      <div className="mt-4 grid gap-3">
        {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border border-border/70 bg-white/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{lesson.sortOrder.toLocaleString("fa-IR")}. {lesson.title}</div>
                {lesson.description ? <p className="mt-2 text-xs leading-6 text-muted">{lesson.description}</p> : null}
              </div>
              <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{getLessonContentTypeLabel(lesson.contentType)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
              {lesson.durationMinutes ? <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1"><Clock3 className="size-3.5" /> {lesson.durationMinutes.toLocaleString("fa-IR")} دقیقه</span> : null}
              {lesson.isPreview ? <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">پیش‌نمایش رایگان</span> : null}
              {lesson.externalUrl ? <a href={lesson.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 font-bold text-primary"><ExternalLink className="size-3.5" /> لینک محتوا</a> : null}
            </div>
          </div>
        ))}
        {!loading && !lessons.length ? <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">هنوز درسی برای این دوره ثبت نشده است.</div> : null}
      </div>
    </div>
  );
}

function MiniValue({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/75 p-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-2 text-sm font-black">{value}</div>
    </div>
  );
}

function CourseRow({ course, selected, onSelect, onPublish, publishing }: { course: CourseSummary; selected: boolean; onSelect: () => void; onPublish: () => void; publishing: boolean }) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm transition ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/15" : "border-border/70 bg-white/80 hover:border-primary/40"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onSelect} className="min-w-0 text-right font-bold">
          <span className="block truncate">{course.title}</span>
          <span className="mt-1 block text-xs text-muted">{course.lessonsCount.toLocaleString("fa-IR")} درس / {course.enrollmentsCount.toLocaleString("fa-IR")} دانش‌آموز / {getDeliveryModeLabel(course.deliveryMode)}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{getCourseStatusLabel(course.status)}</span>
          <button type="button" onClick={onPublish} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold hover:bg-slate-50" disabled={publishing}>
            <Send className="size-3.5" />
            انتشار
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold transition ${
        active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-background hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function EnrollmentPanel({ enrollments, loading, pending, onCertificate }: { enrollments: Array<{ id: string | number; courseTitle?: string | null; courseId: string | number; status: string | number; progressPercent: number; completedAt?: string | null }>; loading?: boolean; pending: boolean; onCertificate: (enrollmentId: number) => void }) {
  return (
    <div className="dashboard-card p-5">
      <h2 className="text-lg font-black">دوره‌های ثبت‌نام‌شده</h2>
      <div className="mt-3 grid gap-2">
        {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
        {enrollments.map((item) => (
          <div
            key={item.id}
            className="rounded-md bg-background/75 p-3 text-sm"
          >
            <div className="font-bold">{item.courseTitle ?? `دوره ${item.courseId}`}</div>
            <div className="mt-1 text-xs text-muted">{String(item.status)} / پیشرفت {item.progressPercent}%</div>
            <p className="mt-2 text-xs leading-6 text-muted">درصد کلی فقط از روی درس‌های تکمیل‌شده محاسبه می‌شود.</p>
            {Number(item.progressPercent) >= 100 || item.completedAt ? (
              <button type="button" onClick={() => onCertificate(Number(item.id))} className="mt-2 inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-60" disabled={pending}>
                <Award className="size-3.5" />
                دریافت گواهی
              </button>
            ) : null}
            <LessonProgressEditor enrollmentId={Number(item.id)} courseId={Number(item.courseId)} />
          </div>
        ))}
        {!loading && !enrollments.length ? <div className="text-sm text-muted">ثبت‌نامی وجود ندارد.</div> : null}
      </div>
    </div>
  );
}

function LessonProgressEditor({ enrollmentId, courseId }: { enrollmentId: number; courseId: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const courseQuery = useQuery({ queryKey: ["education", "course", courseId], queryFn: () => getCourse(courseId), enabled: open && courseId > 0 });
  const progressQuery = useQuery({ queryKey: ["education", "lesson-progress", enrollmentId], queryFn: () => getLessonProgress(enrollmentId), enabled: open && enrollmentId > 0 });
  const progressMutation = useMutation({
    mutationFn: ({ lessonId, progressPercent }: { lessonId: number; progressPercent: number }) => updateLessonProgress(enrollmentId, lessonId, progressPercent),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["education", "lesson-progress", enrollmentId] });
      void queryClient.invalidateQueries({ queryKey: ["education", "enrollments", "mine"] });
    }
  });

  const lessons = courseQuery.data?.result?.lessons ?? [];
  const progressItems = progressQuery.data?.results ?? [];

  return (
    <div className="mt-3 rounded-md border border-border bg-white p-2">
      <button type="button" onClick={() => setOpen((value) => !value)} className="text-xs font-bold text-primary">
        {open ? "بستن پیشرفت درس‌ها" : "ثبت پیشرفت درس‌ها"}
      </button>
      {open ? (
        <div className="mt-3 grid gap-2">
          {(courseQuery.isLoading || progressQuery.isLoading) ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
          {lessons.map((lesson) => {
            const progress = progressItems.find((item) => Number(item.courseLessonId) === Number(lesson.id));
            return (
              <form
                key={lesson.id}
                className="grid gap-2 rounded-md bg-background/70 p-2 md:grid-cols-[minmax(0,1fr)_90px_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  progressMutation.mutate({ lessonId: Number(lesson.id), progressPercent: Number(form.get("progressPercent") || 0) });
                }}
              >
                <span className="text-xs font-bold">{lesson.title}</span>
                <input className="h-8 rounded-md border border-border px-2 text-xs focus-ring" name="progressPercent" type="number" min="0" max="100" defaultValue={progress?.progressPercent ?? 0} />
                <button className="h-8 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-60" disabled={progressMutation.isPending}>ذخیره</button>
              </form>
            );
          })}
          {!lessons.length && !courseQuery.isLoading ? <div className="text-xs text-muted">درسی برای این دوره ثبت نشده است.</div> : null}
        </div>
      ) : null}
    </div>
  );
}

function BookingsPanel({ title, items, emptyText, loading = false, manage = false, pending = false, onStatus }: { title: string; items: TeacherBooking[]; emptyText: string; loading?: boolean; manage?: boolean; pending?: boolean; onStatus?: (bookingId: number, status: TeacherBookingStatus, meetingUrl?: string) => void }) {
  return (
    <div className="dashboard-card p-5">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-3 grid gap-2">
        {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
        {items.map((item) => (
          <form
            key={item.id}
            className="rounded-md bg-background/75 p-3 text-sm"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              onStatus?.(Number(item.id), String(form.get("status") || item.status) as TeacherBookingStatus, String(form.get("meetingUrl") || "") || undefined);
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">{item.subject || item.instructorName || item.studentName || "جلسه آموزشی"}</span>
              <span className="rounded-md bg-white px-2 py-1 text-xs text-muted">{getTeacherBookingStatusLabel(item.status)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" /> {new Date(item.startsAt).toLocaleString("fa-IR")}</span>
              <span>{formatMoney(item.priceAmount, item.currency)}</span>
            </div>
            {item.meetingUrl ? <a className="mt-2 block truncate text-xs font-bold text-primary" href={item.meetingUrl} target="_blank" rel="noreferrer">لینک جلسه</a> : null}
            {manage ? (
              <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                <input className="h-8 rounded-md border border-border bg-white px-2 text-xs focus-ring" name="meetingUrl" defaultValue={item.meetingUrl ?? ""} placeholder="لینک جلسه" />
                <button name="status" value="Completed" className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60" disabled={pending}>
                  <CheckCircle2 className="size-3.5" />
                  تکمیل
                </button>
                <button name="status" value="Cancelled" className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-danger/30 bg-white px-3 text-xs font-bold text-danger disabled:opacity-60" disabled={pending}>
                  <XCircle className="size-3.5" />
                  لغو
                </button>
              </div>
            ) : null}
          </form>
        ))}
        {!loading && !items.length ? <div className="text-sm text-muted">{emptyText}</div> : null}
      </div>
    </div>
  );
}

function EducationMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/70 bg-white/80 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black">{value.toLocaleString("fa-IR")}</div>
    </div>
  );
}

function EducationMoneyMetric({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-white/80 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-xl font-black">{Number(value || 0).toLocaleString("fa-IR")}</div>
      <div className="mt-1 text-xs text-muted">{getCurrencyLabel(currency)}</div>
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="rounded-md bg-background/70 p-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold">{label}</span>
        <span className="text-muted">{normalized.toLocaleString("fa-IR")}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

function getEducationStats(courses: CourseSummary[], enrollments: Array<{ progressPercent: number }>, myBookings: unknown[], instructorBookings: Array<{ status: string | number }>) {
  const published = courses.filter((item) => String(item.status) === "Published" || String(item.status) === "3").length;
  const progressAverage = enrollments.length ? enrollments.reduce((sum, item) => sum + Number(item.progressPercent || 0), 0) / enrollments.length : 0;
  const confirmedBookings = instructorBookings.filter((item) => ["Confirmed", "3"].includes(String(item.status))).length;
  const bookingTotal = myBookings.length + instructorBookings.length;
  return {
    courses: courses.length,
    lessons: courses.reduce((sum, item) => sum + Number(item.lessonsCount || 0), 0),
    enrollments: enrollments.length,
    bookings: bookingTotal,
    publishedPercent: courses.length ? (published / courses.length) * 100 : 0,
    progressAverage,
    confirmedBookingPercent: instructorBookings.length ? (confirmedBookings / instructorBookings.length) * 100 : 0
  };
}

function getCourseStatusLabel(status: string | number) {
  const value = String(status);
  if (value === "Draft" || value === "1") return "پیش‌نویس";
  if (value === "PendingReview" || value === "2") return "در انتظار بررسی";
  if (value === "Published" || value === "3") return "منتشرشده";
  if (value === "Archived" || value === "4") return "آرشیوشده";
  return value;
}

function getEnrollmentStatusLabel(status: string | number) {
  const value = String(status);
  if (value === "PendingPayment" || value === "1") return "در انتظار پرداخت";
  if (value === "Active" || value === "2") return "فعال";
  if (value === "Completed" || value === "3") return "تکمیل‌شده";
  if (value === "Cancelled" || value === "4") return "لغوشده";
  if (value === "Refunded" || value === "5") return "بازگشت وجه";
  return value;
}

function getTeacherBookingStatusLabel(status: string | number) {
  const value = String(status);
  if (value === "PendingPayment" || value === "1") return "در انتظار پرداخت";
  if (value === "PendingOrganizationApproval" || value === "2") return "در انتظار تایید";
  if (value === "Confirmed" || value === "3") return "تاییدشده";
  if (value === "Completed" || value === "4") return "تکمیل‌شده";
  if (value === "Cancelled" || value === "5") return "لغوشده";
  if (value === "Rejected" || value === "6") return "ردشده";
  if (value === "Refunded" || value === "7") return "بازگشت وجه";
  return value;
}

function getCourseLevelLabel(level: string | number) {
  const value = String(level);
  if (value === "Beginner" || value === "1") return "مقدماتی";
  if (value === "Intermediate" || value === "2") return "متوسط";
  if (value === "Advanced" || value === "3") return "پیشرفته";
  return value;
}

function getDeliveryModeLabel(mode: string | number) {
  const value = String(mode);
  if (value === "Recorded" || value === "1") return "ضبط‌شده";
  if (value === "LiveOnline" || value === "2") return "آنلاین زنده";
  if (value === "InPerson" || value === "3") return "حضوری";
  if (value === "Hybrid" || value === "4") return "ترکیبی";
  return value;
}

function getLessonContentTypeLabel(type: string | number) {
  const value = String(type);
  if (value === "Video" || value === "1") return "ویدئو";
  if (value === "Text" || value === "2") return "متن";
  if (value === "File" || value === "3") return "فایل";
  if (value === "LiveSession" || value === "4") return "جلسه زنده";
  if (value === "Quiz" || value === "5") return "آزمون";
  return value;
}

function getCurrencyLabel(currency?: string) {
  return currency === "IRR" ? "ریال" : currency || "ریال";
}

function formatMoney(value: number, currency?: string) {
  const amount = Number(value || 0);
  return amount > 0 ? `${amount.toLocaleString("fa-IR")} ${getCurrencyLabel(currency)}` : "رایگان";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}
