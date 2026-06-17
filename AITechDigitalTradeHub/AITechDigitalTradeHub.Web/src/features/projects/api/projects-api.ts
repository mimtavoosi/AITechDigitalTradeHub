import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type { AcceptProposalPayload, ProjectCreatePayload, ProjectDetail, ProjectSummary, ProposalCreatePayload, ProposalSummary } from "@/features/projects/types";

export function getProjects() {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.list);
}

export function getProject(id: number) {
  return apiRequest<DotNetRowResult<ProjectDetail>>(apiEndpoints.projects.detail(id));
}

export function getMyProjects() {
  return apiRequest<DotNetListResult<ProjectSummary>>(apiEndpoints.projects.mine);
}

export function createProject(payload: ProjectCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.projects.list, {
    method: "POST",
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
