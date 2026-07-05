import { apiEndpoints } from "@/lib/api/api-endpoints";
import { normalizeDotNetList, normalizeDotNetResult, normalizeDotNetRow } from "@/lib/api/dotnet-result";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { AdminActivityLog, AdminPermission, AdminRole, PermissionUpsertPayload, RoleUpsertPayload } from "@/features/admin/types";

export function getAccessRoles(
  params: {
    includeInactive?: boolean;
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminAccess.roles}${toQueryString(params)}`).then(normalizeDotNetList<AdminRole>);
}

export async function getAccessRole(id: number) {
  const response = normalizeDotNetRow<AdminRole>(await apiRequest<unknown>(apiEndpoints.adminAccess.role(id)));
  return response.result;
}

export function createAccessRole(payload: RoleUpsertPayload) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.roles, {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(normalizeDotNetResult);
}

export function updateAccessRole(id: number, payload: RoleUpsertPayload) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.role(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  }).then(normalizeDotNetResult);
}

export function deactivateAccessRole(id: number) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.role(id), {
    method: "DELETE"
  }).then(normalizeDotNetResult);
}

export function setRolePermissions(id: number, permissionIds: number[]) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.rolePermissions(id), {
    method: "PUT",
    body: JSON.stringify({ permissionIds })
  }).then(normalizeDotNetResult);
}

export function getUserPermissions(userId: number) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.userPermissions(userId)).then(normalizeDotNetList<{ permissionId: number; isGranted: boolean; isActive: boolean }>);
}

export function setUserPermissions(userId: number, permissionIds: number[]) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.userPermissions(userId), {
    method: "PUT",
    body: JSON.stringify({ permissionIds })
  }).then(normalizeDotNetResult);
}

export function getAccessPermissions(
  params: {
    includeInactive?: boolean;
    permissionType?: string;
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminAccess.permissions}${toQueryString(params)}`).then(normalizeDotNetList<AdminPermission>);
}

export function createAccessPermission(payload: PermissionUpsertPayload) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.permissions, {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(normalizeDotNetResult);
}

export function updateAccessPermission(id: number, payload: PermissionUpsertPayload) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.permission(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  }).then(normalizeDotNetResult);
}

export function deactivateAccessPermission(id: number) {
  return apiRequest<unknown>(apiEndpoints.adminAccess.permission(id), {
    method: "DELETE"
  }).then(normalizeDotNetResult);
}

export function getActivityLogs(
  params: {
    from?: string;
    to?: string;
    userId?: number | "";
    source?: string;
    pageIndex?: number;
    pageSize?: number;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminAccess.activityLogs}${toQueryString(params)}`).then(normalizeDotNetList<AdminActivityLog>);
}
