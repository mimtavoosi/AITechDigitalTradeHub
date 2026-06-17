"use client";

import { useAuthStore } from "@/store/auth-store";

type AuthTriggerProps = {
  mode: "login" | "register";
  className: string;
  children: React.ReactNode;
};

export function AuthTrigger({ mode, className, children }: AuthTriggerProps) {
  const openAuthDialog = useAuthStore((state) => state.openAuthDialog);

  return (
    <button type="button" className={className} onClick={() => openAuthDialog(mode)}>
      {children}
    </button>
  );
}
