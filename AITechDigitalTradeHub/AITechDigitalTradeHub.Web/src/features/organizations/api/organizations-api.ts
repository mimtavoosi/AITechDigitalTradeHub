import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { Organization, OrganizationMember, OrganizationPayload, OrganizationType } from "@/features/organizations/types";

export function getOrganizations(params: { type?: OrganizationType; searchText?: string } = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", String(params.type));
  if (params.searchText) query.set("searchText", params.searchText);
  return apiRequest<DotNetListResult<Organization>>(`${apiEndpoints.organizations.list}${query.size ? `?${query}` : ""}`);
}

export function getMyOrganizations() {
  return apiRequest<DotNetListResult<Organization>>(apiEndpoints.organizations.mine);
}

export function createOrganization(payload: OrganizationPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.organizations.list, { method: "POST", body: JSON.stringify(payload) });
}

export function updateOrganization(id: number, payload: OrganizationPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.organizations.detail(id), { method: "PUT", body: JSON.stringify(payload) });
}

export function getOrganizationMembers(id: number) {
  return apiRequest<DotNetListResult<OrganizationMember>>(apiEndpoints.organizations.members(id));
}

export function addOrganizationMember(id: number, payload: { userId: number; role: number; canRequestOrganizationPayments: boolean; canApproveOrganizationPayments: boolean; paymentLimit?: number }) {
  return apiRequest<DotNetResult>(apiEndpoints.organizations.members(id), { method: "POST", body: JSON.stringify(payload) });
}
