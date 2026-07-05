import { apiEndpoints } from "@/lib/api/api-endpoints";
import { normalizeDotNetList, normalizeDotNetRow } from "@/lib/api/dotnet-result";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { AdminEscrow, AdminFinanceDashboard, AdminPayoutRequest, AdminTransaction, AdminWallet } from "@/features/finance/types";

export type AdminFinanceRangeParams = {
  from?: string;
  to?: string;
};

export function getAdminFinanceDashboard(params: AdminFinanceRangeParams = {}) {
  return apiRequest<unknown>(`${apiEndpoints.adminFinance.dashboard}${toQueryString(params)}`)
    .then(normalizeDotNetRow<AdminFinanceDashboard>)
    .then((response) => response.result);
}

export function getAdminWallets(
  params: {
    ownerType?: number | "";
    status?: number | "";
    currency?: string;
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminFinance.wallets}${toQueryString(params)}`).then(normalizeDotNetList<AdminWallet>);
}

export function getAdminTransactions(
  params: AdminFinanceRangeParams & {
    walletId?: number | "";
    txType?: number | "";
    status?: number | "";
    referenceType?: string;
    pageIndex?: number;
    pageSize?: number;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminFinance.transactions}${toQueryString(params)}`).then(normalizeDotNetList<AdminTransaction>);
}

export function getAdminEscrows(
  params: {
    status?: number | "";
    contextType?: string;
    pageIndex?: number;
    pageSize?: number;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminFinance.escrows}${toQueryString(params)}`).then(normalizeDotNetList<AdminEscrow>);
}

export function getAdminPayoutRequests(
  params: {
    status?: number | "";
    pageIndex?: number;
    pageSize?: number;
  } = {}
) {
  return apiRequest<unknown>(`${apiEndpoints.adminFinance.payoutRequests}${toQueryString(params)}`).then(normalizeDotNetList<AdminPayoutRequest>);
}
