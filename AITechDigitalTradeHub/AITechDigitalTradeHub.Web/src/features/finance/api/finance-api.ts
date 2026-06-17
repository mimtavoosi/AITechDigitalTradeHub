import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type { Wallet, WalletTransaction } from "@/features/finance/types";

export function getMyWallet() {
  return apiRequest<DotNetRowResult<Wallet>>(apiEndpoints.finance.myWallet);
}

export function getWalletTransactions(walletId: number) {
  return apiRequest<DotNetListResult<WalletTransaction>>(apiEndpoints.finance.walletTransactions(walletId));
}

export function depositToWallet(walletId: number, amount: number) {
  return apiRequest<DotNetResult>(apiEndpoints.finance.deposit(walletId), {
    method: "POST",
    body: JSON.stringify({
      amount,
      gatewayRef: `TEST-${Date.now()}`,
      referenceType: "TestDeposit"
    })
  });
}

export function payCourseFromWallet(courseId: number, walletId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.finance.payCourse(courseId), {
    method: "POST",
    body: JSON.stringify({ walletId })
  });
}

export function payTeacherBookingFromWallet(bookingId: number, walletId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.finance.payTeacherBooking(bookingId), {
    method: "POST",
    body: JSON.stringify({ walletId })
  });
}
