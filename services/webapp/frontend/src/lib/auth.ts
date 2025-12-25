import { api, ACCESS_TOKEN_KEY } from "./api";

export const AUTH_USER_KEY = "authUser";

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  email: string;
};

export async function register(fullName: string, email: string, password: string) {
  const out = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password })
  });
  localStorage.setItem(ACCESS_TOKEN_KEY, out.accessToken);
  return out;
}

export async function login(email: string, password: string) {
  const out = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem(ACCESS_TOKEN_KEY, out.accessToken);
  return out;
}

export async function loadMe<T = unknown>() {
  const me = await api<T>("/api/users/me", { method: "GET" });
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
  return me;
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export function getStoredUser<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
