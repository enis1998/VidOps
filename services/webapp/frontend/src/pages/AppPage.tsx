import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser, isLoggedIn, loadMe } from "../lib/auth";

type User = {
  fullName?: string;
  email?: string;
  plan?: string;
  credits?: number;
};

type PageKey = "today" | "create" | "workflows" | "accounts" | "library" | "pricing";

type ConnectedAccounts = { tiktok: boolean; reels: boolean; shorts: boolean };

type VideoJob = {
  id: string;
  title: string;
  platform: string;
  status: "READY" | "RENDERING";
  watermark: boolean;
  createdAt: number;
};

const PLATFORMS = [
  { key: "tiktok" as const, ui: "TikTok" },
  { key: "reels" as const, ui: "Instagram Reels" },
  { key: "shorts" as const, ui: "YouTube Shorts" },
];

const TRENDS = [
  { title: "AI tarafında yeni model duyuruları", category: "Tech" },
  { title: "Telefon güncellemeleri: en büyük değişiklikler", category: "Tech" },
  { title: "Viral challenge: neden bu kadar tuttu?", category: "Entertainment" },
  { title: "Finans: teknoloji hisseleri & kripto gündemi", category: "Finance" },
  { title: "Oyun dünyasında büyük lansman: kısa özet", category: "Gaming" },
  { title: "Gündem: haftanın konuşulan konusu", category: "Agenda" },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getConnectedAccounts(): ConnectedAccounts {
  try {
    return (
      JSON.parse(localStorage.getItem("connectedAccounts") || "null") || {
        tiktok: false,
        reels: false,
        shorts: false,
      }
    );
  } catch {
    return { tiktok: false, reels: false, shorts: false };
  }
}

function setConnectedAccount(key: keyof ConnectedAccounts, val: boolean) {
  const acc = getConnectedAccounts();
  acc[key] = !!val;
  localStorage.setItem("connectedAccounts", JSON.stringify(acc));
}

function getJobs(): VideoJob[] {
  try {
    return JSON.parse(localStorage.getItem("videoJobs") || "[]") || [];
  } catch {
    return [];
  }
}

function setJobs(j: VideoJob[]) {
  localStorage.setItem("videoJobs", JSON.stringify(j));
}

function formatLabel(k: string | null) {
  if (k === "summary") return "Özet";
  if (k === "top3") return "Top 3";
  if (k === "story") return "Story";
  return "—";
}

export default function AppPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [page, setPage] = useState<PageKey>(() => {
    const last = (localStorage.getItem("lastPage") as PageKey | null) || null;
    return last || "today";
  });

  // “Today” selections
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // “Create” selections
  const [duration, setDuration] = useState<string>("25–35 sn");
  const [platform, setPlatform] = useState<string>("Instagram Reels");
  const [tone, setTone] = useState<string>("Enerjik");
  const [voice, setVoice] = useState<string>("Erkek (TR)");
  const [captions, setCaptions] = useState<string>("Auto + Highlight");
  const [freePrompt, setFreePrompt] = useState<string>("");

  const acc = useMemo(() => getConnectedAccounts(), [user, page]);
  const jobs = useMemo(() => getJobs(), [user, page]);

  // Light theme (same intent as your HTML prototype)
  const cssVars = useMemo(
    () =>
      ({
        ["--bg" as any]: "#F7F9FC",
        ["--surface" as any]: "#FFFFFF",
        ["--border" as any]: "#E6EAF2",
        ["--text" as any]: "#0B1220",
        ["--muted" as any]: "#52607A",
        ["--blue" as any]: "#2F6BFF",
        ["--blue2" as any]: "#2458D6",
        ["--blueSoft" as any]: "rgba(47,107,255,.10)",
        ["--shadow" as any]: "0 10px 30px rgba(17, 24, 39, .06)",
        ["--shadowBlue" as any]: "0 14px 40px rgba(47, 107, 255, .20)",
      }) as React.CSSProperties,
    []
  );

  // Boot auth (if token exists, pull /me and populate “authUser”)
  useEffect(() => {
    if (!isLoggedIn()) {
      setUser(null);
      return;
    }
    loadMe<User>()
      .then((me) => setUser(me))
      .catch(() => {
        clearAuth();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("lastPage", page);
  }, [page]);

  const displayName = user?.fullName || user?.email || "User";
  const avatarLetter = (displayName || "U").slice(0, 1).toUpperCase();

  const finalPrompt = useMemo(() => {
    const topic = freePrompt?.trim() || selectedTrend || "(konu seçilmedi)";
    const typeText =
      selectedFormat === "top3"
        ? "Top 3 formatında"
        : selectedFormat === "story"
        ? "Story mode şeklinde"
        : "Özet formatında";

    return `Bir short video üret.

Konu / Prompt: ${topic}
İçerik: ${typeText}
Süre: ${duration}
Platform: ${platform}
Ton: ${tone}
Ses: ${voice}
Altyazı: ${captions}

Kurallar:
- İlk 1-2 saniye güçlü hook
- Kısa cümleler
- Platform oranına uygun kadraj
- Sonda izleyiciye soru (CTA)`;
  }, [freePrompt, selectedTrend, selectedFormat, duration, platform, tone, voice, captions]);

  function requireLogin(action: string) {
    if (isLoggedIn()) return true;
    // Simple gate for now: navigate to login and come back
    localStorage.setItem("afterLoginPage", page);
    alert(`${action} için giriş yapman gerekiyor.`);
    navigate("/login");
    return false;
  }

  function onLogout() {
    clearAuth();
    setUser(null);
    navigate("/login", { replace: true });
  }

  function connectPlatform(key: keyof ConnectedAccounts) {
    if (!requireLogin("Hesap bağlama")) return;
    setConnectedAccount(key, true);
    // force re-render by nudging page state
    setPage((p) => p);
  }

  function disconnectPlatform(key: keyof ConnectedAccounts) {
    setConnectedAccount(key, false);
    setPage((p) => p);
  }

  function generateDemoJob() {
    const watermark = !isLoggedIn();
    if (!isLoggedIn()) {
      const used = localStorage.getItem("guestDemoUsed") === "true";
      if (used) {
        requireLogin("Üret");
        return;
      }
      localStorage.setItem("guestDemoUsed", "true");
    }

    const title = (freePrompt?.trim() || selectedTrend || "Untitled").slice(0, 42);
    const j: VideoJob = {
      id: uid(),
      title,
      platform,
      status: "READY",
      watermark,
      createdAt: Date.now(),
    };
    const next = [j, ...getJobs()];
    setJobs(next);
    setPage("library");
  }

  function clearLibrary() {
    setJobs([]);
    setPage((p) => p);
  }

  return (
    <div style={cssVars} className="min-h-screen" dir="ltr">
      {/* Hero background */}
      <div
        className="min-h-screen"
        style={
          {
            background:
              "radial-gradient(900px 450px at 15% 10%, rgba(47,107,255,.14), transparent 60%)," +
              "radial-gradient(800px 420px at 80% 18%, rgba(47,107,255,.08), transparent 62%)," +
              "linear-gradient(180deg, #FFFFFF 0%, var(--bg) 55%, var(--bg) 100%)",
            color: "var(--text)",
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b"
          style={
            {
              borderColor: "var(--border)",
              background: "rgba(255,255,255,.80)",
              backdropFilter: "blur(10px)",
            } as React.CSSProperties
          }
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center"
                style={
                  {
                    background: "var(--blue)",
                    color: "#fff",
                    boxShadow: "var(--shadowBlue)",
                  } as React.CSSProperties
                }
              >
                <span className="font-semibold">AV</span>
              </div>
              <div className="leading-tight">
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  AI Video Studio
                </div>
                <div className="text-sm font-semibold">Prompt Flow • Workflows • Publish</div>
              </div>

              <span
                className="hidden md:inline-flex ml-2 rounded-full px-3 py-1 text-xs"
                style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}
              >
                TikTok • Reels • Shorts
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <span
                  className="hidden md:inline-flex rounded-full px-3 py-1 text-xs"
                  style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}
                >
                  Credits: {user.credits ?? 0}
                </span>
              )}

              {!user ? (
                <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium" style={{ background: "var(--blue)", color: "#fff" }}>
                  Login
                </Link>
              ) : (
                <button onClick={onLogout} className="rounded-xl px-4 py-2 text-sm" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  Logout
                </button>
              )}

              <div
                className={(user ? "flex" : "hidden") + " h-9 w-9 rounded-full items-center justify-center font-semibold"}
                style={{ background: "#fff", border: "1px solid var(--border)" }}
                title={displayName}
              >
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Sidebar */}
          <aside
            className="w-72 shrink-0 border-r hidden md:block"
            style={
              {
                background: "rgba(255,255,255,.92)",
                backdropFilter: "blur(10px)",
                borderColor: "var(--border)",
              } as React.CSSProperties
            }
          >
            <div className="flex h-full flex-col p-4">
              {!user ? (
                <div className="mt-2 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  <div className="text-sm font-semibold">Guest Mode</div>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Her şeyi gör. Üret / paylaş / hesap bağla için login.
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    Bonus: 1 demo render (filigranlı).
                  </p>
                  <Link to="/login" className="mt-3 inline-flex text-sm" style={{ color: "var(--blue)" }}>
                    Login →
                  </Link>
                </div>
              ) : (
                <div className="mt-2 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    Hoş geldin
                  </div>
                  <div className="mt-1 text-lg font-semibold">{displayName}</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    Plan: {user.plan || "Free"}
                  </div>
                </div>
              )}

              <nav className="mt-4 space-y-2">
                {(
                  [
                    ["today", "Today"],
                    ["create", "Create"],
                    ["workflows", "Workflows (Pro)"],
                    ["accounts", "Accounts"],
                    ["library", "Library"],
                    ["pricing", "Pricing"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setPage(k)}
                    className="w-full text-left px-4 py-3 rounded-xl"
                    style={
                      {
                        background: page === k ? "var(--blueSoft)" : "#fff",
                        border: "1px solid var(--border)",
                        boxShadow: page === k ? "inset 0 0 0 1px rgba(47,107,255,.35)" : "var(--shadow)",
                      } as React.CSSProperties
                    }
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                <div className="text-sm font-semibold">Hızlı Başlat</div>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Trend seç → format seç → Create
                </p>
                <button
                  onClick={() => setPage("today")}
                  className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: "var(--blue)", color: "#fff" }}
                >
                  Başla
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-4 md:p-6">
            {page === "today" && (
              <section>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold">Bugün ne üretelim?</h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                      Trendden seç → format seç → Create sayfasına geç.
                    </p>
                  </div>
                  <button
                    onClick={() => setPage("create")}
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "#F3F6FF", border: "1px solid #DDE6FF" }}
                  >
                    Prompt Flow →
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Popüler Başlıklar (Mock)</div>
                        <div className="text-sm" style={{ color: "var(--muted)" }}>
                          Karttan formatı seç → seçim özeti dolsun.
                        </div>
                      </div>
                      <span className="hidden md:inline-flex rounded-full px-3 py-1 text-xs" style={{ background: "var(--blueSoft)", border: "1px solid rgba(47,107,255,.18)" }}>
                        AI-curated (demo)
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {TRENDS.map((t) => (
                        <div key={t.title} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs" style={{ color: "var(--muted)" }}>
                                {t.category}
                              </div>
                              <div className="mt-1 font-semibold">{t.title}</div>
                            </div>
                            <span className="text-xs rounded-full px-2 py-1" style={{ background: "var(--blueSoft)", border: "1px solid rgba(47,107,255,.18)" }}>
                              Trend
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {(
                              [
                                ["summary", "Özet"],
                                ["top3", "Top 3"],
                                ["story", "Story"],
                              ] as const
                            ).map(([k, label]) => (
                              <button
                                key={k}
                                onClick={() => {
                                  setSelectedTrend(t.title);
                                  setSelectedFormat(k);
                                }}
                                className="rounded-xl px-3 py-2 text-sm"
                                style={{ background: "#fff", border: "1px solid var(--border)" }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div className="text-sm font-semibold">Seçim Özeti</div>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                      Trend + format seçince Create’a taşı.
                    </p>

                    <div className="mt-4 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Seçilen trend
                      </div>
                      <div className="mt-1 font-medium">{selectedTrend || "—"}</div>
                      <div className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                        Format: {formatLabel(selectedFormat)}
                      </div>

                      <button
                        onClick={() => setPage("create")}
                        className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium"
                        style={{ background: "var(--blue)", color: "#fff" }}
                      >
                        Create Flow’a Git
                      </button>
                    </div>

                    <div className="mt-4 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                      <div className="text-sm font-semibold">Neden Prompt Flow?</div>
                      <ul className="mt-2 text-sm space-y-1" style={{ color: "var(--muted)" }}>
                        <li>• Buton kalabalığı yok</li>
                        <li>• Adım adım ilerlersin</li>
                        <li>• En sonda tek “final prompt” oluşur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {page === "create" && (
              <section>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold">Create</h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                      Şimdilik mock akış: seçimleri yap → final prompt oluşsun → demo “Üret”.
                    </p>
                  </div>
                  <button
                    onClick={generateDemoJob}
                    className="rounded-xl px-4 py-3 text-sm font-medium"
                    style={{ background: "var(--blue)", color: "#fff" }}
                  >
                    Üret
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div className="text-sm font-semibold">Seçimler</div>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Serbest prompt (opsiyonel)
                        </label>
                        <textarea
                          value={freePrompt}
                          onChange={(e) => setFreePrompt(e.target.value)}
                          className="mt-1 w-full rounded-xl p-3 text-sm outline-none"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                          rows={4}
                          placeholder="Örn: Bugünün teknoloji gündemini 30 saniyede anlat..."
                        />
                        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                          Prompt yazarsan trend seçimi yerine onu kullanır.
                        </p>
                      </div>

                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Süre
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          <option>15–25 sn</option>
                          <option>25–35 sn</option>
                          <option>35–45 sn</option>
                          <option>45–60 sn</option>
                        </select>

                        <div className="mt-3">
                          <label className="text-sm" style={{ color: "var(--muted)" }}>
                            Platform
                          </label>
                          <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={{ background: "#fff", border: "1px solid var(--border)" }}
                          >
                            <option>TikTok</option>
                            <option>Instagram Reels</option>
                            <option>YouTube Shorts</option>
                          </select>

                          <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                            Paylaşım için Accounts sayfasından hesabı bağlamalısın.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Ton
                        </label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          <option>Enerjik</option>
                          <option>Ciddi</option>
                          <option>Komik</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Ses
                        </label>
                        <select
                          value={voice}
                          onChange={(e) => setVoice(e.target.value)}
                          className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          <option>Erkek (TR)</option>
                          <option>Kadın (TR)</option>
                          <option>No Voice</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Altyazı
                        </label>
                        <select
                          value={captions}
                          onChange={(e) => setCaptions(e.target.value)}
                          className="mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          <option>Auto + Highlight</option>
                          <option>Sade</option>
                          <option>Kapalı</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm" style={{ color: "var(--muted)" }}>
                          Seçilen trend / format
                        </label>
                        <div className="mt-1 rounded-xl p-3 text-sm" style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}>
                          <div>Trend: {selectedTrend || "—"}</div>
                          <div>Format: {formatLabel(selectedFormat)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Final Prompt</div>
                        <span className="text-xs rounded-full px-2 py-1" style={{ background: "var(--blueSoft)", border: "1px solid rgba(47,107,255,.18)" }}>
                          Backend’e gidecek
                        </span>
                      </div>
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl p-4 text-sm" style={{ background: "#fff", border: "1px solid var(--border)" }}>
                        {finalPrompt}
                      </pre>
                    </div>

                    {!isLoggedIn() && (
                      <div className="rounded-2xl p-4 text-sm" style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}>
                        Guest mode: 1 demo “Üret” hakkın var (filigranlı). Sonrası için login.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {page === "workflows" && (
              <section>
                <h1 className="text-3xl font-semibold">Workflows</h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Şimdilik mock. Preset tıklayınca Create seçimlerini dolduruyor.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                      <div className="font-semibold">Preset #{i + 1}</div>
                      <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                        Demo preset: format + süre + platform.
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedFormat(i === 0 ? "summary" : i === 1 ? "top3" : "story");
                            setDuration(i === 2 ? "35–45 sn" : "25–35 sn");
                            setPlatform(i === 0 ? "Instagram Reels" : i === 1 ? "TikTok" : "YouTube Shorts");
                            setPage("create");
                          }}
                          className="rounded-xl px-3 py-3 text-sm font-medium"
                          style={{ background: "var(--blue)", color: "#fff" }}
                        >
                          Use
                        </button>
                        <button
                          onClick={() => {
                            if (!requireLogin("Workflow run")) return;
                            generateDemoJob();
                          }}
                          className="rounded-xl px-3 py-3 text-sm"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          Run
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {page === "accounts" && (
              <section>
                <h1 className="text-3xl font-semibold">Accounts</h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Şimdilik mock connect. Login olunca bağlanabilir.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {PLATFORMS.map((p) => {
                    const connected = acc[p.key];
                    return (
                      <div key={p.key} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{p.ui}</div>
                            <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                              Publish için platform hesabı.
                            </div>
                          </div>
                          <span
                            className="text-xs rounded-full px-2 py-1"
                            style={
                              connected
                                ? { background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.18)", color: "#065F46" }
                                : { background: "#F1F4FB", border: "1px solid var(--border)", color: "var(--muted)" }
                            }
                          >
                            {connected ? "CONNECTED" : "NOT CONNECTED"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {!connected ? (
                            <button
                              onClick={() => connectPlatform(p.key)}
                              className="rounded-xl px-3 py-3 text-sm font-medium"
                              style={{ background: "var(--blue)", color: "#fff" }}
                            >
                              Connect
                            </button>
                          ) : (
                            <button
                              onClick={() => disconnectPlatform(p.key)}
                              className="rounded-xl px-3 py-3 text-sm"
                              style={{ background: "#fff", border: "1px solid var(--border)" }}
                            >
                              Disconnect
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (!requireLogin("Test publish")) return;
                              alert("Mock publish ✓");
                            }}
                            className="rounded-xl px-3 py-3 text-sm"
                            style={{ background: "#fff", border: "1px solid var(--border)" }}
                          >
                            Test publish
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  Gerçekte burada OAuth olacak. Token’lar client’ta değil backend’de saklanır.
                </div>
              </section>
            )}

            {page === "library" && (
              <section>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold">Library</h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                      Üretilen videolar (demo localStorage).
                    </p>
                  </div>
                  <button
                    onClick={clearLibrary}
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: "#fff", border: "1px solid var(--border)" }}
                  >
                    Listeyi temizle
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {jobs.map((j) => (
                    <div key={j.id} className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                      <div className="aspect-[9/16] rounded-2xl relative overflow-hidden" style={{ background: "#F1F4FB", border: "1px solid var(--border)" }}>
                        {j.watermark && (
                          <div className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs" style={{ background: "rgba(0,0,0,.05)", border: "1px dashed rgba(0,0,0,.20)" }}>
                            WATERMARK
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="font-medium truncate">{j.title}</div>
                        <span className="text-xs rounded-full px-2 py-1" style={{ background: "#F1F4FB", border: "1px solid var(--border)", color: "var(--muted)" }}>
                          {j.status}
                        </span>
                      </div>

                      <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                        {j.platform} • {new Date(j.createdAt).toLocaleString()}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => requireLogin("İndir")}
                          className="rounded-xl px-3 py-3 text-sm"
                          style={{ background: "#fff", border: "1px solid var(--border)" }}
                        >
                          İndir
                        </button>
                        <button
                          onClick={() => requireLogin("Paylaş")}
                          className="rounded-xl px-3 py-3 text-sm font-medium"
                          style={{ background: "var(--blue)", color: "#fff" }}
                        >
                          Paylaş
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {jobs.length === 0 && (
                  <div className="mt-6 rounded-2xl p-4" style={{ background: "#fff", border: "1px solid var(--border)", color: "var(--muted)" }}>
                    Henüz video yok. Create’ten üret.
                  </div>
                )}
              </section>
            )}

            {page === "pricing" && (
              <section>
                <h1 className="text-3xl font-semibold">Pricing</h1>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Basit planlar (mock).
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { t: "Free", d: "Demo + Watermark" },
                    { t: "Creator", d: "Sınırsız üretim" },
                    { t: "Pro Automation", d: "Workflows" },
                  ].map((p) => (
                    <div key={p.t} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                      <div className="text-sm" style={{ color: "var(--muted)" }}>
                        {p.t}
                      </div>
                      <div className="mt-1 text-2xl font-semibold">{p.d}</div>
                      <button
                        onClick={() => requireLogin("Satın al")}
                        className="mt-5 w-full rounded-xl px-4 py-3 text-sm"
                        style={{ background: "#fff", border: "1px solid var(--border)" }}
                      >
                        Başla
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Mobile quick nav (simple) */}
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden rounded-full px-4 py-2 text-xs"
          style={{ background: "rgba(255,255,255,.92)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
        >
          <div className="flex gap-3">
            <button onClick={() => setPage("today")} style={{ color: page === "today" ? "var(--blue)" : "var(--muted)" }}>
              Today
            </button>
            <button onClick={() => setPage("create")} style={{ color: page === "create" ? "var(--blue)" : "var(--muted)" }}>
              Create
            </button>
            <button onClick={() => setPage("library")} style={{ color: page === "library" ? "var(--blue)" : "var(--muted)" }}>
              Library
            </button>
            <button onClick={() => setPage("accounts")} style={{ color: page === "accounts" ? "var(--blue)" : "var(--muted)" }}>
              Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
