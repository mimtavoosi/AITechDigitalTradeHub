"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  CalendarClock,
  Check,
  Clock3,
  Compass,
  GraduationCap,
  Layers3,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Users
} from "lucide-react";
import { AppModal } from "@/components/ui/app-modal";
import { cn } from "@/lib/utils";
import { getEducationQuestionnaire, getEducationRecommendations } from "@/features/education/api/education-api";
import type {
  CourseDeliveryMode,
  CourseLevel,
  CourseSummary,
  EducationLearningGoal,
  EducationTargetRole,
  EducationQuestionnaireQuestion,
  EducationRecommendation
} from "@/features/education/types";

type AnswerOption = {
  id: number;
  label: string;
  learningGoal?: EducationLearningGoal | null;
  targetRole?: EducationTargetRole | null;
  level?: CourseLevel | null;
  preferredMode?: CourseDeliveryMode | null;
  weeklyHoursMin?: number | null;
  weeklyHoursMax?: number | null;
  skillTagId?: number | null;
};

type AnswerQuestion = {
  id: number;
  title: string;
  helpText?: string | null;
  isMulti: boolean;
  options: AnswerOption[];
};

const stepIcons = [Target, Compass, Layers3, Clock3, Sparkles, GraduationCap];

export function EducationQuestionnaireClient() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  const questionnaireQuery = useQuery({
    queryKey: ["education", "questionnaire"],
    queryFn: getEducationQuestionnaire,
    enabled: open
  });
  const recommendationMutation = useMutation({ mutationFn: getEducationRecommendations });

  const questions = useMemo<AnswerQuestion[]>(() => {
    const apiQuestions = questionnaireQuery.data?.results ?? [];
    return apiQuestions.length ? apiQuestions.map(normalizeApiQuestion) : fallbackQuestions;
  }, [questionnaireQuery.data]);

  const result = recommendationMutation.data;
  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];
  const isLastStep = stepIndex >= totalSteps - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? [] : [];
  const canProceed = currentQuestion ? currentAnswer.length > 0 : false;
  const answeredCount = questions.filter((question) => (answers[question.id] ?? []).length > 0).length;

  function toggleOption(question: AnswerQuestion, optionId: number) {
    setAnswers((previous) => {
      const current = previous[question.id] ?? [];
      if (question.isMulti) {
        const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
        return { ...previous, [question.id]: next };
      }
      return { ...previous, [question.id]: [optionId] };
    });
  }

  function goNext() {
    if (!canProceed) return;
    if (!isLastStep) {
      setStepIndex((index) => Math.min(totalSteps - 1, index + 1));
      return;
    }
    submit();
  }

  function goBack() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function submit() {
    const selectedIds = Object.values(answers).flat();
    const selectedOptions = questions.flatMap((question) => question.options).filter((option) => selectedIds.includes(option.id));
    recommendationMutation.mutate(buildRecommendationPayload(selectedOptions, selectedIds));
  }

  function resetAll() {
    setAnswers({});
    setStepIndex(0);
    recommendationMutation.reset();
  }

  function closeModal() {
    setOpen(false);
    resetAll();
  }

  const showResult = Boolean(result);
  const showLoadingQuestions = questionnaireQuery.isLoading;
  const showAnalyzing = recommendationMutation.isPending;

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(126,87,245,0.16),transparent_34%),linear-gradient(135deg,#FFFFFF_0%,#F7F4FF_55%,#F2FFFD_100%)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <div className="absolute -left-16 -top-16 size-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-black text-primary">
              <Sparkles className="size-4" />
              مسیر اختصاصی آموزش
            </div>
            <h2 className="mt-4 text-2xl font-black leading-9 md:text-3xl">از کجا شروع کنم؟</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              با پاسخ به چند سوال کوتاه، یک نقشه راه شخصی، مهارت‌های پیشنهادی و دوره‌های نزدیک به هدف شما در همین صفحه نمایش داده می‌شود.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <FeaturePill icon={Timer} label="کمتر از ۲ دقیقه" />
              <FeaturePill icon={ShieldCheck} label="بدون نیاز به ثبت‌نام" />
              <FeaturePill icon={BadgeCheck} label="پیشنهاد فوری و رایگان" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-black text-white shadow-[0_14px_34px_rgba(126,87,245,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Compass className="size-5" />
            دریافت پیشنهاد مسیر
          </button>
        </div>
      </section>

      {open ? (
        <AppModal
          title={showResult ? "مسیر یادگیری پیشنهادی شما" : "پیشنهاد مسیر یادگیری"}
          description={showResult ? undefined : "در هر مرحله یکی از گزینه‌های نزدیک به وضعیت خودتان را انتخاب کنید."}
          onClose={closeModal}
          bodyClassName="bg-background/40"
          className="max-w-3xl"
        >
          {showLoadingQuestions ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted">
              <Loader2 className="size-7 animate-spin text-primary" />
              <span className="text-sm">در حال آمادهسازی سوال‌ها...</span>
            </div>
          ) : null}

          {!showLoadingQuestions && showAnalyzing ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted">
              <Sparkles className="size-8 animate-pulse text-primary" />
              <span className="text-sm font-bold">در حال تحلیل پاسخ‌ها و ساخت مسیر پیشنهادی...</span>
            </div>
          ) : null}

          {!showLoadingQuestions && !showAnalyzing && !showResult ? (
            <QuestionStep
              question={currentQuestion}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              answeredCount={answeredCount}
              selectedIds={currentAnswer}
              onToggle={(optionId) => toggleOption(currentQuestion, optionId)}
              onBack={goBack}
              onNext={goNext}
              canProceed={canProceed}
              isLastStep={isLastStep}
              isError={recommendationMutation.isError}
            />
          ) : null}

          {!showAnalyzing && showResult && result ? <ResultView result={result} onRestart={resetAll} /> : null}
        </AppModal>
      ) : null}
    </>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: typeof Timer; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-foreground/80 shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
      <Icon className="size-3.5 text-primary" />
      {label}
    </span>
  );
}

