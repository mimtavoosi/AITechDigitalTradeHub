import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { AdminUser, RoleOption, UserProjectProfile, UserProjectProfilePayload, UserRoleAssignment } from "@/features/users/types";

const userStatusPayload = {
  Active: 1,
  Suspended: 2,
  Banned: 3
} as const;

const capabilityStatusPayload = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
  Suspended: 4
} as const;

export type AdminUserStatus = keyof typeof userStatusPayload;
export type CapabilityStatus = keyof typeof capabilityStatusPayload;

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

export function getMyProjectProfile() {
  return apiRequest<UserProjectProfile>(apiEndpoints.users.myProjectProfile);
}

export function updateMyProjectProfile(payload: UserProjectProfilePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.users.myProjectProfile, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function getUserProjectProfile(id: number) {
  return apiRequest<UserProjectProfile>(apiEndpoints.users.projectProfile(id));
}

export function getAdminUsers(
  params: {
    searchText?: string;
    roleId?: number | "";
    status?: AdminUserStatus | "";
    isVerified?: boolean | "";
    pageIndex?: number;
    pageSize?: number;
  } = {}
) {
  return apiRequest<DotNetListResult<AdminUser>>(`${apiEndpoints.users.adminList}${toQueryString(params)}`);
}

export function getCapabilityRequests(status?: string) {
  return apiRequest<UserRoleAssignment[]>(`${apiEndpoints.users.capabilityRequests}${toQueryString({ status })}`);
}

export function updateCapabilityRequest(id: number, status: Exclude<CapabilityStatus, "Pending">, adminNote?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateCapabilityRequest(id), {
    method: "PATCH",
    body: JSON.stringify({ status: capabilityStatusPayload[status], adminNote })
  });
}

export function updateUserStatus(id: number, status: AdminUserStatus, isActive: boolean) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status: userStatusPayload[status], isActive })
  });
}

export function updateUserVerification(id: number, isVerified: boolean, verificationLevel: number) {
  return apiRequest<DotNetResult>(apiEndpoints.users.updateVerification(id), {
    method: "PATCH",
    body: JSON.stringify({ isVerified, verificationLevel })
  });
}
