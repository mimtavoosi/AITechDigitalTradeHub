export type OrganizationType = "Company" | "University" | "ResearchInstitute" | "Startup" | "Government" | "NonProfit" | "Accelerator" | "Other" | number;
export type OrganizationStatus = "Active" | "Suspended" | "PendingVerification" | "Rejected" | number;

export type Organization = {
  id: number;
  title: string;
  slug: string;
  type: OrganizationType;
  nationalId?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  publicEmail?: string | null;
  publicPhone?: string | null;
  isVerified: boolean;
  status: OrganizationStatus;
  ownerUserId: number;
  ownerName: string;
  membersCount: number;
  projectsCount: number;
  requireApprovalForMemberPayments: boolean;
  defaultMemberPaymentLimit?: number | null;
};

export type OrganizationPayload = {
  title: string;
  slug: string;
  type: OrganizationType;
  nationalId?: string;
  description?: string;
  websiteUrl?: string;
  publicEmail?: string;
  publicPhone?: string;
  requireApprovalForMemberPayments: boolean;
  defaultMemberPaymentLimit?: number;
};

export type OrganizationMember = {
  id: number;
  userId: number;
  displayName: string;
  email: string;
  role: string | number;
  isActive: boolean;
  canRequestOrganizationPayments: boolean;
  canApproveOrganizationPayments: boolean;
  paymentLimit?: number | null;
};
