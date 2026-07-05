import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { AssignBadgePayload, BadgeAssignmentSummary, BadgeSummary, CreateBadgePayload } from "@/features/badges/types";

export function getBadges() {
  return apiRequest<DotNetListResult<BadgeSummary>>(apiEndpoints.badges.list);
}

export function createBadge(payload: CreateBadgePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.badges.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getBadgesForTarget(targetType: string, targetId: number) {
  return apiRequest<DotNetListResult<BadgeAssignmentSummary>>(apiEndpoints.badges.forTarget(targetType, targetId));
}

export function getAllBadgeAssignments(params: { pageIndex?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const search = query.toString();
  return apiRequest<DotNetListResult<BadgeAssignmentSummary>>(`${apiEndpoints.badges.assignments}${search ? `?${search}` : ""}`);
}

export function assignBadge(payload: AssignBadgePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.badges.assignments, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function revokeBadge(assignmentId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.badges.revoke(assignmentId), {
    method: "POST"
  });
}

export function getBadgeId(badge: BadgeSummary) {
  return Number(badge.id ?? badge.iD ?? 0);
}

export function getBadgeTitle(badge: BadgeSummary) {
  return badge.title ?? badge.Title ?? `نشان ${getBadgeId(badge)}`;
}

export function getBadgeCode(badge: BadgeSummary) {
  return badge.code ?? badge.Code ?? "";
}

export function getAssignmentId(assignment: BadgeAssignmentSummary) {
  return Number(assignment.id ?? assignment.iD ?? 0);
}

export function getAssignmentBadge(assignment: BadgeAssignmentSummary) {
  return assignment.badge ?? assignment.Badge ?? null;
}

export function getAssignmentStatus(assignment: BadgeAssignmentSummary) {
  return String(assignment.status ?? assignment.Status ?? "");
}

export function getAssignmentTargetType(assignment: BadgeAssignmentSummary) {
  return String(assignment.targetType ?? assignment.TargetType ?? "");
}

export function getAssignmentTargetId(assignment: BadgeAssignmentSummary) {
  return Number(assignment.targetId ?? assignment.TargetId ?? 0);
}
