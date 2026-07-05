import type { EntityId } from "@/types/domain";

export type BadgeTargetType = "User" | "Organization";

export type BadgeSummary = {
  id?: EntityId;
  iD?: EntityId;
  title?: string;
  Title?: string;
  code?: string;
  Code?: string;
  description?: string | null;
  Description?: string | null;
  iconName?: string | null;
  IconName?: string | null;
  isSystemBadge?: boolean;
  IsSystemBadge?: boolean;
};

export type BadgeAssignmentSummary = {
  id?: EntityId;
  iD?: EntityId;
  badgeId?: EntityId;
  BadgeId?: EntityId;
  targetType: string | number;
  TargetType?: string | number;
  targetId?: EntityId;
  TargetId?: EntityId;
  status: string | number;
  Status?: string | number;
  reason?: string | null;
  Reason?: string | null;
  expiresAt?: string | null;
  ExpiresAt?: string | null;
  createDate?: string | null;
  CreateDate?: string | null;
  badge?: BadgeSummary | null;
  Badge?: BadgeSummary | null;
};

export type CreateBadgePayload = {
  title: string;
  code: string;
  description?: string;
  iconName?: string;
};

export type AssignBadgePayload = {
  badgeId: number;
  targetType: BadgeTargetType;
  targetId: number;
  reason?: string;
  expiresAt?: string;
};
