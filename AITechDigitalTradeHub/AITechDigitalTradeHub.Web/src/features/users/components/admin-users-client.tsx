"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Search, ShieldCheck, UserCheck, UserX, X } from "lucide-react";
import { getAdminUsers, getCapabilityRequests, getRoles, updateCapabilityRequest, updateUserStatus, updateUserVerification } from "@/features/users/api/users-api";
import { ApiRequestError } from "@/lib/api/http-client";
import type { AdminUser, UserRoleAssignment } from "@/features/users/types";

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", searchText],
    queryFn: () => getAdminUsers({ searchText })
  });

  const rolesQuery = useQuery({ queryKey: ["users", "roles"], queryFn: getRoles });
  const requestsQuery = useQuery({
    queryKey: ["admin", "capability-requests", "pending"],
    queryFn: () => getCapabilityRequests("Pending")
  });

  const capabilityMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "Approved" | "Rejected" | "Suspended" }) => updateCapabilityRequest(id, status),
    onSuccess: () => {
      setMessage("وضعیت قابلیت به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "عملیات ناموفق بود")
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, isActive }: { id: number; status: "Active" | "Suspended" | "Banned"; isActive: boolean }) => updateUserStatus(id, status, isActive),
    onSuccess: () => {
      setMessage("وضعیت کاربر به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی وضعیت کاربر ناموفق بود")
  });

  const verificationMutation = useMutation({
    mutationFn: ({ id, isVerified, level }: { id: number; isVerified: boolean; level: number }) => updateUserVerification(id, isVerified, level),
    onSuccess: () => {
      setMessage("احراز هویت کاربر به‌روزرسانی شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "به‌روزرسانی احراز هویت ناموفق بود")
  });

  const users = useMemo(() => usersQuery.data?.results ?? [], [usersQuery.data?.results]);
  const roleOptions = rolesQuery.data ?? [];
  const pendingRequests = requestsQuery.data ?? [];
  const stats = useMemo(
    () => ({
      total: usersQuery.data?.totalCount ?? users.length,
      verified: users.filter((item) => item.isVerified).length,
      pendingRequests: pendingRequests.length
    }),
    [users, usersQuery.data?.totalCount, pendingRequests.length]
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="کل کاربران" value={stats.total.toLocaleString("fa-IR")} />
        <Metric label="احراز شده در این صفحه" value={stats.verified.toLocaleString("fa-IR")} />
        <Metric label="درخواست‌های در انتظار" value={stats.pendingRequests.toLocaleString("fa-IR")} />
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">درخواست‌های قابلیت</h2>
          {requestsQuery.isLoading ? <Loader2 className="size-5 animate-spin text-muted" /> : null}
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

      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">مدیریت کاربران</h2>
          <form
            className="flex min-w-72 items-center gap-2 rounded-md border border-border px-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setSearchText(String(form.get("searchText") || ""));
            }}
          >
            <Search className="size-4 text-muted" />
            <input name="searchText" className="h-10 flex-1 bg-transparent text-sm outline-none" placeholder="جستجوی نام، ایمیل یا نام کاربری" />
          </form>
        </div>
        {message ? <div className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-muted">{message}</div> : null}
        {usersQuery.isLoading ? <Loader2 className="mt-6 size-5 animate-spin text-muted" /> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-right text-sm">
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
                  roleOptions={roleOptions.map((item) => item.name)}
                  busy={statusMutation.isPending || verificationMutation.isPending || capabilityMutation.isPending}
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
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function CapabilityRequestCard({ item, pending, onUpdate }: { item: UserRoleAssignment; pending: boolean; onUpdate: (status: "Approved" | "Rejected" | "Suspended") => void }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-black">{item.userDisplayName ?? `کاربر ${item.userId}`}</div>
          <div className="mt-1 text-xs text-muted">{item.userEmail}</div>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{item.roleDescription ?? item.roleName}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => onUpdate("Approved")} className="inline-flex h-8 items-center gap-1 rounded-md bg-primary px-2 text-xs font-bold text-white disabled:opacity-60">
          <Check className="size-3.5" />
          تایید
        </button>
        <button type="button" disabled={pending} onClick={() => onUpdate("Rejected")} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs font-bold disabled:opacity-60">
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
  roleOptions: string[];
  busy: boolean;
  onSuspend: () => void;
  onBan: () => void;
  onActivate: () => void;
  onVerify: () => void;
  onRoleUpdate: (assignmentId: number, status: "Approved" | "Rejected" | "Suspended") => void;
}) {
  return (
    <tr className="bg-slate-50 align-top">
      <td className="rounded-r-md px-3 py-3">
        <div className="font-bold">{user.displayName || user.username}</div>
        <div className="mt-1 text-xs text-muted">@{user.username}</div>
      </td>
      <td className="px-3 py-3 text-xs text-muted">
        <div>{user.email}</div>
        <div className="mt-1">{user.mobileNumber ?? "بدون موبایل"}</div>
      </td>
      <td className="px-3 py-3 text-xs">
        <div className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-muted">{String(user.status)}</div>
        <div className="mt-2">{user.isVerified ? "احراز شده" : "احراز نشده"} / سطح {user.verificationLevel}</div>
      </td>
      <td className="max-w-80 px-3 py-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span key={role.id} className="rounded-md bg-white px-2 py-1 text-xs text-muted">
              {role.roleDescription ?? role.roleName}: {String(role.status)}
            </span>
          ))}
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
            .filter((role) => String(role.status).toLowerCase() !== "approved")
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
