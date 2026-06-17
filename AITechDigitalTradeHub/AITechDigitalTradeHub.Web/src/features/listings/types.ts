import type { EntityId } from "@/types/domain";

export type ListingSummary = {
  id: EntityId;
  slug: string;
  title: string;
  description?: string | null;
  listingType: string | number;
  status: string | number;
  priceType: string | number;
  priceAmount?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency: string;
  categoryName?: string | null;
  ownerUserId: EntityId;
  ownerName?: string | null;
  publishedAt?: string | null;
};

export type ListingDetail = ListingSummary & {
  productDetails?: unknown | null;
  serviceDetails?: {
    serviceMode: string | number;
    durationMinutes?: number | null;
    serviceRadiusKm?: number | null;
    hasPackages: boolean;
    packages: Array<{
      id: EntityId;
      title: string;
      description?: string | null;
      priceAmount: number;
      durationMinutes?: number | null;
    }>;
  } | null;
  equipmentRentalDetails?: unknown | null;
};

export type ListingCreatePayload = {
  listingType: "Product" | "Service" | "RentalEquipment";
  title: string;
  description?: string;
  categoryId: number;
  priceType: "Fixed" | "Negotiable" | "Range";
  priceAmount?: number;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  serviceDetails?: {
    serviceMode: "Online" | "OnSite" | "Both";
    durationMinutes?: number;
    hasPackages: boolean;
  };
  productDetails?: {
    condition: "New" | "Used";
    stockQty: number;
  };
  rentalDetails?: {
    billingUnit: "Hour" | "Day" | "Month";
    pricePerUnit: number;
    gpuModel?: string;
  };
};

export type OrderSummary = {
  id: EntityId;
  buyerUserId: EntityId;
  buyerName?: string | null;
  sellerUserId: EntityId;
  sellerName?: string | null;
  listingId: EntityId;
  listingTitle?: string | null;
  qty: number;
  priceAmount: number;
  status: string | number;
  createDate?: string | null;
  completedAt?: string | null;
};
