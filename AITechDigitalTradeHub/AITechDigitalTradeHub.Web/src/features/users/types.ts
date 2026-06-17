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
