import { create } from "zustand";

export type NotificationTone = "info" | "success" | "warning" | "error";

export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  tone: NotificationTone;
  createdAt: number;
  read: boolean;
  toast: boolean;
};

type NotificationInput = {
  title: string;
  message?: string;
  tone?: NotificationTone;
  toast?: boolean;
};

type NotificationState = {
  notifications: AppNotification[];
  addNotification: (notification: NotificationInput) => string;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const maxNotifications = 60;

function createNotificationId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = createNotificationId();
    const next: AppNotification = {
      id,
      title: notification.title,
      message: notification.message,
      tone: notification.tone ?? "info",
      createdAt: Date.now(),
      read: false,
      toast: notification.toast ?? true
    };

    set((state) => ({
      notifications: [next, ...state.notifications].slice(0, maxNotifications)
    }));

    return id;
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id)
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true, toast: false } : item))
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, read: true, toast: false }))
    })),
  clearNotifications: () => set({ notifications: [] })
}));
