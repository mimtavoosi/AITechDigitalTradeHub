"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, FileCheck2, FileText, HelpCircle, Loader2, MessageSquare, Plus, RotateCcw, Scale, Send, ShieldCheck, WalletCards, X } from "lucide-react";
import {
  acceptProposal,
  addContractTimesheet,
  attachProjectDocument,
  createProposalCounterOffer,
  approveDeliverable,
  completeProjectContract,
  createProject,
  createProjectReview,
  holdMilestoneEscrow,
  openProjectDispute,
  publishProject,
  refundMilestoneEscrow,
  releaseMilestoneEscrow,
  requestDeliverableRevision,
  respondProposalCounterOffer,
  resolveProjectDispute,
  sendProjectMessage,
  submitMilestoneDeliverable,
  updateTimesheetStatus,
  updateProject,
  uploadProjectFile
} from "@/features/projects/api/projects-api";
import { getUserProjectProfile } from "@/features/users/api/users-api";
import { getCategoryDescription, getCategoryId, getCategoryName, isProjectCategory } from "@/features/categories/api/categories-api";
import { getTagId, getTagName } from "@/features/tags/api/tags-api";
import { AppModal } from "@/components/ui/app-modal";
import { PersianDateTimeInput, persianDateTimeToLocalIso } from "@/components/ui/persian-date-time-input";
import { MultiSelect, SearchableSelect } from "@/components/ui/searchable-select";
import { ApiRequestError } from "@/lib/api/http-client";
import { queryKeys } from "@/lib/query-keys";
import type { ContractSummary, DeliverableSummary, MilestoneSummary, ProjectCreatePayload, ProjectDisputeSummary, ProjectDocumentSummary, ProjectMessageSummary, ProjectSummary, ProposalSummary, TimesheetSummary } from "@/features/projects/types";
import type { UserProjectProfile } from "@/features/users/types";
import { useAuthStore } from "@/store/auth-store";
import { useProjectWorkspaceQueries } from "@/features/projects/hooks/use-project-workspace-queries";
import { EmployerMetric, EmptyProjectWorkspace, ProjectMiniBar } from "@/features/projects/components/dashboard-project-overview";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((module) => module.RichTextEditor),
  { ssr: false, loading: () => <div className="min-h-52 animate-pulse rounded-lg border border-border bg-background" /> }
);

