"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, KeyRound, Loader2, Plus, RefreshCw, Save, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import {
  createAccessPermission,
  createAccessRole,
  deactivateAccessPermission,
  deactivateAccessRole,
  getAccessPermissions,
  getAccessRoles,
  getActivityLogs,
  getUserPermissions,
  setRolePermissions,
  setUserPermissions,
  updateAccessPermission,
  updateAccessRole
} from "@/features/admin/api/admin-access-api";
import type { AdminActivityLog, AdminPermission, PermissionUpsertPayload, RoleUpsertPayload } from "@/features/admin/types";
import { ApiRequestError } from "@/lib/api/http-client";

const sourceOptions: Array<SelectOption<string>> = [
  { value: "", label: "همه منابع" },
  { value: "system", label: "سیستم" },
  { value: "analytics", label: "تحلیل رفتار" },
  { value: "project", label: "پروژه" }
];

export function AdminAccessClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | "">("");
  const [userIdDraft, setUserIdDraft] = useState("");
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [selectedUserPermissionIds, setSelectedUserPermissionIds] = useState<Set<number>>(new Set());
  const [logSource, setLogSource] = useState<string>("");

  const rolesQuery = useQuery({
    queryKey: ["admin", "access", "roles", roleSearch],
    queryFn: () => getAccessRoles({ includeInactive: true, pageIndex: 1, pageSize: 80, searchText: roleSearch })
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin", "access", "permissions", permissionSearch],
    queryFn: () => getAccessPermissions({ includeInactive: true, pageIndex: 1, pageSize: 160, searchText: permissionSearch })
  });

  const userPermissionsQuery = useQuery({
    queryKey: ["admin", "access", "user-permissions", loadedUserId],
    queryFn: () => getUserPermissions(Number(loadedUserId)),
    enabled: Boolean(loadedUserId)
  });

  const logsQuery = useQuery({
    queryKey: ["admin", "access", "activity-logs", logSource],
    queryFn: () => getActivityLogs({ source: logSource, pageIndex: 1, pageSize: 20 })
  });

  const roles = useMemo(() => rolesQuery.data?.results ?? [], [rolesQuery.data?.results]);
  const permissions = useMemo(() => permissionsQuery.data?.results ?? [], [permissionsQuery.data?.results]);
  const selectedRole = roles.find((item) => item.id === selectedRoleId);
  const selectedPermission = permissions.find((item) => item.id === selectedPermissionId);
  const accessError = rolesQuery.error instanceof ApiRequestError && [401, 403].includes(rolesQuery.error.statusCode);

  useEffect(() => {
    if (!selectedRole && roles.length) {
      setSelectedRoleId(roles[0].id);
      return;
    }

    if (selectedRole) {
      setSelectedPermissionIds(new Set(selectedRole.permissions.map((item) => item.id)));
    }
  }, [roles, selectedRole, selectedRoleId]);

  useEffect(() => {
    if (!selectedPermission && permissions.length) setSelectedPermissionId(permissions[0].id);
  }, [permissions, selectedPermission]);

  useEffect(() => {
    const granted = userPermissionsQuery.data?.results.filter((item) => item.isActive && item.isGranted).map((item) => item.permissionId) ?? [];
    setSelectedUserPermissionIds(new Set(granted));
  }, [userPermissionsQuery.data?.results]);

  const invalidateAccess = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "access"] });
  };

  const roleCreateMutation = useMutation({
    mutationFn: createAccessRole,
    onSuccess: () => {
      setMessage("نقش جدید ثبت شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "ثبت نقش ناموفق بود"))
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoleUpsertPayload }) => updateAccessRole(id, payload),
    onSuccess: () => {
      setMessage("نقش به‌روزرسانی شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "به‌روزرسانی نقش ناموفق بود"))
  });

  const permissionCreateMutation = useMutation({
    mutationFn: createAccessPermission,
    onSuccess: () => {
      setMessage("مجوز جدید ثبت شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "ثبت مجوز ناموفق بود"))
  });

  const permissionUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PermissionUpsertPayload }) => updateAccessPermission(id, payload),
    onSuccess: () => {
      setMessage("مجوز به‌روزرسانی شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "به‌روزرسانی مجوز ناموفق بود"))
  });

  const deactivateRoleMutation = useMutation({
    mutationFn: deactivateAccessRole,
    onSuccess: () => {
      setMessage("نقش غیرفعال شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "غیرفعال‌سازی نقش ناموفق بود"))
  });

  const deactivatePermissionMutation = useMutation({
    mutationFn: deactivateAccessPermission,
    onSuccess: () => {
      setMessage("مجوز غیرفعال شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "غیرفعال‌سازی مجوز ناموفق بود"))
  });

  const rolePermissionsMutation = useMutation({
    mutationFn: () => setRolePermissions(Number(selectedRoleId), Array.from(selectedPermissionIds)),
    onSuccess: () => {
      setMessage("دسترسی‌های نقش ذخیره شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "ذخیره دسترسی‌های نقش ناموفق بود"))
  });

  const userPermissionsMutation = useMutation({
    mutationFn: () => setUserPermissions(Number(loadedUserId), Array.from(selectedUserPermissionIds)),
    onSuccess: () => {
      setMessage("دسترسی مستقیم کاربر ذخیره شد.");
      invalidateAccess();
    },
    onError: (err) => setMessage(resolveError(err, "ذخیره دسترسی کاربر ناموفق بود"))
  });

  const logColumns = useMemo<Array<DataGridColumn<AdminActivityLog>>>(
    () => [
      { key: "source", title: "منبع", render: (item) => sourceLabel(item.source) },
      { key: "action", title: "عملیات", priority: "primary", render: (item) => <span className="font-black">{item.action}</span> },
      { key: "userId", title: "کاربر", render: (item) => (item.userId ? item.userId.toLocaleString("fa-IR") : "—") },
      { key: "entity", title: "موجودیت", render: (item) => item.entityType ? `${item.entityType} #${item.entityId ?? ""}` : "—" },
      { key: "createDate", title: "زمان", render: (item) => formatDate(item.createDate) }
    ],
    []
  );

  function handleCreateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    roleCreateMutation.mutate({
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      isActive: true
    });
    event.currentTarget.reset();
  }

  function handleUpdateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) return;
    const form = new FormData(event.currentTarget);
    roleUpdateMutation.mutate({
      id: selectedRole.id,
      payload: {
        name: String(form.get("name") ?? selectedRole.name).trim(),
        description: String(form.get("description") ?? "").trim(),
        isActive: form.get("isActive") === "on"
      }
    });
  }

  function handleCreatePermission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    permissionCreateMutation.mutate(readPermissionForm(form));
    event.currentTarget.reset();
  }

  function handleUpdatePermission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPermission) return;
    permissionUpdateMutation.mutate({ id: selectedPermission.id, payload: readPermissionForm(new FormData(event.currentTarget)) });
  }

  function loadUserPermissions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = Number(userIdDraft);
    if (!id) {
      setMessage("شناسه کاربر را وارد کنید.");
      return;
    }
    setLoadedUserId(id);
  }

  return (
    <section className="mt-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">نقش‌ها، دسترسی‌ها و سوابق فعالیت</h2>
          <p className="mt-1 text-sm leading-7 text-muted">مدیریت role/permission، انتساب مجوز به نقش، دسترسی مستقیم کاربر و بررسی لاگ‌های پنل.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void rolesQuery.refetch();
            void permissionsQuery.refetch();
            void logsQuery.refetch();
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold"
        >
          {rolesQuery.isFetching || permissionsQuery.isFetching ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          تازه‌سازی
        </button>
      </div>

      {message ? <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-bold text-primary">{message}</div> : null}

      {accessError ? (
        <div className="dashboard-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h3 className="font-black">مجوز مدیریت دسترسی فعال نیست</h3>
              <p className="mt-2 text-sm leading-7 text-muted">این بخش به مجوز users.manage نیاز دارد.</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid gap-5">
          <section className="dashboard-card p-5">
            <h3 className="text-lg font-black">ثبت نقش</h3>
            <form className="mt-4 grid gap-3" onSubmit={handleCreateRole}>
              <TextField label="کلید نقش" name="name" placeholder="مثلا ContentManager" required />
              <TextAreaField label="توضیح" name="description" />
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={roleCreateMutation.isPending}>
                {roleCreateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                ثبت نقش
              </button>
            </form>
          </section>

          <section className="dashboard-card p-5">
            <h3 className="text-lg font-black">ویرایش نقش انتخاب‌شده</h3>
            <TextField wrapperClassName="mt-4" label="جستجوی نقش" value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} placeholder="نام یا توضیح نقش" />
            <SearchableSelect className="mt-4" label="نقش" options={roles.map((item) => ({ value: item.id, label: item.description || item.name, description: item.name }))} value={selectedRoleId} onChange={setSelectedRoleId} />
            {selectedRole ? (
              <form key={selectedRole.id} className="mt-4 grid gap-3" onSubmit={handleUpdateRole}>
                <TextField label="کلید نقش" name="name" defaultValue={selectedRole.name} required />
                <TextAreaField label="توضیح" name="description" defaultValue={selectedRole.description ?? ""} />
                <label className="inline-flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="isActive" defaultChecked={selectedRole.isActive} className="size-4" />
                  فعال باشد
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-3 text-xs font-bold text-white disabled:opacity-60" disabled={roleUpdateMutation.isPending}>
                    <Save className="size-4" />
                    ذخیره نقش
                  </button>
                  <button type="button" onClick={() => deactivateRoleMutation.mutate(selectedRole.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-danger/30 px-3 text-xs font-bold text-danger disabled:opacity-60" disabled={deactivateRoleMutation.isPending}>
                    <Trash2 className="size-4" />
                    غیرفعال
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          <section className="dashboard-card p-5">
            <h3 className="text-lg font-black">دسترسی مستقیم کاربر</h3>
            <form className="mt-4 grid gap-3" onSubmit={loadUserPermissions}>
              <TextField label="شناسه کاربر" type="number" min={1} value={userIdDraft} onChange={(event) => setUserIdDraft(event.target.value)} />
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-xs font-bold">
                <UserCog className="size-4" />
                بارگذاری مجوزها
              </button>
            </form>
            {loadedUserId ? (
              <PermissionChecklist
                title={`مجوزهای مستقیم کاربر ${loadedUserId.toLocaleString("fa-IR")}`}
                permissions={permissions}
                selectedIds={selectedUserPermissionIds}
                onToggle={(id) => toggleSet(selectedUserPermissionIds, setSelectedUserPermissionIds, id)}
                loading={userPermissionsQuery.isLoading}
              />
            ) : null}
            {loadedUserId ? (
              <button type="button" onClick={() => userPermissionsMutation.mutate()} disabled={userPermissionsMutation.isPending} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 text-xs font-bold text-white disabled:opacity-60">
                {userPermissionsMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                ذخیره مجوزهای کاربر
              </button>
            ) : null}
          </section>
        </div>

        <div className="grid gap-5">
          <section className="dashboard-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">انتساب مجوز به نقش</h3>
                <p className="mt-1 text-xs text-muted">نقش انتخاب‌شده: {selectedRole?.description || selectedRole?.name || "انتخاب نشده"}</p>
              </div>
              <button type="button" onClick={() => rolePermissionsMutation.mutate()} disabled={!selectedRoleId || rolePermissionsMutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white disabled:opacity-60">
                {rolePermissionsMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                ذخیره انتساب
              </button>
            </div>
            <TextField wrapperClassName="mt-4" label="جستجوی مجوز" value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} placeholder="کلید، نام یا توضیح" />
            <PermissionChecklist permissions={permissions} selectedIds={selectedPermissionIds} onToggle={(id) => toggleSet(selectedPermissionIds, setSelectedPermissionIds, id)} loading={permissionsQuery.isLoading} />
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <section className="dashboard-card p-5">
              <h3 className="flex items-center gap-2 text-lg font-black">
                <KeyRound className="size-5 text-primary" />
                ثبت مجوز
              </h3>
              <form className="mt-4 grid gap-3" onSubmit={handleCreatePermission}>
                <PermissionFields />
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={permissionCreateMutation.isPending}>
                  {permissionCreateMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  ثبت مجوز
                </button>
              </form>
            </section>

            <section className="dashboard-card p-5">
              <h3 className="flex items-center gap-2 text-lg font-black">
                <ShieldCheck className="size-5 text-primary" />
                ویرایش مجوز
              </h3>
              <SearchableSelect className="mt-4" label="مجوز" options={permissions.map((item) => ({ value: item.id, label: item.name, description: item.key }))} value={selectedPermissionId} onChange={setSelectedPermissionId} />
              {selectedPermission ? (
                <form key={selectedPermission.id} className="mt-4 grid gap-3" onSubmit={handleUpdatePermission}>
                  <PermissionFields permission={selectedPermission} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-3 text-xs font-bold text-white disabled:opacity-60" disabled={permissionUpdateMutation.isPending}>
                      <Save className="size-4" />
                      ذخیره مجوز
                    </button>
                    <button type="button" onClick={() => deactivatePermissionMutation.mutate(selectedPermission.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-danger/30 px-3 text-xs font-bold text-danger disabled:opacity-60" disabled={deactivatePermissionMutation.isPending}>
                      <Trash2 className="size-4" />
                      غیرفعال
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          </section>
        </div>
      </div>

      <DataGrid
        title="سوابق فعالیت پنل"
        items={logsQuery.data?.results ?? []}
        columns={logColumns}
        getRowId={(item) => `${item.source}-${item.id}`}
        loading={logsQuery.isLoading}
        defaultPageSize={20}
        filters={<SearchableSelect options={sourceOptions} value={logSource} onChange={setLogSource} clearable={false} />}
        searchPlaceholder="جستجو در لاگ‌ها"
        exportFileName="admin-access-activity-logs"
        printTitle="سوابق فعالیت پنل مدیریت"
      />
    </section>
  );
}

function PermissionFields({ permission }: { permission?: AdminPermission }) {
  return (
    <>
      <TextField label="کلید مجوز" name="key" defaultValue={permission?.key ?? ""} placeholder="users.manage" required />
      <TextField label="نام نمایشی" name="name" defaultValue={permission?.name ?? ""} required />
      <TextField label="نوع" name="permissionType" defaultValue={permission?.permissionType ?? "Api"} required />
      <TextField label="Route name" name="routename" defaultValue={permission?.routename ?? ""} />
      <TextAreaField label="توضیح" name="description" defaultValue={permission?.description ?? ""} />
      <label className="inline-flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="isActive" defaultChecked={permission?.isActive ?? true} className="size-4" />
        فعال باشد
      </label>
    </>
  );
}

function PermissionChecklist({
  title,
  permissions,
  selectedIds,
  onToggle,
  loading
}: {
  title?: string;
  permissions: AdminPermission[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  loading?: boolean;
}) {
  return (
    <div className="mt-4 rounded-md border border-border">
      {title ? <div className="border-b border-border px-3 py-2 text-sm font-black">{title}</div> : null}
      <div className="max-h-80 overflow-y-auto p-2">
        {permissions.map((permission) => (
          <label key={permission.id} className="flex min-h-11 items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={selectedIds.has(permission.id)} onChange={() => onToggle(permission.id)} className="mt-1 size-4" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-black">{permission.name}</span>
              <span className="block truncate text-xs text-muted">{permission.key}</span>
            </span>
            <span className={`rounded px-2 py-1 text-[11px] font-bold ${permission.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-muted"}`}>
              {permission.isActive ? "فعال" : "غیرفعال"}
            </span>
          </label>
        ))}
        {loading ? <div className="grid min-h-24 place-items-center text-sm text-muted">در حال بارگذاری...</div> : null}
        {!loading && !permissions.length ? <div className="p-3 text-sm text-muted">مجوزی برای نمایش وجود ندارد.</div> : null}
      </div>
    </div>
  );
}

function readPermissionForm(form: FormData): PermissionUpsertPayload {
  return {
    key: String(form.get("key") ?? "").trim(),
    name: String(form.get("name") ?? "").trim(),
    permissionType: String(form.get("permissionType") ?? "Api").trim(),
    routename: String(form.get("routename") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    isActive: form.get("isActive") === "on"
  };
}

function toggleSet(current: Set<number>, setter: (value: Set<number>) => void, id: number) {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  setter(next);
}

function resolveError(err: unknown, fallback: string) {
  return err instanceof ApiRequestError ? err.message : fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function sourceLabel(source: string) {
  if (source === "analytics") return "تحلیل رفتار";
  if (source === "project") return "پروژه";
  if (source === "system") return "سیستم";
  return source;
}
