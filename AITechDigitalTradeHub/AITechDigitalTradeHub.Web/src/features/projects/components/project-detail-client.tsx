"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BriefcaseBusiness, CalendarDays, Clock3, FileText, Loader2, MapPin, MessageSquare, Scale, Send, ShieldCheck, Upload } from "lucide-react";
import { createProposal, getProject, uploadProjectFile } from "@/features/projects/api/projects-api";
import { formatBudget } from "@/features/projects/components/project-list-client";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { queryKeys } from "@/lib/query-keys";

export function ProjectDetailClient({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [message, setMessage] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProject(projectId)
  });

  const proposalMutation = useMutation({
    mutationFn: (payload: { proposedPrice: number; proposedDays: number; coverLetter?: string; resumeFileUploadId?: number }) => createProposal(projectId, payload),
    onSuccess: () => {
      setMessage("پیشنهاد شما ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت پیشنهاد ناموفق بود")
  });

  if (isLoading) {
    return <div className="grid place-items-center rounded-md border border-border bg-white py-10"><Loader2 className="size-5 animate-spin text-muted" /></div>;
  }

  if (error || !data?.result) {
    return <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">پروژه پیدا نشد.</div>;
  }

  const project = data.result;
  const projectTitle = cleanSeedTitle(project.title);
  const milestones = project.contract?.milestones ?? [];
  const isOpenForProposal = !project.contract && ["Published", "Bidding", "2", "3"].includes(String(project.status));

  async function handleProposal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!user) {
      openAuthDialog("login");
      return;
    }

    const form = new FormData(event.currentTarget);
    const resume = form.get("resume");
    const uploaded = resume instanceof File && resume.size > 0
      ? await uploadProjectFile(resume, { entityType: "ProposalResume", foreignKeyId: projectId, tag: "رزومه پیشنهاد" })
      : null;

    proposalMutation.mutate({
      proposedPrice: Number(form.get("proposedPrice") || 0),
      proposedDays: Number(form.get("proposedDays") || 0),
      coverLetter: String(form.get("coverLetter") || ""),
      resumeFileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
      <section className="grid gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-panel">
          <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#7E57F5,#32D4C8)]" />
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:p-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                  <BriefcaseBusiness className="size-4" />
                  {project.categoryName ?? "پروژه هوش مصنوعی"}
                </span>
                <span className="rounded-full bg-background px-3 py-1.5 text-muted">{statusLabel(project.status)}</span>
              </div>
              <h1 className="mt-4 text-2xl font-black leading-10 text-foreground md:text-4xl md:leading-[1.35]">{projectTitle}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-muted">
                {project.employerName ? `ثبت‌شده توسط ${project.employerName}` : "فرصت پروژه برای متخصصان آی نت"}؛ جزئیات نیاز، بودجه و شرایط همکاری را بررسی کنید و در صورت تناسب، پیشنهاد اجرایی خود را ارسال کنید.
              </p>
              {project.skills?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span key={String(skill.id)} className="rounded-md bg-accent/10 px-2.5 py-1.5 text-xs font-bold text-accent">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-border bg-[linear-gradient(180deg,#F8FAFC,#FFFFFF)] p-4">
              <div className="text-xs font-bold text-muted">بودجه پروژه</div>
              <div className="mt-2 text-xl font-black text-primary">{formatBudget(project)}</div>
              <div className="mt-4 grid gap-2 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  {project.timelineDays ? `${project.timelineDays.toLocaleString("fa-IR")} روز زمان اجرا` : "زمان اجرا توافقی"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" />
                  {locationLabel(project.locationMode)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" />
                  {project.deadlineAt ? `مهلت ارسال: ${new Date(project.deadlineAt).toLocaleDateString("fa-IR")}` : "مهلت ارسال مشخص نشده"}
                </span>
              </div>
              <a href="#send-proposal" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-black text-white transition hover:bg-primary/90">
                ارسال پیشنهاد
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">شرح پروژه</h2>
            <span className="rounded-md bg-background px-3 py-1.5 text-xs font-bold text-muted">{(project.proposalsCount ?? 0).toLocaleString("fa-IR")} پیشنهاد ثبت‌شده</span>
          </div>
          <div
            className="prose-editor mt-5 max-w-none text-sm leading-8 text-muted"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(project.description || "توضیحی برای این پروژه ثبت نشده است.") }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Capability icon={ShieldCheck} title="پرداخت امن" text="نگهداری وجه هر مرحله تا تایید خروجی" />
          <Capability icon={FileText} title="تحویل مستند" text="ثبت فایل‌ها و خروجی‌های پروژه" />
          <Capability icon={MessageSquare} title="گفتگوی کاری" text="هماهنگی مستقیم کارفرما و مجری" />
          <Capability icon={Scale} title="داوری" text="رسیدگی به اختلاف‌های مالی و اجرایی" />
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">مراحل اجرای پروژه</h2>
          <div className="mt-4 grid gap-3">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-md border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{milestone.title}</span>
                  <span className="rounded-md bg-white px-2 py-1 text-xs text-muted">{String(milestone.status)}</span>
                </div>
                <div className="mt-2 text-sm text-primary">{milestone.amount.toLocaleString("fa-IR")} {currencyLabel(project.currency)}</div>
              </div>
            ))}
            {!milestones.length ? <div className="rounded-lg bg-background px-4 py-5 text-sm leading-7 text-muted">پس از انتخاب مجری، مراحل قرارداد و پرداخت مرحله‌ای اینجا نمایش داده می‌شود.</div> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">مستندات عمومی پروژه</h2>
          <div className="mt-4 grid gap-2">
            {(project.documents ?? []).map((item) => (
              <a key={item.id} href={item.fileUrl ?? "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm">
                <span>{item.tag || item.fileName}</span>
                <FileText className="size-4 text-muted" />
              </a>
            ))}
            {!project.documents?.length ? <div className="text-sm text-muted">مستند عمومی برای این پروژه منتشر نشده است.</div> : null}
          </div>
        </div>
      </section>

      <aside id="send-proposal" className="h-fit scroll-mt-24 rounded-2xl border border-border bg-white p-5 shadow-panel lg:sticky lg:top-28">
        <div className="mb-4 flex items-center gap-2">
          <BadgeCheck className="size-5 text-accent" />
          <h2 className="text-lg font-black">ارسال پیشنهاد همکاری</h2>
        </div>
        {!isOpenForProposal ? (
          <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-3 text-sm leading-7 text-primary">
            برای این پروژه قرارداد ساخته شده یا فرصت ارسال پیشنهاد بسته شده است.
          </div>
        ) : null}
        <form className="grid gap-3" onSubmit={handleProposal}>
          <label className="grid gap-2 text-sm">
            مبلغ پیشنهادی به ریال
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="proposedPrice" type="number" min="1" required disabled={!isOpenForProposal} />
          </label>
          <label className="grid gap-2 text-sm">
            مدت اجرا به روز
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="proposedDays" type="number" min="1" required disabled={!isOpenForProposal} />
          </label>
          <label className="grid gap-2 text-sm">
            متن پیشنهاد
            <textarea className="min-h-32 rounded-md border border-border px-3 py-2 focus-ring" name="coverLetter" placeholder="مسیر اجرا، خروجی قابل تحویل، تجربه مشابه و زمان‌بندی پیشنهادی را بنویسید." disabled={!isOpenForProposal} />
          </label>
          <label className="grid gap-2 text-sm">
            رزومه یا نمونه‌کار
            <span className="flex h-11 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted">
              <Upload className="size-4" />
              <input className="min-w-0 flex-1" name="resume" type="file" disabled={!isOpenForProposal} />
            </span>
          </label>
          {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={proposalMutation.isPending || !isOpenForProposal}>
            {proposalMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            ثبت پیشنهاد
          </button>
        </form>
      </aside>
    </div>
  );
}

function Capability({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-panel">
      <Icon className="size-5 text-primary" />
      <div className="mt-3 font-black">{title}</div>
      <div className="mt-1 text-xs text-muted">{text}</div>
    </div>
  );
}

function cleanSeedTitle(value: string) {
  return value.replace(/^\s*\[SeedTest\]\s*/i, "").trim();
}

function currencyLabel(value?: string | null) {
  const normalized = String(value ?? "IRR").toUpperCase();
  if (normalized === "IRR" || normalized === "ریال") return "ریال";
  if (normalized === "IRT" || normalized === "TOMAN" || normalized === "تومان") return "تومان";
  return value ?? "ریال";
}

function statusLabel(value: string | number) {
  const labels: Record<string, string> = {
    Draft: "پیش‌نویس",
    Published: "منتشر شده",
    Bidding: "در انتظار پیشنهاد",
    Assigned: "واگذار شده",
    InProgress: "در حال اجرا",
    Done: "تکمیل شده",
    Cancelled: "لغو شده",
    Disputed: "دارای اختلاف",
    "1": "پیش‌نویس",
    "2": "منتشر شده",
    "3": "در انتظار پیشنهاد"
  };
  return labels[String(value)] ?? String(value);
}

function locationLabel(value?: string | number | null) {
  const normalized = String(value ?? "");
  if (normalized === "OnSite" || normalized === "2") return "حضوری";
  if (normalized === "Hybrid" || normalized === "3") return "ترکیبی";
  return "دورکاری";
}
