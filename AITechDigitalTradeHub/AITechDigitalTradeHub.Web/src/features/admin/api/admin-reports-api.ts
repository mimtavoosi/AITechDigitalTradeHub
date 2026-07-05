import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import { normalizeDotNetRow } from "@/lib/api/dotnet-result";
import type {
  ActiveUsersReport,
  AdminBiDashboard,
  EducationReport,
  FinanceReport,
  InvestmentReportSummary,
  ProjectPerformanceReport,
  ServiceSalesReport
} from "@/features/admin/types";

export type AdminReportParams = {
  from?: string;
  to?: string;
};

function reportUrl(endpoint: string, params: AdminReportParams = {}) {
  return `${endpoint}${toQueryString(params)}`;
}

async function getReportResult<TReport>(endpoint: string, params?: AdminReportParams) {
  const response = normalizeDotNetRow<TReport>(await apiRequest<unknown>(reportUrl(endpoint, params)));
  return response.result;
}

export function getAdminBiDashboard(params?: AdminReportParams) {
  return getReportResult<AdminBiDashboard>(apiEndpoints.adminReports.biDashboard, params);
}

export function getActiveUsersReport(params?: AdminReportParams) {
  return getReportResult<ActiveUsersReport>(apiEndpoints.adminReports.activeUsers, params);
}

export function getFinanceReport(params?: AdminReportParams) {
  return getReportResult<FinanceReport>(apiEndpoints.adminReports.finance, params);
}

export function getProjectPerformanceReport(params?: AdminReportParams) {
  return getReportResult<ProjectPerformanceReport>(apiEndpoints.adminReports.projects, params);
}

export function getServiceSalesReport(params?: AdminReportParams) {
  return getReportResult<ServiceSalesReport>(apiEndpoints.adminReports.services, params);
}

export function getEducationReport(params?: AdminReportParams) {
  return getReportResult<EducationReport>(apiEndpoints.adminReports.education, params);
}

export function getInvestmentReport(params?: AdminReportParams) {
  return getReportResult<InvestmentReportSummary>(apiEndpoints.adminReports.investments, params);
}
