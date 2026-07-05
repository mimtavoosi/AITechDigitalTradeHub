"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, EyeOff, GripVertical } from "lucide-react";
import { getPanelPreference, usePanelPreferencesStore, type PanelKey } from "@/store/panel-preferences-store";

type SortableContextValue = {
  panelKey: PanelKey;
  draggingId: string | null;
  overId: string | null;
  dropPosition: DropPosition;
  setDraggingId: (value: string | null) => void;
  setDropTarget: (targetId: string | null, position?: DropPosition) => void;
  clearDragState: () => void;
  handleDrop: (targetId?: string | null, position?: DropPosition) => void;
  moveItem: (itemId: string, direction: DropPosition) => void;
};

const SortableContext = createContext<SortableContextValue | null>(null);
type DropPosition = "before" | "after";

export function PanelSortableArea({
  panelKey,
  children,
  className
}: {
  panelKey: PanelKey;
  children: React.ReactNode;
  className: string;
}) {
  const preference = usePanelPreferencesStore((state) => getPanelPreference(state.preferences[panelKey], panelKey));
  const loadPreference = usePanelPreferencesStore((state) => state.loadPreference);
  const updatePreference = usePanelPreferencesStore((state) => state.updatePreference);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>("after");

  useEffect(() => {
    void loadPreference(panelKey);
  }, [loadPreference, panelKey]);

  const items = useMemo(() => {
    return React.Children.toArray(children).filter(React.isValidElement) as Array<React.ReactElement<SortableItemProps>>;
  }, [children]);

  const orderedItems = useMemo(() => {
    const order = preference.cardOrder;
    if (order.length === 0) return items.filter((item) => !preference.hiddenItems.includes(item.props.itemId));
    const itemMap = new Map(items.map((item) => [item.props.itemId, item]));
    const sorted = order.map((id) => itemMap.get(id)).filter(Boolean) as Array<React.ReactElement<SortableItemProps>>;
    const missing = items.filter((item) => !order.includes(item.props.itemId));
    return [...sorted, ...missing].filter((item) => !preference.hiddenItems.includes(item.props.itemId));
  }, [items, preference.cardOrder, preference.hiddenItems]);

  function clearDragState() {
    setDraggingId(null);
    setOverId(null);
    setDropPosition("after");
  }

  function setDropTarget(targetId: string | null, position: DropPosition = "after") {
    setOverId(targetId);
    setDropPosition(position);
  }

  function handleDrop(targetId: string | null = null, position: DropPosition = "after") {
    if (!draggingId || draggingId === targetId) {
      clearDragState();
      return;
    }

    const current = orderedItems.map((item) => item.props.itemId);
    const next = current.filter((id) => id !== draggingId);
    const targetIndex = targetId ? next.indexOf(targetId) : -1;
    const insertionIndex = targetIndex < 0 ? next.length : targetIndex + (position === "after" ? 1 : 0);
    next.splice(insertionIndex, 0, draggingId);
    void updatePreference(panelKey, { cardOrder: next });
    clearDragState();
  }

  function moveItem(itemId: string, direction: DropPosition) {
    const current = orderedItems.map((item) => item.props.itemId);
    const currentIndex = current.indexOf(itemId);
    if (currentIndex < 0) return;

    const next = [...current];
    const [movingItem] = next.splice(currentIndex, 1);
    const insertionIndex = direction === "before" ? Math.max(0, currentIndex - 1) : Math.min(next.length, currentIndex + 1);

    if (insertionIndex === currentIndex) return;
    next.splice(insertionIndex, 0, movingItem);
    void updatePreference(panelKey, { cardOrder: next });
  }

  return (
    <SortableContext.Provider value={{ panelKey, draggingId, overId, dropPosition, setDraggingId, setDropTarget, clearDragState, handleDrop, moveItem }}>
      <div
        className={className}
        onDragOver={(event) => {
          if (!draggingId) return;
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setDropTarget(null, "after");
          }
        }}
        onDrop={(event) => {
          if (!draggingId || event.currentTarget !== event.target) return;
          event.preventDefault();
          handleDrop();
        }}
      >
        {orderedItems}
      </div>
    </SortableContext.Provider>
  );
}

type SortableItemProps = {
  itemId: string;
  children: React.ReactNode;
  className?: string;
};

export function PanelSortableItem({ itemId, children, className = "" }: SortableItemProps) {
  const context = useContext(SortableContext);
  const hideItem = usePanelPreferencesStore((state) => state.hideItem);

  if (!context) {
    return <>{children}</>;
  }

  const active = context.draggingId === itemId;
  const over = context.overId === itemId && context.draggingId !== itemId;
  const dropAfter = context.dropPosition === "after";

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", itemId);
        context.setDraggingId(itemId);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        context.setDropTarget(itemId, getDropPosition(event));
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        context.handleDrop(itemId, context.dropPosition);
      }}
      onDragEnd={() => {
        context.clearDragState();
      }}
      className={`group relative min-w-0 rounded-lg transition ${className} ${active ? "scale-[0.98] opacity-60" : ""} ${over ? "ring-2 ring-primary/55" : ""}`}
    >
      {over ? (
        <span
          className={`pointer-events-none absolute inset-x-3 z-20 h-1 rounded-full bg-primary/65 shadow-[0_0_0_4px_rgb(126_87_245_/_0.14)] ${dropAfter ? "-bottom-2" : "-top-2"}`}
        />
      ) : null}
      <div className="absolute left-2 top-2 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => context.moveItem(itemId, "before")}
          className="grid size-8 place-items-center rounded-md border border-border bg-white/90 text-muted shadow-panel transition hover:text-primary focus-ring"
          title="انتقال به قبل"
          aria-label="انتقال کارت به قبل"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => context.moveItem(itemId, "after")}
          className="grid size-8 place-items-center rounded-md border border-border bg-white/90 text-muted shadow-panel transition hover:text-primary focus-ring"
          title="انتقال به بعد"
          aria-label="انتقال کارت به بعد"
        >
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowRight") {
              event.preventDefault();
              context.moveItem(itemId, "before");
            }
            if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
              event.preventDefault();
              context.moveItem(itemId, "after");
            }
          }}
          className="grid size-8 cursor-grab place-items-center rounded-md border border-border bg-white/90 text-muted shadow-panel focus-ring"
          title="کشیدن برای جابه‌جایی"
          aria-label="کشیدن برای جابه‌جایی؛ با کلیدهای جهت‌دار هم قابل جابه‌جایی است"
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => hideItem(context.panelKey, itemId)}
          className="grid size-8 place-items-center rounded-md border border-border bg-white/90 text-muted shadow-panel transition hover:text-danger focus-ring"
          title="مخفی کردن از پنل"
          aria-label="مخفی کردن کارت از پنل"
        >
          <EyeOff className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function getDropPosition(event: React.DragEvent<HTMLElement>): DropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  const horizontal = rect.width > rect.height * 1.25;
  if (!horizontal) {
    return event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  }

  const direction = window.getComputedStyle(event.currentTarget).direction;
  const pastMiddle = event.clientX > rect.left + rect.width / 2;
  return direction === "rtl" ? (pastMiddle ? "before" : "after") : pastMiddle ? "after" : "before";
}
