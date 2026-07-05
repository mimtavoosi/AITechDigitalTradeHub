import type { EntityId } from "@/types/domain";

export type TicketCategory = "Technical" | "Financial" | "Project" | "Education" | "Dispute" | "General" | number;
export type TicketStatus = "Open" | "Pending" | "Answered" | "Resolved" | "Closed" | number;
export type TicketPriority = "Low" | "Normal" | "High" | "Urgent" | number;

export type TicketAttachment = {
  id: EntityId;
  ticketId: EntityId;
  fileUploadId: EntityId;
  fileName?: string | null;
  fileUrl?: string | null;
  contentType?: string | null;
  uploadedByUserId: EntityId;
  createDate?: string | null;
};

export type TicketMessage = {
  id: EntityId;
  ticketId: EntityId;
  userId?: EntityId | null;
  userName?: string | null;
  messageContent: string;
  isAdminResponse: boolean;
  createDate?: string | null;
};

export type Ticket = {
  id: EntityId;
  subject: string;
  description: string;
  userId: EntityId;
  userName?: string | null;
  assignedToUserId?: EntityId | null;
  assignedToName?: string | null;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  referenceType?: string | null;
  referenceId?: EntityId | null;
  slaDueAt?: string | null;
  firstRespondedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  satisfactionScore?: number | null;
  createDate?: string | null;
  updateDate?: string | null;
  messagesCount: number;
  attachmentsCount: number;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
};

export type CreateTicketPayload = {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  referenceType?: string;
  referenceId?: number;
  attachmentFileIds?: number[];
};

export type CreateTicketMessagePayload = {
  messageContent: string;
  attachmentFileIds?: number[];
};

export type UploadedFileSummary = {
  id: EntityId;
  fileName: string;
  fileUrl?: string | null;
  contentType?: string | null;
};

export type TicketAdminSummary = {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  answeredTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  overdueTickets: number;
  slaBreachedTickets: number;
  averageFirstResponseMinutes: number;
  averageResolutionMinutes: number;
  averageSatisfactionScore: number;
  satisfactionResponsesCount: number;
};
