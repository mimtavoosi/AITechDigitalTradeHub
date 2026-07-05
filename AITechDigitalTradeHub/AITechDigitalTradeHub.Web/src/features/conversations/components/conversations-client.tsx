"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { getConversation, getConversations, markConversationAsRead, sendConversationMessage } from "@/features/conversations/api/conversations-api";
import { useConversationRealtime } from "@/features/conversations/realtime/use-conversation-realtime";
import type { Conversation, ConversationMessage, ConversationContextType } from "@/features/conversations/types";
import type { DotNetListResult, DotNetRowResult } from "@/types/api";

export function ConversationsClient() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [text, setText] = useState("");

  const conversationsQuery = useQuery({
    queryKey: ["conversations", "mine"],
    queryFn: () => getConversations({ pageSize: 50 })
  });

  const conversations = useMemo(() => conversationsQuery.data?.results ?? [], [conversationsQuery.data?.results]);

  useEffect(() => {
    if (!selectedConversationId && conversations.length) {
      setSelectedConversationId(Number(conversations[0].id));
    }
  }, [conversations, selectedConversationId]);

  const conversationQuery = useQuery({
    queryKey: ["conversations", "detail", selectedConversationId],
    queryFn: () => getConversation(selectedConversationId ?? 0),
    enabled: Boolean(selectedConversationId)
  });

  const selectedConversation = conversationQuery.data?.result ?? null;
  const messages = selectedConversation?.messages ?? [];

  const handleRealtimeMessage = useCallback(
    (message: ConversationMessage) => {
      queryClient.setQueryData<DotNetRowResult<Conversation>>(["conversations", "detail", Number(message.conversationId)], (current) => {
        if (!current?.result) return current;
        if (current.result.messages.some((item) => Number(item.id) === Number(message.id))) return current;

        return {
          ...current,
          result: {
            ...current.result,
            lastMessage: message,
            lastMessageAt: message.createDate,
            messages: [...current.result.messages, message]
          }
        };
      });

      queryClient.setQueryData<DotNetListResult<Conversation>>(["conversations", "mine"], (current) => {
        if (!current?.results) return current;
        return {
          ...current,
          results: current.results
            .map((item) =>
              Number(item.id) === Number(message.conversationId)
                ? { ...item, lastMessage: message, lastMessageAt: message.createDate, unreadCount: selectedConversationId === Number(message.conversationId) ? 0 : item.unreadCount + 1 }
                : item
            )
            .sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime())
        };
      });
    },
    [queryClient, selectedConversationId]
  );

  useConversationRealtime(selectedConversationId, handleRealtimeMessage);

  useEffect(() => {
    if (!selectedConversationId || !messages.length) return;

    let active = true;
    markConversationAsRead(selectedConversationId)
      .then(() => {
        if (active) void queryClient.invalidateQueries({ queryKey: ["conversations", "mine"] });
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [messages.length, queryClient, selectedConversationId]);

  const sendMutation = useMutation({
    mutationFn: (payload: { conversationId: number; text: string }) => sendConversationMessage(payload.conversationId, { text: payload.text }),
    onSuccess: (_, payload) => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["conversations", "detail", payload.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations", "mine"] });
    }
  });

  const selectedTitle = useMemo(() => selectedConversation ? getConversationTitle(selectedConversation) : "گفتگو", [selectedConversation]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversationId || !text.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ conversationId: selectedConversationId, text: text.trim() });
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="dashboard-card min-h-[520px] p-3">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="font-black">گفتگوها</div>
          {conversationsQuery.isLoading ? <Loader2 className="size-4 animate-spin text-muted" /> : <MessageCircle className="size-4 text-primary" />}
        </div>
        <div className="mt-3 grid gap-2">
          {conversations.map((conversation) => {
            const active = Number(conversation.id) === selectedConversationId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(Number(conversation.id))}
                className={`rounded-md border p-3 text-right transition ${active ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black">{getConversationTitle(conversation)}</span>
                  {conversation.unreadCount ? <span className="grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-black leading-5 text-white">{conversation.unreadCount > 9 ? "+9" : conversation.unreadCount}</span> : null}
                </div>
                {conversation.lastMessage?.text ? <p className="mt-2 line-clamp-1 text-xs leading-6 text-muted">{conversation.lastMessage.text}</p> : null}
                {conversation.lastMessageAt ? <time className="mt-2 block text-[10px] text-muted">{new Date(conversation.lastMessageAt).toLocaleString("fa-IR")}</time> : null}
              </button>
            );
          })}
          {!conversations.length ? <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">{conversationsQuery.isLoading ? "در حال دریافت گفتگوها" : "گفتگویی ثبت نشده است."}</div> : null}
        </div>
      </aside>

      <div className="dashboard-card flex min-h-[520px] flex-col p-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="font-black">{selectedTitle}</h2>
            <p className="mt-1 text-xs text-muted">{selectedConversation ? getContextLabel(selectedConversation.contextType) : "پیام‌ها"}</p>
          </div>
          {conversationQuery.isLoading ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
        </div>

        <div className="mt-4 grid flex-1 content-start gap-2 overflow-y-auto rounded-md bg-background/50 p-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-md bg-white px-3 py-2 text-xs shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-2 text-muted">
                <span>{message.senderName ?? `کاربر ${message.senderUserId}`}</span>
                <time>{message.createDate ? new Date(message.createDate).toLocaleString("fa-IR") : ""}</time>
              </div>
              {message.text ? <p className="mt-2 leading-6">{message.text}</p> : null}
              {message.fileUrl ? (
                <a className="mt-2 inline-flex rounded-md border border-border px-2 py-1 font-bold" href={message.fileUrl} target="_blank" rel="noreferrer">
                  {message.fileName ?? "فایل پیوست"}
                </a>
              ) : null}
            </article>
          ))}
          {!messages.length ? <div className="px-2 py-8 text-center text-sm text-muted">{selectedConversationId ? "هنوز پیامی ثبت نشده است." : "یک گفتگو را انتخاب کنید."}</div> : null}
        </div>

        <form className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleSubmit}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="h-11 rounded-md border border-border bg-white px-3 text-sm focus-ring"
            placeholder="پیام خود را بنویسید"
            disabled={!selectedConversationId || sendMutation.isPending}
          />
          <button
            type="submit"
            disabled={!selectedConversationId || !text.trim() || sendMutation.isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            ارسال
          </button>
        </form>
      </div>
    </section>
  );
}

function getConversationTitle(conversation: Conversation) {
  const members = conversation.members.map((member) => member.userName).filter(Boolean);
  if (members.length) return members.join("، ");
  return `${getContextLabel(conversation.contextType)} #${conversation.contextId}`;
}

function getContextLabel(contextType: ConversationContextType) {
  const value = String(contextType);
  if (value === "1" || value === "Project") return "پروژه";
  if (value === "2" || value === "Order") return "سفارش";
  if (value === "3" || value === "Support") return "پشتیبانی";
  return "گفتگو";
}
