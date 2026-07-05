import type { AuthUser } from "@/store/auth-store";

export const roleNames = {
  user: "User",
  employer: "Employer",
  freelancer: "Freelancer",
  serviceProvider: "ServiceProvider",
  instructor: "Instructor",
  organizationAdmin: "OrganizationAdmin",
  investor: "Investor",
  fundraiser: "Fundraiser",
  support: "Support",
  arbitrator: "Arbitrator",
  admin: "Admin",
  superAdmin: "SuperAdmin"
} as const;

export type RoleName = (typeof roleNames)[keyof typeof roleNames];

export const adminRoleNames: RoleName[] = [roleNames.admin, roleNames.superAdmin];
export const supportPanelRoleNames: RoleName[] = [roleNames.support, roleNames.admin, roleNames.superAdmin];
export const companyRoleNames: RoleName[] = [roleNames.organizationAdmin, roleNames.admin, roleNames.superAdmin];

export function isApprovedRoleStatus(status: string | number | undefined | null) {
  if (status == null) return false;
  const normalized = String(status).toLowerCase();
  return normalized === "2" || normalized === "approved";
}

export function isActiveUserStatus(status: string | number | undefined | null) {
  if (status == null) return false;
  const normalized = String(status).toLowerCase();
  return normalized === "1" || normalized === "active";
}

export function getApprovedRoleNames(user: AuthUser | null) {
  return (
    user?.roles
      ?.filter((role) => isApprovedRoleStatus(role.status))
      .map((role) => role.roleName)
      .filter(Boolean) ?? []
  );
}

export function hasApprovedRole(user: AuthUser | null, allowedRoles: readonly string[]) {
  if (!user || !allowedRoles.length) return false;
  const roles = getApprovedRoleNames(user).map((role) => role.toLowerCase());
  return allowedRoles.some((role) => roles.includes(role.toLowerCase()));
}

export function canAccessDashboard(user: AuthUser | null) {
  return Boolean(user && isActiveUserStatus(user.status));
}

export function canAccessAdminPanel(user: AuthUser | null) {
  return canAccessDashboard(user) && hasApprovedRole(user, supportPanelRoleNames);
}

export function canAccessCompanyPanel(user: AuthUser | null) {
  return canAccessDashboard(user) && hasApprovedRole(user, companyRoleNames);
}
