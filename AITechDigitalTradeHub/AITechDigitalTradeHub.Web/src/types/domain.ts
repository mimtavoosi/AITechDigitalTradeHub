export type EntityId = string;

export type ListingType = "service" | "product" | "rental";

export type ProjectStatus =
  | "draft"
  | "open"
  | "underReview"
  | "assigned"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed";

export type UserRole =
  | "user"
  | "provider"
  | "employer"
  | "executor"
  | "organization"
  | "investor"
  | "instructor"
  | "support"
  | "arbitrator"
  | "admin";
