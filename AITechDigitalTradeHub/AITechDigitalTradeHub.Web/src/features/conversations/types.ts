import type { EntityId } from "@/types/domain";

export type ConversationContextType = "Project" | "Order" | "Support" | number;
export type ConversationMessageType = "Text" | "File" | "System" | number;

export type ConversationMember = {
  userId: EntityId;
  userName?: string | null;
  lastReadMessageId?: EntityId | null;
  isMuted: boolean;
};

export type ConversationMessage = {
  id: EntityId;
  conversationId: EntityId;
  senderUserId: EntityId;
  senderName?: string | null;
  messageType: ConversationMessageType;
  text?: string | null;
  fileUploadId?: EntityId | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createDate?: string | null;
};

export type Conversation = {
  id: EntityId;
  contextType: ConversationContextType;
  contextId: EntityId;
  unreadCount: number;
  lastMessageAt?: string | null;
  lastMessage?: ConversationMessage | null;
  members: ConversationMember[];
  messages: ConversationMessage[];
};

export type CreateConversationPayload = {
  contextType: ConversationContextType;
  contextId: number;
};

export type SendConversationMessagePayload = {
  text?: string;
  fileUploadId?: number;
};
