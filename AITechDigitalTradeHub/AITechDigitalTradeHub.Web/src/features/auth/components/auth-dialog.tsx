"use client";

import { X } from "lucide-react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { useAuthStore } from "@/store/auth-store";

export function AuthDialog() {
  const mode = useAuthStore((state) => state.authDialogMode);
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);
  const closeAuthDialog = useAuthStore((state) => state.closeAuthDialog);

  if (!mode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="بستن" onClick={closeAuthDialog} />
      <section className="relative w-full max-w-[520px] rounded-lg border border-white/80 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.30)]">
        <button
          type="button"
          onClick={closeAuthDialog}
          className="absolute left-4 top-4 grid size-9 place-items-center rounded-md border border-border bg-white text-muted hover:bg-slate-50"
          aria-label="بستن پنجره"
        >
          <X className="size-4" />
        </button>
        <AuthCard mode={mode} compact onModeChange={openAuthDialog} onSuccess={closeAuthDialog} />
      </section>
    </div>
  );
}
