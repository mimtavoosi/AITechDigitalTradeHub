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
