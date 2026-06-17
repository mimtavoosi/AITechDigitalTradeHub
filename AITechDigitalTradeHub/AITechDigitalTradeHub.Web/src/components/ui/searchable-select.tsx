"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption<TValue extends string | number = string> = {
  value: TValue;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SearchableSelectProps<TValue extends string | number = string> = {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: Array<SelectOption<TValue>>;
  value?: TValue | "";
  onChange: (value: TValue | "") => void;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
};

export function SearchableSelect<TValue extends string | number = string>({
  label,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جستجو",
  options,
  value,
  onChange,
  clearable = true,
  disabled,
  className
}: SearchableSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((item) => item.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((item) => `${item.label} ${item.description ?? ""}`.toLowerCase().includes(normalized));
  }, [options, query]);

  return (
    <div className={cn("relative grid gap-1.5 text-sm", className)}>
      {label ? <div className="font-bold text-foreground">{label}</div> : null}
      <button
        type="button"
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-white px-3 text-right text-sm outline-none transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={cn("min-w-0 flex-1 truncate", selected ? "text-foreground" : "text-muted")}>{selected?.label ?? placeholder}</span>
        <span className="flex shrink-0 items-center gap-1 text-muted">
          {clearable && selected ? (
            <span
              role="button"
              tabIndex={0}
              className="grid size-5 place-items-center rounded hover:bg-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
                setQuery("");
              }}
            >
              <X className="size-3.5" />
            </span>
          ) : null}
          <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-border bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={searchPlaceholder} autoFocus />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {filtered.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                disabled={option.disabled}
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-right text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold">{option.label}</span>
                  {option.description ? <span className="mt-0.5 block truncate text-xs text-muted">{option.description}</span> : null}
                </span>
                {option.value === value ? <Check className="size-4 shrink-0 text-primary" /> : null}
              </button>
            ))}
            {!filtered.length ? <div className="px-3 py-4 text-center text-xs text-muted">موردی پیدا نشد.</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type MultiSelectProps<TValue extends string | number = string> = {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: Array<SelectOption<TValue>>;
  value: TValue[];
  onChange: (value: TValue[]) => void;
  disabled?: boolean;
  className?: string;
  maxVisibleTags?: number;
};

export function MultiSelect<TValue extends string | number = string>({
  label,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جستجو",
  options,
  value,
  onChange,
  disabled,
  className,
  maxVisibleTags = 3
}: MultiSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.filter((item) => value.includes(item.value));
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((item) => `${item.label} ${item.description ?? ""}`.toLowerCase().includes(normalized));
  }, [options, query]);

  function toggle(optionValue: TValue) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <div className={cn("relative grid gap-1.5 text-sm", className)}>
      {label ? <div className="font-bold text-foreground">{label}</div> : null}
      <button
        type="button"
        disabled={disabled}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-1 text-right text-sm outline-none transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1">
          {selected.length ? (
            <>
              {selected.slice(0, maxVisibleTags).map((item) => (
                <span key={String(item.value)} className="inline-flex max-w-32 items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                  <span className="truncate">{item.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggle(item.value);
                    }}
                  >
                    <X className="size-3" />
                  </span>
                </span>
              ))}
              {selected.length > maxVisibleTags ? <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-muted">+{selected.length - maxVisibleTags}</span> : null}
            </>
          ) : (
            <span className="py-1 text-muted">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-border bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={searchPlaceholder} autoFocus />
          </div>
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs">
            <button type="button" className="font-bold text-primary" onClick={() => onChange(options.filter((item) => !item.disabled).map((item) => item.value))}>
              انتخاب همه
            </button>
            <button type="button" className="font-bold text-muted" onClick={() => onChange([])}>
              پاک کردن
            </button>
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {filtered.map((option) => {
              const checked = value.includes(option.value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={option.disabled}
                  className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-right text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => toggle(option.value)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{option.label}</span>
                    {option.description ? <span className="mt-0.5 block truncate text-xs text-muted">{option.description}</span> : null}
                  </span>
                  <span className={cn("grid size-5 place-items-center rounded border", checked ? "border-primary bg-primary text-white" : "border-border")}>
                    {checked ? <Check className="size-3.5" /> : null}
                  </span>
                </button>
              );
            })}
            {!filtered.length ? <div className="px-3 py-4 text-center text-xs text-muted">موردی پیدا نشد.</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
