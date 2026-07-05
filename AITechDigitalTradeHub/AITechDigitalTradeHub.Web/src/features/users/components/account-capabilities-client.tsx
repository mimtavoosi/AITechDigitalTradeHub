"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileText, Loader2, Save, Send, ShieldCheck, Upload } from "lucide-react";
import { getMyCapabilities, getMyProjectProfile, requestCapability, updateMyProjectProfile } from "@/features/users/api/users-api";
import { uploadProjectFile } from "@/features/projects/api/projects-api";
import { getTagId, getTagName, getTags } from "@/features/tags/api/tags-api";
import { MultiSelect } from "@/components/ui/searchable-select";
import { ApiRequestError } from "@/lib/api/http-client";
import { useEffect, useState } from "react";

const statusLabels: Record<string, string> = {
  "1": "در انتظار تایید",
  "2": "فعال",
  "3": "رد شده",
  "4": "تعلیق‌شده",
  Pending: "در انتظار تایید",
  Approved: "فعال",
  Rejected: "رد شده",
  Suspended: "تعلیق‌شده"
};

const baseCapabilities = [
  { label: "پروژه‌گذار", description: "ثبت پروژه و مدیریت پیشنهادهای دریافتی" },
  { label: "مجری پروژه", description: "ارسال پیشنهاد و انجام پروژه‌های پذیرفته‌شده" },
  { label: "خریدار خدمات", description: "خرید خدمات، تجهیزات و دوره‌های آموزشی" },
  { label: "سرمایه‌گذار عمومی", description: "استفاده از کیف پول و ثبت تعهد/پرداخت در فرصت‌های سرمایه‌گذاری" }
];

const requestableRoles = [
  { name: "ServiceProvider", label: "خدمات‌دهنده", description: "ثبت خدمات یا تجهیزات برای ارائه در بازارگاه" },
  { name: "Instructor", label: "مدرس", description: "ساخت دوره، انتشار محتوا و مدیریت زمان‌های کلاس" },
  { name: "Fundraiser", label: "سرمایه‌پذیر", description: "ثبت فرصت سرمایه‌گذاری بعد از تایید" },
  { name: "OrganizationAdmin", label: "مدیر سازمان", description: "مدیریت سازمان و درخواست‌های پرداخت شرکتی" },
  { name: "Arbitrator", label: "داور", description: "بررسی پرونده‌های اختلاف پس از تایید مدیریت" }
];

type ResumeDraft = {
  headline: string;
  summary: string;
  experience: string;
  education: string;
};

