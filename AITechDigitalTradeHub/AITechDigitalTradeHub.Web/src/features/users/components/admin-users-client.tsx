"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, ShieldCheck, UserCheck, UserX, X } from "lucide-react";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import {
  getAdminUsers,
  getCapabilityRequests,
  getRoles,
  updateCapabilityRequest,
  updateUserStatus,
  updateUserVerification,
  type AdminUserStatus
} from "@/features/users/api/users-api";
import { ApiRequestError } from "@/lib/api/http-client";
import type { AdminUser, UserRoleAssignment } from "@/features/users/types";

const pageSize = 12;

const userStatusLabels: Record<string, string> = {
  "1": "فعال",
  "2": "تعلیق‌شده",
  "3": "مسدود",
  Active: "فعال",
  Suspended: "تعلیق‌شده",
  Banned: "مسدود"
};

const capabilityStatusLabels: Record<string, string> = {
  "1": "در انتظار",
  "2": "تایید شده",
  "3": "رد شده",
  "4": "تعلیق‌شده",
  Pending: "در انتظار",
  Approved: "تایید شده",
  Rejected: "رد شده",
  Suspended: "تعلیق‌شده"
};

const statusOptions: Array<SelectOption<AdminUserStatus>> = [
  { value: "Active", label: "فعال" },
  { value: "Suspended", label: "تعلیق‌شده" },
  { value: "Banned", label: "مسدود" }
];

