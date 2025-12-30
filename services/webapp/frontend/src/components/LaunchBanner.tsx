import { useEffect, useMemo, useState } from "react";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

export default function LaunchBanner() {
    const target = useMemo(() => new Date("2026-01-02T00:00:00+03:00"), []);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const diffMs = Math.max(0, target.getTime() - now);
    const s = Math.floor(diffMs / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    const isLive = diffMs === 0;
    const isSoon = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;

    const when = useMemo(() => {
        try {
            return new Intl.DateTimeFormat("tr-TR", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "Europe/Istanbul",
            }).format(target);
        } catch {
            return target.toLocaleString();
        }
    }, [target]);

    return (
        <div
            className={
                "rounded-2xl px-4 py-3 ring-1 backdrop-blur " +
                (isLive
                    ? "bg-emerald-500/10 ring-emerald-500/25"
                    : isSoon
                        ? "bg-fuchsia-500/10 ring-fuchsia-500/25"
                        : "bg-white/5 ring-white/10")
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
            <span
                className={
                    "inline-block h-2 w-2 rounded-full " +
                    (isLive ? "bg-emerald-400" : isSoon ? "bg-fuchsia-300 animate-pulse" : "bg-cyan-300")
                }
            />
                        <div className="text-xs text-white/70">
                            {isLive ? "Lansman" : "Lansmana kalan süre"}
                        </div>
                    </div>
                    <div className="mt-1 text-xs text-white/45 truncate">{when} (TRT)</div>
                </div>

                <div className="font-mono text-sm text-white/80 tabular-nums">
                    {isLive ? (
                        <span className="text-emerald-200">Yayındayız 🚀</span>
                    ) : (
                        <span>
              {d}d : {pad2(h)}h : {pad2(m)}m : {pad2(sec)}s
            </span>
                    )}
                </div>
            </div>
        </div>
    );
}
