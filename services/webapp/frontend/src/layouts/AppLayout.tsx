// src/layouts/AppLayout.tsx
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ApiError } from "../lib/api";
import { clearAuth, getStoredUser, isLoggedIn, loadMe, logout } from "../lib/auth";

type User = { fullName?: string; email?: string; plan?: string; credits?: number };

function navCls(active: boolean) {
    return active ? "bg-slate-900 text-white shadow-sm" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50";
}

function cx(...c: Array<string | false | undefined | null>) {
    return c.filter(Boolean).join(" ");
}

export default function AppLayout() {
    const navigate = useNavigate();
    const loc = useLocation();
    const isStudio = loc.pathname.startsWith("/app/studio");

    const [booting, setBooting] = useState(true);
    const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
    const [mobileOpen, setMobileOpen] = useState(false);

    const nextUrl = useMemo(() => encodeURIComponent(loc.pathname + loc.search), [loc.pathname, loc.search]);

    useEffect(() => {
        let cancelled = false;

        async function boot() {
            if (!isLoggedIn()) {
                clearAuth();
                navigate(`/giris?next=${nextUrl}`, { replace: true });
                return;
            }

            try {
                const me = await loadMe<User>();
                if (cancelled) return;
                setUser(me);
            } catch (e: any) {
                if (cancelled) return;

                if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
                    clearAuth();
                    navigate(`/giris?reason=expired&next=${nextUrl}`, { replace: true });
                    return;
                }

                clearAuth();
                navigate(`/giris?reason=error&next=${nextUrl}`, { replace: true });
            } finally {
                if (!cancelled) setBooting(false);
            }
        }

        boot();
        return () => {
            cancelled = true;
        };
    }, [navigate, nextUrl]);

    async function cikis() {
        try {
            await logout();
        } finally {
            setUser(null);
            navigate("/giris?reason=logout", { replace: true });
        }
    }

    const name = user?.fullName || user?.email || "Misafir";
    const credits = user?.credits ?? 0;

    const nav = [
        { to: "/app/dashboard", label: "Dashboard" },
        { to: "/app/studio", label: "Studio" },
        { to: "/app/yayinlama", label: "Yayınlama" },
        { to: "/app/kutuphane", label: "Kütüphane" },
        { to: "/app/hesaplar", label: "Hesaplar" },
        { to: "/app/paketler", label: "Paketler" },
        { to: "/app/ayarlar", label: "Ayarlar" },
    ];

    if (booting) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(99,102,241,0.20),transparent),radial-gradient(70%_55%_at_85%_0%,rgba(236,72,153,0.16),transparent),radial-gradient(60%_60%_at_50%_100%,rgba(34,211,238,0.14),transparent)]" />
                </div>
                <div className="mx-auto max-w-3xl px-6 py-16">
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                        <div className="text-sm font-semibold text-slate-800">Yükleniyor…</div>
                        <div className="mt-2 text-sm text-slate-600">Hesap bilgilerin hazırlanıyor.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_0%,rgba(99,102,241,0.20),transparent),radial-gradient(70%_55%_at_85%_0%,rgba(236,72,153,0.16),transparent),radial-gradient(60%_60%_at_50%_100%,rgba(34,211,238,0.14),transparent)]" />
            </div>

            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden rounded-xl px-3 py-2 text-sm bg-slate-900 text-white" onClick={() => setMobileOpen(true)}>
                            Menü
                        </button>

                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/app/studio")}>
                            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <span className="font-semibold text-sm">ai</span>
                            </div>
                            <div className="leading-tight">
                                <div className="text-xs text-slate-500">aiboxio</div>
                                <div className="font-semibold">Workspace</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isStudio && (
                            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
                                <span className="text-xs text-slate-500">Ara</span>
                                <input className="bg-transparent outline-none text-sm w-64 placeholder:text-slate-400" placeholder="işler, taslaklar, içerikler..." />
                            </div>
                        )}

                        {!isStudio && (
                            <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">{credits}</span> kredi
              </span>
                        )}

                        <button onClick={cikis} className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
                            Çıkış
                        </button>
                    </div>
                </div>
            </div>

            <aside className="hidden md:block fixed left-0 top-[57px] bottom-0 w-64 border-r border-slate-200 bg-white">
                <div className="p-4">
                    <div className="rounded-2xl p-4 ring-1 ring-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                        <div className="text-sm font-semibold truncate">{name}</div>
                        <div className="mt-1 text-xs text-slate-600">
                            Plan: <span className="font-semibold text-slate-900">{user?.plan || (isLoggedIn() ? "FREE" : "GUEST")}</span>
                        </div>
                    </div>

                    <nav className="mt-4 space-y-1">
                        {nav.map((n) => (
                            <NavLink key={n.to} to={n.to} className={({ isActive }) => cx("block rounded-xl px-3 py-2 text-sm font-medium transition", navCls(isActive))}>
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-4 rounded-2xl ring-1 ring-slate-200 bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">İpucu</div>
                        <div className="mt-1 text-sm text-slate-700">Studio’da seçimlerle prompt üret, istersen manuel yaz.</div>
                    </div>
                </div>
            </aside>

            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">Menü</div>
                            <button className="rounded-xl bg-slate-100 px-3 py-2 text-sm" onClick={() => setMobileOpen(false)}>
                                Kapat
                            </button>
                        </div>

                        <nav className="mt-4 space-y-1">
                            {nav.map((n) => (
                                <NavLink
                                    key={n.to}
                                    to={n.to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) => cx("block rounded-xl px-3 py-2 text-sm font-medium transition", navCls(isActive))}
                                >
                                    {n.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-6 md:pl-[280px]">
                <Outlet />
            </div>
        </div>
    );
}
