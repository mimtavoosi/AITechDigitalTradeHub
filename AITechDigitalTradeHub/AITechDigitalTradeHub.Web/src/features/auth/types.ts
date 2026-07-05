import type { AuthUser } from "@/store/auth-store";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  nationalCode?: string;
  mobileNumber: string;
  username: string;
  password: string;
};

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

export type AuthResult = {
  status: boolean;
  errorMessage?: string;
  accessToken?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string | null;
  requiresMobileVerification?: boolean;
  mobileNumber?: string | null;
  user?: AuthUser;
};

export type VerifyMobilePayload = {
  mobileNumber: string;
  code: string;
};

export type UserSession = {
  id: number;
  isActive: boolean;
  createdDate: string;
  expiryDate: string;
  revokedDate?: string | null;
};
