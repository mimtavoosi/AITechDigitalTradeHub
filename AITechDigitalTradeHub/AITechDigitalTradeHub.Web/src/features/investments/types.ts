export type InvestmentOpportunityStatus = "Draft" | "PendingReview" | "Open" | "Funded" | "Closed" | "Rejected" | number;
export type FundraisingStage = "Idea" | "MVP" | "Growth" | "Scale" | number;
export type InvestmentRiskLevel = "Low" | "Medium" | "High" | number;

export type InvestmentOpportunity = {
  id: number;
  ownerUserId: number;
  organizationId?: number | null;
  projectId?: number | null;
  title: string;
  slug: string;
  summary?: string | null;
  businessModel?: string | null;
  roadmap?: string | null;
  stage: FundraisingStage;
  status: InvestmentOpportunityStatus;
  riskLevel: InvestmentRiskLevel;
  requiredCapital: number;
  raisedCapital: number;
  offeredSharePercent?: number | null;
  expectedRoiPercent?: number | null;
  currency: string;
  fundingPercent: number;
  openedAt?: string | null;
  closedAt?: string | null;
  documents: InvestmentDocument[];
  tranches: InvestmentTranche[];
  reports: InvestmentReport[];
};

export type InvestmentDocument = {
  id: number;
  documentType: string | number;
  title: string;
  isConfidential: boolean;
  fileUploadId: number;
  fileName?: string | null;
  fileUrl?: string | null;
};

export type InvestmentTranche = {
  id: number;
  title: string;
  amount: number;
  releaseCondition?: string | null;
  dueAt?: string | null;
  releasedAt?: string | null;
  status: string | number;
};

export type InvestmentReport = {
  id: number;
  title: string;
  content?: string | null;
  spentAmount?: number | null;
  roiPercent?: number | null;
  reportedAt: string;
};

export type AdminInvestmentStatus = "Draft" | "PendingReview" | "Open" | "Funded" | "Closed" | "Rejected";
