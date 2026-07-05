"use client";

import { useEffect } from "react";

const reloadFlagKey = "aitech:asset-recovery:last-reload";
const recoveryCooldownMs = 30_000;

function shouldRecoverFromMessage(message: string) {
  return [
    "/_next/static/",
    "ChunkLoadError",
    "Loading chunk",
    "Loading CSS chunk",
    "Failed to fetch dynamically imported module",
    "Importing a module script failed",
    "dynamically imported module"
  ].some((needle) => message.includes(needle));
}

function tryReloadOnce() {
  const lastReload = Number(sessionStorage.getItem(reloadFlagKey) ?? 0);
  if (Number.isFinite(lastReload) && Date.now() - lastReload < recoveryCooldownMs) return;

  sessionStorage.setItem(reloadFlagKey, String(Date.now()));
  window.location.reload();
}

export function AssetRecovery() {
  useEffect(() => {
    function recoverFromStaticAssetFailure(event: Event) {
      const target = event.target as HTMLElement | null;
      const source = target instanceof HTMLScriptElement ? target.src : target instanceof HTMLLinkElement ? target.href : "";
      if (!source.includes("/_next/static/")) return;
      tryReloadOnce();
    }

    function recoverFromChunkFailure(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message = reason instanceof Error ? `${reason.name} ${reason.message}` : String(reason ?? "");
      if (!shouldRecoverFromMessage(message)) return;
      event.preventDefault();
      tryReloadOnce();
    }

    function recoverFromRuntimeAssetFailure(event: ErrorEvent) {
      const message = `${event.message ?? ""} ${event.filename ?? ""}`;
      if (!shouldRecoverFromMessage(message)) return;
      tryReloadOnce();
    }

    window.addEventListener("error", recoverFromStaticAssetFailure, true);
    window.addEventListener("error", recoverFromRuntimeAssetFailure);
    window.addEventListener("unhandledrejection", recoverFromChunkFailure);
    return () => {
      window.removeEventListener("error", recoverFromStaticAssetFailure, true);
      window.removeEventListener("error", recoverFromRuntimeAssetFailure);
      window.removeEventListener("unhandledrejection", recoverFromChunkFailure);
    };
  }, []);

  return null;
}