const verificationOptions: Array<SelectOption<"true" | "false">> = [
  { value: "true", label: "احراز شده" },
  { value: "false", label: "احراز نشده" }
];

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [searchDraft, setSearchDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [status, setStatus] = useState<AdminUserStatus | "">("");
  const [verifiedFilter, setVerifiedFilter] = useState<"true" | "false" | "">("");
  const [pageIndex, setPageIndex] = useState(1);
  const [message, setMessage] = useState("");

  const isVerified = verifiedFilter === "" ? "" : verifiedFilter === "true";

  const usersQuery = useQuery({
    queryKey: ["admin", "users", { searchText, roleId, status, isVerified, pageIndex }],
    queryFn: () => getAdminUsers({ searchText, roleId, status, isVerified, pageIndex, pageSize })
  });

  const rolesQuery = useQuery({ queryKey: ["users", "roles"], queryFn: getRoles });
  const requestsQuery = useQuery({
    queryKey: ["admin", "capability-requests", "pending"],
    queryFn: () => getCapabilityRequests("Pending")
  });

  const invalidateAdminUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "capability-requests"] });
  };

  const capabilityMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: "Approved" | "Rejected" | "Suspended"; note?: string }) => updateCapabilityRequest(id, status, note),
    onSuccess: () => {
      setMessage("وضعیت قابلیت به‌روزرسانی شد.");
      invalidateAdminUsers();
    },
    onError: (err) => setMessage(resolveErrorMessage(err, "عملیات قابلیت ناموفق بود"))
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, isActive }: { id: number; status: AdminUserStatus; isActive: boolean }) => updateUserStatus(id, status, isActive),
    onSuccess: () => {
      setMessage("وضعیت کاربر به‌روزرسانی شد.");
      invalidateAdminUsers();
    },
    onError: (err) => setMessage(resolveErrorMessage(err, "به‌روزرسانی وضعیت کاربر ناموفق بود"))
  });

  const verificationMutation = useMutation({
    mutationFn: ({ id, isVerified, level }: { id: number; isVerified: boolean; level: number }) => updateUserVerification(id, isVerified, level),
    onSuccess: () => {
      setMessage("احراز هویت کاربر به‌روزرسانی شد.");
      invalidateAdminUsers();
    },
    onError: (err) => setMessage(resolveErrorMessage(err, "به‌روزرسانی احراز هویت ناموفق بود"))
  });

  const users = useMemo(() => usersQuery.data?.results ?? [], [usersQuery.data?.results]);
  const roleOptions = useMemo<Array<SelectOption<number>>>(
    () => (rolesQuery.data ?? []).map((item) => ({ value: Number(item.id), label: item.description || item.name, description: item.name })),
    [rolesQuery.data]
  );
  const pendingRequests = requestsQuery.data ?? [];
  const totalCount = usersQuery.data?.totalCount ?? 0;
  const pageCount = Math.max(usersQuery.data?.pageCount ?? 1, 1);
  const busy = statusMutation.isPending || verificationMutation.isPending || capabilityMutation.isPending;

  const stats = useMemo(
    () => ({
      total: totalCount,
      pageUsers: users.length,
      verified: users.filter((item) => item.isVerified).length,
      pendingRequests: pendingRequests.length
    }),
    [pendingRequests.length, totalCount, users]
  );

  function applyFilters() {
    setPageIndex(1);
    setSearchText(searchDraft.trim());
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchText("");
    setRoleId("");
    setStatus("");
    setVerifiedFilter("");
    setPageIndex(1);
  }

  const accessError = usersQuery.error instanceof ApiRequestError && [401, 403].includes(usersQuery.error.statusCode);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="کل کاربران" value={stats.total.toLocaleString("fa-IR")} />
        <Metric label="کاربران این صفحه" value={stats.pageUsers.toLocaleString("fa-IR")} />
        <Metric label="احراز شده در صفحه" value={stats.verified.toLocaleString("fa-IR")} />
        <Metric label="درخواست قابلیت" value={stats.pendingRequests.toLocaleString("fa-IR")} />
      </section>

      {message ? <div className="rounded-md border border-warning/25 bg-warning/10 px-3 py-2 text-sm font-bold text-warning">{message}</div> : null}

      {accessError ? (
        <div className="dashboard-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-black">دسترسی مدیریت کاربران فعال نیست</h2>
              <p className="mt-2 text-sm leading-7 text-muted">برای دیدن این بخش باید با حسابی وارد شوید که مجوز مدیریت کاربران یا نقش SuperAdmin داشته باشد.</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">درخواست‌های قابلیت</h2>
            <p className="mt-1 text-xs leading-6 text-muted">درخواست‌هایی که کاربر برای مدرس، خدمت‌دهنده، جذب سرمایه یا مدیر سازمان ثبت کرده است.</p>
          </div>
          <button
            type="button"
            onClick={() => requestsQuery.refetch()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted hover:text-foreground"
          >
            {requestsQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            تازه‌سازی
          </button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {pendingRequests.map((item) => (
            <CapabilityRequestCard
              key={item.id}
              item={item}
              pending={capabilityMutation.isPending}
              onUpdate={(status) => capabilityMutation.mutate({ id: Number(item.id), status })}
            />
          ))}
          {!requestsQuery.isLoading && !pendingRequests.length ? <div className="rounded-md border border-border p-4 text-sm text-muted">درخواست در انتظاری وجود ندارد.</div> : null}
        </div>
      </section>

      <section className="dashboard-card overflow-hidden">
        <div className="border-b border-border/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">مدیریت کاربران</h2>
              <p className="mt-1 text-xs leading-6 text-muted">جستجو، فیلتر، احراز هویت، فعال‌سازی، تعلیق و مسدودسازی کاربران.</p>
            </div>
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-xs font-bold text-white"
            >
              {usersQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              تازه‌سازی
            </button>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_repeat(3,minmax(160px,0.7fr))_auto]">
            <form
              className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3"
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
              }}
            >
              <Search className="size-4 text-muted" />
              <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="نام، ایمیل یا نام کاربری" />
            </form>
            <SearchableSelect options={roleOptions} value={roleId} onChange={(value) => { setRoleId(value); setPageIndex(1); }} placeholder="همه نقش‌ها" />
            <SearchableSelect options={statusOptions} value={status} onChange={(value) => { setStatus(value); setPageIndex(1); }} placeholder="همه وضعیت‌ها" />
            <SearchableSelect options={verificationOptions} value={verifiedFilter} onChange={(value) => { setVerifiedFilter(value); setPageIndex(1); }} placeholder="همه احرازها" />
            <div className="flex gap-2">
              <button type="button" onClick={applyFilters} className="h-10 rounded-md bg-foreground px-3 text-xs font-bold text-white">اعمال</button>
              <button type="button" onClick={resetFilters} className="h-10 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted">پاکسازی</button>
            </div>
          </div>
        </div>

        {usersQuery.isLoading ? <Loader2 className="m-6 size-5 animate-spin text-muted" /> : null}
        {usersQuery.error && !accessError ? <div className="m-5 rounded-md border border-danger/25 bg-danger/10 p-4 text-sm font-bold text-danger">{resolveErrorMessage(usersQuery.error, "دریافت کاربران ناموفق بود")}</div> : null}

        <div className="overflow-x-auto p-5 pt-3">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-right text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="px-3 py-2">کاربر</th>
                <th className="px-3 py-2">تماس</th>
                <th className="px-3 py-2">وضعیت</th>
                <th className="px-3 py-2">قابلیت‌ها</th>
                <th className="px-3 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  busy={busy}
                  onSuspend={() => statusMutation.mutate({ id: Number(user.id), status: "Suspended", isActive: true })}
                  onBan={() => statusMutation.mutate({ id: Number(user.id), status: "Banned", isActive: false })}
                  onActivate={() => statusMutation.mutate({ id: Number(user.id), status: "Active", isActive: true })}
                  onVerify={() => verificationMutation.mutate({ id: Number(user.id), isVerified: true, level: Math.max(user.verificationLevel, 2) })}
                  onRoleUpdate={(assignmentId, status) => capabilityMutation.mutate({ id: assignmentId, status })}
                />
              ))}
            </tbody>
          </table>
          {!usersQuery.isLoading && !users.length ? <div className="rounded-md border border-border p-5 text-center text-sm text-muted">کاربری پیدا نشد.</div> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-5 text-sm">
          <div className="font-bold text-muted">
            صفحه {pageIndex.toLocaleString("fa-IR")} از {pageCount.toLocaleString("fa-IR")} · مجموع {totalCount.toLocaleString("fa-IR")} کاربر
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={pageIndex <= 1 || usersQuery.isFetching} onClick={() => setPageIndex((current) => Math.max(1, current - 1))} className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-45">
              <ChevronRight className="size-4" />
              قبلی
            </button>
            <button type="button" disabled={pageIndex >= pageCount || usersQuery.isFetching} onClick={() => setPageIndex((current) => Math.min(pageCount, current + 1))} className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-white px-3 text-xs font-bold disabled:opacity-45">
              بعدی
              <ChevronLeft className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function CapabilityRequestCard({ item, pending, onUpdate }: { item: UserRoleAssignment; pending: boolean; onUpdate: (status: "Approved" | "Rejected" | "Suspended") => void }) {
  return (
    <div className="rounded-md border border-border bg-white/78 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-black">{item.userDisplayName?.trim() || `کاربر ${item.userId}`}</div>
          <div className="mt-1 text-xs text-muted">{item.userEmail || "ایمیل ثبت نشده"}</div>
        </div>
        <span className="rounded-md bg-warning/10 px-2 py-1 text-xs font-bold text-warning">{item.roleDescription ?? item.roleName}</span>
      </div>
      <div className="mt-3 text-xs text-muted">وضعیت: {formatCapabilityStatus(item.status)}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => onUpdate("Approved")} className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-2 text-xs font-bold text-white disabled:opacity-60">
          <Check className="size-3.5" />
          تایید
        </button>
        <button type="button" disabled={pending} onClick={() => onUpdate("Rejected")} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-60">
          <X className="size-3.5" />
          رد
        </button>
      </div>
    </div>
  );
}

