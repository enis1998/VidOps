import { useEffect, useMemo, useRef, useState } from "react";

type Parts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function calcRemaining(target: Date): Parts {
  const now = Date.now();
  const totalMs = Math.max(0, target.getTime() - now);

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return { totalMs, days, hours, minutes, seconds };
}

export default function LaunchCountdown() {
  // Launch moment: 2 Jan 2026 00:00 TRT (UTC+03:00)
  const target = useMemo(() => new Date("2026-01-02T00:00:00+03:00"), []);

  // Progress start (so progress bar is meaningful). Keep as "today" baseline.
  const start = useMemo(() => new Date("2025-12-25T00:00:00+03:00"), []);

  const [left, setLeft] = useState<Parts>(() => calcRemaining(target));
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
      setLeft(calcRemaining(target));
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const totalWindowMs = Math.max(1, target.getTime() - start.getTime());
  const elapsedMs = clamp(nowMs - start.getTime(), 0, totalWindowMs);
  const progress = clamp(elapsedMs / totalWindowMs, 0, 1);

  const isLive = left.totalMs <= 0;
  const isLast24h = left.totalMs > 0 && left.totalMs <= 24 * 60 * 60 * 1000;
  const isLastHour = left.totalMs > 0 && left.totalMs <= 60 * 60 * 1000;

  const formattedTarget = useMemo(() => {
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

  const headerText = isLive ? "Yayındayız 🚀" : isLast24h ? "Lansman yaklaşıyor ⚡" : "Lansmana kalan süre";
  const subText = isLive ? formattedTarget : `${formattedTarget} (TRT)`;

  return (
      <div
          className={
              "relative overflow-hidden rounded-2xl px-4 py-3 ring-1 backdrop-blur " +
              (isLive
                  ? "bg-emerald-500/10 ring-emerald-500/25"
                  : isLast24h
                      ? "bg-fuchsia-500/10 ring-fuchsia-500/25"
                      : "bg-white/5 ring-white/10")
          }
      >
        {/* subtle shine */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
            <span
                className={
                    "inline-block h-2 w-2 rounded-full " +
                    (isLive ? "bg-emerald-400" : isLast24h ? "bg-fuchsia-300 animate-pulse" : "bg-cyan-300")
                }
            />
              <div className={"text-xs " + (isLive ? "text-emerald-200/80" : "text-white/70")}>{headerText}</div>
            </div>
            <div className={"mt-1 text-xs truncate " + (isLive ? "text-emerald-200/70" : "text-white/50")}>
              {subText}
            </div>

            {/* progress bar */}
            {!isLive && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>Beta progress</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                    <div
                        className={
                            "h-full rounded-full " +
                            (isLast24h ? "bg-gradient-to-r from-fuchsia-300/80 to-cyan-300/80" : "bg-white/40")
                        }
                        style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
            )}
          </div>

          {/* timer */}
          {!isLive ? (
              <div className="flex items-center gap-2">
                <FlipUnit label="Gün" value={String(left.days)} wide />
                <FlipUnit label="Saat" value={pad2(left.hours)} glow={isLastHour} />
                <FlipUnit label="Dak" value={pad2(left.minutes)} glow={isLastHour} />
                <FlipUnit label="Sn" value={pad2(left.seconds)} glow={isLastHour} />
              </div>
          ) : (
              <div className="text-xs text-emerald-200/80">Live</div>
          )}
        </div>

        {/* local CSS for flip */}
        <style>{`
        .flip-perspective { perspective: 900px; }
        .flip-top {
          transform-origin: bottom;
          animation: flipTop 520ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        .flip-bottom {
          transform-origin: top;
          animation: flipBottom 520ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes flipTop {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }
        @keyframes flipBottom {
          0% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>
      </div>
  );
}

function FlipUnit({
                    label,
                    value,
                    wide,
                    glow,
                  }: {
  label: string;
  value: string;
  wide?: boolean;
  glow?: boolean;
}) {
  const [prev, setPrev] = useState(value);
  const [flipKey, setFlipKey] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === prev) return;

    setFlipKey((k) => k + 1);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setPrev(value);
      timeoutRef.current = null;
    }, 540);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, prev]);

  const minW = wide ? "min-w-[66px]" : "min-w-[56px]";

  return (
      <div className={"text-center " + minW}>
        <div
            className={
                "flip-perspective relative h-[54px] rounded-xl bg-black/20 ring-1 ring-white/10 overflow-hidden " +
                (glow ? "shadow-[0_0_22px_rgba(255,255,255,0.08)]" : "")
            }
        >
          {/* static current */}
          <Half top value={value} />
          <Half value={value} />

          {/* animated on change */}
          {value !== prev && (
              <>
                {/* top flips away showing prev */}
                <div key={`t-${flipKey}`} className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-xl">
                  <div className="flip-top h-full bg-black/35 ring-1 ring-white/10 flex items-center justify-center">
                    <span className="text-lg font-semibold leading-none">{prev}</span>
                  </div>
                </div>

                {/* bottom flips in showing value */}
                <div key={`b-${flipKey}`} className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-xl">
                  <div
                      className="flip-bottom h-full bg-black/35 ring-1 ring-white/10 flex items-center justify-center"
                      style={{ transform: "rotateX(90deg)" }}
                  >
                    <span className="text-lg font-semibold leading-none">{value}</span>
                  </div>
                </div>
              </>
          )}

          {/* divider */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
        </div>

        <div className="mt-1 text-[10px] text-white/50 uppercase tracking-wider">{label}</div>
      </div>
  );
}

function Half({ top, value }: { top?: boolean; value: string }) {
  return (
      <div className={"absolute inset-x-0 " + (top ? "top-0 h-1/2" : "bottom-0 h-1/2") + " overflow-hidden"}>
        <div
            className={
                "h-full flex items-center justify-center " +
                (top ? "rounded-t-xl" : "rounded-b-xl") +
                " bg-black/20"
            }
        >
          <span className="text-lg font-semibold leading-none">{value}</span>
        </div>
      </div>
  );
}
