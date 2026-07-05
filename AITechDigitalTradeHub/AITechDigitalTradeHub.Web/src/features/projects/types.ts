import type { EntityId, ProjectStatus } from "@/types/domain";

export type ProjectSummary = {
  id: EntityId;
  slug: string;
  title: string;
  status: ProjectStatus | string | number;
  projectType?: string | number;
  locationMode?: string | number;
  description?: string | null;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  timelineDays?: number | null;
  deadlineAt?: string | null;
  publishedAt?: string | null;
  closedAt?: string | null;
  categoryId?: EntityId;
  categoryName?: string | null;
  employerName?: string | null;
  employerUserId?: EntityId;
  organizationId?: EntityId | null;
  organizationName?: string | null;
  proposalsCount?: number;
  activeDisputesCount?: number;
  skills?: ProjectSkillSummary[];
};

export type ProjectSkillSummary = {
  id: EntityId;
  name: string;
  slug?: string | null;
};

export type ProposalSummary = {
  id: EntityId;
  projectId: EntityId;
  freelancerUserId: EntityId;
  freelancerName?: string | null;
  projectTitle?: string | null;
  projectStatus?: string | number | null;
  projectHasContract?: boolean;
  contractId?: EntityId | null;
  proposedPrice: number;
  proposedDays: number;
  counterPrice?: number | null;
  counterDays?: number | null;
  counterMessage?: string | null;
  counterOfferAt?: string | null;
  counterAcceptedAt?: string | null;
  counterRejectedAt?: string | null;
  coverLetter?: string | null;
  status: string | number;
  createDate?: string | null;
  resumeFileUploadId?: EntityId | null;
  resumeFileName?: string | null;
  resumeFileUrl?: string | null;
};

export type MilestoneSummary = {
  id: EntityId;
  contractId: EntityId;
  title: string;
  description?: string | null;
  amount: number;
  startsAt?: string | null;
  dueAt?: string | null;
  durationDays?: number | null;
  daysRemaining?: number | null;
  isOverdue?: boolean;
  status: string | number;
  deliverables?: DeliverableSummary[];
  escrows?: EscrowSummary[];
};

export type ContractSummary = {
  id: EntityId;
  projectId: EntityId;
  employerUserId: EntityId;
  contractorUserId?: EntityId | null;
  status: string | number;
  milestones: MilestoneSummary[];
  timesheets?: TimesheetSummary[];
};

export type ProjectDetail = ProjectSummary & {
  employerUserId: EntityId;
  organizationId?: EntityId | null;
  contract?: ContractSummary | null;
  proposals: ProposalSummary[];
  activityLogs?: ProjectActivitySummary[];
  documents?: ProjectDocumentSummary[];
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
  skillTagIds?: number[];
};

export type ProposalCreatePayload = {
  proposedPrice: number;
  proposedDays: number;
  coverLetter?: string;
  resumeFileUploadId?: number;
};

export type AcceptProposalPayload = {
  milestones: Array<{
    title: string;
    description?: string;
    amount: number;
    startsAt?: string;
    dueAt?: string;
    durationDays?: number;
  }>;
};

export type ProposalCounterOfferPayload = {
  counterPrice: number;
  counterDays: number;
  message?: string;
};

export type ProposalCounterOfferResponsePayload = {
  accepted: boolean;
  message?: string;
};

export type DeliverableSummary = {
  id: EntityId;
  milestoneId: EntityId;
  note?: string | null;
  fileUploadId?: EntityId | null;
  fileName?: string | null;
  fileUrl?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
};

export type EscrowSummary = {
  id: EntityId;
  payerWalletId: EntityId;
  payeeWalletId: EntityId;
  amount: number;
  contextType: string;
  contextId: EntityId;
  status: string | number;
  createDate?: string | null;
};

export type TimesheetSummary = {
  id: EntityId;
  contractId: EntityId;
  userId: EntityId;
  userName?: string | null;
  date: string;
  minutes: number;
  description?: string | null;
  status: string | number;
  createDate?: string | null;
};

