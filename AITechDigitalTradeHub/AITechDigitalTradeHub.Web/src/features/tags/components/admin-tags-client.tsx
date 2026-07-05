"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Tags, Trash2 } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { createTag, deleteTag, getTagId, getTagName, getTagSlug, getTags, type TagSummary } from "@/features/tags/api/tags-api";
import { ApiRequestError } from "@/lib/api/http-client";

export function AdminTagsClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags({ pageSize: 300 })
  });

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      setMessage("مهارت ثبت شد.");
      void queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت مهارت ناموفق بود")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      setMessage("مهارت حذف شد.");
      void queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "حذف مهارت ناموفق بود")
  });

  const tags = tagsQuery.data?.results ?? [];
  const columns = useMemo<Array<DataGridColumn<TagSummary>>>(
    () => [
      {
        key: "name",
        title: "مهارت",
        priority: "primary",
        searchValue: (item) => `${getTagName(item)} ${getTagSlug(item)}`,
        exportValue: getTagName,
        render: (item) => (
          <div>
            <div className="flex items-center gap-2 font-black">
              <Tags className="size-4 text-primary" />
              {getTagName(item)}
            </div>
            <div className="mt-1 text-xs text-muted">{getTagSlug(item) || "بدون اسلاگ"}</div>
          </div>
        )
      }
    ],
    []
  );

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || "") || undefined
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black">ثبت مهارت پروژه</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="name" placeholder="نام مهارت مثل React یا طراحی API" required />
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="slug" placeholder="اسلاگ اختیاری مثل react" />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            ثبت مهارت
          </button>
        </form>
        {message ? <div className="mt-4 rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <DataGrid
        title="مدیریت مهارت‌های پروژه"
        items={tags}
        columns={columns}
        getRowId={(item) => getTagId(item)}
        loading={tagsQuery.isLoading}
        searchPlaceholder="جستجو در نام یا اسلاگ مهارت"
        exportFileName="project-skills"
        printTitle="مهارت‌های پروژه"
        renderRowActions={(item) => (
          <button
            type="button"
            onClick={() => deleteMutation.mutate(getTagId(item))}
            disabled={deleteMutation.isPending}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-danger/30 px-2 text-xs font-bold text-danger disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
            حذف
          </button>
        )}
      />
    </div>
  );
}
