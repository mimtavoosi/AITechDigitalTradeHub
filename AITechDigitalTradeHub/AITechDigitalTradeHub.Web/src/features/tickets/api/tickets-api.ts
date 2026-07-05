import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type { CreateTicketMessagePayload, CreateTicketPayload, Ticket, TicketAdminSummary, TicketCategory, TicketPriority, TicketStatus, UploadedFileSummary } from "@/features/tickets/types";

export function getTickets(params: { category?: TicketCategory | ""; status?: TicketStatus | ""; referenceType?: string; referenceId?: number; searchText?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<Ticket>>(`${apiEndpoints.tickets.list}${toQueryString(params)}`);
}

export function getTicket(id: number) {
  return apiRequest<DotNetRowResult<Ticket>>(apiEndpoints.tickets.detail(id));
}

export function createTicket(payload: CreateTicketPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addTicketMessage(ticketId: number, payload: CreateTicketMessagePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.messages(ticketId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addTicketAttachment(ticketId: number, fileUploadId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.attachments(ticketId), {
    method: "POST",
    body: JSON.stringify({ fileUploadId })
  });
}

export function resolveTicket(ticketId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.resolve(ticketId), { method: "POST" });
}

export function closeTicket(ticketId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.close(ticketId), { method: "POST" });
}

export function updateTicketSatisfaction(ticketId: number, satisfactionScore: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.satisfaction(ticketId), {
    method: "PATCH",
    body: JSON.stringify({ satisfactionScore })
  });
}

export function uploadTicketFile(file: File, params: { ticketId?: number; tag?: string; note?: string } = {}) {
  const form = new FormData();
  form.set("file", file);
  form.set("entityType", "Ticket");
  if (params.ticketId) {
    form.set("foreignKeyId", String(params.ticketId));
  }
  if (params.tag) {
    form.set("tag", params.tag);
  }
  if (params.note) {
    form.set("note", params.note);
  }

  return apiRequest<DotNetRowResult<UploadedFileSummary>>(apiEndpoints.files.upload, {
    method: "POST",
    body: form
  });
}

export function getAdminTickets(params: { category?: TicketCategory | ""; status?: TicketStatus | ""; priority?: TicketPriority | ""; assignedToMe?: boolean; searchText?: string; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<Ticket>>(`${apiEndpoints.tickets.adminList}${toQueryString(params)}`);
}

export function getAdminTicketSummary() {
  return apiRequest<DotNetRowResult<TicketAdminSummary>>(apiEndpoints.tickets.adminSummary);
}

export function getAdminTicket(id: number) {
  return apiRequest<DotNetRowResult<Ticket>>(apiEndpoints.tickets.adminDetail(id));
}

export function addAdminTicketMessage(ticketId: number, payload: CreateTicketMessagePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.adminMessages(ticketId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function assignAdminTicket(ticketId: number, assignedToUserId?: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.adminAssign(ticketId), {
    method: "PATCH",
    body: JSON.stringify({ assignedToUserId })
  });
}

export function updateAdminTicketStatus(ticketId: number, status: TicketStatus, satisfactionScore?: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.adminStatus(ticketId), {
    method: "PATCH",
    body: JSON.stringify({ status, satisfactionScore })
  });
}

export function escalateAdminTicket(ticketId: number, targetQueue: "Financial" | "Arbitration", note?: string) {
  return apiRequest<DotNetResult>(apiEndpoints.tickets.adminEscalate(ticketId), {
    method: "PATCH",
    body: JSON.stringify({ targetQueue, note })
  });
}
