"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppErrorBoundary } from "@/components/system/app-error-boundary";
import { AssetRecovery } from "@/components/system/asset-recovery";
import { NotificationViewport } from "@/components/system/notification-viewport";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { AuthSessionBootstrap } from "@/features/auth/components/auth-session-bootstrap";
import { resolveErrorMessage, resolveErrorTitle } from "@/lib/errors";
import { useNotificationStore } from "@/store/notification-store";

const errorDedupeWindowMs = 3500;
const recentErrors = new Map<string, number>();

function notifyGlobalError(error: unknown, fallback: string) {
  const title = resolveErrorTitle(error);
  const message = resolveErrorMessage(error, fallback);
  const key = `${title}:${message}`;
  const now = Date.now();
  const lastShown = recentErrors.get(key) ?? 0;
  if (now - lastShown < errorDedupeWindowMs) return;

  recentErrors.set(key, now);
  useNotificationStore.getState().addNotification({
    title,
    message,
    tone: "error"
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.suppressGlobalError) return;
            notifyGlobalError(error, "دریافت اطلاعات ناموفق بود");
          }
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.suppressGlobalError) return;
            notifyGlobalError(error, "انجام عملیات ناموفق بود");
          }
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
              if (statusCode >= 400 && statusCode < 500) return false;
              return failureCount < 1;
            }
          },
          mutations: {
            retry: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AssetRecovery />
      <AuthSessionBootstrap />
      <AppErrorBoundary>{children}</AppErrorBoundary>
      <AuthDialog />
      <NotificationViewport />
    </QueryClientProvider>
  );
}
