import { useState } from "react";
import LaunchCountdown from "./LaunchCountdown";

export default function AnnouncementBar() {
    const [open, setOpen] = useState(true);
    if (!open) return null;

    return (
        <div className="sticky top-0 z-50">
            <div
                className="mx-auto max-w-7xl px-4 py-2"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(37,99,235,.16), rgba(99,102,241,.12), rgba(14,165,233,.12))",
                    borderBottom: "1px solid rgba(15, 23, 42, .10)",
                }}
            >
                <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
                    <LaunchCountdown compact />
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white/60 ring-1 ring-black/10"
                        aria-label="Kapat"
                        type="button"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
