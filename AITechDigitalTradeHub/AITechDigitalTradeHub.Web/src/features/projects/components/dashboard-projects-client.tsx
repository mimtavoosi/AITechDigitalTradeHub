"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, Send } from "lucide-react";
import { acceptProposal, createProject, getMyProjects, getProject, publishProject } from "@/features/projects/api/projects-api";
import { ApiRequestError } from "@/lib/api/http-client";
import type { ProjectSummary } from "@/features/projects/types";

export function DashboardProjectsClient() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects", "mine"],
    queryFn: getMyProjects
  });

  const selectedProjectQuery = useQuery({
    queryKey: ["projects", selectedProjectId],
    queryFn: () => getProject(selectedProjectId ?? 0),
    enabled: Boolean(selectedProjectId)
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      setMessage("پروژه ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت پروژه ناموفق بود")
  });

  const publishMutation = useMutation({
    mutationFn: publishProject,
    onSuccess: () => {
      setMessage("پروژه منتشر شد.");
      void queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "انتشار پروژه ناموفق بود")
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: number) => {
      const proposal = selectedProjectQuery.data?.result?.proposals.find((item) => Number(item.id) === proposalId);
      return acceptProposal(proposalId, {
        milestones: [
          {
            title: "مرحله اصلی پروژه",
            amount: proposal?.proposedPrice ?? 0
          }
        ]
      });
    },
    onSuccess: () => {
      setMessage("پیشنهاد پذیرفته شد و قرارداد ساخته شد.");
      void queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId] });
      void queryClient.invalidateQueries({ queryKey: ["projects", "mine"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "پذیرش پیشنهاد ناموفق بود")
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      categoryId: Number(form.get("categoryId") || 1),
      projectType: "Fixed",
      budgetMin: Number(form.get("budgetMin") || 0) || undefined,
      budgetMax: Number(form.get("budgetMax") || 0) || undefined,
      currency: "IRR",
      timelineDays: Number(form.get("timelineDays") || 0) || undefined,
      locationMode: "Remote"
    });
    event.currentTarget.reset();
  }

  const projects = projectsQuery.data?.results ?? [];
  const selectedProject = selectedProjectQuery.data?.result;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">ثبت پروژه جدید</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="title" placeholder="عنوان پروژه" required />
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" name="description" placeholder="توضیح پروژه" />
          <div className="grid grid-cols-2 gap-3">
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="categoryId" type="number" min="1" placeholder="شناسه دسته" required />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="timelineDays" type="number" min="1" placeholder="روز" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="budgetMin" type="number" min="0" placeholder="بودجه حداقل" />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="budgetMax" type="number" min="0" placeholder="بودجه حداکثر" />
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            ثبت پروژه
          </button>
        </form>
        {message ? <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">پروژه‌های من</h2>
        {projectsQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 grid gap-3">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              selected={selectedProjectId === Number(project.id)}
              onSelect={() => setSelectedProjectId(Number(project.id))}
              onPublish={() => publishMutation.mutate(Number(project.id))}
              publishing={publishMutation.isPending}
            />
          ))}
          {!projectsQuery.isLoading && !projects.length ? <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted">هنوز پروژه‌ای ثبت نکرده‌اید.</div> : null}
        </div>

        {selectedProject ? (
          <div className="mt-6 rounded-md border border-border p-4">
            <h3 className="font-black">پیشنهادهای پروژه</h3>
            <div className="mt-3 grid gap-2">
              {selectedProject.proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{proposal.freelancerName ?? `کاربر ${proposal.freelancerUserId}`}</span>
                    <span>{proposal.proposedPrice.toLocaleString("fa-IR")} IRR / {proposal.proposedDays} روز</span>
                  </div>
                  {proposal.coverLetter ? <p className="mt-2 leading-7 text-muted">{proposal.coverLetter}</p> : null}
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate(Number(proposal.id))}
                    disabled={acceptMutation.isPending || String(proposal.status).toLowerCase() === "accepted"}
                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-xs font-bold text-white disabled:opacity-60"
                  >
                    <Check className="size-4" />
                    پذیرش و ساخت قرارداد
                  </button>
                </div>
              ))}
              {!selectedProject.proposals.length ? <div className="text-sm text-muted">هنوز پیشنهادی ثبت نشده است.</div> : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ProjectRow({
  project,
  selected,
  onSelect,
  onPublish,
  publishing
}: {
  project: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
  onPublish: () => void;
  publishing: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${selected ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onSelect} className="text-right font-bold text-foreground">
          {project.title}
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-muted">{String(project.status)}</span>
          <button type="button" onClick={onPublish} disabled={publishing} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-60">
            <Send className="size-3.5" />
            انتشار
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted">{project.proposalsCount ?? 0} پیشنهاد</div>
    </div>
  );
}
