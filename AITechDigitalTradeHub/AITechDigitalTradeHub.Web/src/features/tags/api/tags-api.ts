import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";

export type TagSummary = {
  id?: number;
  iD?: number;
  name?: string;
  Name?: string;
  slug?: string;
  Slug?: string;
};

export type TagPayload = {
  name: string;
  slug?: string;
};

export function getTags(params: { pageIndex?: number; pageSize?: number; searchText?: string } = {}) {
  return apiRequest<DotNetListResult<TagSummary>>(apiEndpoints.tags.list + toQueryString({ pageSize: 200, ...params }));
}

export function getTag(id: number) {
  return apiRequest<DotNetRowResult<TagSummary>>(apiEndpoints.tags.detail(id));
}

export function createTag(payload: TagPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.tags.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTag(id: number, payload: TagPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.tags.detail(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteTag(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.tags.detail(id), {
    method: "DELETE"
  });
}

export function getTagId(tag: TagSummary) {
  return Number(tag.id ?? tag.iD ?? 0);
}

export function getTagName(tag: TagSummary) {
  return tag.name ?? tag.Name ?? `مهارت ${getTagId(tag)}`;
}

export function getTagSlug(tag: TagSummary) {
  return tag.slug ?? tag.Slug ?? "";
}
