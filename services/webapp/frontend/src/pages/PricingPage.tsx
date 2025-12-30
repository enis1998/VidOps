export default function PricingPage() {
    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm text-slate-500">Planlar</div>
                <h1 className="text-2xl font-semibold text-slate-900">Paketler</h1>
                <p className="mt-1 text-slate-600">Şimdilik demo. Sonra billing-service ile bağlanacak.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card name="Free" price="₺0" desc="Başlamak için" items={["Demo panel", "Temel kütüphane", "JWT giriş"]} />
                <Card
                    name="Pro"
                    price="₺499"
                    desc="Üretenler için"
                    highlight
                    items={["Takvim + taslak", "Daha fazla kredi", "Öncelikli üretim", "Otomasyon (yakında)"]}
                />
                <Card name="Ekip" price="₺1299" desc="Takımlar için" items={["Onay akışı", "Roller", "Analytics", "Destek"]} />
            </div>

            <div className="vo-card p-6">
                <div className="text-sm font-semibold text-slate-900">Önemli</div>
                <div className="mt-2 text-sm text-slate-600">
                    Paketler şimdilik UI amaçlı. Faturalandırma ve ödeme akışı sonraki adım.
                </div>
            </div>
        </div>
    );
}

function Card({
                  name,
                  price,
                  desc,
                  items,
                  highlight,
              }: {
    name: string;
    price: string;
    desc: string;
    items: string[];
    highlight?: boolean;
}) {
    return (
        <div
            className={
                highlight
                    ? "rounded-[22px] p-6 text-white border border-blue-600 bg-gradient-to-r from-blue-700 to-sky-500 shadow-[0_25px_80px_rgba(37,99,235,0.22)]"
                    : "vo-card p-6"
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

            <ul className={highlight ? "mt-4 space-y-2 text-sm text-white/90" : "mt-4 space-y-2 text-sm text-slate-600"}>
                {items.map((x) => (
                    <li key={x}>• {x}</li>
                ))}
            </ul>

            <a
                href="/register"
                className={
                    highlight
                        ? "mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-white/90"
                        : "mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                }
            >
                {name} seç
            </a>
        </div>
    );
}
