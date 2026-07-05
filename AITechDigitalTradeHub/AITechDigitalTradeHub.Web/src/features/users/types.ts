import type { EntityId } from "@/types/domain";

export type RoleOption = {
  id: EntityId;
  name: string;
  description?: string | null;
};

export type UserRoleAssignment = {
  id: EntityId;
  userId: EntityId;
  userDisplayName?: string | null;
  userEmail?: string | null;
  roleId: EntityId;
  roleName: string;
  roleDescription?: string | null;
  status: string | number;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  adminNote?: string | null;
};

export type AdminUser = {
  id: EntityId;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  username: string;
  mobileNumber?: string | null;
  status: string | number;
  isActive: boolean;
  isVerified: boolean;
  verificationLevel: number;
  createDate?: string | null;
  roles: UserRoleAssignment[];
};

export type UserProjectSkill = {
  id: EntityId;
  name: string;
  slug?: string | null;
};

export type UserPortfolioItem = {
  id: EntityId;
  title: string;
  description?: string | null;
  externalUrl?: string | null;
};

export type UserProjectProfile = {
  userId: EntityId;
  displayName: string;
  email?: string | null;
  mobileNumber?: string | null;
  isVerified: boolean;
  verificationLevel: number;
  trustScore: number;
  completedProjectsCount: number;
  skills: UserProjectSkill[];
  resumeFileUploadId?: EntityId | null;
  resumeFileName?: string | null;
  resumeFileUrl?: string | null;
  resumeHeadline?: string | null;
  resumeSummary?: string | null;
  resumeExperience?: string | null;
  resumeEducation?: string | null;
  portfolioItems: UserPortfolioItem[];
};

export type UserProjectProfilePayload = {
  skillTagIds: number[];
  resumeFileUploadId?: number;
  resumeHeadline?: string;
  resumeSummary?: string;
  resumeExperience?: string;
  resumeEducation?: string;
};
