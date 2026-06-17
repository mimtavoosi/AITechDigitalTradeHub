import { appConfig } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";

type RequestOptions = RequestInit & {
  authToken?: string;
  skipAuth?: boolean;
};

export class ApiRequestError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
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
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const errorPayload = isErrorPayload(payload) ? payload : null;
    throw new ApiRequestError(
      errorPayload?.message ?? errorPayload?.errorMessage ?? "درخواست با خطا مواجه شد",
      response.status,
      errorPayload?.errors
    );
  }

  return payload as TData;
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
