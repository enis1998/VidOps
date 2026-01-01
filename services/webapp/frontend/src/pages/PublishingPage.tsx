export default function PublishingPage() {
    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm text-slate-500">Takvim</div>
                <h1 className="text-2xl font-semibold text-slate-900">Yayın Takvimi</h1>
                <p className="mt-1 text-slate-600">Haftalık görünüm (demo). Planlama burada gelişecek.</p>
            </div>

            <div className="vo-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-semibold text-slate-900">Bu hafta</div>
                        <div className="text-sm text-slate-600">Draft/Planlı/Yayınlandı durumları eklenecek.</div>
                    </div>
                    <button className="vo-btn vo-btn-primary px-4 py-2 text-sm">Yeni plan</button>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                        <div key={d} className="text-center text-xs font-semibold text-slate-500">
                            {d}
                        </div>
                    ))}
                    {Array.from({ length: 21 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-slate-50" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="vo-card p-6">
                    <div className="text-sm font-semibold text-slate-900">Taslaklar</div>
                    <div className="mt-2 text-sm text-slate-600">
                        Taslakları burada listeler, takvime sürüklersin (yakında).
                    </div>
                </div>

                <div className="vo-card p-6">
                    <div className="text-sm font-semibold text-slate-900">Planlı yayınlar</div>
                    <div className="mt-2 text-sm text-slate-600">
                        Scheduler-service ile gerçek zamanlı planlı yayın burada yönetilecek.
                    </div>
                </div>
            </div>
        </div>
    );
}
