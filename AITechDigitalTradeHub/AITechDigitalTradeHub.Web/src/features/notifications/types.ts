import type { EntityId } from "@/types/domain";

export type ServerNotification = {
  id?: EntityId;
  iD?: EntityId;
  message: string;
  userId: EntityId;
  isRead: boolean;
  createDate?: string | null;
  updateDate?: string | null;
};

export type UnreadNotificationCount = {
  unreadCount: number;
};

export type NotificationPreferences = {
  userId?: EntityId;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  financialEnabled: boolean;
  projectEnabled: boolean;
  disputeEnabled: boolean;
  educationEnabled: boolean;
  supportEnabled: boolean;
  marketingEnabled: boolean;
  digestFrequency: "instant" | "daily" | "weekly" | string;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  updateDate?: string | null;
};
