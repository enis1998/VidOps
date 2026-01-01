export const ACCESS_TOKEN_KEY = "accessToken";

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

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

async function parseError(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return { message: res.statusText || "Request failed", body: null };

  try {
    const j = JSON.parse(text);
    const msg = j?.message || j?.error || res.statusText || "Request failed";
    return { message: msg, body: j };
  } catch {
    return { message: text || res.statusText || "Request failed", body: text };
  }
}

/**
 * Minimal fetch wrapper:
 * - Adds Bearer access token (localStorage)
 * - Sends cookies (refresh token HttpOnly cookie)
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
    const { message, body } = await parseError(res);
    throw new ApiError(res.status, message, body);
  }

  const text = await res.text().catch(() => "");
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
