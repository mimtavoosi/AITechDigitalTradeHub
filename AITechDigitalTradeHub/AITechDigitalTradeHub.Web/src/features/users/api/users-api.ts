import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { AdminUser, RoleOption, UserRoleAssignment } from "@/features/users/types";

export function getRoles() {
  return apiRequest<RoleOption[]>(apiEndpoints.users.roles);
}

export function getMyCapabilities() {
  return apiRequest<UserRoleAssignment[]>(apiEndpoints.users.myCapabilities);
}

export function requestCapability(roleName: string) {
  return apiRequest<DotNetResult>(apiEndpoints.users.requestCapability, {
    method: "POST",
    body: JSON.stringify({ roleName })
  });
}

export function getAdminUsers(params: { searchText?: string; roleId?: number; status?: string; isVerified?: boolean } = {}) {
  return apiRequest<DotNetListResult<AdminUser>>(`${apiEndpoints.users.adminList}${toQueryString(params)}`);
}

export function getCapabilityRequests(status?: string) {
  return apiRequest<UserRoleAssignment[]>(`${apiEndpoints.users.capabilityRequests}${toQueryString({ status })}`);
}

export function updateCapabilityRequest(id: number, status: "Approved" | "Rejected" | "Suspended", adminNote?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateCapabilityRequest(id), {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote })
  });
}

export function updateUserStatus(id: number, status: "Active" | "Suspended" | "Banned", isActive: boolean) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status, isActive })
  });
}

export function updateUserVerification(id: number, isVerified: boolean, verificationLevel: number) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateVerification(id), {
    method: "PATCH",
    body: JSON.stringify({ isVerified, verificationLevel })
  });
}
