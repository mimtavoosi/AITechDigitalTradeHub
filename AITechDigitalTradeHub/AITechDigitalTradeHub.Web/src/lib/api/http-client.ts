import { appConfig } from "@/lib/config";
import { useAuthStore, type AuthUser } from "@/store/auth-store";

type RequestOptions = RequestInit & {
  authToken?: string;
  skipAuth?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

export class ApiRequestError extends Error {
  statusCode: number;
  errors?: unknown;
  payload?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.payload = payload;
  }
}

export async function apiRequest<TData>(
  path: string,
  options: RequestOptions = {}
): Promise<TData> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = options.authToken ?? (!options.skipAuth ? useAuthStore.getState().accessToken : null);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store"
  });

  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${refreshed}`);
      const retryResponse = await fetch(`${appConfig.apiBaseUrl}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
        cache: "no-store"
      });
      return handleResponse<TData>(retryResponse);
    }
  }

  return handleResponse<TData>(response);
}

async function handleResponse<TData>(response: Response) {
  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const errorPayload = isErrorPayload(payload) ? payload : null;
    throw new ApiRequestError(
      errorPayload?.message ?? errorPayload?.errorMessage ?? "درخواست با خطا مواجه شد",
      response.status,
      errorPayload?.errors,
      payload
    );
  }

  return payload as TData;
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = performRefreshAccessToken();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function performRefreshAccessToken() {
  try {
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}),
      credentials: "include",
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => null)) as {
      status?: boolean;
      accessToken?: string;
      user?: AuthUser;
    } | null;

    if (!response.ok || !payload?.status || !payload.accessToken || !payload.user) {
      useAuthStore.getState().clearSession();
      return null;
    }

    useAuthStore.getState().setSession({
      accessToken: payload.accessToken,
      user: payload.user
    });
    return payload.accessToken;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

export function toQueryString(params: Record<string, string | number | boolean | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

function isErrorPayload(value: unknown): value is { errorMessage?: string; message?: string; errors?: unknown } {
  return typeof value === "object" && value !== null;
}
