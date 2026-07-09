"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Clock3,
  Compass,
  GraduationCap,
  Layers3,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquareText,
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
  EducationLearningGoal,
  EducationTargetRole,
  EducationQuestionnaireQuestion,
  EducationRecommendation,
  EducationRoadmapNode,
  EducationRoadmapNodeCourse
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
  const [freeText, setFreeText] = useState("");

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
  // آخرین مرحله، توضیحات آزاد کاربر است که برای مدل هوش مصنوعی ارسال می‌شود.
  const totalSteps = questions.length + 1;
  const isFreeTextStep = stepIndex >= questions.length;
  const currentQuestion = isFreeTextStep ? undefined : questions[stepIndex];
  const isLastStep = stepIndex >= totalSteps - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? [] : [];
  const canProceed = isFreeTextStep ? true : currentAnswer.length > 0;
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
    recommendationMutation.mutate(buildRecommendationPayload(selectedOptions, selectedIds, freeText));
  }

  function resetAll() {
    setAnswers({});
    setFreeText("");
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
  const submitError = recommendationMutation.error as Error | null;

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(126,87,245,0.16),transparent_34%),linear-gradient(135deg,#FFFFFF_0%,#F7F4FF_55%,#F2FFFD_100%)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <div className="absolute -left-16 -top-16 size-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-black text-primary">
              <Sparkles className="size-4" />
              مسیر اختصاصی آموزش با هوش مصنوعی
            </div>
            <h2 className="mt-4 text-2xl font-black leading-9 md:text-3xl">از کجا شروع کنم؟</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              با پاسخ به چند سوال کوتاه، هوش مصنوعی آکادمی یک نقشه راه مرحله‌به‌مرحله بر اساس سرفصل دوره‌های سایت برای شما می‌سازد.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <FeaturePill icon={Timer} label="کمتر از ۲ دقیقه" />
              <FeaturePill icon={ShieldCheck} label="بدون نیاز به ثبت‌نام" />
              <FeaturePill icon={BadgeCheck} label="تحلیل هوشمند سرفصل‌ها" />
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
          title={showResult ? "نقشه راه یادگیری شما" : "پیشنهاد مسیر یادگیری"}
          description={showResult ? undefined : "در هر مرحله یکی از گزینه‌های نزدیک به وضعیت خودتان را انتخاب کنید."}
          onClose={closeModal}
          bodyClassName="bg-background/40"
          className={showResult ? "max-w-5xl" : "max-w-3xl"}
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
              <span className="text-sm font-bold">هوش مصنوعی در حال تحلیل پاسخ‌ها و سرفصل دوره‌هاست...</span>
              <span className="text-xs">این مرحله ممکن است تا یک دقیقه طول بکشد.</span>
            </div>
          ) : null}

          {!showLoadingQuestions && !showAnalyzing && !showResult ? (
            isFreeTextStep ? (
              <FreeTextStep
                value={freeText}
                onChange={setFreeText}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                onBack={goBack}
                onSubmit={goNext}
                errorMessage={submitError?.message ?? null}
              />
            ) : (
              <QuestionStep
                question={currentQuestion}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                answeredCount={answeredCount}
                selectedIds={currentAnswer}
                onToggle={(optionId) => currentQuestion && toggleOption(currentQuestion, optionId)}
                onBack={goBack}
                onNext={goNext}
                canProceed={canProceed}
              />
            )
          ) : null}

          {!showAnalyzing && showResult && result ? <RoadmapResultView result={result} onRestart={resetAll} /> : null}
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

