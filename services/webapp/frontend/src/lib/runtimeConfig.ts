declare global {
    interface Window {
        __APP_CONFIG__?: {
            googleClientId?: string;
        };
    }
}

export function getGoogleClientId(): string {
    // 1) runtime (docker env.js)
    const rt = window.__APP_CONFIG__?.googleClientId;
    if (typeof rt === "string" && rt.trim().length > 0) return rt.trim();

    // 2) fallback: vite build-time env (lokalde işe yarar)
    const vite = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (typeof vite === "string" && vite.trim().length > 0) return vite.trim();

    return "";
}
