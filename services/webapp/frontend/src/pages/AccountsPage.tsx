import { useMemo, useState } from "react";
import { isLoggedIn } from "../lib/auth";

type Connected = { tiktok: boolean; reels: boolean; shorts: boolean };

function getConnected(): Connected {
    try {
        return (
            JSON.parse(localStorage.getItem("connectedAccounts") || "null") || {
                tiktok: false,
                reels: false,
                shorts: false,
            }
        );
    } catch {
        return { tiktok: false, reels: false, shorts: false };
    }
}

function setConnected(key: keyof Connected, val: boolean) {
    const x = getConnected();
    x[key] = !!val;
    localStorage.setItem("connectedAccounts", JSON.stringify(x));
}

export default function AccountsPage() {
    const logged = isLoggedIn();
    const [acc, setAcc] = useState<Connected>(() => getConnected());

    const items = useMemo(
        () => [
            { key: "tiktok" as const, label: "TikTok" },
            { key: "reels" as const, label: "Instagram Reels" },
            { key: "shorts" as const, label: "YouTube Shorts" },
        ],
        []
    );

    function connect(k: keyof Connected) {
        if (!logged) {
            alert("Hesap bağlamak için giriş yapmalısın.");
            return;
        }
        setConnected(k, true);
        setAcc(getConnected());
    }

    function disconnect(k: keyof Connected) {
        setConnected(k, false);
        setAcc(getConnected());
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Hesaplar</h1>
                <p className="mt-1 text-slate-600">
                    Şimdilik 3 platform. Sonra admin panelden ekleme/çıkarma yapacağız.
                </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="text-lg font-semibold">Bağlantılar</div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {items.map((it) => {
                        const connected = acc[it.key];
                        return (
                            <div key={it.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <div className="text-base font-semibold">{it.label}</div>
                                <div className="mt-2 text-sm text-slate-600">
                                    Durum:{" "}
                                    <span className={connected ? "font-semibold text-emerald-700" : "font-semibold text-slate-700"}>
                    {connected ? "Bağlı" : "Bağlı değil"}
                  </span>
                                </div>

                                <div className="mt-4">
                                    {connected ? (
                                        <button
                                            onClick={() => disconnect(it.key)}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                        >
                                            Bağlantıyı kaldır
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => connect(it.key)}
                                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            Bağla
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="text-sm font-semibold">Not</div>
                    <div className="mt-1 text-sm text-slate-600">
                        Gerçek OAuth bağlantıları (Google/TikTok/Meta) auth-service üzerinden eklenecek.
                    </div>
                </div>
            </div>
        </div>
    );
}
