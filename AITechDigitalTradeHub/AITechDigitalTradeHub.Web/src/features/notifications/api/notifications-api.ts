import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { NotificationPreferences, ServerNotification, UnreadNotificationCount } from "@/features/notifications/types";

export function getNotifications(params: { pageIndex?: number; pageSize?: number; searchText?: string } = {}) {
  return apiRequest<DotNetListResult<ServerNotification>>(`${apiEndpoints.notifications.list}${toQueryString(params)}`);
}

export function getUnreadNotificationCount() {
  return apiRequest<UnreadNotificationCount>(apiEndpoints.notifications.unreadCount);
}

export function getNotificationPreferences() {
  return apiRequest<NotificationPreferences>(apiEndpoints.notifications.preferences);
}

export function updateNotificationPreferences(payload: NotificationPreferences) {
  return apiRequest<NotificationPreferences>(apiEndpoints.notifications.preferences, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function markNotificationAsRead(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.notifications.read(id), { method: "PATCH" });
}

export function markAllNotificationsAsRead() {
  return apiRequest<DotNetResult>(apiEndpoints.notifications.readAll, { method: "PATCH" });
}

export function deleteNotification(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.notifications.delete(id), { method: "DELETE" });
}
