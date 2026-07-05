"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, MoreHorizontal, Scale, ShieldAlert, X } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { blockAdminProject, getAdminProjectDisputes, getAdminProjects, resolveProjectDispute, terminateAdminProjectContract, updateAdminProjectStatus } from "@/features/projects/api/projects-api";
import type { ProjectDisputeSummary, ProjectSummary } from "@/features/projects/types";
import { ApiRequestError } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query-keys";

const projectStatuses = ["Draft", "Published", "Bidding", "Assigned", "InProgress", "Done", "Cancelled", "Disputed"] as const;

const projectStatusLabels: Record<string, string> = {
  Draft: "پیش‌نویس",
  Published: "منتشر شده",
  Bidding: "در مناقصه",
  Assigned: "واگذار شده",
  InProgress: "در حال اجرا",
  Done: "تمام‌شده",
  Cancelled: "لغو شده",
  Disputed: "دارای اختلاف"
};

const projectStatusOptions: Array<SelectOption<string>> = projectStatuses.map((status) => ({ value: status, label: projectStatusLabels[status] }));

export function AdminProjectsClient() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | "">("");
  const [message, setMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null);

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.admin(status || undefined),
    queryFn: () => getAdminProjects({ status, pageSize: 100 })
  });

  const disputesQuery = useQuery({
    queryKey: queryKeys.projects.adminDisputes(),
    queryFn: () => getAdminProjectDisputes({ pageSize: 50 })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus, note }: { id: number; nextStatus: string; note?: string }) => updateAdminProjectStatus(id, nextStatus, note),
    onSuccess: () => {
      setMessage("وضعیت پروژه به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.admin() });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی پروژه ناموفق بود")
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => blockAdminProject(id, note),
    onSuccess: () => {
      setMessage("پروژه مسدود و از چرخه کار خارج شد.");
      setSelectedProject(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.admin() });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "مسدودسازی پروژه ناموفق بود")
  });

  const terminateContractMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => terminateAdminProjectContract(id, note),
    onSuccess: () => {
      setMessage("قرارداد فعال پروژه خاتمه داده شد.");
      setSelectedProject(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.admin() });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "خاتمه قرارداد ناموفق بود")
  });

  const disputeDecisionMutation = useMutation({
    mutationFn: ({ disputeId, decisionType, decisionText, releaseAmount, refundAmount }: { disputeId: number; decisionType: "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction"; decisionText?: string; releaseAmount?: number; refundAmount?: number }) =>
      resolveProjectDispute(disputeId, { decisionType, decisionText, releaseAmount, refundAmount, executeFinancialDecision: true }),
    onSuccess: () => {
      setMessage("رأی داوری ثبت و اجرا شد.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.adminDisputes() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.admin() });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت رأی داوری ناموفق بود")
  });

  const projects = useMemo(() => projectsQuery.data?.results ?? [], [projectsQuery.data?.results]);
  const stats = useMemo(
    () => ({
      total: projectsQuery.data?.totalCount ?? projects.length,
      active: projects.filter((item) => ["Published", "Bidding", "Assigned", "InProgress"].includes(String(item.status)) || [2, 3, 4, 5].includes(Number(item.status))).length,
      done: projects.filter((item) => String(item.status) === "Done" || Number(item.status) === 6).length,
      proposals: projects.reduce((sum, item) => sum + (item.proposalsCount ?? 0), 0)
    }),
    [projects, projectsQuery.data?.totalCount]
  );

  const columns = useMemo<Array<DataGridColumn<ProjectSummary>>>(
    () => [
      {
        key: "title",
        title: "پروژه",
        priority: "primary",
        sortable: true,
        searchValue: (item) => `${item.title} ${item.description ?? ""}`,
        sortValue: (item) => item.title,
        exportValue: (item) => item.title,
        render: (item) => (
          <div>
            <div className="flex flex-wrap items-center gap-2 font-black">
              <BriefcaseBusiness className="size-4 text-primary" />
              {item.title}
              {item.activeDisputesCount ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-800">
                  <AlertTriangle className="size-3.5" />
                  {item.activeDisputesCount.toLocaleString("fa-IR")} اختلاف فعال
                </span>
              ) : null}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-muted">{item.description ?? "بدون توضیح"}</div>
          </div>
        )
      },
      {
        key: "employer",
        title: "کارفرما",
        priority: "meta",
        sortable: true,
        searchValue: (item) => `${item.employerName ?? ""} ${item.employerUserId ?? ""}`,
        sortValue: (item) => item.employerName ?? "",
        exportValue: (item) => item.employerName || `کاربر ${item.employerUserId}`,
        render: (item) => <span className="text-xs text-muted">{item.employerName || `کاربر ${item.employerUserId}`}</span>
      },
      {
        key: "organization",
        title: "سازمان",
        priority: "meta",
        searchValue: (item) => `${item.organizationName ?? ""} ${item.organizationId ?? ""}`,
        exportValue: (item) => item.organizationName ?? "",
        render: (item) => <span className="text-xs text-muted">{item.organizationName ?? "شخصی"}</span>
      },
      {
        key: "budget",
        title: "بودجه",
        sortable: true,
        sortValue: (item) => item.budgetMax ?? item.budgetMin ?? 0,
        exportValue: (item) => formatBudget(item),
        render: (item) => <span className="text-xs text-muted">{formatBudget(item)}</span>
      },
      {
        key: "proposals",
        title: "پیشنهاد",
        sortable: true,
        sortValue: (item) => item.proposalsCount ?? 0,
        exportValue: (item) => item.proposalsCount ?? 0,
        render: (item) => <span className="text-xs text-muted">{(item.proposalsCount ?? 0).toLocaleString("fa-IR")}</span>
      },
      {
        key: "status",
        title: "وضعیت",
        sortable: true,
        sortValue: (item) => String(item.status),
        exportValue: (item) => projectStatusLabels[String(item.status)] ?? String(item.status),
        render: (item) => <StatusPill value={String(item.status)} />
      }
    ],
    []
  );

  const disputeColumns = useMemo<Array<DataGridColumn<ProjectDisputeSummary>>>(
    () => [
      {
        key: "title",
        title: "پرونده",
        priority: "primary",
        searchValue: (item) => `${item.title} ${item.description ?? ""}`,
        exportValue: (item) => item.title,
        render: (item) => (
          <div>
            <div className="flex items-center gap-2 font-black">
              <Scale className="size-4 text-amber-700" />
              {item.title}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-muted">{item.description ?? "بدون توضیح"}</div>
          </div>
        )
      },
      {
        key: "parties",
        title: "طرفین",
        priority: "meta",
        exportValue: (item) => `${item.openedByName ?? item.openedByUserId} / ${item.respondentName ?? item.respondentUserId ?? ""}`,
        render: (item) => <span className="text-xs text-muted">{item.openedByName ?? `کاربر ${item.openedByUserId}`} / {item.respondentName ?? `کاربر ${item.respondentUserId ?? "-"}`}</span>
      },
      {
        key: "context",
        title: "زمینه",
        exportValue: (item) => `${item.contextType} ${item.contextId}`,
        render: (item) => <span className="text-xs text-muted">{String(item.contextType)} #{item.contextId}</span>
      },
      {
        key: "status",
        title: "وضعیت",
        exportValue: (item) => String(item.status),
        render: (item) => <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">{String(item.status)}</span>
      }
    ],
    []
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="کل پروژه‌ها" value={stats.total.toLocaleString("fa-IR")} />
        <Metric label="فعال در صفحه" value={stats.active.toLocaleString("fa-IR")} />
        <Metric label="تمام‌شده در صفحه" value={stats.done.toLocaleString("fa-IR")} />
        <Metric label="پیشنهادها در صفحه" value={stats.proposals.toLocaleString("fa-IR")} />
      </section>

      {message ? <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}

      <DataGrid
        title="مدیریت پروژه‌ها و مناقصه‌ها"
        items={projects}
        columns={columns}
        getRowId={(item) => item.id}
        loading={projectsQuery.isLoading}
        exportFileName="projects"
        printTitle="گزارش پروژه‌ها"
        searchPlaceholder="جستجو در عنوان، توضیح، کارفرما یا سازمان"
        filters={<SearchableSelect className="w-full sm:w-64" options={projectStatusOptions} value={status} onChange={setStatus} placeholder="همه وضعیت‌های پروژه" />}
        renderRowActions={(item) => (
          <button
            type="button"
            onClick={() => setSelectedProject(item)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold hover:bg-slate-50"
          >
            <MoreHorizontal className="size-4" />
            جزئیات و عملیات
          </button>
        )}
      />

      <DataGrid
        title="پرونده‌های اختلاف و داوری پروژه"
        items={disputesQuery.data?.results ?? []}
        columns={disputeColumns}
        getRowId={(item) => item.id}
        loading={disputesQuery.isLoading}
        exportFileName="project-disputes"
        printTitle="پرونده‌های اختلاف پروژه"
        searchPlaceholder="جستجو در پرونده‌های اختلاف"
        renderRowActions={(item) =>
          item.decision ? (
            <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent">رأی ثبت شده</span>
          ) : (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                disputeDecisionMutation.mutate({
                  disputeId: Number(item.id),
                  decisionType: String(form.get("decisionType") || "NoAction") as "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction",
                  decisionText: String(form.get("decisionText") || ""),
                  releaseAmount: Number(form.get("releaseAmount") || 0) || undefined,
                  refundAmount: Number(form.get("refundAmount") || 0) || undefined
                });
                event.currentTarget.reset();
              }}
            >
              <select className="h-8 rounded-md border border-border bg-white px-2 text-xs" name="decisionType" defaultValue="NoAction">
                <option value="ReleasePayment">آزادسازی کامل</option>
                <option value="RefundPayment">بازگشت کامل</option>
                <option value="PartialRelease">تقسیم مبلغ</option>
                <option value="ReviseWork">اصلاح کار</option>
                <option value="NoAction">بدون اقدام مالی</option>
              </select>
              <input className="h-8 w-44 rounded-md border border-border px-2 text-xs" name="decisionText" placeholder="متن رأی" />
              <input className="h-8 w-28 rounded-md border border-border px-2 text-xs" name="releaseAmount" type="number" min="0" placeholder="آزادسازی" />
              <input className="h-8 w-28 rounded-md border border-border px-2 text-xs" name="refundAmount" type="number" min="0" placeholder="بازگشت" />
              <button className="h-8 rounded-md bg-amber-700 px-3 text-xs font-bold text-white" disabled={disputeDecisionMutation.isPending}>ثبت رأی</button>
            </form>
          )
        }
      />

      {selectedProject ? (
        <ProjectAdminDialog
          project={selectedProject}
          pending={statusMutation.isPending || blockMutation.isPending || terminateContractMutation.isPending}
          onClose={() => setSelectedProject(null)}
          onStatus={(nextStatus, note) => statusMutation.mutate({ id: Number(selectedProject.id), nextStatus, note })}
          onBlock={(note) => blockMutation.mutate({ id: Number(selectedProject.id), note })}
          onTerminateContract={(note) => terminateContractMutation.mutate({ id: Number(selectedProject.id), note })}
        />
      ) : null}
    </div>
  );
}

