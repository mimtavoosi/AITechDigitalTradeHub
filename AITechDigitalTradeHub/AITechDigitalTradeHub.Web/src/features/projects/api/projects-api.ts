import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type {
  AcceptProposalPayload,
  AddProjectDisputeEvidencePayload,
  AttachProjectDocumentPayload,
  CompleteProjectPayload,
  CreateProjectReviewPayload,
  CreateTimesheetPayload,
  HoldMilestoneEscrowPayload,
  OpenProjectDisputePayload,
  ProjectActivitySummary,
  ProjectConversationSummary,
  ProjectCreatePayload,
  ProjectDetail,
  ProjectDisputeSummary,
  ProjectDocumentSummary,
  ProjectSummary,
  ProposalCounterOfferPayload,
  ProposalCounterOfferResponsePayload,
  ProposalCreatePayload,
  ProposalSummary,
  ReviewDeliverablePayload,
  ResolveProjectDisputePayload,
  SendProjectMessagePayload,
  SubmitDeliverablePayload
} from "@/features/projects/types";

export function getProjects(params: {
  status?: string;
  categoryId?: number;
  minBudget?: number;
  maxBudget?: number;
  skillTagId?: number;
  projectType?: string;
  locationMode?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  pageIndex?: number;
  pageSize?: number;
  searchText?: string;
  sortQuery?: string;
} = {}) {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.list + toQueryString(params));
}

export function getAdminProjects(params: { status?: string; organizationId?: number; searchText?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.adminList + toQueryString(params));
}

export function getAdminProjectDisputes(params: { status?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<ProjectDisputeSummary>>(apiEndpoints.projects.adminDisputes + toQueryString(params));
}

export function updateAdminProjectStatus(id: number, status: string, note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.adminStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status, note })
  });
}

export function blockAdminProject(id: number, note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.adminBlock(id), {
    method: "POST",
    body: JSON.stringify({ status: "Cancelled", note })
  });
}

export function terminateAdminProjectContract(id: number, note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.adminTerminateContract(id), {
    method: "POST",
    body: JSON.stringify({ status: "Cancelled", note })
  });
}

export function getProject(id: number) {
  return apiRequest<DotNetRowResult<ProjectDetail>>(apiEndpoints.projects.detail(id));
}

export function getMyProjects() {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.mine);
}

export function getMyProposals() {
  return apiRequest<DotNetListResult<ProposalSummary>>(apiEndpoints.projects.myProposals);
}

export function getOrganizationProjects(organizationId: number) {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.organizationProjects(organizationId));
}

export function createProject(payload: ProjectCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProject(id: number, payload: ProjectCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.detail(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function publishProject(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.publish(id), {
    method: "POST"
  });
}

export function createProposal(projectId: number, payload: ProposalCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.proposals(projectId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function acceptProposal(proposalId: number, payload: AcceptProposalPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.acceptProposal(proposalId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProjectProposals(projectId: number) {
  return apiRequest<DotNetListResult<ProposalSummary>>(apiEndpoints.projects.proposals(projectId));
}

export function updateProposalStatus(proposalId: number, status: string) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.proposalStatus(proposalId), {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function createProposalCounterOffer(proposalId: number, payload: ProposalCounterOfferPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.proposalCounterOffer(proposalId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function respondProposalCounterOffer(proposalId: number, payload: ProposalCounterOfferResponsePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.proposalCounterOfferResponse(proposalId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function submitMilestoneDeliverable(milestoneId: number, payload: SubmitDeliverablePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.submitDeliverable(milestoneId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function approveDeliverable(deliverableId: number, payload: ReviewDeliverablePayload = {}) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.approveDeliverable(deliverableId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function requestDeliverableRevision(deliverableId: number, payload: ReviewDeliverablePayload = {}) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.requestDeliverableRevision(deliverableId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function holdMilestoneEscrow(milestoneId: number, payload: HoldMilestoneEscrowPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.holdMilestoneEscrow(milestoneId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function releaseMilestoneEscrow(milestoneId: number, escrowId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.releaseMilestoneEscrow(milestoneId, escrowId), {
    method: "POST"
  });
}

export function refundMilestoneEscrow(milestoneId: number, escrowId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.refundMilestoneEscrow(milestoneId, escrowId), {
    method: "POST"
  });
}

export function addContractTimesheet(contractId: number, payload: CreateTimesheetPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.timesheets(contractId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTimesheetStatus(timesheetId: number, status: string) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.timesheetStatus(timesheetId), {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function completeProjectContract(contractId: number, payload: CompleteProjectPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.completeContract(contractId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createProjectReview(payload: CreateProjectReviewPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.reviews.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProjectActivity(projectId: number, pageIndex = 1, pageSize = 50) {
  return apiRequest<DotNetListResult<ProjectActivitySummary>>(`${apiEndpoints.projects.activity(projectId)}${toQueryString({ pageIndex, pageSize })}`);
}

export function getProjectDocuments(projectId: number, pageIndex = 1, pageSize = 50) {
  return apiRequest<DotNetListResult<ProjectDocumentSummary>>(`${apiEndpoints.projects.documents(projectId)}${toQueryString({ pageIndex, pageSize })}`);
}

export function attachProjectDocument(projectId: number, payload: AttachProjectDocumentPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.documents(projectId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProjectConversation(projectId: number) {
  return apiRequest<DotNetRowResult<ProjectConversationSummary>>(apiEndpoints.projects.conversation(projectId));
}

export function sendProjectMessage(projectId: number, payload: SendProjectMessagePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.messages(projectId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProjectDisputes(projectId: number, pageIndex = 1, pageSize = 50) {
  return apiRequest<DotNetListResult<ProjectDisputeSummary>>(`${apiEndpoints.projects.disputes(projectId)}${toQueryString({ pageIndex, pageSize })}`);
}

export function openProjectDispute(projectId: number, payload: OpenProjectDisputePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.disputes(projectId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addProjectDisputeEvidence(disputeId: number, payload: AddProjectDisputeEvidencePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.disputeEvidence(disputeId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resolveProjectDispute(disputeId: number, payload: ResolveProjectDisputePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.disputeDecision(disputeId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function uploadProjectFile(file: File, params: { entityType?: string; foreignKeyId?: number; tag?: string; note?: string } = {}) {
  const form = new FormData();
  form.set("file", file);
  form.set("entityType", params.entityType ?? "Project");
  if (params.foreignKeyId) {
    form.set("foreignKeyId", String(params.foreignKeyId));
  }
  if (params.tag) {
    form.set("tag", params.tag);
  }
  if (params.note) {
    form.set("note", params.note);
  }

  return apiRequest<DotNetRowResult<ProjectDocumentSummary>>(apiEndpoints.files.upload, {
    method: "POST",
    body: form
  });
}
