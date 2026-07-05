"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Loader2, Plus, ShieldX } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
import { TextField } from "@/components/ui/form-field";
import {
  assignBadge,
  createBadge,
  getAllBadgeAssignments,
  getAssignmentBadge,
  getAssignmentId,
  getAssignmentStatus,
  getAssignmentTargetId,
  getAssignmentTargetType,
  getBadgeId,
  getBadgeTitle,
  getBadges,
  revokeBadge
} from "@/features/badges/api/badges-api";
import type { BadgeAssignmentSummary, BadgeTargetType } from "@/features/badges/types";
import { ApiRequestError } from "@/lib/api/http-client";

const assignmentStatusLabels: Record<string, string> = {
  Active: "فعال",
  Revoked: "لغوشده",
  Expired: "منقضی"
};

const targetTypeLabels: Record<string, string> = {
  User: "کاربر",
  Organization: "شرکت"
};

const targetTypeOptions: Array<SelectOption<BadgeTargetType>> = [
  { value: "User", label: "کاربر" },
  { value: "Organization", label: "شرکت" }
];

export function AdminBadgesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<BadgeTargetType | "">("User");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | "">("");

  const badgesQuery = useQuery({ queryKey: ["badges", "catalog"], queryFn: getBadges });
  const assignmentsQuery = useQuery({ queryKey: ["badges", "assignments"], queryFn: () => getAllBadgeAssignments({ pageSize: 200 }) });

  const assignments = assignmentsQuery.data?.results ?? [];

  const badgeOptions = useMemo<Array<SelectOption<number>>>(
    () => (badgesQuery.data?.results ?? []).map((badge) => ({ value: getBadgeId(badge), label: getBadgeTitle(badge) })),
    [badgesQuery.data]
  );

  const createBadgeMutation = useMutation({
    mutationFn: createBadge,
    onSuccess: () => {
      setMessage("نشان جدید ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["badges", "catalog"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت نشان ناموفق بود")
  });

  const assignMutation = useMutation({
    mutationFn: assignBadge,
    onSuccess: () => {
      setMessage("نشان به هدف اختصاص یافت.");
      void queryClient.invalidateQueries({ queryKey: ["badges", "assignments"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "اختصاص نشان ناموفق بود")
  });

  const revokeMutation = useMutation({
    mutationFn: revokeBadge,
    onSuccess: () => {
      setMessage("نشان لغو شد.");
      void queryClient.invalidateQueries({ queryKey: ["badges", "assignments"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "لغو نشان ناموفق بود")
  });

  function handleCreateBadge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createBadgeMutation.mutate({
      title: String(form.get("title") || ""),
      code: String(form.get("code") || ""),
      description: String(form.get("description") || "") || undefined,
      iconName: String(form.get("iconName") || "") || undefined
    });
    event.currentTarget.reset();
  }

  function handleAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const targetId = Number(form.get("targetId") || 0);
    if (!selectedBadgeId || !targetType || !targetId) {
      setMessage("نشان، نوع هدف و شناسه هدف الزامی است.");
      return;
    }

    assignMutation.mutate({
      badgeId: selectedBadgeId,
      targetType,
      targetId,
      reason: String(form.get("reason") || "") || undefined
    });
    event.currentTarget.reset();
  }

  const assignmentColumns = useMemo<Array<DataGridColumn<BadgeAssignmentSummary>>>(
    () => [
      {
        key: "badge",
        title: "نشان",
        priority: "primary",
        searchValue: (item) => getBadgeTitle(getAssignmentBadge(item) ?? {}),
        exportValue: (item) => getBadgeTitle(getAssignmentBadge(item) ?? {}),
        render: (item) => (
          <div className="flex items-center gap-2 font-black">
            <Award className="size-4 text-amber-600" />
            {getBadgeTitle(getAssignmentBadge(item) ?? {})}
          </div>
        )
      },
      {
        key: "target",
        title: "هدف",
        priority: "meta",
        searchValue: (item) => `${getAssignmentTargetType(item)} ${getAssignmentTargetId(item)}`,
        render: (item) => (
          <div className="text-xs text-muted">
            {targetTypeLabels[getAssignmentTargetType(item)] ?? getAssignmentTargetType(item)} #{getAssignmentTargetId(item).toLocaleString("fa-IR")}
          </div>
        )
      },
      {
        key: "status",
        title: "وضعیت",
        priority: "meta",
        render: (item) => {
          const status = getAssignmentStatus(item);
          return <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-bold">{assignmentStatusLabels[status] ?? status}</span>;
        }
      }
    ],
    []
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="grid gap-5">
        <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">ثبت نشان جدید</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleCreateBadge}>
            <TextField label="عنوان نشان" name="title" placeholder="مثل مجری برتر" required />
            <TextField label="کد یکتا" name="code" placeholder="مثل top-contractor" required />
            <TextField label="آیکون (اختیاری)" name="iconName" placeholder="نام آیکون" />
            <TextField label="توضیحات (اختیاری)" name="description" placeholder="توضیح کوتاه نشان" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createBadgeMutation.isPending}>
              {createBadgeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              ثبت نشان
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
          <h2 className="text-lg font-black">اختصاص نشان</h2>
          <form className="mt-4 grid gap-3" onSubmit={handleAssign}>
            <SearchableSelect label="نشان" placeholder="انتخاب نشان" options={badgeOptions} value={selectedBadgeId} onChange={setSelectedBadgeId} />
            <SearchableSelect label="نوع هدف" options={targetTypeOptions} value={targetType} onChange={setTargetType} clearable={false} />
            <TextField label="شناسه هدف (کاربر یا شرکت)" name="targetId" type="number" placeholder="مثلا 12" required />
            <TextField label="دلیل اختصاص (اختیاری)" name="reason" placeholder="مثلا عملکرد عالی در سه پروژه پایانی" />
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
              اختصاص نشان
            </button>
          </form>
        </section>

        {message ? <div className="rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
      </div>

      <DataGrid
        title="نشان‌های اختصاص‌یافته"
        items={assignments}
        columns={assignmentColumns}
        getRowId={(item) => getAssignmentId(item)}
        loading={assignmentsQuery.isLoading}
        searchPlaceholder="جستجو در نشان‌ها"
        exportFileName="badge-assignments"
        printTitle="نشان‌های اختصاص‌یافته"
        renderRowActions={(item) =>
          getAssignmentStatus(item) === "Active" ? (
            <button
              type="button"
              onClick={() => revokeMutation.mutate(getAssignmentId(item))}
              disabled={revokeMutation.isPending}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-danger/30 px-2 text-xs font-bold text-danger disabled:opacity-50"
            >
              <ShieldX className="size-3.5" />
              لغو
            </button>
          ) : null
        }
      />
    </div>
  );
}
