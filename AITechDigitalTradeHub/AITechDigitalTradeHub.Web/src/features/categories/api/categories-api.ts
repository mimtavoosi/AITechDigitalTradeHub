import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";

export type CategorySummary = {
  id?: number;
  iD?: number;
  parentId?: number | null;
  categoryName: string;
  CategoryName?: string;
  categoryDescription?: string | null;
  CategoryDescription?: string | null;
  typeMask: number | string;
  TypeMask?: number | string;
};

export type CategoryPayload = {
  parentId?: number | null;
  categoryName: string;
  categoryDescription?: string;
  typeMask: number;
};

export function getCategories(params: { pageIndex?: number; pageSize?: number; searchText?: string; sortQuery?: string } = {}) {
  return apiRequest<DotNetListResult<CategorySummary>>(apiEndpoints.categories.list + toQueryString({ pageSize: 100, ...params }));
}

export function getCategory(id: number) {
  return apiRequest<DotNetRowResult<CategorySummary>>(apiEndpoints.categories.detail(id));
}

export function createCategory(payload: CategoryPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.categories.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategory(id: number, payload: CategoryPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.categories.detail(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteCategory(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.categories.detail(id), {
    method: "DELETE"
  });
}

export function getCategoryId(category: CategorySummary) {
  return Number(category.id ?? category.iD ?? 0);
}

export function getCategoryName(category: CategorySummary) {
  return category.categoryName ?? category.CategoryName ?? `دسته ${getCategoryId(category)}`;
}

export function getCategoryDescription(category: CategorySummary) {
  return category.categoryDescription ?? category.CategoryDescription ?? undefined;
}

export function getCategoryTypeMask(category: CategorySummary) {
  return category.typeMask ?? category.TypeMask ?? 0;
}

export function isProjectCategory(category: CategorySummary) {
  const mask = getCategoryTypeMask(category);
  if (typeof mask === "number") return (mask & 4) === 4;
  const normalized = String(mask).toLowerCase();
  return normalized.includes("project") || normalized === "4" || normalized === "6" || normalized === "7";
}
