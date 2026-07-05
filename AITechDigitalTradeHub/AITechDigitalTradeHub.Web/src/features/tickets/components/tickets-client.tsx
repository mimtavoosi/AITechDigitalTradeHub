"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Archive, ArrowUpRight, CalendarClock, CheckCircle2, FileUp, LifeBuoy, Loader2, MessageSquareText, Paperclip, Search, Send, Star, UserCheck } from "lucide-react";
import { addAdminTicketMessage, addTicketAttachment, addTicketMessage, assignAdminTicket, closeTicket, createTicket, escalateAdminTicket, getAdminTicket, getAdminTickets, getAdminTicketSummary, getTicket, getTickets, resolveTicket, updateAdminTicketStatus, updateTicketSatisfaction, uploadTicketFile } from "@/features/tickets/api/tickets-api";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "@/features/tickets/types";
import { ApiRequestError } from "@/lib/api/http-client";

type TicketsClientMode = "user" | "admin";

export function TicketsClient({ mode = "user" }: { mode?: TicketsClientMode }) {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [message, setMessage] = useState("");

  const isAdmin = mode === "admin";
  const ticketsQuery = useQuery({
    queryKey: ["tickets", mode, searchText, status, category],
    queryFn: () => isAdmin
      ? getAdminTickets({ searchText, status, category, pageSize: 50 })
      : getTickets({ searchText, status, category, pageSize: 50 })
  });
  const summaryQuery = useQuery({
    queryKey: ["tickets", "admin", "summary"],
    queryFn: getAdminTicketSummary,
    enabled: isAdmin
  });

  const tickets = useMemo(() => ticketsQuery.data?.results ?? [], [ticketsQuery.data?.results]);
  const effectiveSelectedId = selectedTicketId ?? (tickets[0] ? Number(tickets[0].id) : null);
  const detailQuery = useQuery({
    queryKey: ["tickets", mode, "detail", effectiveSelectedId],
    queryFn: () => isAdmin ? getAdminTicket(Number(effectiveSelectedId)) : getTicket(Number(effectiveSelectedId)),
    enabled: Boolean(effectiveSelectedId)
  });
  const selectedTicket = detailQuery.data?.result ?? tickets.find((item) => Number(item.id) === effectiveSelectedId) ?? null;
  const stats = useMemo(() => getTicketStats(tickets), [tickets]);
  const adminSummary = summaryQuery.data?.result ?? null;

  const refreshTickets = () => {
    void queryClient.invalidateQueries({ queryKey: ["tickets"] });
  };

  const createMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const file = form.get("attachment");
      const attachmentFileIds: number[] = [];
      if (file instanceof File && file.size > 0) {
        const uploaded = await uploadTicketFile(file, { tag: "initial" });
        if (uploaded.result?.id) attachmentFileIds.push(Number(uploaded.result.id));
      }

      return createTicket({
        subject: String(form.get("subject") || ""),
        description: String(form.get("description") || ""),
        category: String(form.get("category") || "General") as TicketCategory,
        priority: String(form.get("priority") || "Normal") as TicketPriority,
        referenceType: String(form.get("referenceType") || "") || undefined,
        referenceId: Number(form.get("referenceId") || 0) || undefined,
        attachmentFileIds
      });
    },
    onSuccess: (result) => {
      setMessage("تیکت ثبت شد.");
      setSelectedTicketId(Number(result.id || 0) || null);
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "ثبت تیکت ناموفق بود"))
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, form }: { ticketId: number; form: FormData }) => {
      const file = form.get("attachment");
      const attachmentFileIds: number[] = [];
      if (file instanceof File && file.size > 0) {
        const uploaded = await uploadTicketFile(file, { ticketId, tag: "reply" });
        if (uploaded.result?.id) attachmentFileIds.push(Number(uploaded.result.id));
      }

      const payload = {
        messageContent: String(form.get("messageContent") || ""),
        attachmentFileIds
      };

      return isAdmin ? addAdminTicketMessage(ticketId, payload) : addTicketMessage(ticketId, payload);
    },
    onSuccess: () => {
      setMessage(isAdmin ? "پاسخ پشتیبان ثبت شد." : "پیام شما ارسال شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "ارسال پیام ناموفق بود"))
  });

  const attachmentMutation = useMutation({
    mutationFn: async ({ ticketId, file }: { ticketId: number; file: File }) => {
      const uploaded = await uploadTicketFile(file, { ticketId, tag: "attachment" });
      const fileUploadId = Number(uploaded.result?.id ?? 0);
      if (!fileUploadId) throw new Error("آپلود فایل ناموفق بود");
      return addTicketAttachment(ticketId, fileUploadId);
    },
    onSuccess: () => {
      setMessage("پیوست اضافه شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "افزودن پیوست ناموفق بود"))
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, nextStatus }: { ticketId: number; nextStatus: TicketStatus }) => {
      if (isAdmin) return updateAdminTicketStatus(ticketId, nextStatus);
      return nextStatus === "Closed" ? closeTicket(ticketId) : resolveTicket(ticketId);
    },
    onSuccess: () => {
      setMessage("وضعیت تیکت به‌روزرسانی شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "تغییر وضعیت ناموفق بود"))
  });

  const assignMutation = useMutation({
    mutationFn: (ticketId: number) => assignAdminTicket(ticketId),
    onSuccess: () => {
      setMessage("تیکت به شما ارجاع شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "ارجاع تیکت ناموفق بود"))
  });

  const satisfactionMutation = useMutation({
    mutationFn: ({ ticketId, score }: { ticketId: number; score: number }) => updateTicketSatisfaction(ticketId, score),
    onSuccess: () => {
      setMessage("امتیاز رضایت شما ثبت شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "ثبت رضایت ناموفق بود"))
  });

  const escalateMutation = useMutation({
    mutationFn: ({ ticketId, targetQueue }: { ticketId: number; targetQueue: "Financial" | "Arbitration" }) => escalateAdminTicket(ticketId, targetQueue),
    onSuccess: () => {
      setMessage("تیکت به صف تخصصی ارجاع شد.");
      refreshTickets();
    },
    onError: (error) => setMessage(getErrorMessage(error, "ارجاع تخصصی ناموفق بود"))
  });

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="grid gap-5">
        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">{isAdmin ? "صف پشتیبانی" : "درخواست‌های من"}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{isAdmin ? "تیکت‌ها بر اساس SLA، وضعیت و ارجاع پیگیری می‌شوند." : "درخواست مالی، فنی، پروژه یا آموزش را با گفتگو و پیوست دنبال کنید."}</p>
            </div>
            <LifeBuoy className="size-6 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <TicketMetric label="باز" value={stats.open} />
            <TicketMetric label="در انتظار پاسخ" value={stats.pending} />
            <TicketMetric label="حل‌شده" value={stats.resolved} />
          </div>
          {isAdmin && adminSummary ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <TicketMetric label="خارج از SLA" value={adminSummary.overdueTickets} tone="danger" />
              <TicketMetric label="میانگین اولین پاسخ" value={formatDurationMinutes(adminSummary.averageFirstResponseMinutes)} />
              <TicketMetric label="میانگین حل پرونده" value={formatDurationMinutes(adminSummary.averageResolutionMinutes)} />
              <TicketMetric label="رضایت کاربران" value={adminSummary.satisfactionResponsesCount ? `${Number(adminSummary.averageSatisfactionScore || 0).toLocaleString("fa-IR")} از ۵` : "بدون داده"} />
            </div>
          ) : null}
        </div>

        <div className="dashboard-card p-5">
          <div className="grid gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-3 size-4 text-muted" />
              <input className="h-10 w-full rounded-md border border-border bg-white pr-9 text-sm focus-ring" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="جستجو در موضوع یا متن" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="h-10 rounded-md border border-border bg-white px-2 text-sm focus-ring" value={String(category)} onChange={(event) => setCategory(event.target.value as TicketCategory | "")}>
                <option value="">همه دسته‌ها</option>
                <option value="Technical">فنی</option>
                <option value="Financial">مالی</option>
                <option value="Project">پروژه</option>
                <option value="Education">آموزش</option>
                <option value="General">عمومی</option>
              </select>
              <select className="h-10 rounded-md border border-border bg-white px-2 text-sm focus-ring" value={String(status)} onChange={(event) => setStatus(event.target.value as TicketStatus | "")}>
                <option value="">همه وضعیت‌ها</option>
                <option value="Open">باز</option>
                <option value="Pending">در انتظار پشتیبانی</option>
                <option value="Answered">پاسخ‌داده‌شده</option>
                <option value="Resolved">حل‌شده</option>
                <option value="Closed">بسته</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {ticketsQuery.isLoading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedTicketId(Number(ticket.id))}
                className={`rounded-md border p-3 text-right transition ${Number(ticket.id) === effectiveSelectedId ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1 font-bold">{ticket.subject}</span>
                  <span className="shrink-0 rounded-md bg-background px-2 py-1 text-[11px] text-muted">{getStatusLabel(ticket.status)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{getCategoryLabel(ticket.category)}</span>
                  <span>{getPriorityLabel(ticket.priority)}</span>
                  {ticket.slaDueAt ? <span>مهلت {formatDate(ticket.slaDueAt)}</span> : null}
                </div>
              </button>
            ))}
            {!ticketsQuery.isLoading && !tickets.length ? <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted">تیکتی با این فیلتر وجود ندارد.</div> : null}
          </div>
        </div>

        {!isAdmin ? (
          <CreateTicketForm pending={createMutation.isPending} onSubmit={(form, formElement) => {
            createMutation.mutate(form);
            formElement.reset();
          }} />
        ) : null}
      </section>

      <section className="grid gap-5">
        {message ? <div className="rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
        {selectedTicket ? (
          <TicketDetailPanel
            ticket={selectedTicket}
            isAdmin={isAdmin}
            loading={detailQuery.isLoading}
            replyPending={replyMutation.isPending}
            attachmentPending={attachmentMutation.isPending}
            statusPending={statusMutation.isPending}
            assignPending={assignMutation.isPending}
            satisfactionPending={satisfactionMutation.isPending}
            escalatePending={escalateMutation.isPending}
            onReply={(ticketId, form, formElement) => {
              replyMutation.mutate({ ticketId, form });
              formElement.reset();
            }}
            onAttach={(ticketId, file) => attachmentMutation.mutate({ ticketId, file })}
            onStatus={(ticketId, nextStatus) => statusMutation.mutate({ ticketId, nextStatus })}
            onAssign={(ticketId) => assignMutation.mutate(ticketId)}
            onSatisfaction={(ticketId, score) => satisfactionMutation.mutate({ ticketId, score })}
            onEscalate={(ticketId, targetQueue) => escalateMutation.mutate({ ticketId, targetQueue })}
          />
        ) : (
          <div className="dashboard-card grid min-h-80 place-items-center p-8 text-center text-sm text-muted">برای مشاهده گفتگو، یک تیکت را انتخاب کنید.</div>
        )}
      </section>
    </div>
  );
}

function CreateTicketForm({ pending, onSubmit }: { pending: boolean; onSubmit: (form: FormData, formElement: HTMLFormElement) => void }) {
  return (
    <form
      className="dashboard-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget), event.currentTarget);
      }}
    >
      <h2 className="text-lg font-black">ثبت تیکت جدید</h2>
      <div className="mt-4 grid gap-3">
        <input className="h-11 rounded-md border border-border px-3 text-sm focus-ring" name="subject" placeholder="موضوع درخواست" required />
        <textarea className="min-h-28 rounded-md border border-border px-3 py-2 text-sm focus-ring" name="description" placeholder="شرح کامل درخواست" required />
        <div className="grid grid-cols-2 gap-3">
          <select className="h-11 rounded-md border border-border px-2 text-sm focus-ring" name="category" defaultValue="General">
            <option value="Technical">فنی</option>
            <option value="Financial">مالی</option>
            <option value="Project">پروژه</option>
            <option value="Education">آموزش</option>
            <option value="General">عمومی</option>
          </select>
          <select className="h-11 rounded-md border border-border px-2 text-sm focus-ring" name="priority" defaultValue="Normal">
            <option value="Low">کم</option>
            <option value="Normal">معمولی</option>
            <option value="High">زیاد</option>
            <option value="Urgent">فوری</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select className="h-11 rounded-md border border-border px-2 text-sm focus-ring" name="referenceType" defaultValue="">
            <option value="">بدون اتصال</option>
            <option value="Project">پروژه</option>
            <option value="Order">سفارش</option>
            <option value="Course">دوره</option>
            <option value="Listing">لیستینگ</option>
          </select>
          <input className="h-11 rounded-md border border-border px-3 text-sm focus-ring" name="referenceId" type="number" min="1" placeholder="شناسه مرتبط" />
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 text-sm text-muted">
          <FileUp className="size-4" />
          <span>پیوست اولیه</span>
          <input className="sr-only" name="attachment" type="file" />
        </label>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          ثبت تیکت
        </button>
      </div>
    </form>
  );
}

function TicketDetailPanel({
  ticket,
  isAdmin,
  loading,
  replyPending,
  attachmentPending,
  statusPending,
  assignPending,
  satisfactionPending,
  escalatePending,
  onReply,
  onAttach,
  onStatus,
  onAssign,
  onSatisfaction,
  onEscalate
}: {
  ticket: Ticket;
  isAdmin: boolean;
  loading: boolean;
  replyPending: boolean;
  attachmentPending: boolean;
  statusPending: boolean;
  assignPending: boolean;
  satisfactionPending: boolean;
  escalatePending: boolean;
  onReply: (ticketId: number, form: FormData, formElement: HTMLFormElement) => void;
  onAttach: (ticketId: number, file: File) => void;
  onStatus: (ticketId: number, status: TicketStatus) => void;
  onAssign: (ticketId: number) => void;
  onSatisfaction: (ticketId: number, score: number) => void;
  onEscalate: (ticketId: number, targetQueue: "Financial" | "Arbitration") => void;
}) {
  const ticketId = Number(ticket.id);
  const isClosed = String(ticket.status) === "Closed" || String(ticket.status) === "5";
  const isResolved = String(ticket.status) === "Resolved" || String(ticket.status) === "4";

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="border-b border-border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <span>{getCategoryLabel(ticket.category)}</span>
              <span>{getPriorityLabel(ticket.priority)}</span>
              {ticket.referenceType && ticket.referenceId ? <span>{getReferenceLabel(ticket.referenceType)} #{String(ticket.referenceId)}</span> : null}
            </div>
            <h2 className="mt-3 text-xl font-black leading-8">{ticket.subject}</h2>
            <p className="mt-2 text-sm leading-7 text-muted">{ticket.description}</p>
          </div>
          <span className="rounded-md bg-background px-3 py-2 text-xs font-bold text-muted">{getStatusLabel(ticket.status)}</span>
        </div>
        <div className="mt-4 grid gap-2 text-xs text-muted md:grid-cols-3">
          <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" /> ایجاد {formatDate(ticket.createDate)}</span>
          <span className="inline-flex items-center gap-1"><AlertCircle className="size-3.5" /> SLA {formatDate(ticket.slaDueAt)}</span>
          <span className="inline-flex items-center gap-1"><UserCheck className="size-3.5" /> {ticket.assignedToName ? `ارجاع به ${ticket.assignedToName}` : "بدون ارجاع"}</span>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-muted md:grid-cols-3">
          <span>اولین پاسخ: {ticket.firstRespondedAt ? formatDurationBetween(ticket.createDate, ticket.firstRespondedAt) : "ثبت نشده"}</span>
          <span>حل پرونده: {ticket.resolvedAt ? formatDurationBetween(ticket.createDate, ticket.resolvedAt) : "ثبت نشده"}</span>
          <span>رضایت: {ticket.satisfactionScore ? `${Number(ticket.satisfactionScore).toLocaleString("fa-IR")} از ۵` : "ثبت نشده"}</span>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        {loading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
        <div className="grid gap-3">
          <h3 className="inline-flex items-center gap-2 font-black"><MessageSquareText className="size-4 text-primary" /> گفتگو</h3>
          {ticket.messages.map((item) => (
            <div key={item.id} className={`max-w-[92%] rounded-lg border p-3 text-sm ${item.isAdminResponse ? "justify-self-start border-primary/20 bg-primary/5" : "justify-self-end border-border bg-white"}`}>
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>{item.isAdminResponse ? "پشتیبانی" : item.userName ?? "کاربر"}</span>
                <span>{formatDate(item.createDate)}</span>
              </div>
              <p className="mt-2 leading-7">{item.messageContent}</p>
            </div>
          ))}
          {!ticket.messages.length ? <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted">هنوز پیامی در این تیکت ثبت نشده است.</div> : null}
        </div>

        <div className="grid gap-3">
          <h3 className="inline-flex items-center gap-2 font-black"><Paperclip className="size-4 text-primary" /> پیوست‌ها</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {ticket.attachments.map((item) => (
              <a key={item.id} href={item.fileUrl ?? "#"} target="_blank" rel="noreferrer" className="rounded-md border border-border bg-white p-3 text-sm font-bold text-primary">
                {item.fileName ?? `فایل ${item.fileUploadId}`}
              </a>
            ))}
          </div>
          {!ticket.attachments.length ? <div className="text-sm text-muted">پیوستی ثبت نشده است.</div> : null}
          {!isClosed ? (
            <label className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-60">
              {attachmentPending ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              افزودن پیوست
              <input
                className="sr-only"
                type="file"
                disabled={attachmentPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onAttach(ticketId, file);
                  event.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>

        {!isClosed ? (
          <form
            className="grid gap-3 rounded-lg border border-border bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              onReply(ticketId, new FormData(event.currentTarget), event.currentTarget);
            }}
          >
            <textarea className="min-h-24 rounded-md border border-border px-3 py-2 text-sm focus-ring" name="messageContent" placeholder={isAdmin ? "پاسخ پشتیبان" : "پیام جدید"} required />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-xs font-bold">
                <Paperclip className="size-4" />
                پیوست همراه پیام
                <input className="sr-only" name="attachment" type="file" />
              </label>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold text-white disabled:opacity-60" disabled={replyPending}>
                {replyPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                ارسال پیام
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <button type="button" onClick={() => onAssign(ticketId)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold disabled:opacity-60" disabled={assignPending}>
              <UserCheck className="size-4" />
              ارجاع به من
            </button>
          ) : null}
          {isAdmin ? (
            <>
              <button type="button" onClick={() => onEscalate(ticketId, "Financial")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold text-muted disabled:opacity-60" disabled={escalatePending || isClosed}>
                <ArrowUpRight className="size-4" />
                ارجاع مالی
              </button>
              <button type="button" onClick={() => onEscalate(ticketId, "Arbitration")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold text-muted disabled:opacity-60" disabled={escalatePending || isClosed}>
                <ArrowUpRight className="size-4" />
                ارجاع داوری
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => onStatus(ticketId, "Resolved")} className="inline-flex h-9 items-center gap-2 rounded-md border border-primary/30 px-3 text-xs font-bold text-primary disabled:opacity-60" disabled={statusPending || isClosed}>
            <CheckCircle2 className="size-4" />
            حل شد
          </button>
          <button type="button" onClick={() => onStatus(ticketId, "Closed")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold text-muted disabled:opacity-60" disabled={statusPending || isClosed}>
            <Archive className="size-4" />
            بستن
          </button>
        </div>
        {!isAdmin && (isResolved || isClosed) && !ticket.satisfactionScore ? (
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="text-sm font-black">رضایت از پشتیبانی</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button key={score} type="button" onClick={() => onSatisfaction(ticketId, score)} className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-xs font-bold text-muted hover:border-primary hover:text-primary disabled:opacity-60" disabled={satisfactionPending}>
                  <Star className="size-3.5" />
                  {score.toLocaleString("fa-IR")}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TicketMetric({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "danger" }) {
  return (
    <div className={`rounded-md border bg-white p-3 ${tone === "danger" ? "border-danger/30" : "border-border"}`}>
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-2 text-2xl font-black ${tone === "danger" ? "text-danger" : ""}`}>{typeof value === "number" ? value.toLocaleString("fa-IR") : value}</div>
    </div>
  );
}

function getTicketStats(tickets: Ticket[]) {
  return {
    open: tickets.filter((item) => ["Open", "1"].includes(String(item.status))).length,
    pending: tickets.filter((item) => ["Pending", "2"].includes(String(item.status))).length,
    resolved: tickets.filter((item) => ["Resolved", "4"].includes(String(item.status))).length
  };
}

function getCategoryLabel(value: TicketCategory) {
  const text = String(value);
  if (text === "Technical" || text === "1") return "فنی";
  if (text === "Financial" || text === "2") return "مالی";
  if (text === "Project" || text === "3") return "پروژه";
  if (text === "Education" || text === "4") return "آموزش";
  if (text === "Dispute" || text === "5") return "اختلاف";
  if (text === "General" || text === "6") return "عمومی";
  return text;
}

function getStatusLabel(value: TicketStatus) {
  const text = String(value);
  if (text === "Open" || text === "1") return "باز";
  if (text === "Pending" || text === "2") return "در انتظار پشتیبانی";
  if (text === "Answered" || text === "3") return "پاسخ‌داده‌شده";
  if (text === "Resolved" || text === "4") return "حل‌شده";
  if (text === "Closed" || text === "5") return "بسته";
  return text;
}

function getPriorityLabel(value: TicketPriority) {
  const text = String(value);
  if (text === "Low" || text === "1") return "اولویت کم";
  if (text === "Normal" || text === "2") return "اولویت معمولی";
  if (text === "High" || text === "3") return "اولویت زیاد";
  if (text === "Urgent" || text === "4") return "فوری";
  return text;
}

function getReferenceLabel(value: string) {
  if (value === "Project") return "پروژه";
  if (value === "Order") return "سفارش";
  if (value === "Course") return "دوره";
  if (value === "Listing") return "لیستینگ";
  return value;
}

function formatDate(value?: string | null) {
  if (!value) return "ثبت نشده";
  return new Date(value).toLocaleString("fa-IR");
}

function formatDurationMinutes(value?: number | null) {
  const minutes = Math.max(0, Math.round(Number(value || 0)));
  if (!minutes) return "ثبت نشده";
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours.toLocaleString("fa-IR")} ساعت و ${remaining.toLocaleString("fa-IR")} دقیقه` : `${hours.toLocaleString("fa-IR")} ساعت`;
}

function formatDurationBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return "ثبت نشده";
  return formatDurationMinutes((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return fallback;
}
