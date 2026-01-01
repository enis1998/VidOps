export default function LibraryPage() {
    return (
        <div className="space-y-6">
            <div>
                <div className="text-sm text-slate-500">Medya</div>
                <h1 className="text-2xl font-semibold text-slate-900">Kütüphane</h1>
                <p className="mt-1 text-slate-600">Üretilen içerikler burada toplanacak (demo).</p>
            </div>

            <div className="vo-card p-6">
                <div className="text-lg font-semibold text-slate-900">İçerikler</div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="h-28 rounded-xl border border-slate-200 bg-white" />
                            <div className="mt-3 font-semibold text-slate-900">Demo içerik</div>
                            <div className="text-sm text-slate-600">Reels • 30 sn</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
