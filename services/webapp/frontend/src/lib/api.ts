export const ACCESS_TOKEN_KEY = "accessToken";

function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

function buildHeaders(initHeaders: HeadersInit | undefined, body: any, token: string | null): Headers {
  const headers = new Headers(initHeaders || {});
  // Do not set JSON content-type for FormData
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function tryRefresh(): Promise<string | null> {
  try {
    const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (!r.ok) return null;
    const data: any = await r.json().catch(() => null);
    const token = data?.accessToken;
    if (typeof token === "string" && token.length > 0) {
      setAccessToken(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Minimal fetch wrapper used by the frontend.
 * - Adds Bearer access token (from localStorage)
 * - Sends cookies (refresh token is HttpOnly cookie)
 * - On 401, tries to refresh once via POST /api/auth/refresh then retries
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const doFetch = async (token: string | null) => {
    const headers = buildHeaders(options.headers, options.body, token);
    return fetch(path, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let token = getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const newToken = await tryRefresh();
    if (newToken) {
      token = newToken;
      res = await doFetch(token);
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text || res.statusText;
    try {
      const j = text ? JSON.parse(text) : null;
      msg = j?.message || j?.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  // Some endpoints might return empty body
  const text = await res.text().catch(() => "");
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    // If it wasn't JSON, return the raw text
    return text as unknown as T;
  }
}
