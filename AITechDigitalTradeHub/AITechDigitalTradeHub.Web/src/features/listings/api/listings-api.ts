import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import { toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type { ListingCreatePayload, ListingDetail, ListingSummary, OrderSummary } from "@/features/listings/types";

export function getListings() {
  return apiRequest<DotNetListResult<ListingSummary>>(`${apiEndpoints.listings.list}?status=Published`);
}

export function getListing(id: number) {
  return apiRequest<DotNetRowResult<ListingDetail>>(apiEndpoints.listings.detail(id));
}

export function getMyListings() {
  return apiRequest<DotNetListResult<ListingSummary>>(apiEndpoints.listings.mine);
}

export function createListing(payload: ListingCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.listings.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function publishListing(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.listings.publish(id), {
    method: "POST"
  });
}

export function createOrder(payload: { listingId: number; qty: number; servicePackageId?: number; priceAmount?: number }) {
  return apiRequest<DotNetResult>(apiEndpoints.orders.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function payOrder(orderId: number, walletId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.orders.pay(orderId), {
    method: "POST",
    body: JSON.stringify({ walletId })
  });
}

export function getPurchases() {
  return apiRequest<DotNetListResult<OrderSummary>>(apiEndpoints.orders.purchases);
}

export function getSales() {
  return apiRequest<DotNetListResult<OrderSummary>>(apiEndpoints.orders.sales);
}

export function getAdminListings(params: { status?: string; listingType?: string; searchText?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<ListingSummary>>(apiEndpoints.listings.adminList + toQueryString(params));
}

export function updateAdminListingStatus(id: number, status: string, note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.listings.adminStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status, note })
  });
}

export function getAdminOrders(params: { status?: string; listingId?: number; searchText?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<OrderSummary>>(apiEndpoints.orders.adminList + toQueryString(params));
}

export function updateAdminOrderStatus(id: number, status: string, note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.orders.adminStatus(id), {
    method: "PATCH",
    body: JSON.stringify({ status, note })
  });
}
