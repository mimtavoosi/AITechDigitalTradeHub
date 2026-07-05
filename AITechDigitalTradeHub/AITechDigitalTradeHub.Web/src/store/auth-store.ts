import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  authDialogMode: "login" | "register" | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  openAuthDialog: (mode: "login" | "register") => void;
  closeAuthDialog: () => void;
};

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobileNumber?: string | null;
  roleId: number;
  roleName?: string | null;
  roles?: Array<{
    roleId: number;
    roleName: string;
    description?: string | null;
    status: string | number;
  }>;
  trustScore: number;
  isVerified: boolean;
  verificationLevel: number;
  status: string | number;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export const useAuthStore = create<AuthState>()(
  (set) => ({
    accessToken: null,
    user: null,
    hasHydrated: false,
    authDialogMode: null,
    setSession: (session) =>
      set({
        accessToken: session.accessToken,
        user: session.user,
        authDialogMode: null
      }),
    clearSession: () => set({ accessToken: null, user: null }),
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    openAuthDialog: (authDialogMode) => set({ authDialogMode }),
    closeAuthDialog: () => set({ authDialogMode: null })
  })
);