export type ProjectActivitySummary = {
  id: EntityId;
  projectId: EntityId;
  actorUserId?: EntityId | null;
  actorName?: string | null;
  activityType: string | number;
  title: string;
  detailsJson?: string | null;
  createDate?: string | null;
};

export type SubmitDeliverablePayload = {
  note?: string;
  fileUploadId?: number;
};

export type ReviewDeliverablePayload = {
  note?: string;
};

export type HoldMilestoneEscrowPayload = {
  payerWalletId?: number;
  payeeWalletId?: number;
};

export type CreateTimesheetPayload = {
  date: string;
  minutes: number;
  description?: string;
};

export type CompleteProjectPayload = {
  addToContractorPortfolio: boolean;
  portfolioExternalUrl?: string;
};

export type CreateProjectReviewPayload = {
  targetType: "User" | "Organization" | "Listing" | "Contract";
  targetId: number;
  contextType: "Contract";
  contextId: number;
  rating: number;
  comment?: string;
};

export type ProjectDocumentSummary = {
  id: EntityId;
  fileName: string;
  fileUrl?: string | null;
  contentType?: string | null;
  description?: string | null;
  tag?: string | null;
  note?: string | null;
  creatorId?: EntityId;
  createDate?: string | null;
};

export type AttachProjectDocumentPayload = {
  fileUploadId: number;
  title?: string;
  note?: string;
};

export type ProjectConversationSummary = {
  id: EntityId;
  projectId: EntityId;
  members: ProjectConversationMemberSummary[];
  messages: ProjectMessageSummary[];
};

export type ProjectConversationMemberSummary = {
  userId: EntityId;
  userName?: string | null;
  lastReadMessageId?: EntityId | null;
  isMuted?: boolean;
};

export type ProjectMessageSummary = {
  id: EntityId;
  conversationId: EntityId;
  senderUserId: EntityId;
  senderName?: string | null;
  messageType: string | number;
  text?: string | null;
  fileUploadId?: EntityId | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createDate?: string | null;
};

export type SendProjectMessagePayload = {
  text?: string;
  fileUploadId?: number;
};

export type ProjectDisputeSummary = {
  id: EntityId;
  contextType: string | number;
  contextId: EntityId;
  openedByUserId: EntityId;
  openedByName?: string | null;
  respondentUserId?: EntityId | null;
  respondentName?: string | null;
  title: string;
  description?: string | null;
  reason: string | number;
  status: string | number;
  createDate?: string | null;
  decidedAt?: string | null;
  closedAt?: string | null;
  evidenceItems?: ProjectDisputeEvidenceSummary[];
  decision?: ProjectArbitrationDecisionSummary | null;
};

export type ProjectDisputeEvidenceSummary = {
  id: EntityId;
  submittedByUserId: EntityId;
  submittedByName?: string | null;
  fileUploadId?: EntityId | null;
  title: string;
  note?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createDate?: string | null;
};

export type OpenProjectDisputePayload = {
  title: string;
  description?: string;
  reason: "Technical" | "Financial" | "Timeline" | "Quality" | "Scope" | "Other";
  milestoneId?: number;
  fileUploadId?: number;
  evidenceTitle?: string;
  evidenceNote?: string;
};

export type AddProjectDisputeEvidencePayload = {
  fileUploadId: number;
  title: string;
  note?: string;
};

export type ProjectArbitrationDecisionSummary = {
  id: EntityId;
  disputeId: EntityId;
  decidedByUserId: EntityId;
  decisionType: string | number;
  decisionText?: string | null;
  releaseAmount?: number | null;
  refundAmount?: number | null;
  isExecuted: boolean;
  executedAt?: string | null;
};

export type ResolveProjectDisputePayload = {
  decisionType: "ReleasePayment" | "RefundPayment" | "PartialRelease" | "ReviseWork" | "NoAction";
  decisionText?: string;
  releaseAmount?: number;
  refundAmount?: number;
  executeFinancialDecision: boolean;
};
