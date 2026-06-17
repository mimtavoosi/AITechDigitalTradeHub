"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { createProposal, getProject } from "@/features/projects/api/projects-api";
import { formatBudget } from "@/features/projects/components/project-list-client";
import { ApiRequestError } from "@/lib/api/http-client";
import { useAuthStore } from "@/store/auth-store";

export function ProjectDetailClient({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const [message, setMessage] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId)
  });

  const proposalMutation = useMutation({
    mutationFn: (payload: { proposedPrice: number; proposedDays: number; coverLetter?: string }) => createProposal(projectId, payload),
    onSuccess: () => {
      setMessage("پیشنهاد شما ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
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

  function handleProposal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!user) {
      openAuthDialog("login");
      return;
    }

    const form = new FormData(event.currentTarget);
    proposalMutation.mutate({
      proposedPrice: Number(form.get("proposedPrice") || 0),
      proposedDays: Number(form.get("proposedDays") || 0),
      coverLetter: String(form.get("coverLetter") || "")
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-border bg-white p-5">
        <div className="text-xs font-bold text-primary">{project.categoryName ?? "پروژه هوش مصنوعی"}</div>
        <h1 className="mt-2 text-2xl font-black">{project.title}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
          <span>{formatBudget(project)}</span>
          <span>{project.timelineDays ? `${project.timelineDays} روز` : "زمان توافقی"}</span>
          <span>{project.proposalsCount ?? 0} پیشنهاد</span>
        </div>
        <p className="mt-5 whitespace-pre-line text-sm leading-8 text-muted">{project.description || "توضیحی برای این پروژه ثبت نشده است."}</p>

        {project.contract ? (
          <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4">
            <h2 className="font-black">قرارداد فعال</h2>
            <div className="mt-3 grid gap-2">
              {project.contract.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                  <span>{milestone.title}</span>
                  <span>{milestone.amount.toLocaleString("fa-IR")} {project.currency}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-lg font-black">ارسال پیشنهاد</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleProposal}>
          <label className="grid gap-2 text-sm">
            مبلغ پیشنهادی
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="proposedPrice" type="number" min="1" required />
          </label>
          <label className="grid gap-2 text-sm">
            مدت اجرا روز
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="proposedDays" type="number" min="1" required />
          </label>
          <label className="grid gap-2 text-sm">
            متن پیشنهاد
            <textarea className="min-h-28 rounded-md border border-border px-3 py-2 focus-ring" name="coverLetter" />
          </label>
          {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={proposalMutation.isPending}>
            {proposalMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            ثبت پیشنهاد
          </button>
        </form>
      </aside>
    </div>
  );
}
