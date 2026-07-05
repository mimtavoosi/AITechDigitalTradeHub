"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AppModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
  bodyClassName?: string;
};

export function AppModal({ title, description, children, footer, onClose, className, bodyClassName }: AppModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black/45 p-3 sm:p-5">
      <section className={cn("flex max-h-[calc(100vh-2rem)] w-full max-w-5xl min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]", className)}>
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-lg font-black leading-7 text-foreground">{title}</h3>
            {description ? <p className="mt-1 text-sm leading-7 text-muted">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-white text-muted transition hover:border-danger hover:text-danger" aria-label="بستن">
            <X className="size-4" />
          </button>
        </header>

        <div className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5", bodyClassName)}>
          {children}
        </div>

        {footer ? <footer className="shrink-0 border-t border-border bg-white px-4 py-3 sm:px-5">{footer}</footer> : null}
      </section>
    </div>
  );
}
