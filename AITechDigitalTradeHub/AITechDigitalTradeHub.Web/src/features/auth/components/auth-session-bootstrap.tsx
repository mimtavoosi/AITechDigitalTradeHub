"use client";

import { useEffect, useRef } from "react";
import { authApi } from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/store/auth-store";

export function AuthSessionBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    // Remove auth data persisted by older frontend versions. Access tokens now
    // live only in memory and are restored through the HttpOnly refresh cookie.
    window.localStorage.removeItem("aitech-auth");

    void authApi
      .refresh()
      .then((result) => {
        if (result.status && result.accessToken && result.user) {
          setSession({ accessToken: result.accessToken, user: result.user });
          return;
        }
        clearSession();
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setHasHydrated(true);
      });
  }, [clearSession, setHasHydrated, setSession]);

  return null;
}
