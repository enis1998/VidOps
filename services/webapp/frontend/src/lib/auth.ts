// src/lib/auth.ts
import { api, ACCESS_TOKEN_KEY } from "./api";

export const AUTH_USER_KEY = "authUser";
const AUTH_PROVIDER_KEY = "authProvider";

export type AuthProvider = "LOCAL" | "GOOGLE" | "UNKNOWN";

export type AuthResponse = {
  accessToken: string;
  tokenType?: string;
  expiresInSeconds?: number;
  userId?: string;
  email?: string;
};

function decodeJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
        atob(b64)
            .split("")
            .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
            .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function setAuthProvider(p: AuthProvider) {
  try {
    localStorage.setItem(AUTH_PROVIDER_KEY, p);
  } catch {}
}

export function getAuthProvider(): AuthProvider {
  try {
    const v = localStorage.getItem(AUTH_PROVIDER_KEY);
    if (v === "LOCAL" || v === "GOOGLE") return v;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return "UNKNOWN";

    const payload = decodeJwt(token);
    const p = payload?.provider;
    if (p === "LOCAL" || p === "GOOGLE") {
      setAuthProvider(p);
      return p;
    }
    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export async function register(fullName: string, email: string, password: string) {
  const out = await api<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });

  setAuthProvider("LOCAL");
  return out;
}

export async function login(email: string, password: string) {
  const out = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (out?.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, out.accessToken);
  setAuthProvider("LOCAL");
  return out;
}

export async function googleLogin(idToken: string) {
  const out = await api<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  if (out?.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, out.accessToken);
  setAuthProvider("GOOGLE");
  return out;
}

export async function logout() {
  try {
    await api<void>("/api/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
  }
}

export async function resendVerification(email: string) {
  return api<any>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmail(token: string) {
  return api<any>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function loadMe<T = unknown>() {
  const me = await api<T>("/api/users/account", { method: "GET" });
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
  localStorage.removeItem(AUTH_PROVIDER_KEY);
}