function QuestionStep({
  question,
  stepIndex,
  totalSteps,
  answeredCount,
  selectedIds,
  onToggle,
  onBack,
  onNext,
  canProceed,
  isLastStep,
  isError
}: {
  question: AnswerQuestion | undefined;
  stepIndex: number;
  totalSteps: number;
  answeredCount: number;
  selectedIds: number[];
  onToggle: (optionId: number) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLastStep: boolean;
  isError: boolean;
}) {
  if (!question) {
    return <div className="py-10 text-center text-sm text-muted">سوالی برای نمایش وجود ندارد.</div>;
  }

  const StepIcon = stepIcons[stepIndex % stepIcons.length];
  const progressPercent = Math.round(((stepIndex + 1) / Math.max(totalSteps, 1)) * 100);

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span>
            سوال {(stepIndex + 1).toLocaleString("fa-IR")} از {totalSteps.toLocaleString("fa-IR")}
          </span>
          <span>{answeredCount.toLocaleString("fa-IR")} پاسخ ثبت‌شده</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <StepIcon className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-black leading-8">{question.title}</h3>
            {question.helpText ? <p className="mt-1 text-xs leading-6 text-muted">{question.helpText}</p> : null}
            {question.isMulti ? <p className="mt-1 text-xs font-bold text-primary">می‌توانید چند گزینه را انتخاب کنید</p> : null}
          </div>
        </div>

        <div className={cn("mt-5 grid gap-3", question.options.length > 2 && "sm:grid-cols-2")}>
          {question.options.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggle(option.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-right text-sm font-bold transition",
                  selected ? "border-primary bg-primary/8 text-primary shadow-[0_8px_20px_rgba(126,87,245,0.14)]" : "border-border bg-background/60 text-foreground hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <span>{option.label}</span>
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-primary bg-primary text-white" : "border-border text-transparent")}>
                  <Check className="size-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isError ? <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-bold text-danger">مشکلی در دریافت پیشنهاد رخ داد، دوباره تلاش کنید.</div> : null}

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3 shadow-[0_-10px_28px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          onClick={onBack}
          disabled={stepIndex === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold text-muted transition disabled:opacity-40"
        >
          <ArrowRight className="size-4" />
          قبلی
        </button>
        <div className="hidden items-center gap-1.5 sm:flex">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span key={index} className={cn("size-1.5 rounded-full transition", index === stepIndex ? "w-5 bg-primary" : "bg-border")} />
          ))}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-white transition disabled:opacity-40"
        >
          {isLastStep ? "دریافت پیشنهاد" : "بعدی"}
          <ArrowLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ResultView({ result, onRestart }: { result: EducationRecommendation; onRestart: () => void }) {
  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-primary/20 bg-[linear-gradient(135deg,#F7F4FF_0%,#FFFFFF_60%)] p-5">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <span className="text-xs font-black">مسیر پیشنهادی شما آماده شد</span>
        </div>
        <h3 className="mt-2 text-xl font-black leading-8">{result.roadmapTitle}</h3>
        <p className="mt-2 text-sm leading-7 text-muted">{result.roadmapSummary}</p>
      </div>

      {result.steps.length ? (
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center gap-2 font-black">
            <BookMarked className="size-5 text-primary" />
            گام‌های پیشنهادی
          </div>
          <ol className="relative mt-4 grid gap-5 border-r-2 border-dashed border-primary/20 pr-5">
            {result.steps.map((step, index) => (
              <li key={step} className="relative">
                <span className="absolute -right-[33px] top-0 grid size-7 place-items-center rounded-full bg-primary text-xs font-black text-white">
                  {(index + 1).toLocaleString("fa-IR")}
                </span>
                <p className="text-sm leading-7">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {result.recommendedCourses.length ? (
        <div>
          <div className="mb-3 flex items-center gap-2 font-black">
            <GraduationCap className="size-5 text-primary" />
            دوره‌های نزدیک به هدف شما
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.recommendedCourses.map((course) => (
              <RecommendedCourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-background/60 p-4 text-center text-sm text-muted">دوره متناسبی برای این مسیر فعلاً منتشر نشده است.</div>
      )}

      {result.recommendedTeacherSlots.length ? (
        <div className="flex items-center gap-3 rounded-lg border border-accent/25 bg-accent/5 p-4 text-sm">
          <Users className="size-5 shrink-0 text-accent" />
          <span>
            {result.recommendedTeacherSlots.length.toLocaleString("fa-IR")} زمان رزرو مدرس متناسب با مسیر شما موجود است؛ از صفحه دوره پیشنهادی می‌توانید کلاس خصوصی رزرو کنید.
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <button type="button" onClick={onRestart} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-bold text-muted transition hover:text-foreground">
          <RotateCcw className="size-4" />
          پاسخ دوباره به سوال‌ها
        </button>
        {result.recommendedCourses[0] ? (
          <Link href={`/courses/${result.recommendedCourses[0].id}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-white transition hover:bg-primary/90">
            شروع با اولین دوره پیشنهادی
            <ArrowLeft className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link href={`/courses/${course.id}`} className="group rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <h4 className="line-clamp-2 text-sm font-black leading-7 group-hover:text-primary">{course.title}</h4>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 font-bold">{formatLevelLabel(course.level)}</span>
        {course.durationMinutes ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            {course.durationMinutes.toLocaleString("fa-IR")} دقیقه
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="font-black text-foreground">{course.priceAmount > 0 ? `${course.priceAmount.toLocaleString("fa-IR")} ریال` : "رایگان"}</span>
        <span className="text-muted">{course.lessonsCount.toLocaleString("fa-IR")} درس</span>
      </div>
    </Link>
  );
}

function formatLevelLabel(level: CourseLevel) {
  const normalized = String(level).toLowerCase();
  if (normalized === "1" || normalized === "beginner") return "مقدماتی";
  if (normalized === "2" || normalized === "intermediate") return "متوسط";
  if (normalized === "3" || normalized === "advanced") return "پیشرفته";
  return "سطح نامشخص";
}

function isMultiChoice(questionType: EducationQuestionnaireQuestion["questionType"]) {
  const normalized = String(questionType).toLowerCase();
  return normalized === "2" || normalized === "multichoice";
}

function normalizeApiQuestion(question: EducationQuestionnaireQuestion): AnswerQuestion {
  return {
    id: Number(question.id),
    title: question.title,
    helpText: question.helpText,
    isMulti: isMultiChoice(question.questionType),
    options: question.options.map((option) => ({
      id: Number(option.id),
      label: option.label,
      learningGoal: option.learningGoal,
      targetRole: option.targetRole,
      level: option.level,
      preferredMode: option.preferredMode,
      weeklyHoursMin: option.weeklyHoursMin,
      weeklyHoursMax: option.weeklyHoursMax,
      skillTagId: option.skillTagId != null ? Number(option.skillTagId) : null
    }))
  };
}

function buildRecommendationPayload(selectedOptions: AnswerOption[], selectedOptionIds: number[]) {
  const goalOption = selectedOptions.find((option) => option.learningGoal != null);
  const roleOption = selectedOptions.find((option) => option.targetRole != null);
  const levelOption = selectedOptions.find((option) => option.level != null);
  const modeOption = selectedOptions.find((option) => option.preferredMode != null);
  const timeOption = selectedOptions.find((option) => option.weeklyHoursMin != null || option.weeklyHoursMax != null);
  const skillTagIds = selectedOptions.map((option) => Number(option.skillTagId || 0)).filter((value) => value > 0);

  return {
    goal: selectedOptions.map((option) => option.label).join("، ") || "شروع یادگیری هوش مصنوعی",
    learningGoal: goalOption?.learningGoal ?? null,
    targetRole: roleOption?.targetRole ?? null,
    level: normalizeLevel(levelOption?.level) ?? "Beginner",
    weeklyHours: Number(timeOption?.weeklyHoursMax ?? timeOption?.weeklyHoursMin ?? 4),
    preferredMode: normalizeMode(modeOption?.preferredMode) ?? "Recorded",
    skillTagIds,
    selectedOptionIds
  };
}

function normalizeLevel(level: CourseLevel | null | undefined): "Beginner" | "Intermediate" | "Advanced" | undefined {
  const normalized = String(level ?? "").toLowerCase();
  if (normalized === "1" || normalized === "beginner") return "Beginner";
  if (normalized === "2" || normalized === "intermediate") return "Intermediate";
  if (normalized === "3" || normalized === "advanced") return "Advanced";
  return undefined;
}

function normalizeMode(mode: CourseDeliveryMode | null | undefined): "Recorded" | "LiveOnline" | "InPerson" | "Hybrid" | undefined {
  const normalized = String(mode ?? "").toLowerCase();
  if (normalized === "1" || normalized === "recorded") return "Recorded";
  if (normalized === "2" || normalized === "liveonline") return "LiveOnline";
  if (normalized === "3" || normalized === "inperson") return "InPerson";
  if (normalized === "4" || normalized === "hybrid") return "Hybrid";
  return undefined;
}

const fallbackQuestions: AnswerQuestion[] = [
  {
    id: 1001,
    title: "هدف شما از یادگیری هوش مصنوعی چیست؟",
    helpText: "این مهم‌ترین عامل برای انتخاب مسیر مناسب شماست.",
    isMulti: false,
    options: [
      { id: 100101, label: "شروع مسیر شغلی در AI", learningGoal: "CareerStart" },
      { id: 100102, label: "ساخت پروژه و نمونه‌کار شخصی", learningGoal: "BuildProject" },
      { id: 100103, label: "ارتقای مهارت شغلی فعلی", learningGoal: "Upskill" },
      { id: 100104, label: "تحقیق و پژوهش دانشگاهی", learningGoal: "Research" }
    ]
  },
  {
    id: 1002,
    title: "به کدام نقش در حوزه AI علاقه دارید؟",
    isMulti: false,
    options: [
      { id: 100201, label: "توسعه‌دهنده هوش مصنوعی", targetRole: "AiDeveloper" },
      { id: 100202, label: "تحلیل‌گر داده", targetRole: "DataAnalyst" },
      { id: 100203, label: "مهندس یادگیری ماشین", targetRole: "MlEngineer" },
      { id: 100204, label: "مدیر محصول هوشمند", targetRole: "ProductManager" }
    ]
  },
  {
    id: 1003,
    title: "سطح فعلی دانش شما چقدر است؟",
    isMulti: false,
    options: [
      { id: 100301, label: "مقدماتی، تازه شروع کرده‌ام", level: "Beginner" },
      { id: 100302, label: "متوسط، پایه‌ها را می‌دانم", level: "Intermediate" },
      { id: 100303, label: "پیشرفته، دنبال تخصصی‌ترها هستم", level: "Advanced" }
    ]
  },
  {
    id: 1004,
    title: "فرمت یادگیری مطلوب شما چیست؟",
    isMulti: false,
    options: [
      { id: 100401, label: "ویدیوی ضبط‌شده با ریتم خودم", preferredMode: "Recorded" },
      { id: 100402, label: "کلاس آنلاین زنده", preferredMode: "LiveOnline" },
      { id: 100403, label: "ترکیبی همراه با منتورینگ", preferredMode: "Hybrid" }
    ]
  },
  {
    id: 1005,
    title: "چقدر زمان در هفته برای یادگیری دارید؟",
    isMulti: false,
    options: [
      { id: 100501, label: "کمتر از ۳ ساعت", weeklyHoursMin: 1, weeklyHoursMax: 3 },
      { id: 100502, label: "بین ۳ تا ۶ ساعت", weeklyHoursMin: 3, weeklyHoursMax: 6 },
      { id: 100503, label: "بیشتر از ۶ ساعت", weeklyHoursMin: 6, weeklyHoursMax: 12 }
    ]
  }
];
