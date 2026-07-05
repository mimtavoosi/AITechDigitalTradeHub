import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";

export function normalizeDotNetResult(payload: unknown): DotNetResult {
  return camelizeKeys(payload) as DotNetResult;
}

export function normalizeDotNetRow<TData>(payload: unknown): DotNetRowResult<TData> {
  return camelizeKeys(payload) as DotNetRowResult<TData>;
}

export function normalizeDotNetList<TItem>(payload: unknown): DotNetListResult<TItem> {
  return camelizeKeys(payload) as DotNetListResult<TItem>;
}

export function camelizeKeys<TValue>(value: unknown): TValue {
  if (Array.isArray(value)) {
    return value.map((item) => camelizeKeys(item)) as TValue;
  }

  if (!isPlainObject(value)) {
    return value as TValue;
  }

  const result: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, nestedValue]) => {
    result[toCamelKey(key)] = camelizeKeys(nestedValue);
  });

  return result as TValue;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function toCamelKey(key: string) {
  if (!key) return key;
  if (key === key.toUpperCase()) return key.toLowerCase();
  return `${key[0].toLowerCase()}${key.slice(1)}`;
}
