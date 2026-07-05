"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNotificationStore, type AppNotification, type NotificationTone } from "@/store/notification-store";

const toneClass: Record<NotificationTone, string> = {
  info: "border-primary/25 bg-white text-foreground",
  success: "border-success/25 bg-white text-foreground",
  warning: "border-warning/25 bg-white text-foreground",
  error: "border-danger/25 bg-white text-foreground"
};

const iconClass: Record<NotificationTone, string> = {
  info: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-danger/10 text-danger"
};

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle
};

export function NotificationViewport() {
  const allNotifications = useNotificationStore((state) => state.notifications);
  const notifications = useMemo(() => allNotifications.filter((item) => item.toast).slice(0, 4), [allNotifications]);

  return (
    <div className="fixed bottom-4 left-4 z-[80] grid w-[min(92vw,380px)] gap-3" dir="rtl" aria-live="polite">
      {notifications.map((notification) => <NotificationToast key={notification.id} notification={notification} />)}
    </div>
  );
}

function NotificationToast({ notification }: { notification: AppNotification }) {
  const dismiss = useNotificationStore((state) => state.dismissNotification);
  const Icon = iconMap[notification.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(notification.id), notification.tone === "error" ? 8000 : 5200);
    return () => window.clearTimeout(timer);
  }, [dismiss, notification.id, notification.tone]);

  return (
    <div className={`animate-panel-in rounded-lg border p-3 shadow-[0_18px_48px_rgb(15_23_42_/_0.16)] backdrop-blur ${toneClass[notification.tone]}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-md ${iconClass[notification.tone]}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">{notification.title}</div>
          {notification.message ? <p className="mt-1 text-xs leading-6 text-muted">{notification.message}</p> : null}
        </div>
        <button type="button" onClick={() => dismiss(notification.id)} className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-background hover:text-foreground" aria-label="بستن اعلان">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}


