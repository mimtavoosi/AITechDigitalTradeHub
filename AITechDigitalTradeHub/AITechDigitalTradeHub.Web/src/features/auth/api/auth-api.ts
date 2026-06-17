import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest } from "@/lib/api/http-client";
import type { AuthResult, LoginPayload, RegisterPayload, UserSession, VerifyMobilePayload } from "@/features/auth/types";
import type { AuthUser } from "@/store/auth-store";

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<AuthResult>(apiEndpoints.auth.register, {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });
  },
  login(payload: LoginPayload) {
    return apiRequest<AuthResult>(apiEndpoints.auth.login, {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });
  },
  verifyMobile(payload: VerifyMobilePayload) {
    return apiRequest<AuthResult>(apiEndpoints.auth.verifyMobile, {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });
  },
  resendMobileCode(mobileNumber: string) {
    return apiRequest<{ status: boolean; errorMessage?: string }>(apiEndpoints.auth.resendMobileCode, {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
      skipAuth: true
    });
  },
  refresh(refreshToken: string) {
    return apiRequest<AuthResult>(apiEndpoints.auth.refresh, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true
    });
  },
  logout(refreshToken: string) {
    return apiRequest<{ status: boolean; errorMessage?: string }>(apiEndpoints.auth.logout, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true
    });
  },
  me() {
    return apiRequest<AuthUser>(apiEndpoints.auth.me);
  },
  sessions() {
    return apiRequest<UserSession[]>(apiEndpoints.auth.sessions);
  }
};
