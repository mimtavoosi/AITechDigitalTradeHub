import type { EntityId, ProjectStatus } from "@/types/domain";

export type ProjectSummary = {
  id: EntityId;
  slug: string;
  title: string;
  status: ProjectStatus;
  projectType?: string | number;
  description?: string | null;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  timelineDays?: number | null;
  deadlineAt?: string | null;
  publishedAt?: string | null;
  categoryName?: string | null;
  employerName?: string | null;
  proposalsCount?: number;
};

export type ProposalSummary = {
  id: EntityId;
  projectId: EntityId;
  freelancerUserId: EntityId;
  freelancerName?: string | null;
  proposedPrice: number;
  proposedDays: number;
  coverLetter?: string | null;
  status: string | number;
  createDate?: string | null;
};

export type MilestoneSummary = {
  id: EntityId;
  contractId: EntityId;
  title: string;
  amount: number;
  dueAt?: string | null;
  status: string | number;
};

export type ContractSummary = {
  id: EntityId;
  projectId: EntityId;
  employerUserId: EntityId;
  contractorUserId?: EntityId | null;
  status: string | number;
  milestones: MilestoneSummary[];
};

export type ProjectDetail = ProjectSummary & {
  employerUserId: EntityId;
  organizationId?: EntityId | null;
  contract?: ContractSummary | null;
  proposals: ProposalSummary[];
};

export type ProjectCreatePayload = {
  title: string;
  description?: string;
  categoryId: number;
  projectType: "Fixed" | "Hourly";
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  timelineDays?: number;
  deadlineAt?: string;
  locationMode: "Remote" | "OnSite" | "Hybrid";
};

export type ProposalCreatePayload = {
  proposedPrice: number;
  proposedDays: number;
  coverLetter?: string;
};

export type AcceptProposalPayload = {
  milestones: Array<{
    title: string;
    amount: number;
    dueAt?: string;
  }>;
};
