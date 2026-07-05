import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type { Conversation, ConversationContextType, CreateConversationPayload, SendConversationMessagePayload } from "@/features/conversations/types";

export function getConversations(params: { contextType?: ConversationContextType | ""; contextId?: number; pageIndex?: number; pageSize?: number } = {}) {
  return apiRequest<DotNetListResult<Conversation>>(`${apiEndpoints.conversations.list}${toQueryString(params)}`);
}

export function createOrGetConversation(payload: CreateConversationPayload) {
  return apiRequest<DotNetRowResult<Conversation>>(apiEndpoints.conversations.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getConversation(id: number) {
  return apiRequest<DotNetRowResult<Conversation>>(apiEndpoints.conversations.detail(id));
}

export function sendConversationMessage(conversationId: number, payload: SendConversationMessagePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.conversations.messages(conversationId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function markConversationAsRead(conversationId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.conversations.read(conversationId), {
    method: "PATCH"
  });
}
