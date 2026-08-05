/** StackForge API configuration — override via environment variables */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Resolved API base URL.
 * - Relative `/api/v1` → same-origin in browser; internal backend URL on server.
 * - Absolute URL → used as-is (local dev without Docker proxy).
 */
export function getApiBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  if (configured.startsWith("/")) {
    if (typeof window !== "undefined") {
      return trimTrailingSlash(`${window.location.origin}${configured}`);
    }
    const internal =
      process.env.BACKEND_INTERNAL_URL ?? "http://backend:8000";
    return trimTrailingSlash(`${internal}${configured}`);
  }

  return trimTrailingSlash(configured);
}

/** WebSocket base (live logs). Uses public backend port when proxied via Next. */
export function getWsBaseUrl(): string {
  const wsPublic = process.env.NEXT_PUBLIC_WS_URL;
  if (wsPublic) {
    return trimTrailingSlash(wsPublic).replace(/^http/, "ws");
  }
  return getApiBaseUrl().replace(/^http/, "ws");
}

export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  wsPath: "/ws",
} as const;
