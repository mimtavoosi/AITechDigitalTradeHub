import { apiEndpoints } from "@/lib/api/api-endpoints";
import { normalizeDotNetList, normalizeDotNetResult, normalizeDotNetRow } from "@/lib/api/dotnet-result";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { AdminInvestmentStatus, FundraisingStage, InvestmentOpportunity, InvestmentOpportunityStatus, InvestmentRiskLevel } from "@/features/investments/types";

const statusPayload: Record<AdminInvestmentStatus, number> = {
  Draft: 1,
  PendingReview: 2,
  Open: 3,
  Funded: 4,
  Closed: 5,
  Rejected: 6
};

export function getInvestments(
  params: {
    status?: InvestmentOpportunityStatus | "";
    stage?: FundraisingStage | "";
    riskLevel?: InvestmentRiskLevel | "";
    minRequiredCapital?: number;
    maxRequiredCapital?: number;
    minExpectedRoi?: number;
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.investments.list}${toQueryString(params)}`).then(normalizeDotNetList<InvestmentOpportunity>);
}

export async function getInvestment(id: number) {
  const response = normalizeDotNetRow<InvestmentOpportunity>(await apiRequest<unknown>(apiEndpoints.investments.detail(id)));
  return response.result;
}

export function getAdminInvestments(
  params: {
    status?: InvestmentOpportunityStatus | "";
    stage?: FundraisingStage | "";
    riskLevel?: InvestmentRiskLevel | "";
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.investments.adminList}${toQueryString(params)}`).then(normalizeDotNetList<InvestmentOpportunity>);
}

export async function getAdminInvestment(id: number) {
  const response = normalizeDotNetRow<InvestmentOpportunity>(await apiRequest<unknown>(apiEndpoints.investments.adminDetail(id)));
  return response.result;
}

export function updateAdminInvestmentStatus(id: number, status: AdminInvestmentStatus, note?: string) {
  return apiRequest<unknown>(apiEndpoints.investments.adminStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status: statusPayload[status], note })
  }).then(normalizeDotNetResult);
}