export function AccountCapabilitiesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [resumeDraft, setResumeDraft] = useState<ResumeDraft>({ headline: "", summary: "", experience: "", education: "" });

  const capabilitiesQuery = useQuery({
    queryKey: ["users", "me", "capabilities"],
    queryFn: getMyCapabilities
  });

  const profileQuery = useQuery({
    queryKey: ["users", "me", "project-profile"],
    queryFn: getMyProjectProfile
  });

  const tagsQuery = useQuery({
    queryKey: ["tags", "user-project-profile"],
    queryFn: () => getTags({ pageSize: 300 })
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (profile?.skills) {
      setSkillIds(profile.skills.map((item) => Number(item.id)).filter(Boolean));
    }
    if (profile) {
      setResumeDraft({
        headline: profile.resumeHeadline ?? "",
        summary: profile.resumeSummary ?? "",
        experience: profile.resumeExperience ?? "",
        education: profile.resumeEducation ?? ""
      });
    }
  }, [profileQuery.data]);

  const requestMutation = useMutation({
    mutationFn: requestCapability,
    onSuccess: () => {
      setMessage("درخواست ثبت شد و در انتظار بررسی مدیریت است.");
      void queryClient.invalidateQueries({ queryKey: ["users", "me", "capabilities"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت درخواست ناموفق بود")
  });

  const saveProfileMutation = useMutation({
    mutationFn: (payload: { skillTagIds: number[]; resumeFileUploadId?: number; resumeHeadline?: string; resumeSummary?: string; resumeExperience?: string; resumeEducation?: string }) => updateMyProjectProfile(payload),
    onSuccess: () => {
      setProfileMessage("پروفایل پروژه‌ای ذخیره شد.");
      void queryClient.invalidateQueries({ queryKey: ["users", "me", "project-profile"] });
    },
    onError: (err) => setProfileMessage(err instanceof ApiRequestError ? err.message : "ذخیره پروفایل ناموفق بود")
  });

  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => uploadProjectFile(file, { entityType: "UserResume", tag: "رزومه کاربر" }),
    onSuccess: (result) => {
      const fileId = Number(result.result?.id ?? 0);
      saveProfileMutation.mutate({ skillTagIds: skillIds, resumeFileUploadId: fileId || undefined, ...toResumePayload(resumeDraft) });
    },
    onError: (err) => setProfileMessage(err instanceof ApiRequestError ? err.message : "آپلود رزومه ناموفق بود")
  });

  const capabilities = capabilitiesQuery.data ?? [];
  const profile = profileQuery.data;
  const skillOptions = (tagsQuery.data?.results ?? [])
    .map((item) => ({ value: getTagId(item), label: getTagName(item) }))
    .filter((item) => item.value > 0);
  const selectedSkillLabels = skillOptions.filter((item) => skillIds.includes(Number(item.value))).map((item) => item.label);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-5">
      <section className="dashboard-card p-5">
        <h2 className="text-lg font-black">درخواست قابلیت‌های حساب</h2>
        <p className="mt-2 text-sm leading-7 text-muted">قابلیت‌های عمومی با ثبت‌نام فعال هستند. نقش‌هایی که اعتماد بیشتری می‌خواهند بعد از تایید مدیریت فعال می‌شوند.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {baseCapabilities.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-primary shadow-panel">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <h3 className="font-black">{item.label}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted">{item.description}</p>
                  <span className="mt-3 inline-flex rounded-md bg-white px-2 py-1 text-xs font-bold text-primary">فعال پیش‌فرض</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {requestableRoles.map((role) => {
            const current = capabilities.find((item) => item.roleName === role.name);
            const statusValue = String(current?.status ?? "");
            const isPending = statusValue === "1" || statusValue.toLowerCase() === "pending";
            const isApproved = statusValue === "2" || statusValue.toLowerCase() === "approved";
            return (
              <div key={role.name} className="rounded-md border border-border/70 bg-white/78 p-4 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{role.label}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted">{role.description}</p>
                  </div>
                  {current ? <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{formatStatus(current.status)}</span> : null}
                </div>
                <button
                  type="button"
                  disabled={requestMutation.isPending || isApproved || isPending}
                  onClick={() => requestMutation.mutate(role.name)}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60"
                >
                  {requestMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isApproved ? "فعال شده" : isPending ? "در انتظار بررسی" : "درخواست فعال‌سازی"}
                </button>
              </div>
            );
          })}
        </div>
        {message ? <div className="mt-4 rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">رزومه‌ساز و مهارت‌ها</h2>
            <p className="mt-2 text-sm leading-7 text-muted">مهارت‌ها و فایل رزومه اینجا ذخیره می‌شود و برای پیشنهاد پروژه، درخواست مدرس شدن و اعتمادسازی حساب استفاده می‌شود.</p>
          </div>
          {profile?.resumeFileUrl ? (
            <a className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold" href={profile.resumeFileUrl} target="_blank" rel="noreferrer">
              <FileText className="size-4" />
              {profile.resumeFileName ?? "رزومه فعلی"}
            </a>
          ) : null}
        </div>

        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const file = form.get("resume");
            setProfileMessage("");
            if (file instanceof File && file.size > 0) {
              uploadResumeMutation.mutate(file);
              event.currentTarget.reset();
              return;
            }
            saveProfileMutation.mutate({ skillTagIds: skillIds, ...toResumePayload(resumeDraft) });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" value={resumeDraft.headline} onChange={(event) => setResumeDraft((prev) => ({ ...prev, headline: event.target.value }))} placeholder="عنوان حرفه‌ای، مثلا مدرس و متخصص Computer Vision" />
            <input className="h-10 rounded-md border border-border px-3 text-sm focus-ring" value={resumeDraft.education} onChange={(event) => setResumeDraft((prev) => ({ ...prev, education: event.target.value }))} placeholder="تحصیلات یا گواهی‌های مهم" />
          </div>
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2 text-sm focus-ring" value={resumeDraft.summary} onChange={(event) => setResumeDraft((prev) => ({ ...prev, summary: event.target.value }))} placeholder="خلاصه توانمندی‌ها، حوزه تخصص و نوع همکاری مطلوب" />
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2 text-sm focus-ring" value={resumeDraft.experience} onChange={(event) => setResumeDraft((prev) => ({ ...prev, experience: event.target.value }))} placeholder="تجربه‌ها، پروژه‌ها، تدریس‌ها یا نمونه کارهای شاخص" />
          <MultiSelect options={skillOptions} value={skillIds} onChange={setSkillIds} placeholder={tagsQuery.isLoading ? "در حال خواندن مهارت‌ها" : "مهارت‌های شما"} />
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <input className="h-10 rounded-md border border-border px-3 py-1 text-sm focus-ring" name="resume" type="file" />
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
              disabled={saveProfileMutation.isPending || uploadResumeMutation.isPending}
            >
              {saveProfileMutation.isPending || uploadResumeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : profile?.resumeFileUrl ? <Save className="size-4" /> : <Upload className="size-4" />}
              ذخیره پروفایل
            </button>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-bold"
            onClick={() => {
              setProfileMessage("");
              saveProfileMutation.mutate({ skillTagIds: skillIds, ...toResumePayload(resumeDraft) });
            }}
          >
            <Save className="size-4" />
            ذخیره متن رزومه
          </button>
        </form>

        <div className="mt-4 grid gap-2 rounded-md bg-background/70 p-3 text-xs text-muted md:grid-cols-3">
          <span>پروژه موفق: {(profile?.completedProjectsCount ?? 0).toLocaleString("fa-IR")}</span>
          <span>مهارت: {(profile?.skills.length ?? skillIds.length).toLocaleString("fa-IR")}</span>
          <span>احراز: {profile?.isVerified ? "تایید شده" : "نیازمند تکمیل"}</span>
        </div>
        <div className="mt-4 rounded-md border border-border bg-white/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-black">{profile?.displayName || "رزومه کاربر"}</div>
              {resumeDraft.headline ? <div className="mt-1 text-xs font-bold text-primary">{resumeDraft.headline}</div> : null}
            </div>
            <button type="button" onClick={() => window.print()} className="rounded-md border border-border px-3 py-1.5 text-xs font-bold">چاپ</button>
          </div>
          {resumeDraft.summary ? <p className="mt-3 text-sm leading-7 text-muted">{resumeDraft.summary}</p> : null}
          {resumeDraft.experience ? <div className="mt-3 rounded-md bg-background/70 px-3 py-2 text-xs leading-6 text-muted">{resumeDraft.experience}</div> : null}
          {resumeDraft.education ? <div className="mt-2 text-xs font-bold text-muted">{resumeDraft.education}</div> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {(profile?.skills ?? []).map((skill) => (
              <span key={skill.id} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {skill.name}
              </span>
            ))}
            {!profile?.skills?.length && selectedSkillLabels.map((skill) => (
              <span key={skill} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {skill}
              </span>
            ))}
            {!profile?.skills?.length && !selectedSkillLabels.length ? <span className="text-xs text-muted">بعد از انتخاب مهارت‌ها، رزومه خلاصه اینجا کامل‌تر می‌شود.</span> : null}
          </div>
          {profile?.portfolioItems?.length ? (
            <div className="mt-3 grid gap-2">
              {profile.portfolioItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-md bg-background/70 px-3 py-2 text-xs">
                  <span className="font-bold">{item.title}</span>
                  {item.description ? <span className="mt-1 block text-muted">{item.description}</span> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {profileMessage ? <div className="mt-4 rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{profileMessage}</div> : null}
      </section>
      </div>

      <aside className="dashboard-card p-5">
        <h2 className="font-black">قابلیت‌های فعلی</h2>
        {capabilitiesQuery.isLoading ? <Loader2 className="mt-5 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 grid gap-2">
          {capabilities.map((item) => (
            <div key={item.id} className="rounded-md bg-background/75 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-bold">
                  <CheckCircle2 className="size-4 text-primary" />
                  {item.roleDescription ?? item.roleName}
                </span>
                <span className="text-xs text-muted">{formatStatus(item.status)}</span>
              </div>
              {item.adminNote ? <p className="mt-2 text-xs leading-6 text-muted">{item.adminNote}</p> : null}
            </div>
          ))}
          {!capabilitiesQuery.isLoading && !capabilities.length ? <div className="text-sm text-muted">قابلیتی ثبت نشده است.</div> : null}
        </div>
      </aside>
    </div>
  );
}

function formatStatus(status: string | number) {
  return statusLabels[String(status)] ?? String(status);
}

function toResumePayload(draft: ResumeDraft) {
  return {
    resumeHeadline: draft.headline,
    resumeSummary: draft.summary,
    resumeExperience: draft.experience,
    resumeEducation: draft.education
  };
}
