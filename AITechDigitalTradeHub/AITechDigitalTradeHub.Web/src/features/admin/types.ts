export type MetricPoint = {
  label: string;
  count: number;
  amount: number;
};

export type AdminReportRange = {
  from: string;
  to: string;
};

export type ActiveUsersReport = {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  newUsersByDay: MetricPoint[];
};

export type FinanceReport = {
  transactionCount: number;
  transactionVolume: number;
  depositVolume: number;
  paymentVolume: number;
  refundVolume: number;
  platformFeeRevenue: number;
  heldEscrows: number;
  heldEscrowAmount: number;
  volumeByDay: MetricPoint[];
};

export type ProjectPerformanceReport = {
  totalProjects: number;
  newProjects: number;
  publishedProjects: number;
  inProgressProjects: number;
  doneProjects: number;
  cancelledProjects: number;
  submittedProposals: number;
  activeContracts: number;
  completedContracts: number;
  projectsByStatus: MetricPoint[];
};

export type ServiceSalesReport = {
  totalOrders: number;
  paidOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  salesVolume: number;
  completedSalesVolume: number;
  ordersByStatus: MetricPoint[];
};

export type EducationReport = {
  publishedCourses: number;
  newEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  enrollmentRevenue: number;
  confirmedTeacherBookings: number;
  completedTeacherBookings: number;
  teacherBookingRevenue: number;
};

export type InvestmentReportSummary = {
  totalOpportunities: number;
  openOpportunities: number;
  fundedOpportunities: number;
  closedOpportunities: number;
  requiredCapital: number;
  raisedCapital: number;
  averageExpectedRoiPercent: number;
  averageReportedRoiPercent: number;
  fundedCommitments: number;
  fundedCommitmentAmount: number;
  opportunitiesByStage: MetricPoint[];
};

export type DisputeReport = {
  totalDisputes: number;
  openDisputes: number;
  underReviewDisputes: number;
  decidedDisputes: number;
  closedDisputes: number;
  disputesByContext: MetricPoint[];
};

export type AdminBiDashboard = {
  range: AdminReportRange;
  users: ActiveUsersReport;
  finance: FinanceReport;
  projects: ProjectPerformanceReport;
  services: ServiceSalesReport;
  education: EducationReport;
  investments: InvestmentReportSummary;
  disputes: DisputeReport;
  dailyActivity: MetricPoint[];
};

export type AdminRole = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  usersCount: number;
  permissions: AdminPermission[];
};

export type AdminPermission = {
  id: number;
  key: string;
  name: string;
  permissionType: string;
  description?: string | null;
  icon?: string | null;
  routename?: string | null;
  menuParentId?: number | null;
  menuIds?: string | null;
  isActive: boolean;
};

export type AdminActivityLog = {
  source: string;
  id: number;
  userId?: number | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  detailsJson?: string | null;
  createDate?: string | null;
};

export type RoleUpsertPayload = {
  name: string;
  description?: string;
  isActive: boolean;
};

export type PermissionUpsertPayload = {
  key: string;
  name: string;
  permissionType: string;
  description?: string;
  icon?: string;
  routename?: string;
  isActive: boolean;
};
