"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createConversationRealtimeClient } from "@/features/conversations/realtime/conversation-realtime";
import type { ConversationMessage } from "@/features/conversations/types";
import type { ServerNotification } from "@/features/notifications/types";
import { useAuthStore } from "@/store/auth-store";
import type { DotNetListResult } from "@/types/api";
import type { EntityId } from "@/types/domain";

export function useConversationRealtime(conversationId: EntityId | number | null | undefined, onMessage?: (message: ConversationMessage) => void) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken || !conversationId) return;

    const client = createConversationRealtimeClient({
      conversationId,
      onMessage
    });

    return () => client.close();
  }, [accessToken, conversationId, onMessage]);
}

export function useRealtimeNotifications() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const client = createConversationRealtimeClient({
      onNotification: (notification: ServerNotification) => {
        queryClient.setQueryData<DotNetListResult<ServerNotification>>(["notifications", "mine"], (current) => {
          if (!current?.results) return current;

          const notificationId = Number(notification.id ?? notification.iD ?? 0);
          const alreadyExists = current.results.some((item) => Number(item.id ?? item.iD ?? 0) === notificationId);
          if (alreadyExists) return current;

          return {
            ...current,
            totalCount: current.totalCount + 1,
            results: [notification, ...current.results].slice(0, 20)
          };
        });

        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });

    return () => client.close();
  }, [accessToken, queryClient]);
}
