import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth } from "../lib/auth";

function cx(...c: Array<string | false | undefined | null>) {
    return c.filter(Boolean).join(" ");
}

export default function AppLayout() {
    const navigate = useNavigate();

    const onLogout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* Premium app background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 opacity-[0.6] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
                <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_62%)] blur-2xl" />
                <div className="absolute -top-56 -right-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.16),transparent_60%)] blur-2xl" />
                <div className="absolute bottom-[-18rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),transparent_60%)] blur-2xl" />
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex lg:flex-col w-72 min-h-screen sticky top-0 border-r border-slate-200/70 bg-white/70 backdrop-blur">
                    <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-200/70">
                        <div className="h-10 w-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center ring-1 ring-slate-200 shadow-sm">
                            <span className="font-semibold">ai</span>
                        </div>
                        <div className="leading-tight">
                            <div className="text-xs text-slate-500">aiboxio</div>
                            <div className="font-semibold tracking-tight">Workspace</div>
                        </div>
                    </div>

                    <div className="px-4 py-4">
                        <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 p-4 shadow-sm">
                            <div className="text-sm font-semibold">Misafir</div>
                            <div className="text-xs text-slate-500 mt-1">Plan: GUEST</div>
                        </div>
                    </div>

                    <nav className="px-3 pb-6 flex-1">
                        <NavItem to="/app/dashboard" label="Dashboard" />
                        <NavItem to="/app/studio" label="Studio" />
                        <NavItem to="/app/publishing" label="Yayınlama" />
                        <NavItem to="/app/library" label="Kütüphane" />
                        <NavItem to="/app/accounts" label="Hesaplar" />
                        <NavItem to="/app/pricing" label="Paketler" />
                    </nav>

                    <div className="px-4 pb-6">
                        <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 p-4 shadow-sm">
                            <div className="text-xs text-slate-500">İpucu</div>
                            <div className="mt-2 text-sm text-slate-700">
                                Studio’da seçimlerle prompt üret ya da manuel yaz. Görsel/video ekleyip benzer üretmeyi
                                buradan yönet.
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 min-w-0">
                    {/* Topbar */}
                    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur">
                        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 lg:hidden">
                                <div className="h-9 w-9 rounded-2xl bg-slate-950 text-white flex items-center justify-center ring-1 ring-slate-200 shadow-sm">
                                    <span className="font-semibold">ai</span>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-xs text-slate-500">aiboxio</div>
                                    <div className="font-semibold tracking-tight">Workspace</div>
                                </div>
                            </div>

                            <div className="flex-1 hidden md:block">
                                <div className="max-w-xl mx-auto">
                                    <div className="rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-2 text-sm text-slate-600">
                                        Ara: işler, taslaklar, içerikler...
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-700">
                                    <span className="text-slate-500">Kredi:</span> <span className="font-semibold">0</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                                >
                                    Çıkış
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

function NavItem({ to, label }: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cx(
                    "block rounded-2xl px-4 py-3 text-sm font-semibold transition mb-1",
                    isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-800 hover:bg-slate-100"
                )
            }
        >
            {label}
        </NavLink>
    );
}
