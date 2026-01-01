import { useEffect, useMemo, useState } from "react";

type Props = {
    /** Launch date in ISO-like format: "2026-01-02T00:00:00" */
    targetISO?: string;
    /** Optional label */
    title?: string;

    /**
     * Some pages (login/register) render the countdown inside a tighter wrapper.
     * This is optional & mostly cosmetic; it also avoids TS errors when used as:
     * <LaunchCountdown compact />
     */
    compact?: boolean;
};

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

export default function LaunchCountdown({
                                            targetISO = "2026-01-02T00:00:00",
                                            title = "Lansmana kalan süre",
                                        }: Props) {
    const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const diffMs = Math.max(0, target - now);
    const totalSec = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSec / (3600 * 24));
    const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    // “beta progress” hissi için min 5 max 98 gibi bir cap
    const progress = Math.min(
        98,
        Math.max(5, Math.round((1 - diffMs / (1000 * 3600 * 24 * 60)) * 100))
    );

    return (
        <div className="banner">
            <div className="container">
                <div className="bannerInner">
                    <div className="bannerLeft">
                        <span className="bannerDot" />
                        <div className="bannerText">
                            <b>{title}:</b> {days} gün {pad2(hours)}:{pad2(mins)}:{pad2(secs)} •{" "}
                            <span style={{ color: "rgba(10,16,32,.5)" }}>2 Ocak 2026</span>
                        </div>
                    </div>

                    <div className="bannerPills" aria-label="launch-kpis">
                        <div className="kpi">
                            <b>{progress}%</b>
                            <span>beta</span>
                        </div>
                        <div className="kpi">
                            <b>{pad2(hours)}</b>
                            <span>saat</span>
                        </div>
                        <div className="kpi">
                            <b>{pad2(mins)}</b>
                            <span>dak</span>
                        </div>
                        <div className="kpi">
                            <b>{pad2(secs)}</b>
                            <span>sn</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
