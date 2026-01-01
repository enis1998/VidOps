import { useEffect, useState } from "react";
import { changePlan, getAccount, type UserResponse } from "../lib/account";

function Card({
                  name,
                  price,
                  desc,
                  items,
                  highlight,
                  onSelect,
                  buttonText,
              }: {
    name: string;
    price: string;
    desc: string;
    items: string[];
    highlight?: boolean;
    onSelect?: () => void;
    buttonText?: string;
}) {
    return (
        <div
            className={
                highlight
                    ? "rounded-3xl bg-blue-600 text-white p-6 shadow-soft ring-1 ring-blue-500/30"
                    : "rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200"
            }
        >
            <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{name}</div>
                {highlight && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
            Popüler
          </span>
                )}
            </div>

            <div className={highlight ? "mt-2 text-sm text-white/90" : "mt-2 text-sm text-slate-600"}>{desc}</div>

            <div className="mt-4 text-4xl font-semibold">
                {price}
                <span className={highlight ? "text-sm text-white/80" : "text-sm text-slate-500"}>/ay</span>
            </div>

            <ul className={highlight ? "mt-5 space-y-2 text-sm text-white/90" : "mt-5 space-y-2 text-sm text-slate-700"}>
                {items.map((it) => (
                    <li key={it}>• {it}</li>
                ))}
            </ul>

            {onSelect && (
                <button
                    onClick={onSelect}
                    className={
                        highlight
                            ? "mt-6 w-full rounded-2xl bg-white text-blue-700 px-4 py-3 text-sm font-semibold hover:bg-white/90 transition"
                            : "mt-6 w-full rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition"
                    }
                >
                    {buttonText ?? "Seç"}
                </button>
            )}
        </div>
    );
}

export default function PricingPage() {
    const [me, setMe] = useState<UserResponse | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        getAccount().then(setMe).catch(() => setMe(null));
    }, []);

    const upgradeToPro = async () => {
        setBusy("PRO");
        try {
            const updated = await changePlan("PRO");
            setMe(updated);
        } finally {
            setBusy(null);
        }
    };

    const cancelToFree = async () => {
        setBusy("FREE");
        try {
            const updated = await changePlan("FREE");
            setMe(updated);
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm text-slate-500">Planlar</div>
                <h1 className="text-2xl font-semibold text-slate-900">Paketler</h1>
                <p className="mt-1 text-slate-600">
                    Şimdilik demo. Plan güncelleme user-service’e bağlı. (Mevcut plan:{" "}
                    <span className="font-semibold">{me?.plan ?? "?"}</span>)
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card
                    name="Free"
                    price="₺0"
                    desc="Başlamak için"
                    items={["Demo panel", "Temel kütüphane", "JWT giriş"]}
                    onSelect={busy ? undefined : cancelToFree}
                    buttonText={busy === "FREE" ? "Güncelleniyor..." : "FREE’ye geç"}
                />
                <Card
                    name="Pro"
                    price="₺499"
                    desc="Üretenler için"
                    highlight
                    items={["Studio prompt builder", "Daha yüksek limit", "Öncelikli destek"]}
                    onSelect={busy ? undefined : upgradeToPro}
                    buttonText={busy === "PRO" ? "Güncelleniyor..." : "PRO’ya yükselt"}
                />
                <Card
                    name="Enterprise"
                    price="Teklif"
                    desc="Takımlar için"
                    items={["Takım yönetimi", "On-prem opsiyon", "Özel entegrasyonlar"]}
                />
            </div>
        </div>
    );
}
