"use client";

import { Fragment, ReactNode, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns3, FileDown, FileSpreadsheet, Maximize2, Minimize2, Printer, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataGridColumn<TItem> = {
  key: string;
  title: string;
  accessor?: keyof TItem | ((item: TItem, index: number) => ReactNode);
  sortable?: boolean;
  searchable?: boolean;
  hidden?: boolean;
  priority?: "primary" | "meta" | "detail";
  className?: string;
  headerClassName?: string;
  render?: (item: TItem, index: number) => ReactNode;
  sortValue?: (item: TItem) => string | number | Date | null | undefined;
  searchValue?: (item: TItem) => string;
  exportValue?: (item: TItem, index: number) => string | number | null | undefined;
};

type DataGridProps<TItem> = {
  title?: string;
  items: TItem[];
  columns: Array<DataGridColumn<TItem>>;
  getRowId: (item: TItem, index: number) => string | number;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableDensityToggle?: boolean;
  enableExport?: boolean;
  enablePrint?: boolean;
  exportFileName?: string;
  printTitle?: string;
  toolbarActions?: ReactNode;
  filters?: ReactNode;
  renderRowActions?: (item: TItem, index: number) => ReactNode;
};

type SortState = {
  key: string;
  direction: "asc" | "desc";
} | null;

export function DataGrid<TItem>({
  title,
  items,
  columns,
  getRowId,
  loading,
  searchable = true,
  searchPlaceholder = "جستجو",
  emptyText = "داده‌ای برای نمایش وجود ندارد.",
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  enableSelection = false,
  enableColumnVisibility = true,
  enableDensityToggle = true,
  enableExport = true,
  enablePrint = true,
  exportFileName = "grid-export",
  printTitle,
  toolbarActions,
  filters,
  renderRowActions
}: DataGridProps<TItem>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [compact, setCompact] = useState(false);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => new Set(columns.filter((col) => col.hidden).map((col) => col.key)));
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const visibleColumns = useMemo(() => columns.filter((column) => !hiddenColumns.has(column.key)), [columns, hiddenColumns]);
  const hasActions = Boolean(renderRowActions);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const searchableColumns = columns.filter((column) => column.searchable !== false);
    const base = normalized
      ? items.filter((item, index) =>
          searchableColumns.some((column) => getSearchText(item, index, column).toLowerCase().includes(normalized))
        )
      : items;

    if (!sort) return base;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return base;

    return [...base].sort((first, second) => {
      const firstValue = getSortValue(first, column);
      const secondValue = getSortValue(second, column);
      const result = compareValues(firstValue, secondValue);
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, items, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedCount = selectedIds.size;
  const allPageSelected = pagedItems.length > 0 && pagedItems.every((item, index) => selectedIds.has(getRowId(item, index)));
  const selectedItems = useMemo(
    () => filteredItems.filter((item, index) => selectedIds.has(getRowId(item, index))),
    [filteredItems, getRowId, selectedIds]
  );
  const exportItems = selectedItems.length ? selectedItems : filteredItems;

  function toggleSort(column: DataGridColumn<TItem>) {
    if (!column.sortable) return;
    setSort((current) => {
      if (!current || current.key !== column.key) return { key: column.key, direction: "asc" };
      if (current.direction === "asc") return { key: column.key, direction: "desc" };
      return null;
    });
  }

  function toggleColumn(key: string) {
    setHiddenColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleRow(id: string | number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePageSelection() {
    setSelectedIds((current) => {
      const next = new Set(current);
      pagedItems.forEach((item, index) => {
        const id = getRowId(item, index);
        if (allPageSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }

  function exportCsv() {
    const csv = toCsv(exportItems, visibleColumns);
    downloadFile(`${exportFileName}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportExcel() {
    const html = toExcelHtml(exportItems, visibleColumns, title ?? exportFileName);
    downloadFile(`${exportFileName}.xls`, html, "application/vnd.ms-excel;charset=utf-8");
  }

  function printGrid() {
    const html = toPrintableHtml(exportItems, visibleColumns, printTitle ?? title ?? "گزارش");
    const popup = window.open("", "_blank", "width=1100,height=760");
    if (!popup) return;
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <section className="rounded-lg border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          {title ? <h2 className="text-lg font-black">{title}</h2> : null}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-slate-50 px-2 py-1">کل: {filteredItems.length.toLocaleString("fa-IR")}</span>
            <span className="rounded-md bg-slate-50 px-2 py-1">صفحه: {safePage.toLocaleString("fa-IR")} / {pageCount.toLocaleString("fa-IR")}</span>
            {enableSelection && selectedCount ? <span className="rounded-md bg-primary/10 px-2 py-1 font-bold text-primary">انتخاب‌شده: {selectedCount.toLocaleString("fa-IR")}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbarActions}
          {enableExport ? (
            <>
              <button type="button" className="grid size-10 place-items-center rounded-md border border-border bg-white text-muted hover:text-foreground" onClick={exportExcel} title="خروجی اکسل">
                <FileSpreadsheet className="size-4" />
              </button>
              <button type="button" className="grid size-10 place-items-center rounded-md border border-border bg-white text-muted hover:text-foreground" onClick={exportCsv} title="خروجی CSV">
                <FileDown className="size-4" />
              </button>
            </>
          ) : null}
          {enablePrint ? (
            <button type="button" className="grid size-10 place-items-center rounded-md border border-border bg-white text-muted hover:text-foreground" onClick={printGrid} title="چاپ">
              <Printer className="size-4" />
            </button>
          ) : null}
          {enableColumnVisibility ? (
            <div className="relative">
              <button type="button" className="grid size-10 place-items-center rounded-md border border-border bg-white text-muted hover:text-foreground" onClick={() => setColumnPanelOpen((current) => !current)} title="ستون‌ها">
                <Columns3 className="size-4" />
              </button>
              {columnPanelOpen ? (
                <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-border bg-white p-3 shadow-lg">
                  <div className="mb-2 text-xs font-black text-muted">نمایش ستون‌ها</div>
                  <div className="grid max-h-64 gap-2 overflow-auto">
                    {columns.map((column) => (
                      <label key={column.key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!hiddenColumns.has(column.key)} onChange={() => toggleColumn(column.key)} />
                        <span>{column.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {enableDensityToggle ? (
            <button type="button" className="grid size-10 place-items-center rounded-md border border-border bg-white text-muted hover:text-foreground" onClick={() => setCompact((current) => !current)} title={compact ? "ردیف عادی" : "ردیف فشرده"}>
              {compact ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
            </button>
          ) : null}
        </div>
      </div>

      {(searchable || filters) && (
        <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(260px,380px)_1fr]">
          {searchable ? (
            <div className="flex h-10 items-center gap-2 rounded-md border border-border px-3">
              <Search className="size-4 text-muted" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder={searchPlaceholder}
              />
              {query ? (
                <button type="button" className="text-muted" onClick={() => setQuery("")}>
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
          ) : null}
          {filters ? <div className="flex flex-wrap gap-2">{filters}</div> : null}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[860px] border-separate border-spacing-0 text-right text-sm", compact && "text-xs")}>
          <thead>
            <tr className="bg-slate-50 text-xs text-muted">
              {enableSelection ? (
                <th className="w-11 px-3 py-3">
                  <input type="checkbox" checked={allPageSelected} onChange={togglePageSelection} />
                </th>
              ) : null}
              {visibleColumns.map((column) => (
                <th key={column.key} className={cn("px-3 py-3 font-black", column.sortable && "cursor-pointer select-none", column.headerClassName)} onClick={() => toggleSort(column)}>
                  <span className="inline-flex items-center gap-1">
                    {column.title}
                    {sort?.key === column.key ? sort.direction === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" /> : null}
                  </span>
                </th>
              ))}
              {hasActions ? <th className="px-3 py-3 font-black">عملیات</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {enableSelection ? <td className="border-b border-border px-3 py-3"><SkeletonLine /></td> : null}
                  {visibleColumns.map((column) => <td key={column.key} className="border-b border-border px-3 py-3"><SkeletonLine /></td>)}
                  {hasActions ? <td className="border-b border-border px-3 py-3"><SkeletonLine /></td> : null}
                </tr>
              ))
            ) : pagedItems.length ? (
              pagedItems.map((item, index) => {
                const id = getRowId(item, index);
                return (
                  <Fragment key={id}>
                    <tr className={cn("hidden align-top transition hover:bg-slate-50 md:table-row", selectedIds.has(id) && "bg-primary/5")}>
                      {enableSelection ? (
                        <td className="border-b border-border px-3 py-3">
                          <input type="checkbox" checked={selectedIds.has(id)} onChange={() => toggleRow(id)} />
                        </td>
                      ) : null}
                      {visibleColumns.map((column) => (
                        <td key={column.key} className={cn("border-b border-border px-3", compact ? "py-2" : "py-3", column.className)}>
                          {renderCell(item, index, column)}
                        </td>
                      ))}
                      {hasActions ? <td className={cn("border-b border-border px-3", compact ? "py-2" : "py-3")}>{renderRowActions?.(item, index)}</td> : null}
                    </tr>
                    <tr className="md:hidden">
                      <td colSpan={visibleColumns.length + Number(enableSelection) + Number(hasActions)} className="border-b border-border p-3">
                        <MobileCard item={item} index={index} columns={visibleColumns} selected={selectedIds.has(id)} enableSelection={enableSelection} onSelect={() => toggleRow(id)} actions={renderRowActions?.(item, index)} />
                      </td>
                    </tr>
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + Number(enableSelection) + Number(hasActions)} className="px-4 py-10 text-center text-sm text-muted">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm">
        <div className="flex items-center gap-2">
          <button type="button" className="grid size-9 place-items-center rounded-md border border-border disabled:opacity-45" disabled={safePage <= 1} onClick={() => setPage(1)}><ChevronsRight className="size-4" /></button>
          <button type="button" className="grid size-9 place-items-center rounded-md border border-border disabled:opacity-45" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronRight className="size-4" /></button>
          <span className="min-w-24 text-center text-xs text-muted">{safePage.toLocaleString("fa-IR")} از {pageCount.toLocaleString("fa-IR")}</span>
          <button type="button" className="grid size-9 place-items-center rounded-md border border-border disabled:opacity-45" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronLeft className="size-4" /></button>
          <button type="button" className="grid size-9 place-items-center rounded-md border border-border disabled:opacity-45" disabled={safePage >= pageCount} onClick={() => setPage(pageCount)}><ChevronsLeft className="size-4" /></button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          تعداد ردیف
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-9 rounded-md border border-border bg-white px-2 outline-none">
            {pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}

function MobileCard<TItem>({ item, index, columns, selected, enableSelection, onSelect, actions }: { item: TItem; index: number; columns: Array<DataGridColumn<TItem>>; selected: boolean; enableSelection: boolean; onSelect: () => void; actions?: ReactNode }) {
  const primary = columns.find((column) => column.priority === "primary") ?? columns[0];
  const meta = columns.filter((column) => column.priority === "meta").slice(0, 2);
  const details = columns.filter((column) => column.key !== primary?.key && !meta.some((metaColumn) => metaColumn.key === column.key));

  return (
    <article className={cn("rounded-lg border border-border bg-white p-3 shadow-panel", selected && "border-primary bg-primary/5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black text-primary">#{index + 1}</div>
          {primary ? <div className="mt-1 text-sm font-black">{renderCell(item, index, primary)}</div> : null}
        </div>
        {enableSelection ? <input type="checkbox" checked={selected} onChange={onSelect} /> : null}
      </div>
      {meta.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {meta.map((column) => (
            <div key={column.key} className="rounded-md bg-slate-50 p-2">
              <div className="text-[11px] font-bold text-muted">{column.title}</div>
              <div className="mt-1 text-xs font-black">{renderCell(item, index, column)}</div>
            </div>
          ))}
        </div>
      ) : null}
      {details.length ? (
        <div className="mt-3 grid gap-2">
          {details.map((column) => (
            <div key={column.key} className="grid grid-cols-[92px_1fr] gap-2 border-t border-dashed border-border pt-2 text-xs">
              <span className="font-bold text-muted">{column.title}</span>
              <span className="min-w-0">{renderCell(item, index, column)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {actions ? <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{actions}</div> : null}
    </article>
  );
}

function SkeletonLine() {
  return <div className="h-3 w-full animate-pulse rounded bg-slate-200" />;
}

function renderCell<TItem>(item: TItem, index: number, column: DataGridColumn<TItem>) {
  if (column.render) return column.render(item, index);
  if (typeof column.accessor === "function") return column.accessor(item, index);
  if (column.accessor) return String(item[column.accessor] ?? "");
  return "";
}

function getSearchText<TItem>(item: TItem, index: number, column: DataGridColumn<TItem>) {
  if (column.searchValue) return column.searchValue(item);
  const value = renderCell(item, index, column);
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function getSortValue<TItem>(item: TItem, column: DataGridColumn<TItem>) {
  if (column.sortValue) return column.sortValue(item);
  if (column.accessor && typeof column.accessor !== "function") return item[column.accessor] as string | number | Date | null | undefined;
  return "";
}

function compareValues(first: unknown, second: unknown) {
  const firstValue = first instanceof Date ? first.getTime() : first ?? "";
  const secondValue = second instanceof Date ? second.getTime() : second ?? "";
  if (typeof firstValue === "number" && typeof secondValue === "number") return firstValue - secondValue;
  return String(firstValue).localeCompare(String(secondValue), "fa");
}

function getExportText<TItem>(item: TItem, index: number, column: DataGridColumn<TItem>) {
  if (column.exportValue) return String(column.exportValue(item, index) ?? "");
  if (typeof column.accessor === "function") return normalizeExportValue(column.accessor(item, index));
  if (column.accessor) return normalizeExportValue(item[column.accessor]);
  const sortValue = column.sortValue?.(item);
  if (sortValue !== undefined && sortValue !== null) return normalizeExportValue(sortValue);
  const searchValue = column.searchValue?.(item);
  return normalizeExportValue(searchValue ?? "");
}

function normalizeExportValue(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function toCsv<TItem>(items: TItem[], columns: Array<DataGridColumn<TItem>>) {
  const header = columns.map((column) => escapeCsv(column.title)).join(",");
  const rows = items.map((item, index) => columns.map((column) => escapeCsv(getExportText(item, index, column))).join(","));
  return `\uFEFF${[header, ...rows].join("\r\n")}`;
}

function toExcelHtml<TItem>(items: TItem[], columns: Array<DataGridColumn<TItem>>, title: string) {
  const rows = items.map((item, index) => `<tr>${columns.map((column) => `<td>${escapeHtml(getExportText(item, index, column))}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body dir="rtl"><h2>${escapeHtml(title)}</h2><table border="1"><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.title)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function toPrintableHtml<TItem>(items: TItem[], columns: Array<DataGridColumn<TItem>>, title: string) {
  const rows = items.map((item, index) => `<tr>${columns.map((column) => `<td>${escapeHtml(getExportText(item, index, column))}</td>`).join("")}</tr>`).join("");
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body{font-family:Tahoma,Arial,sans-serif;color:#111827;margin:24px}
    h1{font-size:20px;margin:0 0 16px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #d1d5db;padding:8px;text-align:right;vertical-align:top}
    th{background:#f3f4f6}
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.title)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
</body>
</html>`;
}

function downloadFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
