import { useMemo, useState } from "react";

type Connected = { tiktok: boolean; reels: boolean; shorts: boolean };

function getConnected(): Connected {
    try {
        return (
            JSON.parse(localStorage.getItem("connectedAccounts") || "null") || {
                tiktok: true,
                reels: true,
                shorts: false,
            }
        );
    } catch {
        return { tiktok: true, reels: true, shorts: false };
    }
}

function setConnected(v: Connected) {
    localStorage.setItem("connectedAccounts", JSON.stringify(v));
}

export default function AccountsPage() {
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
        const next = { ...acc, [k]: true };
        setAcc(next);
        setConnected(next);
    }

    function disconnect(k: keyof Connected) {
        const next = { ...acc, [k]: false };
        setAcc(next);
        setConnected(next);
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm text-slate-500">Hesaplar</div>
                <h1 className="text-2xl font-semibold text-slate-900">Bağlantılar</h1>
                <p className="mt-1 text-slate-600">
                    Şimdilik 3 platform. Sonra admin panelden ekleme/çıkarma yapacağız.
                </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-lg font-semibold text-slate-900">Bağlantılar</div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {items.map((it) => {
                        const connected = acc[it.key];
                        return (
                            <div key={it.key} className="rounded-3xl border border-slate-200 bg-white p-5">
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
                                            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
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

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-sm font-semibold">Not</div>
                    <div className="mt-1 text-sm text-slate-600">
                        Gerçek OAuth bağlantıları (Google/TikTok/Meta) auth-service üzerinden eklenecek.
                    </div>
                </div>
            </div>
        </div>
    );
}
