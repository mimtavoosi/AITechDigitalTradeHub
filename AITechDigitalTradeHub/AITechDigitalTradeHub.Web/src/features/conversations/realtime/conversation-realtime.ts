import { appConfig } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import type { ServerNotification } from "@/features/notifications/types";
import type { ConversationMessage } from "@/features/conversations/types";
import type { EntityId } from "@/types/domain";

const recordSeparator = "\u001e";

type SignalRFrame = {
  type?: number;
  target?: string;
  arguments?: unknown[];
  error?: string;
};

export type ConversationRealtimeClient = {
  joinConversation: (conversationId: EntityId | number) => void;
  leaveConversation: (conversationId: EntityId | number) => void;
  close: () => void;
};

type ConversationRealtimeOptions = {
  conversationId?: EntityId | number;
  onMessage?: (message: ConversationMessage) => void;
  onNotification?: (notification: ServerNotification) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

export function createConversationRealtimeClient(options: ConversationRealtimeOptions = {}): ConversationRealtimeClient {
  if (typeof window === "undefined") {
    return createNoopClient();
  }

  const token = useAuthStore.getState().accessToken;
  if (!token) {
    return createNoopClient();
  }

  const pendingInvocations: string[] = [];
  let closed = false;
  let socket: WebSocket | null = new WebSocket(getHubUrl(token));

  const sendInvocation = (target: string, args: unknown[]) => {
    const payload = `${JSON.stringify({ type: 1, target, arguments: args })}${recordSeparator}`;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(payload);
      return;
    }

    pendingInvocations.push(payload);
  };

  socket.onopen = () => {
    socket?.send(`${JSON.stringify({ protocol: "json", version: 1 })}${recordSeparator}`);
    if (options.conversationId) {
      sendInvocation("JoinConversation", [Number(options.conversationId)]);
    }

    while (pendingInvocations.length && socket?.readyState === WebSocket.OPEN) {
      socket.send(pendingInvocations.shift() ?? "");
    }

    options.onOpen?.();
  };

  socket.onmessage = (event) => {
    if (typeof event.data !== "string") return;

    for (const rawFrame of event.data.split(recordSeparator)) {
      if (!rawFrame.trim()) continue;

      const frame = parseFrame(rawFrame);
      if (!frame || frame.type !== 1 || !frame.target) continue;

      if (frame.target === "ConversationMessageCreated") {
        const message = frame.arguments?.[0] as ConversationMessage | undefined;
        if (message) options.onMessage?.(message);
      }

      if (frame.target === "NotificationCreated") {
        const notification = frame.arguments?.[0] as ServerNotification | undefined;
        if (notification) options.onNotification?.(notification);
      }
    }
  };

  socket.onerror = (event) => {
    options.onError?.(event);
  };

  socket.onclose = () => {
    socket = null;
    if (!closed) options.onClose?.();
  };

  return {
    joinConversation: (conversationId) => sendInvocation("JoinConversation", [Number(conversationId)]),
    leaveConversation: (conversationId) => sendInvocation("LeaveConversation", [Number(conversationId)]),
    close: () => {
      closed = true;
      pendingInvocations.length = 0;
      socket?.close();
      socket = null;
    }
  };
}

function createNoopClient(): ConversationRealtimeClient {
  return {
    joinConversation: () => undefined,
    leaveConversation: () => undefined,
    close: () => undefined
  };
}

function getHubUrl(token: string) {
  const url = new URL(appConfig.apiBaseUrl, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/api\/?$/, "").replace(/\/$/, "")}/hubs/conversations`;
  url.searchParams.set("access_token", token);
  return url.toString();
}

function parseFrame(rawFrame: string): SignalRFrame | null {
  try {
    return JSON.parse(rawFrame) as SignalRFrame;
  } catch {
    return null;
  }
}
