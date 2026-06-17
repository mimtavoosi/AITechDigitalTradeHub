import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  authDialogMode: "login" | "register" | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
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
  refreshToken: string;
  user: AuthUser;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      authDialogMode: null,
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
          authDialogMode: null
        }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
      openAuthDialog: (authDialogMode) => set({ authDialogMode }),
      closeAuthDialog: () => set({ authDialogMode: null })
    }),
    {
      name: "aitech-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      })
    }
  )
);
