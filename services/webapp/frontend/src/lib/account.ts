// src/lib/account.ts
import { api } from "./api";

export type UserResponse = {
    id?: string;
    email?: string;
    fullName?: string;
    plan?: string;
    credits?: number;
    createdAt?: string;
    updatedAt?: string;
    authProvider?: "LOCAL" | "GOOGLE";
};

export async function getAccount(): Promise<UserResponse> {
    return api<UserResponse>("/api/users/account", { method: "GET" });
}

export async function updateAccountFullName(fullName: string): Promise<UserResponse> {
    return api<UserResponse>("/api/users/account", {
        method: "PATCH",
        body: JSON.stringify({ fullName }),
    });
}

export async function changePlan(plan: string): Promise<UserResponse> {
    return api<UserResponse>("/api/users/account/plan", {
        method: "PATCH",
        body: JSON.stringify({ plan }),
    });
}

/**
 * LOCAL kullanıcılar için şifre değiştir.
 * Backend (primary): PATCH /api/auth/account/password
 * (compat): POST /api/auth/change-password
 * body: { currentPassword, newPassword }
 *
 * Google kullanıcıları bu endpointi bulsa bile backend 403 dönmeli.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api<void>("/api/auth/account/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function deleteAccount(): Promise<void> {
    await api<void>("/api/auth/account", { method: "DELETE" });
}
