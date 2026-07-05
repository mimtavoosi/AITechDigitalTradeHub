"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Loader2, Plus, Trash2 } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createCategory, deleteCategory, getCategories, getCategoryId, type CategorySummary } from "@/features/categories/api/categories-api";
import { ApiRequestError } from "@/lib/api/http-client";

const typeOptions = [
  { value: 4, label: "پروژه" },
  { value: 2, label: "خدمت" },
  { value: 1, label: "محصول" },
  { value: 6, label: "پروژه و خدمت" },
  { value: 7, label: "همه کاربردها" }
];

export function AdminCategoriesClient() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [typeMask, setTypeMask] = useState<number | "">(4);
  const [parentId, setParentId] = useState<number | "">("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ pageSize: 200 })
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setMessage("دسته‌بندی ثبت شد.");
      setParentId("");
      setTypeMask(4);
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "ثبت دسته‌بندی ناموفق بود")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setMessage("دسته‌بندی حذف شد.");
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => setMessage(err instanceof ApiRequestError ? err.message : "حذف دسته‌بندی ناموفق بود")
  });

  const categories = categoriesQuery.data?.results ?? [];
  const parentOptions = categories.map((item) => ({
    value: getCategoryId(item),
    label: item.categoryName,
    description: typeMaskLabel(item.typeMask)
  }));

  const columns = useMemo<Array<DataGridColumn<CategorySummary>>>(
    () => [
      {
        key: "name",
        title: "دسته‌بندی",
        priority: "primary",
        searchValue: (item) => `${item.categoryName} ${item.categoryDescription ?? ""}`,
        exportValue: (item) => item.categoryName,
        render: (item) => (
          <div>
            <div className="flex items-center gap-2 font-black">
              <FolderTree className="size-4 text-primary" />
              {item.categoryName}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-muted">{item.categoryDescription ?? "بدون توضیح"}</div>
          </div>
        )
      },
      {
        key: "type",
        title: "کاربرد",
        exportValue: (item) => typeMaskLabel(item.typeMask),
        render: (item) => <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{typeMaskLabel(item.typeMask)}</span>
      },
      {
        key: "parent",
        title: "والد",
        exportValue: (item) => item.parentId ?? "",
        render: (item) => <span className="text-xs text-muted">{item.parentId ? `#${item.parentId}` : "ریشه"}</span>
      }
    ],
    []
  );

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      categoryName: String(form.get("categoryName") || ""),
      categoryDescription: String(form.get("categoryDescription") || ""),
      parentId: parentId || null,
      typeMask: Number(typeMask || 4)
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="rounded-lg border border-border bg-white p-5 shadow-panel">
        <h2 className="text-lg font-black">ثبت دسته‌بندی</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
          <input className="h-11 rounded-md border border-border px-3 focus-ring" name="categoryName" placeholder="نام دسته‌بندی" required />
          <textarea className="min-h-24 rounded-md border border-border px-3 py-2 focus-ring" name="categoryDescription" placeholder="توضیح دسته‌بندی" />
          <SearchableSelect label="کاربرد" options={typeOptions} value={typeMask} onChange={setTypeMask} clearable={false} />
          <SearchableSelect label="دسته والد" options={parentOptions} value={parentId} onChange={setParentId} placeholder="بدون والد" />
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-white disabled:opacity-60" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            ثبت دسته‌بندی
          </button>
        </form>
        {message ? <div className="mt-4 rounded-md bg-background px-3 py-2 text-sm text-muted">{message}</div> : null}
      </section>

      <DataGrid
        title="مدیریت دسته‌بندی‌ها"
        items={categories}
        columns={columns}
        getRowId={(item) => getCategoryId(item)}
        loading={categoriesQuery.isLoading}
        searchPlaceholder="جستجو در نام و توضیح دسته‌بندی"
        exportFileName="categories"
        printTitle="دسته‌بندی‌ها"
        renderRowActions={(item) => (
          <button
            type="button"
            onClick={() => deleteMutation.mutate(getCategoryId(item))}
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

function typeMaskLabel(value: string | number) {
  const numeric = Number(value);
  if (numeric === 7) return "همه";
  if (numeric === 6) return "پروژه و خدمت";
  if (numeric === 4) return "پروژه";
  if (numeric === 2) return "خدمت";
  if (numeric === 1) return "محصول";
  return String(value);
}
