import { getApiBaseUrl } from "@/lib/api/config";
import type { ApiError, ApiResponse } from "@/lib/api/types";

const TOKEN_KEY = "stackforge_token";
const TOKEN_COOKIE = "stackforge_token";

export class ApiClientError extends Error {
  constructor(public readonly payload: ApiError) {
    super(payload.message);
    this.name = "ApiClientError";
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

async function parseError(res: Response): Promise<ApiError> {
  const error: ApiError = {
    code: "REQUEST_FAILED",
    message: res.statusText,
    status: res.status,
  };
  try {
    const body = await res.json();
    if (typeof body.detail === "string") error.message = body.detail;
    else if (Array.isArray(body.detail))
      error.message = body.detail.map((d: { msg?: string }) => d.msg).join(", ");
    else if (body.message) error.message = body.message;
    if (body.code) error.code = body.code;
  } catch {
    /* ignore */
  }
  return error;
}

export type ApiClientOptions = RequestInit & {
  auth?: boolean;
};

/**
 * Central fetch client — attaches JWT, parses `{ data }` responses.
 */
export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const { auth = true, headers: initHeaders, ...init } = options;
  const token = auth ? getAuthToken() : null;

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...initHeaders,
    },
  });

  if (!res.ok) {
    const payload = await parseError(res);
    if (res.status === 401 && typeof window !== "undefined") {
      clearAuthToken();
    }
    throw new ApiClientError(payload);
  }

  if (res.status === 204) {
    return { data: undefined as T };
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export const api = {
  get: <T>(path: string) => apiClient<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiClient<T>(path, { method: "DELETE" }),
};