function ProjectAdminDialog({
  project,
  pending,
  onClose,
  onStatus,
  onBlock,
  onTerminateContract
}: {
  project: ProjectSummary;
  pending: boolean;
  onClose: () => void;
  onStatus: (status: string, note?: string) => void;
  onBlock: (note?: string) => void;
  onTerminateContract: (note?: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-xl font-black">{project.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
              <span className="rounded-md bg-background px-2 py-1">{project.employerName || `کاربر ${project.employerUserId}`}</span>
              <span className="rounded-md bg-background px-2 py-1">{project.organizationName ?? "شخصی"}</span>
              <span className="rounded-md bg-background px-2 py-1">{formatBudget(project)}</span>
              <span className="rounded-md bg-background px-2 py-1">{project.proposalsCount ?? 0} پیشنهاد</span>
              {project.activeDisputesCount ? <span className="rounded-md bg-amber-100 px-2 py-1 font-bold text-amber-800">{project.activeDisputesCount} اختلاف فعال</span> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md border border-border">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          <div className="rounded-md border border-border bg-background/60 p-4">
            <h3 className="font-black">خلاصه پروژه</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-7 text-muted">{stripHtml(project.description ?? "توضیحی ثبت نشده است.")}</p>
            <div className="mt-3">
              <StatusPill value={String(project.status)} />
            </div>
          </div>

          <label className="grid gap-2 text-sm">
            یادداشت عملیات ادمین
            <textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" placeholder="علت تغییر وضعیت، مسدودسازی یا خاتمه قرارداد" />
          </label>

          <div className="grid gap-3">
            <h3 className="font-black">تغییر وضعیت پروژه</h3>
            <div className="flex flex-wrap gap-2">
              {projectStatuses.map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  disabled={pending || String(project.status) === nextStatus}
                  onClick={() => onStatus(nextStatus, note)}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-45"
                >
                  {nextStatus === "Done" ? <CheckCircle2 className="size-3.5" /> : null}
                  {nextStatus === "Cancelled" ? <ShieldAlert className="size-3.5" /> : null}
                  {projectStatusLabels[nextStatus]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-danger/30 bg-danger/5 p-4">
            <h3 className="font-black text-danger">عملیات حساس</h3>
            <p className="mt-1 text-xs leading-6 text-muted">مسدودسازی، پروژه را لغو و غیرفعال می‌کند. خاتمه قرارداد فقط برای قرارداد فعال کاربرد دارد.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending} onClick={() => onBlock(note)} className="inline-flex h-10 items-center gap-2 rounded-md bg-danger px-4 text-sm font-bold text-white disabled:opacity-50">
                <ShieldAlert className="size-4" />
                مسدود کردن پروژه
              </button>
              <button type="button" disabled={pending} onClick={() => onTerminateContract(note)} className="inline-flex h-10 items-center gap-2 rounded-md border border-danger/40 bg-white px-4 text-sm font-bold text-danger disabled:opacity-50">
                خاتمه قرارداد فعال
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  return <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-muted">{projectStatusLabels[value] ?? value}</span>;
}

function formatBudget(project: Pick<ProjectSummary, "budgetMin" | "budgetMax" | "currency">) {
  const currency = project.currency ?? "IRR";
  if (project.budgetMin && project.budgetMax) {
    return `${project.budgetMin.toLocaleString("fa-IR")} تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMin) {
    return `از ${project.budgetMin.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMax) {
    return `تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  return "توافقی";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
