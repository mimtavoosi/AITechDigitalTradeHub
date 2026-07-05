import type { EntityId } from "@/types/domain";

export type Wallet = {
  id?: EntityId;
  iD?: EntityId;
  ownerType: string | number;
  ownerUserId?: EntityId | null;
  ownerOrganizationId?: EntityId | null;
  balance: number;
  currency: string;
  status: string | number;
};

export type PlatformFeeContextType = "Order" | "Contract" | "Course" | "TeacherBooking" | "Investment" | "Payout";

export type FeeRuleSummary = {
  id?: EntityId;
  iD?: EntityId;
  contextType: string | number;
  ContextType?: string | number;
  percent: number;
  Percent?: number;
  fixedAmount?: number | null;
  FixedAmount?: number | null;
  currency?: string;
  Currency?: string;
  minAmount?: number | null;
  MinAmount?: number | null;
  maxAmount?: number | null;
  MaxAmount?: number | null;
  isActiveRule: boolean;
  IsActiveRule?: boolean;
};

export type FeeRulePayload = {
  contextType: PlatformFeeContextType;
  percent: number;
  fixedAmount?: number;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  isActiveRule?: boolean;
};

export type WalletTransaction = {
  id?: EntityId;
  iD?: EntityId;
  walletId: EntityId;
  txType: string | number;
  amount: number;
  referenceType?: string | null;
  referenceId?: EntityId | null;
  gatewayRef?: string | null;
  status: string | number;
  createDate?: string | null;
};

export type AdminFinanceDashboard = {
  range: {
    from: string;
    to: string;
  };
  walletsCount: number;
  walletsBalance: number;
  frozenWalletsCount: number;
  transactionCount: number;
  transactionVolume: number;
  depositVolume: number;
  paymentVolume: number;
  withdrawVolume: number;
  holdVolume: number;
  releaseVolume: number;
  refundVolume: number;
  feeVolume: number;
  heldEscrowsCount: number;
  heldEscrowsAmount: number;
  requestedPayoutsCount: number;
  requestedPayoutsAmount: number;
};

export type AdminWallet = {
  id: EntityId;
  ownerType: string | number;
  ownerUserId?: EntityId | null;
  ownerOrganizationId?: EntityId | null;
  ownerName: string;
  balance: number;
  currency: string;
  status: string | number;
  createDate?: string | null;
};

export type AdminTransaction = {
  id: EntityId;
  walletId: EntityId;
  walletOwnerName: string;
  walletOwnerType: string | number;
  txType: string | number;
  amount: number;
  referenceType?: string | null;
  referenceId?: EntityId | null;
  gatewayRef?: string | null;
  status: string | number;
  createDate?: string | null;
};

export type AdminEscrow = {
  id: EntityId;
  payerWalletId: EntityId;
  payerOwnerName: string;
  payeeWalletId: EntityId;
  payeeOwnerName: string;
  amount: number;
  contextType: string;
  contextId: EntityId;
  status: string | number;
  createDate?: string | null;
  updateDate?: string | null;
};

export type AdminPayoutRequest = {
  id: EntityId;
  walletId: EntityId;
  walletOwnerName: string;
  amount: number;
  bankAccountMasked: string;
  status: string | number;
  paidAt?: string | null;
  createDate?: string | null;
};