function UserRow({
  user,
  busy,
  onSuspend,
  onBan,
  onActivate,
  onVerify,
  onRoleUpdate
}: {
  user: AdminUser;
  busy: boolean;
  onSuspend: () => void;
  onBan: () => void;
  onActivate: () => void;
  onVerify: () => void;
  onRoleUpdate: (assignmentId: number, status: "Approved" | "Rejected" | "Suspended") => void;
}) {
  return (
    <tr className="bg-background/80 align-top">
      <td className="rounded-r-md px-3 py-3">
        <div className="font-bold">{user.displayName || user.username}</div>
        <div className="mt-1 text-xs text-muted">@{user.username}</div>
        {user.createDate ? <div className="mt-1 text-xs text-muted">عضویت: {new Date(user.createDate).toLocaleDateString("fa-IR")}</div> : null}
      </td>
      <td className="px-3 py-3 text-xs text-muted">
        <div>{user.email || "بدون ایمیل"}</div>
        <div className="mt-1">{user.mobileNumber ?? "بدون موبایل"}</div>
      </td>
      <td className="px-3 py-3 text-xs">
        <StatusPill value={formatUserStatus(user.status)} tone={String(user.status) === "1" || String(user.status) === "Active" ? "success" : "warning"} />
        <div className="mt-2">{user.isVerified ? "احراز شده" : "احراز نشده"} / سطح {user.verificationLevel.toLocaleString("fa-IR")}</div>
        <div className="mt-1 text-muted">{user.isActive ? "حساب فعال" : "حساب غیرفعال"}</div>
      </td>
      <td className="max-w-80 px-3 py-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span key={role.id} className="rounded-md bg-white px-2 py-1 text-xs text-muted">
              {role.roleDescription ?? role.roleName}: {formatCapabilityStatus(role.status)}
            </span>
          ))}
          {!user.roles.length ? <span className="text-xs text-muted">نقش فعالی ثبت نشده</span> : null}
        </div>
      </td>
      <td className="rounded-l-md px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || user.isVerified} onClick={onVerify} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-50">
            <ShieldCheck className="size-3.5" />
            تایید احراز
          </button>
          <button type="button" disabled={busy} onClick={onActivate} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-50">
            <UserCheck className="size-3.5" />
            فعال
          </button>
          <button type="button" disabled={busy} onClick={onSuspend} className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-white px-2 text-xs font-bold disabled:opacity-50">
            تعلیق
          </button>
          <button type="button" disabled={busy} onClick={onBan} className="inline-flex h-8 items-center gap-1 rounded-md bg-danger px-2 text-xs font-bold text-white disabled:opacity-50">
            <UserX className="size-3.5" />
            مسدود
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {user.roles
            .filter((role) => !isCapabilityApproved(role.status))
            .map((role) => (
              <button key={role.id} type="button" disabled={busy} onClick={() => onRoleUpdate(Number(role.id), "Approved")} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary disabled:opacity-50">
                تایید {role.roleDescription ?? role.roleName}
              </button>
            ))}
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ value, tone }: { value: string; tone: "success" | "warning" }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${tone === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{value}</span>;
}

function formatUserStatus(value: string | number) {
  return userStatusLabels[String(value)] ?? String(value);
}

function formatCapabilityStatus(value: string | number) {
  return capabilityStatusLabels[String(value)] ?? String(value);
}

function isCapabilityApproved(value: string | number) {
  return String(value) === "2" || String(value).toLowerCase() === "approved";
}

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 401) return "برای این عملیات باید وارد حساب مدیریت شوید.";
    if (error.statusCode === 403) return "حساب فعلی مجوز مدیریت کاربران را ندارد.";
    return error.message || fallback;
  }
  return fallback;
}