export function DashboardProjectsClient() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [workspace, setWorkspace] = useState<"employer" | "contractor">("employer");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategoryId, setProjectCategoryId] = useState<number | "">("");
  const [projectSkillIds, setProjectSkillIds] = useState<number[]>([]);
  const [projectDeadline, setProjectDeadline] = useState("");
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const {
    projectsQuery,
    myProposalsQuery,
    selectedProjectQuery,
    walletQuery,
    categoriesQuery,
    tagsQuery,
    conversationQuery,
    disputesQuery,
    documentsQuery,
    activityQuery,
    refreshSelected
  } = useProjectWorkspaceQueries(selectedProjectId);

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      setMessage("پروژه ثبت شد.");
      setCreateProjectOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت پروژه ناموفق بود"))
  });

  const publishMutation = useMutation({
    mutationFn: publishProject,
    onSuccess: () => {
      setMessage("پروژه منتشر شد.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
    onError: (err) => setMessage(getErrorMessage(err, "انتشار پروژه ناموفق بود"))
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProjectCreatePayload }) => updateProject(id, payload),
    onSuccess: () => {
      setMessage("پروژه ویرایش شد.");
      setEditingProject(null);
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ویرایش پروژه ناموفق بود"))
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: number) => {
      const proposal = selectedProjectQuery.data?.result?.proposals.find((item) => Number(item.id) === proposalId);
      return acceptProposal(proposalId, {
        milestones: [
          {
            title: "مرحله اصلی پروژه",
            description: "اجرای پروژه طبق پیشنهاد پذیرفته شده. بعد از تحویل و تایید این مرحله، وجه برای مجری آزاد می‌شود.",
            amount: proposal?.proposedPrice ?? 0,
            durationDays: proposal?.proposedDays ?? undefined
          }
        ]
      });
    },
    onSuccess: () => {
      setMessage("پیشنهاد پذیرفته شد و قرارداد ساخته شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "پذیرش پیشنهاد ناموفق بود"))
  });

  const counterOfferMutation = useMutation({
    mutationFn: ({ proposalId, counterPrice, counterDays, message }: { proposalId: number; counterPrice: number; counterDays: number; message?: string }) =>
      createProposalCounterOffer(proposalId, { counterPrice, counterDays, message }),
    onSuccess: () => {
      setMessage("پیشنهاد اصلاح قیمت/زمان برای مجری ارسال شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ارسال پیشنهاد اصلاحی ناموفق بود"))
  });

  const respondCounterOfferMutation = useMutation({
    mutationFn: ({ proposalId, accepted, message }: { proposalId: number; accepted: boolean; message?: string }) =>
      respondProposalCounterOffer(proposalId, { accepted, message }),
    onSuccess: () => {
      setMessage("پاسخ شما به پیشنهاد اصلاحی ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت پاسخ مذاکره ناموفق بود"))
  });

  const holdEscrowMutation = useMutation({
    mutationFn: ({ milestoneId }: { milestoneId: number }) => {
      const walletId = getEntityId(walletQuery.data?.result);
      if (!walletId) {
        throw new Error("کیف پول کارفرما پیدا نشد.");
      }
      return holdMilestoneEscrow(milestoneId, { payerWalletId: walletId });
    },
    onSuccess: () => {
      setMessage("وجه مرحله در Escrow نگهداری شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت Escrow ناموفق بود"))
  });

  const releaseEscrowMutation = useMutation({
    mutationFn: ({ milestoneId, escrowId }: { milestoneId: number; escrowId: number }) => releaseMilestoneEscrow(milestoneId, escrowId),
    onSuccess: () => {
      setMessage("وجه مرحله آزاد شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "آزادسازی وجه ناموفق بود"))
  });

  const refundEscrowMutation = useMutation({
    mutationFn: ({ milestoneId, escrowId }: { milestoneId: number; escrowId: number }) => refundMilestoneEscrow(milestoneId, escrowId),
    onSuccess: () => {
      setMessage("وجه مرحله برگشت داده شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "برگشت وجه ناموفق بود"))
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: ({ milestoneId, note, fileUploadId }: { milestoneId: number; note: string; fileUploadId?: number }) => submitMilestoneDeliverable(milestoneId, { note, fileUploadId }),
    onSuccess: () => {
      setMessage("تحویل مرحله ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت تحویل ناموفق بود"))
  });

  const approveDeliverableMutation = useMutation({
    mutationFn: (deliverableId: number) => approveDeliverable(deliverableId),
    onSuccess: () => {
      setMessage("تحویل تایید شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "تایید تحویل ناموفق بود"))
  });

  const revisionDeliverableMutation = useMutation({
    mutationFn: ({ deliverableId, note }: { deliverableId: number; note: string }) => requestDeliverableRevision(deliverableId, { note }),
    onSuccess: () => {
      setMessage("درخواست اصلاح ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت درخواست اصلاح ناموفق بود"))
  });

  const timesheetMutation = useMutation({
    mutationFn: ({ contractId, date, minutes, description }: { contractId: number; date: string; minutes: number; description?: string }) =>
      addContractTimesheet(contractId, { date, minutes, description }),
    onSuccess: () => {
      setMessage("تایم‌شیت ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت تایم‌شیت ناموفق بود"))
  });

  const timesheetStatusMutation = useMutation({
    mutationFn: ({ timesheetId, status }: { timesheetId: number; status: string }) => updateTimesheetStatus(timesheetId, status),
    onSuccess: () => {
      setMessage("وضعیت تایم‌شیت به‌روزرسانی شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "تغییر وضعیت تایم‌شیت ناموفق بود"))
  });

  const completeContractMutation = useMutation({
    mutationFn: (contractId: number) => completeProjectContract(contractId, { addToContractorPortfolio: true }),
    onSuccess: () => {
      setMessage("پروژه مختومه شد و نمونه‌کار مجری ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "اختتام پروژه ناموفق بود"))
  });

  const reviewMutation = useMutation({
    mutationFn: ({ contractId, targetUserId, rating, comment }: { contractId: number; targetUserId: number; rating: number; comment?: string }) =>
      createProjectReview({
        targetType: "User",
        targetId: targetUserId,
        contextType: "Contract",
        contextId: contractId,
        rating,
        comment
      }),
    onSuccess: () => {
      setMessage("امتیاز پروژه ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت امتیاز ناموفق بود"))
  });

  const attachDocumentMutation = useMutation({
    mutationFn: ({ projectId, fileUploadId, title, note }: { projectId: number; fileUploadId: number; title?: string; note?: string }) =>
      attachProjectDocument(projectId, { fileUploadId, title, note }),
    onSuccess: () => {
      setMessage("مستند پروژه ثبت شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت مستند ناموفق بود"))
  });

  const messageMutation = useMutation({
    mutationFn: ({ projectId, text, fileUploadId }: { projectId: number; text?: string; fileUploadId?: number }) => sendProjectMessage(projectId, { text, fileUploadId }),
    onSuccess: () => {
      setMessage("پیام ارسال شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ارسال پیام ناموفق بود"))
  });

  const disputeMutation = useMutation({
    mutationFn: ({ projectId, title, description, reason, milestoneId, fileUploadId }: { projectId: number; title: string; description?: string; reason: "Technical" | "Financial" | "Timeline" | "Quality" | "Scope" | "Other"; milestoneId?: number; fileUploadId?: number }) =>
      openProjectDispute(projectId, { title, description, reason, milestoneId, fileUploadId }),
    onSuccess: () => {
      setMessage("اختلاف پروژه ثبت شد و پرداخت مرحله مرتبط متوقف شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت اختلاف ناموفق بود"))
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: ({ disputeId, decisionType, decisionText, releaseAmount, refundAmount }: { disputeId: number; decisionType: "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction"; decisionText?: string; releaseAmount?: number; refundAmount?: number }) =>
      resolveProjectDispute(disputeId, { decisionType, decisionText, releaseAmount, refundAmount, executeFinancialDecision: true }),
    onSuccess: () => {
      setMessage("رأی داوری ثبت و اجرا شد.");
      refreshSelected();
    },
    onError: (err) => setMessage(getErrorMessage(err, "ثبت رأی داوری ناموفق بود"))
  });

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!projectCategoryId) {
      setMessage("دسته پروژه را انتخاب کنید. اگر لیست خالی است، از پنل مدیریت یک دسته پروژه بسازید.");
      return;
    }
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      title: String(form.get("title") || ""),
      description: projectDescription,
      categoryId: Number(projectCategoryId),
      projectType: String(form.get("projectType") || "Fixed") as "Fixed" | "Hourly",
      budgetMin: Number(form.get("budgetMin") || 0) || undefined,
      budgetMax: Number(form.get("budgetMax") || 0) || undefined,
      currency: "IRR",
      timelineDays: Number(form.get("timelineDays") || 0) || undefined,
      deadlineAt: persianDateTimeToLocalIso(projectDeadline) || undefined,
      locationMode: String(form.get("locationMode") || "Remote") as "Remote" | "OnSite" | "Hybrid",
      skillTagIds: projectSkillIds
    });
    setProjectDescription("");
    setProjectCategoryId("");
    setProjectSkillIds([]);
    setProjectDeadline("");
    event.currentTarget.reset();
  }

  const projects = projectsQuery.data?.results ?? [];
  const categoryItems = categoriesQuery.data?.results ?? [];
  const projectCategoryItems = categoryItems.filter(isProjectCategory);
  const categoryOptions = (projectCategoryItems.length ? projectCategoryItems : categoryItems)
    .map((item) => ({ value: getCategoryId(item), label: getCategoryName(item), description: getCategoryDescription(item) }))
    .filter((item) => item.value > 0);
  const skillOptions = (tagsQuery.data?.results ?? [])
    .map((item) => ({ value: getTagId(item), label: getTagName(item) }))
    .filter((item) => item.value > 0);
  const selectedProject = selectedProjectQuery.data?.result;
  const currentUserId = user?.id ?? 0;
  const isEmployer = selectedProject ? Number(selectedProject.employerUserId) === currentUserId : false;
  const isContractor = selectedProject?.contract?.contractorUserId ? Number(selectedProject.contract.contractorUserId) === currentUserId : false;

  const myProposals = myProposalsQuery.data?.results ?? [];
  const employerStats = getEmployerProjectStats(projects);

  return (
    <div className="grid gap-5">
      <section className="dashboard-card p-3">
        <div className="grid gap-2 md:grid-cols-2">
          <button type="button" onClick={() => { setWorkspace("employer"); setSelectedProjectId(null); }} className={`rounded-md px-4 py-3 text-sm font-black ${workspace === "employer" ? "bg-primary text-white" : "bg-background text-muted"}`}>
            میز کار کارفرما
          </button>
          <button type="button" onClick={() => { setWorkspace("contractor"); setSelectedProjectId(null); }} className={`rounded-md px-4 py-3 text-sm font-black ${workspace === "contractor" ? "bg-primary text-white" : "bg-background text-muted"}`}>
            میز کار مجری
          </button>
        </div>
      </section>

      {workspace === "contractor" ? (
        <ContractorWorkspace
          proposals={myProposals}
          loading={myProposalsQuery.isLoading}
          responding={respondCounterOfferMutation.isPending}
          onSelectProject={(projectId) => setSelectedProjectId(projectId)}
          onRespond={(proposalId, accepted, text) => respondCounterOfferMutation.mutate({ proposalId, accepted, message: text })}
        />
      ) : null}

      {workspace === "employer" ? (
        <div className="grid gap-5">
          <section className="dashboard-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <SectionTitle title="میز کار کارفرما" help="اینجا پروژه‌های ثبت‌شده، پیشنهادهای دریافتی، قرارداد فعال، تحویل‌ها و اختلاف‌های همان پروژه را مدیریت می‌کنید. ثبت پروژه جدید از دکمه جداگانه باز می‌شود تا صفحه شلوغ نشود." />
                <p className="mt-2 text-sm leading-7 text-muted">ابتدا پروژه را از ستون فهرست انتخاب کنید؛ عملیات همان پروژه در سمت مقابل نمایش داده می‌شود.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateProjectOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white"
              >
                <Plus className="size-4" />
                ثبت پروژه جدید
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <EmployerMetric label="کل پروژه‌ها" value={employerStats.total} />
              <EmployerMetric label="پیش‌نویس" value={employerStats.draft} />
              <EmployerMetric label="در مناقصه" value={employerStats.bidding} />
              <EmployerMetric label="قرارداددار" value={employerStats.contracts} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ProjectMiniBar label="آماده انتشار" value={employerStats.total ? (employerStats.draft / employerStats.total) * 100 : 0} />
              <ProjectMiniBar label="در جذب پیشنهاد" value={employerStats.total ? (employerStats.bidding / employerStats.total) * 100 : 0} />
              <ProjectMiniBar label="قرارداد فعال/تمام‌شده" value={employerStats.total ? (employerStats.contracts / employerStats.total) * 100 : 0} />
            </div>
            {message ? <div className="mt-4 rounded-md bg-background/80 px-3 py-2 text-sm text-muted">{message}</div> : null}
          </section>

          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <section className="dashboard-card p-5">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle title="پروژه‌های من" help="یک پروژه را انتخاب کنید تا پیشنهادها، قرارداد و عملیات اجرایی آن در پنل سمت مقابل نمایش داده شود." />
                {projectsQuery.isLoading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
              </div>
              <div className="mt-4 grid gap-3">
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    selected={selectedProjectId === Number(project.id)}
                    onSelect={() => setSelectedProjectId(Number(project.id))}
                    onPublish={() => publishMutation.mutate(Number(project.id))}
                    onEdit={() => setEditingProject(project)}
                    publishing={publishMutation.isPending}
                  />
                ))}
                {!projectsQuery.isLoading && !projects.length ? (
                  <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm leading-7 text-muted">
                    هنوز پروژه‌ای ثبت نکرده‌اید.
                    <button type="button" onClick={() => setCreateProjectOpen(true)} className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white">
                      <Plus className="size-4" />
                      ثبت اولین پروژه
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="dashboard-card p-5">
              {!selectedProject && !selectedProjectQuery.isFetching ? (
                <EmptyProjectWorkspace onCreate={() => setCreateProjectOpen(true)} />
              ) : null}

        {selectedProjectQuery.isFetching && selectedProjectId ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}

        {selectedProject ? (
          <div className="grid gap-5">
            <SelectedProjectHeader project={selectedProject} />
            {selectedProject.contract ? (
              <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-7 text-primary">
                برای این پروژه قرارداد ساخته شده است؛ ارسال و پذیرش پیشنهاد جدید بسته شده و ادامه کار از بخش قرارداد فعال انجام می‌شود.
              </div>
            ) : null}

            <ProposalPanel
              proposals={selectedProject.proposals}
              hasContract={Boolean(selectedProject.contract)}
              disabled={acceptMutation.isPending}
              onAccept={(proposalId) => acceptMutation.mutate(proposalId)}
              onCounterOffer={(proposalId, counterPrice, counterDays, text) => counterOfferMutation.mutate({ proposalId, counterPrice, counterDays, message: text })}
            />

            {selectedProject.contract ? (
              <ContractPanel
                contract={selectedProject.contract}
                isEmployer={isEmployer}
                isContractor={isContractor}
                onHoldEscrow={(milestoneId) => holdEscrowMutation.mutate({ milestoneId })}
                onReleaseEscrow={(milestoneId, escrowId) => releaseEscrowMutation.mutate({ milestoneId, escrowId })}
                onRefundEscrow={(milestoneId, escrowId) => refundEscrowMutation.mutate({ milestoneId, escrowId })}
                onSubmitDeliverable={async (milestoneId, note, file) => {
                  const uploaded = file ? await uploadProjectFile(file, { entityType: "ProjectDeliverable", foreignKeyId: milestoneId, tag: "تحویل مرحله" }) : null;
                  if (file && !uploaded?.result) {
                    throw new Error("آپلود فایل تحویل ناموفق بود.");
                  }
                  submitDeliverableMutation.mutate({ milestoneId, note, fileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined });
                }}
                onApproveDeliverable={(deliverableId) => approveDeliverableMutation.mutate(deliverableId)}
                onRequestRevision={(deliverableId, note) => revisionDeliverableMutation.mutate({ deliverableId, note })}
                onAddTimesheet={(date, minutes, description) =>
                  timesheetMutation.mutate({ contractId: Number(selectedProject.contract?.id), date, minutes, description })
                }
                onUpdateTimesheet={(timesheetId, status) => timesheetStatusMutation.mutate({ timesheetId, status })}
                onComplete={(contractId) => completeContractMutation.mutate(contractId)}
                onReview={(contractId, targetUserId, rating, comment) => reviewMutation.mutate({ contractId, targetUserId, rating, comment })}
              />
            ) : null}

            <DocumentsPanel
              documents={documentsQuery.data?.results ?? []}
              onAttach={async (file, title, note) => {
                const uploaded = await uploadProjectFile(file, { entityType: "Project", foreignKeyId: Number(selectedProject.id), tag: title, note });
                if (!uploaded.result) {
                  throw new Error("آپلود فایل ناموفق بود.");
                }
                attachDocumentMutation.mutate({ projectId: Number(selectedProject.id), fileUploadId: Number(uploaded.result.id), title, note });
              }}
            />

            <ConversationPanel
              messages={conversationQuery.data?.result?.messages ?? []}
              loading={conversationQuery.isLoading}
              onSend={async (text, file) => {
                const uploaded = file ? await uploadProjectFile(file, { entityType: "ProjectMessage", foreignKeyId: Number(selectedProject.id) }) : null;
                if (file && !uploaded?.result) {
                  throw new Error("آپلود فایل پیام ناموفق بود.");
                }
                messageMutation.mutate({ projectId: Number(selectedProject.id), text, fileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined });
              }}
            />

            <DisputesPanel
              disputes={disputesQuery.data?.results ?? []}
              milestones={selectedProject.contract?.milestones ?? []}
              loading={disputesQuery.isLoading}
              onOpen={async (title, description, reason, milestoneId, file) => {
                const uploaded = file ? await uploadProjectFile(file, { entityType: "ProjectDispute", foreignKeyId: Number(selectedProject.id) }) : null;
                if (file && !uploaded?.result) {
                  throw new Error("آپلود مستند اختلاف ناموفق بود.");
                }
                disputeMutation.mutate({ projectId: Number(selectedProject.id), title, description, reason, milestoneId, fileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined });
              }}
              onResolve={(disputeId, decisionType, decisionText, releaseAmount, refundAmount) =>
                resolveDisputeMutation.mutate({ disputeId, decisionType, decisionText, releaseAmount, refundAmount })
              }
            />

            <ActivityPanel items={activityQuery.data?.results ?? []} />
          </div>
        ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {createProjectOpen ? (
        <ProjectCreateDialog
          categoryOptions={categoryOptions}
          skillOptions={skillOptions}
          categoryLoading={categoriesQuery.isLoading}
          tagsLoading={tagsQuery.isLoading}
          description={projectDescription}
          categoryId={projectCategoryId}
          skillIds={projectSkillIds}
          deadline={projectDeadline}
          pending={createMutation.isPending}
          onClose={() => setCreateProjectOpen(false)}
          onDescriptionChange={setProjectDescription}
          onCategoryChange={setProjectCategoryId}
          onSkillsChange={setProjectSkillIds}
          onDeadlineChange={setProjectDeadline}
          onSubmit={handleCreate}
        />
      ) : null}

      {editingProject ? (
        <ProjectEditDialog
          project={editingProject}
          categoryOptions={categoryOptions}
          skillOptions={skillOptions}
          pending={updateProjectMutation.isPending}
          onClose={() => setEditingProject(null)}
          onSubmit={(payload) => updateProjectMutation.mutate({ id: Number(editingProject.id), payload })}
        />
      ) : null}

      {workspace === "contractor" && selectedProject ? (
        <section className="dashboard-card p-5">
          <SectionTitle title="مسیر اجرای پروژه انتخاب‌شده" help="بعد از پذیرفته شدن پیشنهاد و ساخت قرارداد، گفتگو، Milestoneها، ثبت تحویل، تایم‌شیت و اختلاف از این بخش قابل انجام است." />
          <div className="mt-4 grid gap-5">
            {selectedProject.contract ? (
              <>
                <ConversationPanel
                  messages={conversationQuery.data?.result?.messages ?? []}
                  loading={conversationQuery.isLoading}
                  onSend={async (text, file) => {
                    const uploaded = file ? await uploadProjectFile(file, { entityType: "ProjectMessage", foreignKeyId: Number(selectedProject.id) }) : null;
                    if (file && !uploaded?.result) {
                      throw new Error("آپلود فایل پیام ناموفق بود.");
                    }
                    messageMutation.mutate({ projectId: Number(selectedProject.id), text, fileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined });
                  }}
                />
                <ContractPanel
                  contract={selectedProject.contract}
                  isEmployer={false}
                  isContractor={isContractor}
                  onHoldEscrow={(milestoneId) => holdEscrowMutation.mutate({ milestoneId })}
                  onReleaseEscrow={(milestoneId, escrowId) => releaseEscrowMutation.mutate({ milestoneId, escrowId })}
                  onRefundEscrow={(milestoneId, escrowId) => refundEscrowMutation.mutate({ milestoneId, escrowId })}
                  onSubmitDeliverable={async (milestoneId, note, file) => {
                    const uploaded = file ? await uploadProjectFile(file, { entityType: "ProjectDeliverable", foreignKeyId: milestoneId, tag: "تحویل مرحله" }) : null;
                    if (file && !uploaded?.result) {
                      throw new Error("آپلود فایل تحویل ناموفق بود.");
                    }
                    submitDeliverableMutation.mutate({ milestoneId, note, fileUploadId: uploaded?.result ? Number(uploaded.result.id) : undefined });
                  }}
                  onApproveDeliverable={(deliverableId) => approveDeliverableMutation.mutate(deliverableId)}
                  onRequestRevision={(deliverableId, note) => revisionDeliverableMutation.mutate({ deliverableId, note })}
                  onAddTimesheet={(date, minutes, description) =>
                    timesheetMutation.mutate({ contractId: Number(selectedProject.contract?.id), date, minutes, description })
                  }
                  onUpdateTimesheet={(timesheetId, status) => timesheetStatusMutation.mutate({ timesheetId, status })}
                  onComplete={(contractId) => completeContractMutation.mutate(contractId)}
                  onReview={(contractId, targetUserId, rating, comment) => reviewMutation.mutate({ contractId, targetUserId, rating, comment })}
                />
              </>
            ) : (
              <div className="rounded-md border border-border bg-background px-4 py-5 text-sm leading-7 text-muted">
                هنوز برای این پیشنهاد قرارداد ساخته نشده است. اگر کارفرما پیشنهاد شما یا پیشنهاد اصلاحی مورد توافق را بپذیرد، مسیر قرارداد و تحویل‌ها اینجا فعال می‌شود.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SelectedProjectHeader({ project }: { project: ProjectSummary }) {
  return (
    <div className="rounded-md border border-border/70 bg-white/78 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-primary">{project.categoryName ?? "پروژه"}</div>
          <h3 className="mt-1 text-xl font-black leading-8">{project.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-background px-2 py-1">{projectStatusLabel(project.status)}</span>
            <span className="rounded-md bg-background px-2 py-1">{formatProjectBudget(project)}</span>
            <span className="rounded-md bg-background px-2 py-1">{(project.proposalsCount ?? 0).toLocaleString("fa-IR")} پیشنهاد</span>
            {project.timelineDays ? <span className="rounded-md bg-background px-2 py-1">{project.timelineDays.toLocaleString("fa-IR")} روز</span> : null}
          </div>
        </div>
      </div>
      {project.skills?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <span key={skill.id} className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
              {skill.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProjectCreateDialog({
  categoryOptions,
  skillOptions,
  categoryLoading,
  tagsLoading,
  description,
  categoryId,
  skillIds,
  deadline,
  pending,
  onClose,
  onDescriptionChange,
  onCategoryChange,
  onSkillsChange,
  onDeadlineChange,
  onSubmit
}: {
  categoryOptions: Array<{ value: number; label: string; description?: string }>;
  skillOptions: Array<{ value: number; label: string }>;
  categoryLoading: boolean;
  tagsLoading: boolean;
  description: string;
  categoryId: number | "";
  skillIds: number[];
  deadline: string;
  pending: boolean;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: number | "") => void;
  onSkillsChange: (value: number[]) => void;
  onDeadlineChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const formId = "project-create-form";

  return (
    <AppModal
      title="ثبت پروژه جدید"
      description="نیاز پروژه، خروجی قابل تحویل، بودجه و زمان‌بندی را شفاف بنویسید تا پیشنهادهای دقیق‌تری بگیرید."
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs leading-6 text-muted">
            <HelpHint text="پروژه ابتدا پیش‌نویس می‌شود. بعد از بررسی متن، بودجه و مهارت‌ها، آن را منتشر کنید تا مجری‌ها بتوانند پیشنهاد ارسال کنند." />
            <span className="min-w-0">بعد از ثبت، پروژه در فهرست پیش‌نویس‌ها قرار می‌گیرد.</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-md border border-border px-4 text-sm font-bold">
              انصراف
            </button>
            <button form={formId} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              ثبت پیش‌نویس
            </button>
          </div>
        </div>
      }
    >
      <form id={formId} className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]" onSubmit={onSubmit}>
        <div className="grid min-w-0 content-start gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-bold text-foreground">عنوان پروژه</span>
            <input className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="title" placeholder="مثلا طراحی داشبورد فروش B2B" required />
          </label>

          <RichTextEditor
            label="توضیحات و معیار پذیرش"
            value={description}
            onChange={onDescriptionChange}
            placeholder="نیاز پروژه، خروجی‌های قابل تحویل، محدودیت‌ها، معیار پذیرش و فایل‌هایی که باید تحویل شوند"
            minHeight={300}
            className="min-w-0"
          />
        </div>

        <aside className="grid min-w-0 content-start gap-4 rounded-md border border-border/70 bg-background/45 p-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">مشخصات پروژه</span>
              <HelpHint text="این بخش برای دسته‌بندی، نوع همکاری و مهارت‌هایی است که مجری‌ها براساس آن پروژه را پیدا می‌کنند." />
            </div>
            <SearchableSelect options={categoryOptions} value={categoryId} onChange={onCategoryChange} placeholder={categoryLoading ? "در حال خواندن دسته‌ها" : "دسته پروژه"} clearable={false} />
            <select className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="projectType" defaultValue="Fixed">
              <option value="Fixed">ثابت</option>
              <option value="Hourly">ساعتی</option>
            </select>
            <MultiSelect options={skillOptions} value={skillIds} onChange={onSkillsChange} placeholder={tagsLoading ? "در حال خواندن مهارت‌ها" : "مهارت‌های مورد نیاز پروژه"} />
          </div>

          <div className="grid gap-3 border-t border-border/70 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">زمان‌بندی پیشنهادی</span>
              <HelpHint text="روز اجرا مدت تقریبی پروژه است. ددلاین آخرین زمانی است که انتظار دارید پروژه یا مرحله اصلی تحویل شود." />
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-bold text-foreground">روز اجرا</span>
              <input className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="timelineDays" type="number" min="1" placeholder="مثلا ۳۰" />
            </label>
            <PersianDateTimeInput label="ددلاین" value={deadline} onChange={onDeadlineChange} popoverAlign="end" />
          </div>

          <div className="grid gap-3 border-t border-border/70 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">بودجه و محل انجام</span>
              <HelpHint text="حداقل و حداکثر بودجه به مجری کمک می‌کند پیشنهاد واقع‌بینانه‌تری بدهد. محل انجام مشخص می‌کند پروژه دورکاری، حضوری یا ترکیبی است." />
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3">
              <input className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="budgetMin" type="number" min="0" placeholder="حداقل" />
              <input className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="budgetMax" type="number" min="0" placeholder="حداکثر" />
            </div>
            <select className="h-11 min-w-0 rounded-md border border-border px-3 focus-ring" name="locationMode" defaultValue="Remote">
              <option value="Remote">دورکاری</option>
              <option value="OnSite">حضوری</option>
              <option value="Hybrid">ترکیبی</option>
            </select>
          </div>
        </aside>
      </form>
    </AppModal>
  );
}

function ProjectRow({
  project,
  selected,
  onSelect,
  onPublish,
  onEdit,
  publishing
}: {
  project: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
  onPublish: () => void;
  onEdit: () => void;
  publishing: boolean;
}) {
  const canPublish = String(project.status) === "Draft" || Number(project.status) === 1;
  const canEdit = ["Draft", "Published", "Bidding", "1", "2", "3"].includes(String(project.status));
  return (
    <div className={`rounded-md border p-3 shadow-panel transition ${selected ? "border-primary bg-primary/5" : "border-border/70 bg-white/78 hover:border-primary/35"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-right">
          <span className="block truncate font-bold text-foreground">{project.title}</span>
          <span className="mt-1 block text-xs text-muted">{project.categoryName ?? "بدون دسته"} - {formatProjectBudget(project)}</span>
        </button>
        <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{projectStatusLabel(project.status)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{project.proposalsCount ?? 0} پیشنهاد</span>
        <div className="flex items-center gap-2">
          {canPublish ? (
            <button type="button" onClick={onPublish} disabled={publishing} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 font-bold hover:bg-slate-50 disabled:opacity-60">
              <Send className="size-3.5" />
              انتشار
            </button>
          ) : null}
          {canEdit ? (
            <button type="button" onClick={onEdit} className="inline-flex h-8 items-center rounded-md border border-border bg-white px-2 font-bold hover:bg-slate-50">
              ویرایش
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProjectEditDialog({
  project,
  categoryOptions,
  skillOptions,
  pending,
  onClose,
  onSubmit
}: {
  project: ProjectSummary;
  categoryOptions: Array<{ value: number; label: string; description?: string }>;
  skillOptions: Array<{ value: number; label: string }>;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: ProjectCreatePayload) => void;
}) {
  const [description, setDescription] = useState(project.description ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(Number(project.categoryId ?? 0) || "");
  const [skillIds, setSkillIds] = useState<number[]>((project.skills ?? []).map((item) => Number(item.id)).filter(Boolean));
  const [deadline, setDeadline] = useState(project.deadlineAt ? new Date(project.deadlineAt).toISOString().slice(0, 16) : "");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="text-lg font-black">ویرایش پروژه</h3>
            <p className="mt-1 text-sm text-muted">ویرایش فقط تا قبل از ساخت قرارداد مجاز است.</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md border border-border">
            <X className="size-4" />
          </button>
        </div>
        <form
          className="grid gap-3 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            onSubmit({
              title: String(form.get("title") || ""),
              description,
              categoryId: Number(categoryId || project.categoryId || 0),
              projectType: String(form.get("projectType") || "Fixed") as "Fixed" | "Hourly",
              budgetMin: Number(form.get("budgetMin") || 0) || undefined,
              budgetMax: Number(form.get("budgetMax") || 0) || undefined,
              currency: project.currency ?? "IRR",
              timelineDays: Number(form.get("timelineDays") || 0) || undefined,
              deadlineAt: deadline ? new Date(deadline).toISOString() : undefined,
              locationMode: String(form.get("locationMode") || "Remote") as "Remote" | "OnSite" | "Hybrid",
              skillTagIds: skillIds
            });
          }}
        >
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="title" defaultValue={project.title} placeholder="عنوان پروژه" required />
          <RichTextEditor value={description} onChange={setDescription} placeholder="توضیح پروژه" minHeight={140} />
          <div className="grid gap-3 md:grid-cols-2">
            <SearchableSelect options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="دسته پروژه را دوباره انتخاب کنید" clearable={false} />
            <select className="h-11 rounded-md border border-border px-3 focus-ring" name="projectType" defaultValue={String(project.projectType) === "Hourly" || Number(project.projectType) === 2 ? "Hourly" : "Fixed"}>
              <option value="Fixed">ثابت</option>
              <option value="Hourly">ساعتی</option>
            </select>
          </div>
          <MultiSelect options={skillOptions} value={skillIds} onChange={setSkillIds} placeholder="مهارت‌های مورد نیاز پروژه" />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="timelineDays" type="number" min="1" defaultValue={project.timelineDays ?? ""} placeholder="روز" />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="budgetMin" type="number" min="0" defaultValue={project.budgetMin ?? ""} placeholder="بودجه حداقل" />
            <input className="h-11 rounded-md border border-border px-3 focus-ring" name="budgetMax" type="number" min="0" defaultValue={project.budgetMax ?? ""} placeholder="بودجه حداکثر" />
          </div>
          <select className="h-11 rounded-md border border-border px-3 focus-ring" name="locationMode" defaultValue={String(project.locationMode) === "OnSite" || Number(project.locationMode) === 2 ? "OnSite" : String(project.locationMode) === "Hybrid" || Number(project.locationMode) === 3 ? "Hybrid" : "Remote"}>
            <option value="Remote">دورکاری</option>
            <option value="OnSite">حضوری</option>
            <option value="Hybrid">ترکیبی</option>
          </select>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={pending || !categoryId}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            ذخیره ویرایش
          </button>
        </form>
      </section>
    </div>
  );
}

function projectStatusLabel(value: string | number) {
  const labels: Record<string, string> = {
    Draft: "پیش‌نویس",
    Published: "منتشر شده",
    Bidding: "در مناقصه",
    Assigned: "واگذار شده / قرارداددار",
    InProgress: "در حال اجرا",
    Done: "تمام شده",
    Cancelled: "لغو شده",
    Disputed: "دارای اختلاف",
    "1": "پیش‌نویس",
    "2": "منتشر شده",
    "3": "در مناقصه",
    "4": "واگذار شده / قرارداددار",
    "5": "در حال اجرا",
    "6": "تمام شده",
    "7": "لغو شده",
    "8": "دارای اختلاف"
  };
  return labels[String(value)] ?? String(value);
}

function getEmployerProjectStats(projects: ProjectSummary[]) {
  return {
    total: projects.length,
    draft: projects.filter((item) => String(item.status) === "Draft" || Number(item.status) === 1).length,
    bidding: projects.filter((item) => ["Published", "Bidding", "2", "3"].includes(String(item.status))).length,
    contracts: projects.filter((item) => ["Assigned", "InProgress", "Done", "Disputed", "4", "5", "6", "8"].includes(String(item.status))).length
  };
}

function formatProjectBudget(project: Pick<ProjectSummary, "budgetMin" | "budgetMax" | "currency">) {
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
  return "بودجه توافقی";
}

function formatMilestoneDueLabel(milestone: MilestoneSummary) {
  if (typeof milestone.daysRemaining === "number") {
    if (milestone.daysRemaining > 0) {
      return `${milestone.daysRemaining.toLocaleString("fa-IR")} روز مانده`;
    }
    if (milestone.daysRemaining === 0) {
      return "مهلت امروز";
    }
    return `${Math.abs(milestone.daysRemaining).toLocaleString("fa-IR")} روز دیرکرد`;
  }

  if (milestone.dueAt) {
    const due = new Date(milestone.dueAt);
    const today = new Date();
    const diffDays = Math.ceil((startOfDay(due).getTime() - startOfDay(today).getTime()) / 86_400_000);
    if (diffDays > 0) {
      return `${diffDays.toLocaleString("fa-IR")} روز مانده`;
    }
    if (diffDays === 0) {
      return "مهلت امروز";
    }
    return `${Math.abs(diffDays).toLocaleString("fa-IR")} روز دیرکرد`;
  }

  return milestone.durationDays ? `${milestone.durationDays.toLocaleString("fa-IR")} روز برنامه‌ریزی` : "";
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function SectionTitle({ title, help }: { title: string; help: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-black">{title}</h2>
      <HelpHint text={help} />
    </div>
  );
}

function HelpHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-grid size-7 place-items-center rounded-md border border-border bg-white text-muted">
      <HelpCircle className="size-4" />
      <span className="pointer-events-none absolute right-0 top-full z-40 mt-2 hidden w-72 rounded-md border border-border bg-white p-3 text-xs leading-6 text-muted shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

function ContractorWorkspace({
  proposals,
  loading,
  responding,
  onSelectProject,
  onRespond
}: {
  proposals: ProposalSummary[];
  loading: boolean;
  responding: boolean;
  onSelectProject: (projectId: number) => void;
  onRespond: (proposalId: number, accepted: boolean, message?: string) => void;
}) {
  return (
    <section className="dashboard-card p-5">
      <SectionTitle
        title="پیشنهادها و کارهای من"
        help="اینجا همه پیشنهادهایی که برای پروژه‌ها ارسال کرده‌اید دیده می‌شود. اگر کارفرما قیمت یا زمان جدید پیشنهاد کند، از همین کارت قبول یا رد می‌کنید. بعد از ساخت قرارداد، پروژه را انتخاب کنید تا گفتگو، تحویل و تایم‌شیت فعال شود."
      />
      {loading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {proposals.map((proposal) => (
          <ProposalWorkCard
            key={proposal.id}
            proposal={proposal}
            responding={responding}
            onSelectProject={() => onSelectProject(Number(proposal.projectId))}
            onRespond={(accepted, text) => onRespond(Number(proposal.id), accepted, text)}
          />
        ))}
        {!loading && !proposals.length ? (
          <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted">هنوز پیشنهادی برای پروژه‌ها ارسال نکرده‌اید.</div>
        ) : null}
      </div>
    </section>
  );
}

function ProposalWorkCard({
  proposal,
  responding,
  onSelectProject,
  onRespond
}: {
  proposal: ProposalSummary;
  responding: boolean;
  onSelectProject: () => void;
  onRespond: (accepted: boolean, message?: string) => void;
}) {
  const hasActiveCounter = proposal.counterPrice && proposal.counterDays && !proposal.counterAcceptedAt && !proposal.counterRejectedAt && !proposal.projectHasContract;
  return (
    <div className="rounded-md border border-border bg-white p-4 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-primary">{proposalStatusLabel(proposal.status)}</div>
          <h3 className="mt-1 font-black">{proposal.projectTitle ?? `پروژه ${proposal.projectId}`}</h3>
        </div>
        <button type="button" onClick={onSelectProject} disabled={!proposal.projectHasContract} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:bg-background disabled:cursor-not-allowed disabled:opacity-45">
          {proposal.projectHasContract ? "مدیریت مسیر" : "در انتظار قرارداد"}
        </button>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted">
        <div>پیشنهاد شما: {proposal.proposedPrice.toLocaleString("fa-IR")} IRR / {proposal.proposedDays} روز</div>
        <div>وضعیت پروژه: {proposal.projectHasContract ? "قرارداد بسته شده" : projectStatusLabel(proposal.projectStatus ?? "")}</div>
      </div>
      {hasActiveCounter ? (
        <form
          className="mt-4 rounded-md bg-primary/5 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            onRespond(true, String(form.get("message") || ""));
          }}
        >
          <div className="font-bold text-primary">پیشنهاد اصلاحی کارفرما</div>
          <div className="mt-2 text-sm text-muted">{proposal.counterPrice?.toLocaleString("fa-IR")} IRR / {proposal.counterDays} روز</div>
          {proposal.counterMessage ? <p className="mt-2 text-xs leading-6 text-muted">{proposal.counterMessage}</p> : null}
          <input className="mt-3 h-9 w-full rounded-md border border-border px-3 text-xs focus-ring" name="message" placeholder="پیام اختیاری برای کارفرما" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="inline-flex h-9 items-center gap-1 rounded-md bg-accent px-3 text-xs font-bold text-white disabled:opacity-60" disabled={responding}>
              <Check className="size-4" />
              قبول اصلاحیه
            </button>
            <button type="button" onClick={() => onRespond(false)} disabled={responding} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-60">
              <X className="size-4" />
              رد اصلاحیه
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function proposalStatusLabel(value: string | number) {
  const labels: Record<string, string> = {
    Sent: "ارسال شده",
    Withdrawn: "انصراف داده شده",
    Shortlisted: "در حال مذاکره / منتخب اولیه",
    Rejected: "رد شده",
    Accepted: "پذیرفته شده",
    "1": "ارسال شده",
    "2": "انصراف داده شده",
    "3": "در حال مذاکره / منتخب اولیه",
    "4": "رد شده",
    "5": "پذیرفته شده"
  };
  return labels[String(value)] ?? String(value);
}

function ProposalPanel({
  proposals,
  hasContract,
  disabled,
  onAccept,
  onCounterOffer
}: {
  proposals: ProposalSummary[];
  hasContract: boolean;
  disabled: boolean;
  onAccept: (proposalId: number) => void;
  onCounterOffer: (proposalId: number, counterPrice: number, counterDays: number, text?: string) => void;
}) {
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
  const profileQuery = useQuery({
    queryKey: queryKeys.users.projectProfile(profileUserId),
    queryFn: () => getUserProjectProfile(profileUserId ?? 0),
    enabled: Boolean(profileUserId)
  });

  return (
    <div className="rounded-md border border-border/70 bg-white/72 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-black">پیشنهادهای پروژه</h3>
        {hasContract ? <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">قرارداد برای این پروژه ساخته شده است</span> : null}
      </div>
      {hasContract ? <p className="mt-2 text-xs leading-6 text-muted">بعد از ساخت قرارداد، پذیرش پیشنهاد جدید بسته می‌شود و ادامه کار از بخش قرارداد فعال انجام می‌شود.</p> : null}
      <div className="mt-3 grid gap-2">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="rounded-md bg-background/75 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{proposal.freelancerName ?? `کاربر ${proposal.freelancerUserId}`}</span>
              <span>{proposal.proposedPrice.toLocaleString("fa-IR")} IRR / {proposal.proposedDays} روز</span>
            </div>
            {proposal.coverLetter ? <p className="mt-2 leading-7 text-muted">{proposal.coverLetter}</p> : null}
            {proposal.counterOfferAt ? (
              <div className="mt-3 rounded-md bg-primary/5 px-3 py-2 text-xs leading-6 text-primary">
                پیشنهاد اصلاحی: {proposal.counterPrice?.toLocaleString("fa-IR")} IRR / {proposal.counterDays} روز
                {proposal.counterAcceptedAt ? " - پذیرفته شده" : proposal.counterRejectedAt ? " - رد شده" : " - در انتظار پاسخ مجری"}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setProfileUserId(Number(proposal.freelancerUserId))}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold"
              >
                <ShieldCheck className="size-4" />
                پروفایل مجری
              </button>
              {proposal.resumeFileUrl ? (
                <a className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold" href={proposal.resumeFileUrl} target="_blank" rel="noreferrer">
                  <FileText className="size-4" />
                  {proposal.resumeFileName ?? "رزومه / نمونه‌کار"}
                </a>
              ) : null}
              {hasContract ? (
                <span className="inline-flex h-9 items-center rounded-md bg-white px-3 text-xs font-bold text-muted">پذیرش بسته شده</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onAccept(Number(proposal.id))}
                  disabled={disabled || String(proposal.status).toLowerCase() === "accepted" || Number(proposal.status) === 5}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-xs font-bold text-white disabled:opacity-60"
                >
                  <Check className="size-4" />
                  پذیرش و ساخت قرارداد
                </button>
              )}
            </div>
            {!hasContract ? (
              <form
                className="mt-3 grid gap-2 md:grid-cols-[1fr_100px_minmax(0,1fr)_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  onCounterOffer(
                    Number(proposal.id),
                    Number(form.get("counterPrice") || 0),
                    Number(form.get("counterDays") || 0),
                    String(form.get("counterMessage") || "")
                  );
                  event.currentTarget.reset();
                }}
              >
                <input className="h-9 rounded-md border border-border bg-white px-2 text-xs focus-ring" name="counterPrice" type="number" min="1" placeholder="مبلغ پیشنهادی شما" required />
                <input className="h-9 rounded-md border border-border bg-white px-2 text-xs focus-ring" name="counterDays" type="number" min="1" placeholder="روز" required />
                <input className="h-9 rounded-md border border-border bg-white px-2 text-xs focus-ring" name="counterMessage" placeholder="توضیح مذاکره" />
                <button className="inline-flex h-9 items-center gap-1 rounded-md border border-primary/30 px-3 text-xs font-bold text-primary">
                  <MessageSquare className="size-4" />
                  مذاکره
                </button>
              </form>
            ) : null}
          </div>
        ))}
        {!proposals.length ? <div className="text-sm text-muted">هنوز پیشنهادی ثبت نشده است.</div> : null}
      </div>
      {profileUserId ? (
        <ProposerProfileDialog
          profile={profileQuery.data ?? null}
          loading={profileQuery.isLoading}
          onClose={() => setProfileUserId(null)}
        />
      ) : null}
    </div>
  );
}

function ProposerProfileDialog({
  profile,
  loading,
  onClose
}: {
  profile: UserProjectProfile | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 className="text-lg font-black">پروفایل مجری</h3>
            <p className="mt-1 text-sm text-muted">مهارت‌ها، رزومه و سابقه همکاری کاربر</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md border border-border">
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
          {profile ? (
            <>
              <div className="rounded-md border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-black">{profile.displayName || `کاربر ${profile.userId}`}</div>
                    <div className="mt-2 text-xs text-muted">
                      {profile.email ?? "ایمیل ثبت نشده"} {profile.mobileNumber ? `- ${profile.mobileNumber}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-white px-2 py-1">پروژه موفق: {profile.completedProjectsCount.toLocaleString("fa-IR")}</span>
                    <span className="rounded-md bg-white px-2 py-1">اعتماد: {Number(profile.trustScore ?? 0).toLocaleString("fa-IR")}</span>
                    <span className="rounded-md bg-white px-2 py-1">{profile.isVerified ? "احراز شده" : "احراز نشده"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-black">مهارت‌ها</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill.id} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{skill.name}</span>
                  ))}
                  {!profile.skills.length ? <span className="text-sm text-muted">مهارتی ثبت نشده است.</span> : null}
                </div>
              </div>
              {profile.resumeFileUrl ? (
                <a className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-border px-3 text-sm font-bold" href={profile.resumeFileUrl} target="_blank" rel="noreferrer">
                  <FileText className="size-4" />
                  مشاهده رزومه عمومی
                </a>
              ) : null}
              <div>
                <h4 className="font-black">نمونه‌کارها</h4>
                <div className="mt-2 grid gap-2">
                  {profile.portfolioItems.map((item) => (
                    <div key={item.id} className="rounded-md bg-background/75 p-3 text-sm">
                      <div className="font-bold">{item.title}</div>
                      {item.description ? <p className="mt-1 text-xs leading-6 text-muted">{item.description}</p> : null}
                      {item.externalUrl ? <a className="mt-2 inline-block text-xs font-bold text-primary" href={item.externalUrl} target="_blank" rel="noreferrer">لینک نمونه‌کار</a> : null}
                    </div>
                  ))}
                  {!profile.portfolioItems.length ? <div className="text-sm text-muted">نمونه‌کاری ثبت نشده است.</div> : null}
                </div>
              </div>
            </>
          ) : !loading ? (
            <div className="text-sm text-muted">پروفایل مجری پیدا نشد.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ContractPanel({
  contract,
  isEmployer,
  isContractor,
  onHoldEscrow,
  onReleaseEscrow,
  onRefundEscrow,
  onSubmitDeliverable,
  onApproveDeliverable,
  onRequestRevision,
  onAddTimesheet,
  onUpdateTimesheet,
  onComplete,
  onReview
}: {
  contract: ContractSummary;
  isEmployer: boolean;
  isContractor: boolean;
  onHoldEscrow: (milestoneId: number) => void;
  onReleaseEscrow: (milestoneId: number, escrowId: number) => void;
  onRefundEscrow: (milestoneId: number, escrowId: number) => void;
  onSubmitDeliverable: (milestoneId: number, note: string, file?: File) => void | Promise<void>;
  onApproveDeliverable: (deliverableId: number) => void;
  onRequestRevision: (deliverableId: number, note: string) => void;
  onAddTimesheet: (date: string, minutes: number, description?: string) => void;
  onUpdateTimesheet: (timesheetId: number, status: string) => void;
  onComplete: (contractId: number) => void;
  onReview: (contractId: number, targetUserId: number, rating: number, comment?: string) => void;
}) {
  const allMilestonesApproved = contract.milestones.length > 0 && contract.milestones.every((item) => String(item.status).toLowerCase() === "approved" || Number(item.status) === 4);
  const isCompleted = String(contract.status).toLowerCase() === "completed" || Number(contract.status) === 3;

  return (
    <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle title="قرارداد فعال" help="قرارداد بعد از پذیرش پیشنهاد ساخته می‌شود. کار پروژه به مرحله‌های قابل تحویل تقسیم می‌شود تا وجه هر مرحله ابتدا نگهداری شود و فقط بعد از تحویل و تایید آزاد شود." />
        <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-primary">{String(contract.status)}</span>
      </div>

      <div className="mt-4 grid gap-3">
        {contract.milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            isEmployer={isEmployer}
            isContractor={isContractor}
            onHoldEscrow={onHoldEscrow}
            onReleaseEscrow={onReleaseEscrow}
            onRefundEscrow={onRefundEscrow}
            onSubmitDeliverable={onSubmitDeliverable}
            onApproveDeliverable={onApproveDeliverable}
            onRequestRevision={onRequestRevision}
          />
        ))}
      </div>

      <TimesheetPanel
        timesheets={contract.timesheets ?? []}
        isEmployer={isEmployer}
        onAddTimesheet={onAddTimesheet}
        onUpdateTimesheet={onUpdateTimesheet}
      />

      <div className="mt-5 rounded-md border border-border bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-black">اختتام و امتیازدهی پروژه</h4>
            <p className="mt-1 text-xs text-muted">اختتام فقط بعد از تایید همه Milestoneها فعال می‌شود.</p>
          </div>
          {isEmployer ? (
            <button
              type="button"
              disabled={!allMilestonesApproved || isCompleted}
              onClick={() => onComplete(Number(contract.id))}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-45"
            >
              <ShieldCheck className="size-4" />
              اختتام پروژه
            </button>
          ) : null}
        </div>

        {isCompleted ? (
          <ReviewForm
            contractId={Number(contract.id)}
            targetUserId={Number(isEmployer ? contract.contractorUserId : contract.employerUserId)}
            onReview={onReview}
          />
        ) : null}
      </div>
    </div>
  );
}

function ReviewForm({
  contractId,
  targetUserId,
  onReview
}: {
  contractId: number;
  targetUserId: number;
  onReview: (contractId: number, targetUserId: number, rating: number, comment?: string) => void;
}) {
  if (!targetUserId) {
    return null;
  }

  return (
    <form
      className="mt-3 grid gap-2 md:grid-cols-[110px_minmax(0,1fr)_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onReview(contractId, targetUserId, Number(form.get("rating") || 5), String(form.get("comment") || ""));
        event.currentTarget.reset();
      }}
    >
      <select className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="rating" defaultValue="5">
        <option value="5">۵ ستاره</option>
        <option value="4">۴ ستاره</option>
        <option value="3">۳ ستاره</option>
        <option value="2">۲ ستاره</option>
        <option value="1">۱ ستاره</option>
      </select>
      <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="comment" placeholder="نظر شما درباره همکاری" />
      <button className="inline-flex h-9 items-center gap-1 rounded-md bg-accent px-3 text-xs font-bold text-white">
        <Check className="size-4" />
        ثبت امتیاز
      </button>
    </form>
  );
}

function MilestoneCard({
  milestone,
  isEmployer,
  isContractor,
  onHoldEscrow,
  onReleaseEscrow,
  onRefundEscrow,
  onSubmitDeliverable,
  onApproveDeliverable,
  onRequestRevision
}: {
  milestone: MilestoneSummary;
  isEmployer: boolean;
  isContractor: boolean;
  onHoldEscrow: (milestoneId: number) => void;
  onReleaseEscrow: (milestoneId: number, escrowId: number) => void;
  onRefundEscrow: (milestoneId: number, escrowId: number) => void;
  onSubmitDeliverable: (milestoneId: number, note: string, file?: File) => void | Promise<void>;
  onApproveDeliverable: (deliverableId: number) => void;
  onRequestRevision: (deliverableId: number, note: string) => void;
}) {
  const heldEscrow = milestone.escrows?.find((item) => String(item.status).toLowerCase() === "held" || Number(item.status) === 1);
  const hasAnyEscrow = Boolean(milestone.escrows?.length);
  const dueLabel = formatMilestoneDueLabel(milestone);

  return (
    <div className={`rounded-md border bg-white p-4 ${milestone.isOverdue ? "border-danger/35" : "border-border"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-bold">{milestone.title}</div>
            <HelpHint text="Milestone یعنی یک مرحله قابل تحویل از قرارداد. کارفرما قبل از شروع یا هنگام شروع، مبلغ این مرحله را نگهداری می‌کند؛ مجری خروجی را تحویل می‌دهد؛ بعد از تایید، وجه همان مرحله آزاد می‌شود." />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-background px-2 py-1">{milestone.amount.toLocaleString("fa-IR")} IRR</span>
            {milestone.durationDays ? <span className="rounded-md bg-background px-2 py-1">{milestone.durationDays.toLocaleString("fa-IR")} روز اجرا</span> : null}
            {dueLabel ? <span className={`rounded-md px-2 py-1 ${milestone.isOverdue ? "bg-danger/10 text-danger" : "bg-background text-muted"}`}>{dueLabel}</span> : null}
          </div>
          {milestone.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{milestone.description}</p> : null}
        </div>
        <span className="rounded-md bg-background px-2 py-1 text-xs text-muted">{String(milestone.status)}</span>
      </div>

      {isEmployer ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={hasAnyEscrow}
            onClick={() => onHoldEscrow(Number(milestone.id))}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-45"
          >
            <WalletCards className="size-4" />
            {hasAnyEscrow ? "وجه این مرحله ثبت شده" : "نگهداری وجه این مرحله"}
          </button>
          <HelpHint text="با این دکمه مبلغ همین مرحله از کیف پول کارفرما کم و در حساب امانی نگهداری می‌شود. سیستم کیف پول مجری را خودش از قرارداد پیدا می‌کند و نیازی به وارد کردن شناسه نیست." />
        </div>
      ) : null}

      {heldEscrow && isEmployer ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onReleaseEscrow(Number(milestone.id), Number(heldEscrow.id))} className="inline-flex h-9 items-center gap-1 rounded-md bg-accent px-3 text-xs font-bold text-white">
            <ShieldCheck className="size-4" />
            آزادسازی وجه
          </button>
          <button type="button" onClick={() => onRefundEscrow(Number(milestone.id), Number(heldEscrow.id))} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold">
            <RotateCcw className="size-4" />
            برگشت وجه
          </button>
        </div>
      ) : null}

      {isContractor ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const file = form.get("file");
            void onSubmitDeliverable(Number(milestone.id), String(form.get("note") || ""), file instanceof File && file.size > 0 ? file : undefined);
            event.currentTarget.reset();
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">تحویل مرحله</span>
            <HelpHint text="وقتی خروجی این مرحله آماده شد، توضیح، لینک مخزن یا فایل تحویل را ثبت کنید. کارفرما همین تحویل را تایید می‌کند یا برای اصلاح برمی‌گرداند." />
          </div>
          <textarea className="min-h-20 rounded-md border border-border px-3 py-2 text-xs focus-ring" name="note" placeholder="توضیح تحویل، لینک مخزن، مسیر دمو یا نکته‌های بررسی" />
          <div className="flex flex-wrap gap-2">
            <input className="h-9 rounded-md border border-border px-2 py-1 text-xs focus-ring" name="file" type="file" />
            <button className="inline-flex h-9 w-fit items-center gap-1 rounded-md bg-accent px-3 text-xs font-bold text-white">
              <FileCheck2 className="size-4" />
              ثبت تحویل
            </button>
          </div>
        </form>
      ) : null}

      <DeliverablesList
        items={milestone.deliverables ?? []}
        isEmployer={isEmployer}
        onApprove={onApproveDeliverable}
        onRevision={onRequestRevision}
      />
    </div>
  );
}

function DeliverablesList({
  items,
  isEmployer,
  onApprove,
  onRevision
}: {
  items: DeliverableSummary[];
  isEmployer: boolean;
  onApprove: (deliverableId: number) => void;
  onRevision: (deliverableId: number, note: string) => void;
}) {
  if (!items.length) {
    return <div className="mt-3 rounded-md bg-background/70 px-3 py-2 text-xs text-muted">هنوز تحویلی برای این مرحله ثبت نشده است.</div>;
  }

  return (
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-md bg-background/75 p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleString("fa-IR") : "تحویل ثبت‌شده"}</span>
            <span>{item.approvedAt ? "تایید شده" : "در انتظار بررسی"}</span>
          </div>
          {item.note ? <p className="mt-2 leading-6 text-muted">{item.note}</p> : null}
          {item.fileUrl ? (
            <a className="mt-2 inline-flex rounded-md border border-border bg-white px-2 py-1 font-bold" href={item.fileUrl} target="_blank" rel="noreferrer">
              {item.fileName ?? "فایل تحویل"}
            </a>
          ) : null}
          {isEmployer && !item.approvedAt ? (
            <div className="mt-3 grid gap-2 md:grid-cols-[auto_minmax(180px,1fr)_auto]">
              <button type="button" onClick={() => onApprove(Number(item.id))} className="inline-flex h-8 items-center gap-1 rounded-md bg-accent px-3 font-bold text-white">
                <Check className="size-4" />
                تایید
              </button>
              <input className="h-8 rounded-md border border-border px-2 focus-ring" id={`revision-${item.id}`} placeholder="دلیل اصلاح" />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(`revision-${item.id}`) as HTMLInputElement | null;
                  onRevision(Number(item.id), input?.value ?? "");
                }}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 font-bold"
              >
                <X className="size-4" />
                اصلاح
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TimesheetPanel({
  timesheets,
  isEmployer,
  onAddTimesheet,
  onUpdateTimesheet
}: {
  timesheets: TimesheetSummary[];
  isEmployer: boolean;
  onAddTimesheet: (date: string, minutes: number, description?: string) => void;
  onUpdateTimesheet: (timesheetId: number, status: string) => void;
}) {
  return (
    <div className="mt-5 rounded-md border border-border bg-white p-3">
      <SectionTitle title="تایم‌شیت و گزارش زمان" help="تایم‌شیت برای ثبت زمان صرف‌شده روی قرارداد است. در پروژه‌های ساعتی یا پروژه‌هایی که کارفرما گزارش زمان می‌خواهد، مجری تاریخ، دقیقه و شرح کار را ثبت می‌کند و کارفرما آن را تایید یا رد می‌کند." />
      <form
        className="mt-3 grid gap-2 md:grid-cols-[150px_120px_minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onAddTimesheet(String(form.get("date") || ""), Number(form.get("minutes") || 0), String(form.get("description") || ""));
          event.currentTarget.reset();
        }}
      >
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="date" type="date" required />
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="minutes" type="number" min="1" max="1440" placeholder="دقیقه" required />
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="description" placeholder="شرح کار" />
        <button className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white">
          <Clock3 className="size-4" />
          ثبت
        </button>
      </form>
      <div className="mt-3 grid gap-2">
        {timesheets.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background/75 px-3 py-2 text-xs">
            <span>{new Date(item.date).toLocaleDateString("fa-IR")} - {item.minutes} دقیقه - {item.userName ?? `کاربر ${item.userId}`}</span>
            <div className="flex items-center gap-2">
              <span>{String(item.status)}</span>
              {isEmployer ? (
                <>
                  <button type="button" onClick={() => onUpdateTimesheet(Number(item.id), "Approved")} className="rounded-md bg-accent px-2 py-1 font-bold text-white">تایید</button>
                  <button type="button" onClick={() => onUpdateTimesheet(Number(item.id), "Rejected")} className="rounded-md border border-border px-2 py-1 font-bold">رد</button>
                </>
              ) : null}
            </div>
          </div>
        ))}
        {!timesheets.length ? <div className="text-xs text-muted">تایم‌شیتی ثبت نشده است.</div> : null}
      </div>
    </div>
  );
}

function DocumentsPanel({
  documents,
  onAttach
}: {
  documents: ProjectDocumentSummary[];
  onAttach: (file: File, title?: string, note?: string) => void | Promise<void>;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-white/72 p-4">
      <SectionTitle title="مستندات پروژه" help="اینجا فایل‌های عمومی یا کاری پروژه مثل صورتجلسه، نیازمندی‌ها، فایل نمونه، مستند فنی یا فایل تاییدشده نگهداری می‌شود. این بخش با تحویل مرحله فرق دارد؛ تحویل هر مرحله داخل کارت همان milestone ثبت می‌شود." />
      <form
        className="mt-3 grid gap-2 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const file = form.get("file");
          if (file instanceof File) {
            void onAttach(file, String(form.get("title") || ""), String(form.get("note") || ""));
          }
          event.currentTarget.reset();
        }}
      >
        <input className="h-9 rounded-md border border-border px-2 py-1 text-xs focus-ring" name="file" type="file" required />
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="title" placeholder="عنوان مستند" />
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="note" placeholder="توضیح کوتاه" />
        <button className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-bold text-white">
          <FileText className="size-4" />
          ثبت
        </button>
      </form>
      <div className="mt-3 grid gap-2">
        {documents.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background/75 px-3 py-2 text-xs">
            <div>
              <div className="font-bold">{item.tag || item.fileName}</div>
              <div className="mt-1 text-muted">{item.note || item.description || item.fileName}</div>
            </div>
            {item.fileUrl ? (
              <a className="rounded-md border border-border px-2 py-1 font-bold" href={item.fileUrl} target="_blank" rel="noreferrer">
                مشاهده
              </a>
            ) : null}
          </div>
        ))}
        {!documents.length ? <div className="text-sm text-muted">مستندی برای این پروژه ثبت نشده است.</div> : null}
      </div>
    </div>
  );
}

function ConversationPanel({
  messages,
  loading,
  onSend
}: {
  messages: ProjectMessageSummary[];
  loading: boolean;
  onSend: (text?: string, file?: File) => void | Promise<void>;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-white/72 p-4">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle title="گفتگوی پروژه" help="گفتگوی پروژه برای هماهنگی کارفرما و مجری داخل همان قرارداد است. پیام‌ها و فایل‌های مرتبط با تصمیم‌های اجرایی را اینجا ثبت کنید تا سابقه پروژه قابل پیگیری بماند." />
        {loading ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
      </div>
      <div className="mt-3 grid max-h-72 gap-2 overflow-auto rounded-md bg-background/50 p-2">
        {messages.map((item) => (
          <div key={item.id} className="rounded-md bg-white px-3 py-2 text-xs shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-2 text-muted">
              <span>{item.senderName ?? `کاربر ${item.senderUserId}`}</span>
              <span>{item.createDate ? new Date(item.createDate).toLocaleString("fa-IR") : ""}</span>
            </div>
            {item.text ? <p className="mt-2 leading-6">{item.text}</p> : null}
            {item.fileUrl ? (
              <a className="mt-2 inline-flex rounded-md border border-border px-2 py-1 font-bold" href={item.fileUrl} target="_blank" rel="noreferrer">
                {item.fileName ?? "فایل پیوست"}
              </a>
            ) : null}
          </div>
        ))}
        {!messages.length ? <div className="px-2 py-5 text-center text-sm text-muted">هنوز پیامی ثبت نشده است.</div> : null}
      </div>
      <form
        className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_130px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const file = form.get("file");
          void onSend(String(form.get("text") || ""), file instanceof File && file.size > 0 ? file : undefined);
          event.currentTarget.reset();
        }}
      >
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="text" placeholder="پیام به طرف مقابل پروژه" />
        <input className="h-9 rounded-md border border-border px-2 py-1 text-xs focus-ring" name="file" type="file" />
        <button className="inline-flex h-9 items-center gap-1 rounded-md bg-accent px-3 text-xs font-bold text-white">
          <MessageSquare className="size-4" />
          ارسال
        </button>
      </form>
    </div>
  );
}

function DisputesPanel({
  disputes,
  milestones,
  loading,
  onOpen
  , onResolve
}: {
  disputes: ProjectDisputeSummary[];
  milestones: MilestoneSummary[];
  loading: boolean;
  onOpen: (title: string, description: string, reason: "Technical" | "Financial" | "Timeline" | "Quality" | "Scope" | "Other", milestoneId?: number, file?: File) => void | Promise<void>;
  onResolve: (disputeId: number, decisionType: "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction", decisionText?: string, releaseAmount?: number, refundAmount?: number) => void;
}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle title="اختلاف و توقف پرداخت" help="اگر درباره کیفیت، زمان، محدوده یا پرداخت اختلاف ایجاد شد، پرونده اختلاف باز کنید. اگر اختلاف به یک milestone وصل باشد، وجه نگهداری‌شده همان مرحله قفل می‌شود تا داور یا ادمین رأی بدهد." />
        {loading ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
      </div>
      <form
        className="mt-3 grid gap-2 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const milestoneId = Number(form.get("milestoneId") || 0);
          const file = form.get("file");
          void onOpen(
            String(form.get("title") || ""),
            String(form.get("description") || ""),
            String(form.get("reason") || "Other") as "Technical" | "Financial" | "Timeline" | "Quality" | "Scope" | "Other",
            milestoneId || undefined,
            file instanceof File && file.size > 0 ? file : undefined
          );
          event.currentTarget.reset();
        }}
      >
        <input className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="title" placeholder="عنوان اختلاف" required />
        <select className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="reason" defaultValue="Quality">
          <option value="Technical">فنی</option>
          <option value="Financial">مالی</option>
          <option value="Timeline">زمان‌بندی</option>
          <option value="Quality">کیفیت</option>
          <option value="Scope">محدوده کار</option>
          <option value="Other">سایر</option>
        </select>
        <select className="h-9 rounded-md border border-border px-2 text-xs focus-ring" name="milestoneId" defaultValue="">
          <option value="">کل پروژه</option>
          {milestones.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.title}
            </option>
          ))}
        </select>
        <input className="h-9 rounded-md border border-border px-2 py-1 text-xs focus-ring" name="file" type="file" />
        <textarea className="min-h-20 rounded-md border border-border px-2 py-2 text-xs focus-ring md:col-span-2" name="description" placeholder="شرح اختلاف و خواسته" />
        <button className="inline-flex h-9 w-fit items-center gap-1 rounded-md bg-amber-600 px-3 text-xs font-bold text-white">
          <Scale className="size-4" />
          ثبت اختلاف
        </button>
      </form>
      <div className="mt-3 grid gap-2">
        {disputes.map((item) => (
          <div key={item.id} className="rounded-md bg-white px-3 py-2 text-xs shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{item.title}</span>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-800">{String(item.status)}</span>
            </div>
            {item.description ? <p className="mt-2 leading-6 text-muted">{item.description}</p> : null}
            <div className="mt-2 text-muted">{item.evidenceItems?.length ?? 0} مستند</div>
            {item.decision ? (
              <div className="mt-2 rounded-md bg-accent/10 px-2 py-1 text-accent">رأی ثبت شده: {String(item.decision.decisionType)}</div>
            ) : (
              <form
                className="mt-3 grid gap-2 md:grid-cols-[150px_1fr_110px_110px_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  onResolve(
                    Number(item.id),
                    String(form.get("decisionType") || "NoAction") as "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction",
                    String(form.get("decisionText") || ""),
                    Number(form.get("releaseAmount") || 0) || undefined,
                    Number(form.get("refundAmount") || 0) || undefined
                  );
                  event.currentTarget.reset();
                }}
              >
                <select className="h-8 rounded-md border border-border px-2 focus-ring" name="decisionType" defaultValue="NoAction">
                  <option value="ReleasePayment">آزادسازی کامل</option>
                  <option value="RefundPayment">بازگشت کامل</option>
                  <option value="PartialRelease">تقسیم مبلغ</option>
                  <option value="ReviseWork">اصلاح کار</option>
                  <option value="NoAction">بدون اقدام مالی</option>
                </select>
                <input className="h-8 rounded-md border border-border px-2 focus-ring" name="decisionText" placeholder="متن رأی" />
                <input className="h-8 rounded-md border border-border px-2 focus-ring" name="releaseAmount" type="number" min="0" placeholder="آزادسازی" />
                <input className="h-8 rounded-md border border-border px-2 focus-ring" name="refundAmount" type="number" min="0" placeholder="بازگشت" />
                <button className="h-8 rounded-md bg-amber-700 px-3 font-bold text-white">ثبت رأی</button>
              </form>
            )}
          </div>
        ))}
        {!disputes.length ? <div className="text-sm text-muted">اختلاف فعالی برای این پروژه ثبت نشده است.</div> : null}
      </div>
    </div>
  );
}

function ActivityPanel({ items }: { items: Array<{ id: string; title: string; actorName?: string | null; createDate?: string | null }> }) {
  return (
    <div className="rounded-md border border-border/70 bg-white/72 p-4">
      <SectionTitle title="تاریخچه تصمیمات" help="هر تصمیم مهم مثل پذیرش پیشنهاد، ثبت تحویل، تایید مرحله، اختلاف، رأی داوری و اختتام پروژه اینجا ثبت می‌شود تا مسیر قرارداد قابل حسابرسی باشد." />
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md bg-background/75 px-3 py-2 text-xs">
            <div className="font-bold">{item.title}</div>
            <div className="mt-1 text-muted">{item.actorName ?? "کاربر سیستم"} {item.createDate ? `- ${new Date(item.createDate).toLocaleString("fa-IR")}` : ""}</div>
          </div>
        ))}
        {!items.length ? <div className="text-sm text-muted">هنوز رخدادی ثبت نشده است.</div> : null}
      </div>
    </div>
  );
}

function getEntityId(value: { id?: string | number; iD?: string | number } | null | undefined) {
  return Number(value?.id ?? value?.iD ?? 0);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}