function StepProgress({ stepIndex, totalSteps, answeredCount }: { stepIndex: number; totalSteps: number; answeredCount?: number }) {
  const progressPercent = Math.round(((stepIndex + 1) / Math.max(totalSteps, 1)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-muted">
        <span>
          مرحله {(stepIndex + 1).toLocaleString("fa-IR")} از {totalSteps.toLocaleString("fa-IR")}
        </span>
        {answeredCount != null ? <span>{answeredCount.toLocaleString("fa-IR")} پاسخ ثبت‌شده</span> : null}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
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
  canProceed
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
}) {
  if (!question) {
    return <div className="py-10 text-center text-sm text-muted">سوالی برای نمایش وجود ندارد.</div>;
  }

  const StepIcon = stepIcons[stepIndex % stepIcons.length];

  return (
    <div className="grid gap-6">
      <StepProgress stepIndex={stepIndex} totalSteps={totalSteps} answeredCount={answeredCount} />

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
          بعدی
          <ArrowLeft className="size-4" />
        </button>
      </div>
    </div>
  );
}

function FreeTextStep({
  value,
  onChange,
  stepIndex,
  totalSteps,
  onBack,
  onSubmit,
  errorMessage
}: {
  value: string;
  onChange: (value: string) => void;
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onSubmit: () => void;
  errorMessage: string | null;
}) {
  return (
    <div className="grid gap-6">
      <StepProgress stepIndex={stepIndex} totalSteps={totalSteps} />

      <div className="rounded-xl border border-border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareText className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-black leading-8">درباره خودتان و هدفتان بیشتر بگویید</h3>
            <p className="mt-1 text-xs leading-6 text-muted">
              اختیاری است، اما هرچه دقیق‌تر بنویسید (سابقه، مهارت‌های فعلی، هدف شغلی یا پروژه‌ای که در ذهن دارید)، نقشه راه دقیق‌تری برای شما ساخته می‌شود.
            </p>
          </div>
        </div>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={1500}
          rows={5}
          placeholder="مثلاً: دانشجوی مهندسی صنایع هستم، با اکسل و کمی پایتون کار کرده‌ام و می‌خواهم در حوزه تحلیل داده شاغل شوم..."
          className="mt-5 w-full resize-y rounded-lg border border-border bg-background/60 p-4 text-sm leading-7 outline-none transition focus:border-primary/60 focus:bg-white"
        />
        <div className="mt-1 text-left text-[11px] text-muted">{value.length.toLocaleString("fa-IR")} / ۱٬۵۰۰</div>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-bold leading-6 text-danger">
          {errorMessage}
          <span className="mt-1 block font-normal text-danger/80">اگر مشکل ادامه داشت، چند دقیقه بعد دوباره تلاش کنید.</span>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3 shadow-[0_-10px_28px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold text-muted transition"
        >
          <ArrowRight className="size-4" />
          قبلی
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-white transition"
        >
          <Sparkles className="size-4" />
          ساخت نقشه راه
        </button>
      </div>
    </div>
  );
}

function RoadmapResultView({ result, onRestart }: { result: EducationRecommendation; onRestart: () => void }) {
  const phases = useMemo(() => groupNodesByPhase(result.nodes), [result.nodes]);

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-primary/20 bg-[linear-gradient(135deg,#F7F4FF_0%,#FFFFFF_60%)] p-5">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" />
          <span className="text-xs font-black">نقشه راه اختصاصی شما آماده شد</span>
        </div>
        <h3 className="mt-2 text-xl font-black leading-8">{result.roadmapTitle}</h3>
        <p className="mt-2 text-sm leading-7 text-muted">{result.roadmapSummary}</p>
        {result.totalEstimatedWeeks > 0 ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-foreground/80">
            <CalendarClock className="size-4 text-primary" />
            مدت تقریبی مسیر: {result.totalEstimatedWeeks.toLocaleString("fa-IR")} هفته
          </div>
        ) : null}
      </div>

      {phases.length ? (
        <div className="relative grid gap-0">
          {phases.map((phase, phaseIndex) => (
            <div key={phase.order} className="relative flex gap-4">
              {/* ستون تایم‌لاین: شماره مرحله و خط اتصال به مرحله بعد */}
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span className="z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white shadow-[0_8px_20px_rgba(126,87,245,0.3)]">
                  {(phaseIndex + 1).toLocaleString("fa-IR")}
                </span>
                {phaseIndex < phases.length - 1 ? <span className="w-0.5 grow border-r-2 border-dashed border-primary/30" /> : null}
              </div>

              <div className={cn("min-w-0 grow pb-6", phase.nodes.length > 1 && "grid gap-4 lg:grid-cols-2")}>
                {phase.nodes.map((node) => (
                  <RoadmapNodeCard key={node.id} node={node} allNodes={result.nodes} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {result.tips.length ? (
        <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
          <div className="flex items-center gap-2 font-black">
            <Lightbulb className="size-5 text-accent" />
            توصیه‌های مسیر
          </div>
          <ul className="mt-3 grid gap-2">
            {result.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm leading-7">
                <Check className="mt-1.5 size-4 shrink-0 text-accent" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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

function RoadmapNodeCard({ node, allNodes }: { node: EducationRoadmapNode; allNodes: EducationRoadmapNode[] }) {
  const dependencyTitles = node.dependsOn
    .map((id) => allNodes.find((item) => item.id === id)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <div className={cn("rounded-xl border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]", node.isOptional ? "border-dashed border-border" : "border-border")}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-black leading-7">{node.title}</h4>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {node.isOptional ? <span className="rounded-full bg-background px-2 py-1 text-[11px] font-bold text-muted">اختیاری</span> : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-black text-primary">
            <CalendarClock className="size-3" />
            {node.estimatedWeeks.toLocaleString("fa-IR")} هفته
          </span>
        </div>
      </div>

      {node.description ? <p className="mt-2 text-sm leading-7 text-muted">{node.description}</p> : null}

      {dependencyTitles.length ? (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-bold text-muted">
          <Lock className="mt-0.5 size-3 shrink-0" />
          پیش‌نیاز: {dependencyTitles.join("، ")}
        </p>
      ) : null}

      {node.skills.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {node.skills.map((skill) => (
            <span key={skill} className="rounded-md bg-background px-2 py-1 text-[11px] font-bold text-foreground/70">
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {node.courses.length ? (
        <div className="mt-4 grid gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-foreground/80">
            <GraduationCap className="size-4 text-primary" />
            دوره‌های پیشنهادی این مرحله
          </div>
          {node.courses.map((item) => (
            <RoadmapCourseRow key={item.course.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted">برای این مرحله فعلاً دوره منتشرشده‌ای در آکادمی موجود نیست؛ می‌توانید با منتور جلسه بگذارید.</p>
      )}
    </div>
  );
}

function RoadmapCourseRow({ item }: { item: EducationRoadmapNodeCourse }) {
  return (
    <Link
      href={`/courses/${item.course.id}`}
      className="group rounded-lg border border-border bg-background/50 p-3 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-sm font-black group-hover:text-primary">{item.course.title}</span>
        <span className="shrink-0 text-[11px] font-black text-primary">{item.matchScore.toLocaleString("fa-IR")}٪ تطابق</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/60">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(4, Math.min(100, item.matchScore))}%` }} />
      </div>
      {item.reason ? <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted">{item.reason}</p> : null}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span className="font-bold">{formatLevelLabel(item.course.level)}</span>
        <span className="font-black text-foreground">{item.course.priceAmount > 0 ? `${item.course.priceAmount.toLocaleString("fa-IR")} ریال` : "رایگان"}</span>
      </div>
    </Link>
  );
}

function groupNodesByPhase(nodes: EducationRoadmapNode[]) {
  const phaseMap = new Map<number, EducationRoadmapNode[]>();
  for (const node of nodes) {
    const key = node.order || 1;
    const bucket = phaseMap.get(key);
    if (bucket) bucket.push(node);
    else phaseMap.set(key, [node]);
  }
  return [...phaseMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([order, phaseNodes]) => ({ order, nodes: phaseNodes }));
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

function buildRecommendationPayload(selectedOptions: AnswerOption[], selectedOptionIds: number[], freeText: string) {
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
    selectedOptionIds,
    freeText: freeText.trim().slice(0, 1500)
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
