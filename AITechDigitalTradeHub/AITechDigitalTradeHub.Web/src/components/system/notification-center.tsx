"use client";

import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeNotifications } from "@/features/conversations/realtime/use-conversation-realtime";
import { getNotifications, markAllNotificationsAsRead } from "@/features/notifications/api/notifications-api";
import type { ServerNotification } from "@/features/notifications/types";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";

export function NotificationCenter({ label = "اعلان‌ها" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  useRealtimeNotifications();
  const notifications = useNotificationStore((state) => state.notifications);
  const markLocalAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);
  const serverNotificationsQuery = useQuery({
    queryKey: ["notifications", "mine"],
    queryFn: () => getNotifications({ pageSize: 20 }),
    enabled: isAuthenticated
  });
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      markLocalAllAsRead();
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => markLocalAllAsRead()
  });
  const serverNotifications = serverNotificationsQuery.data?.results ?? [];
  const visibleNotifications = [
    ...serverNotifications.map(toDisplayNotification),
    ...notifications.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      read: item.read,
      createdAt: item.createdAt,
      source: "local" as const
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);
  const unreadCount = visibleNotifications.filter((item) => !item.read).length;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={label}
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded-md border border-border bg-white/86 text-muted shadow-panel hover:text-foreground"
      >
        <Bell className="size-4" />
        {unreadCount ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-black leading-5 text-white">{unreadCount > 9 ? "+9" : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-12 z-[90] w-[min(88vw,360px)] rounded-lg border border-border bg-white p-3 text-foreground shadow-[0_22px_70px_rgb(15_23_42_/_0.18)]" dir="rtl">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <div className="text-sm font-black">اعلان‌ها</div>
              <div className="mt-1 text-xs text-muted">{unreadCount ? `${unreadCount} اعلان خوانده‌نشده` : "اعلان خوانده‌نشده ندارید"}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-md text-muted hover:bg-background hover:text-foreground" aria-label="بستن">
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => markAllMutation.mutate()} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold text-muted hover:text-foreground">
              <CheckCheck className="size-3.5" />
              خواندن همه
            </button>
            <button type="button" onClick={clearNotifications} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold text-muted hover:text-danger">
              <Trash2 className="size-3.5" />
              پاک کردن
            </button>
          </div>

          <div className="mt-3 max-h-[360px] overflow-y-auto pr-1">
            {visibleNotifications.length ? (
              <div className="grid gap-2">
                {visibleNotifications.slice(0, 12).map((item) => (
                  <article key={item.id} className={`rounded-md border p-3 ${item.read ? "border-border bg-background/45" : "border-primary/25 bg-primary/5"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black">{item.title}</div>
                        {item.message ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted">{item.message}</p> : null}
                      </div>
                      {!item.read ? <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" /> : null}
                    </div>
                    <time className="mt-2 block text-[10px] text-muted">{new Date(item.createdAt).toLocaleString("fa-IR")}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-background px-3 py-6 text-center text-sm text-muted">{serverNotificationsQuery.isLoading ? "در حال دریافت اعلان‌ها" : "هنوز اعلانی ثبت نشده است."}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toDisplayNotification(item: ServerNotification) {
  const id = Number(item.id ?? item.iD ?? 0);
  const message = item.message || "اعلان جدید";
  return {
    id: `server-${id}`,
    title: message,
    message: undefined as string | undefined,
    read: item.isRead,
    createdAt: item.createDate ? new Date(item.createDate).getTime() : Date.now(),
    source: "server" as const
  };
}
