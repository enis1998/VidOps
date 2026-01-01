const demoJobs = [
    { title: "Haftanın AI gündemi (30sn)", platform: "TikTok", status: "READY" },
    { title: "Reels: 3 başlık + hook", platform: "Instagram", status: "DRAFT" },
    { title: "Shorts: karşılaştırma video", platform: "YouTube", status: "PLANNED" },
];

function Badge({ children, tone }: { children: string; tone: "green" | "blue" | "slate" }) {
    const cls =
        tone === "green"
            ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
            : tone === "blue"
                ? "bg-blue-50 text-blue-800 ring-blue-100"
                : "bg-slate-100 text-slate-700 ring-slate-200";

    return (
        <span className={"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 " + cls}>
      {children}
    </span>
    );
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold text-blue-700">DASHBOARD</div>
                    <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                        Hoş geldin 👋
                    </h1>
                    <p className="mt-1 text-slate-600">
                        Bugün neler üretelim? Studio’dan hızlıca prompt oluşturabilir ya da referans dosya ekleyebilirsin.
                    </p>
                </div>

                <a
                    href="/app/studio"
                    className="hidden md:inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                >
                    Studio’ya git
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <div className="text-xs text-slate-500">Bugün</div>
                    <div className="mt-2 text-lg font-semibold">0 içerik planlandı</div>
                    <div className="mt-1 text-sm text-slate-600">Takvime ekleyerek başlayabilirsin.</div>
                </Card>

                <Card>
                    <div className="text-xs text-slate-500">Pipeline</div>
                    <div className="mt-2 text-lg font-semibold">Draft → Planned → Published</div>
                    <div className="mt-1 text-sm text-slate-600">Akış net ve büyütülebilir.</div>
                </Card>

                <Card>
                    <div className="text-xs text-slate-500">Güvenlik</div>
                    <div className="mt-2 text-lg font-semibold">JWT + Refresh</div>
                    <div className="mt-1 text-sm text-slate-600">Refresh token HttpOnly cookie.</div>
                </Card>
            </div>

            {/* Recent jobs */}
            <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between">
                    <div>
                        <div className="font-semibold">Son işler</div>
                        <div className="text-sm text-slate-600">En son oluşturduğun içerik işleri burada görünecek.</div>
                    </div>
                    <a
                        href="/app/publishing"
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                    >
                        Takvime git
                    </a>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-3">
                        {demoJobs.map((j, idx) => (
                            <div key={idx} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">{j.title}</div>
                                    <div className="text-sm text-slate-600 mt-1">{j.platform}</div>
                                </div>
                                <div className="shrink-0">
                                    {j.status === "READY" && <Badge tone="green">READY</Badge>}
                                    {j.status === "DRAFT" && <Badge tone="slate">DRAFT</Badge>}
                                    {j.status === "PLANNED" && <Badge tone="blue">PLANNED</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="text-lg font-semibold">Hızlı başlangıç</div>
                        <div className="mt-1 text-white/85">
                            Studio’da “gündem + platform + süre” seç → prompt otomatik oluşsun → sohbetten netleştir.
                        </div>
                        <a
                            href="/app/studio"
                            className="mt-4 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90 transition"
                        >
                            Studio’da üret
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 p-6 shadow-sm">
            {children}
        </div>
    );
}
