import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand";
import { clearAuth, loadMe, register, googleLogin } from "../lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

function PublicBg() {
  return (
      <>
        <div className="fixed inset-0 -z-10 bg-slate-50" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_12%_0%,rgba(37,99,235,0.22),transparent_60%),radial-gradient(70%_55%_at_88%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(65%_60%_at_50%_100%,rgba(14,165,233,0.16),transparent_60%)]" />
        <div
            className="fixed inset-0 -z-10 opacity-[0.22]"
            style={{
              backgroundImage:
                  "linear-gradient(to right, rgba(37,99,235,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.10) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(65% 55% at 50% 10%, black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(65% 55% at 50% 10%, black 0%, transparent 70%)",
            }}
        />
        <div className="noiseOverlay" />
      </>
  );
}

function strengthLabel(pw: string) {
  const s = pw.length;
  if (!pw) return { text: "", tone: "text-slate-500" };
  if (s < 8) return { text: "Zayıf", tone: "text-rose-600" };
  if (s < 12) return { text: "Orta", tone: "text-amber-600" };
  return { text: "Güçlü", tone: "text-emerald-600" };
}

/**
 * Google Sign-In Button (GIS)
 * - index.html içinde script olmalı: https://accounts.google.com/gsi/client
 * - callback: resp.credential -> ID token
 */
function GoogleSignInButton({
                              clientId,
                              onCredential,
                              disabled,
                            }: {
  clientId: string;
  onCredential: (idToken: string) => Promise<void>;
  disabled?: boolean;
}) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        setReady(true);
        clearInterval(t);
      }
    }, 50);
    return () => clearInterval(t);
  }, [clientId]);

  useEffect(() => {
    if (!ready || !divRef.current || !clientId || disabled) return;

    divRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp: any) => {
        const idToken = resp?.credential;
        if (typeof idToken === "string" && idToken.length > 0) {
          await onCredential(idToken);
        }
      },
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 360,
      text: "continue_with",
    });

    return () => {
      try {
        window.google?.accounts?.id?.cancel?.();
      } catch {
        // ignore
      }
    };
  }, [ready, clientId, onCredential, disabled]);

  return (
      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <div ref={divRef} />
      </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const pw = useMemo(() => strengthLabel(password), [password]);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function onGoogleCredential(idToken: string) {
    if (loading) return;

    setLoading(true);
    setMsg(null);

    try {
      await googleLogin(idToken);
      await loadMe();
      setMsg({ type: "ok", text: "Google ile giriş başarılı. Yönlendiriliyorsun..." });
      navigate("/app", { replace: true });
    } catch (err: any) {
      clearAuth();
      setMsg({ type: "err", text: err?.message || "Google ile giriş başarısız" });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setMsg(null);

    if (!accepted) {
      setMsg({ type: "err", text: "Devam etmek için şartları kabul etmelisin." });
      return;
    }

    if (password.length < 8) {
      setMsg({ type: "err", text: "Şifre en az 8 karakter olmalı." });
      return;
    }

    if (password !== confirm) {
      setMsg({ type: "err", text: "Şifreler eşleşmiyor." });
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      await loadMe();
      navigate("/app", { replace: true });
    } catch (err: any) {
      clearAuth();
      setMsg({ type: "err", text: err?.message || "Kayıt oluşturulamadı" });
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen text-slate-900">
        <PublicBg />

        {/* Top nav */}
        <header className="sticky top-[44px] z-20">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur">
              <Brand />
              <nav className="flex items-center gap-2 text-sm">
                <a className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50" href="/">
                  Ana sayfa
                </a>
                <a className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50" href="/#paketler">
                  Paketler
                </a>
                <Link className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700" to="/login">
                  Giriş
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left */}
            <section className="lg:pt-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Erken erişim
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                İçerik üretimini <span className="text-blue-600">tek panelde</span> yönet.
              </h1>

              <p className="mt-4 text-lg text-slate-600">
                Konu seç, platformu belirle, takvime yerleştir. aiboxio; üretim, planlama ve yayın akışını tek yerde toplar.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Studio</div>
                  <div className="mt-1 text-sm text-slate-600">Prompt builder + öneriler + chat akışı</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Yayın Takvimi</div>
                  <div className="mt-1 text-sm text-slate-600">Takvim + kuyruk (queue) hissi</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Kütüphane</div>
                  <div className="mt-1 text-sm text-slate-600">Taslaklarını ve içeriklerini düzenle</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Güvenli oturum</div>
                  <div className="mt-1 text-sm text-slate-600">Verilerin korunur, erişim kontrollüdür</div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur">
                <div className="text-sm font-semibold">Yeni başlayanlar için</div>
                <div className="mt-1 text-sm text-slate-600">İlk içerik işini 2 dakikada oluştur. Sonra takvimden sıraya al.</div>
              </div>
            </section>

            {/* Right */}
            <section>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-extrabold">Hesap oluştur</div>
                    <div className="mt-1 text-sm text-slate-600">Ücretsiz başlayabilir, sonra yükseltebilirsin.</div>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">BETA</div>
                </div>

                {/* ✅ Google sign-in */}
                <div className="mt-5">
                  {googleClientId ? (
                      <GoogleSignInButton
                          clientId={googleClientId}
                          onCredential={onGoogleCredential}
                          disabled={loading}
                      />
                  ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                        Google Client ID yok. <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span> tanımla.
                      </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <div className="text-xs text-slate-500">veya</div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </div>

                <form onSubmit={onSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Ad Soyad</label>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Ad Soyad"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">E-posta</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="ornek@domain.com"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-slate-700">Şifre</label>
                      <span className={"text-xs font-semibold " + pw.tone}>{pw.text}</span>
                    </div>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        minLength={8}
                        required
                        placeholder="En az 8 karakter"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Şifre (tekrar)</label>
                    <input
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        type="password"
                        required
                        placeholder="Şifreyi tekrar yaz"
                        className={
                            "mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-4 " +
                            (mismatch
                                ? "border-rose-300 focus:border-rose-300 focus:ring-rose-100"
                                : "border-slate-200 focus:border-blue-300 focus:ring-blue-100")
                        }
                    />
                    {mismatch && <div className="mt-2 text-xs font-semibold text-rose-600">Şifreler eşleşmiyor.</div>}
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4"
                    />
                    <span className="text-sm text-slate-700">
                    <span className="font-semibold">Kullanım Şartları</span> ve <span className="font-semibold">Gizlilik</span>{" "}
                      politikasını okudum, kabul ediyorum.
                    <span className="block mt-1 text-xs text-slate-500">
                      <Link className="underline hover:text-slate-700" to="/terms">
                        Şartlar
                      </Link>
                      {" · "}
                      <Link className="underline hover:text-slate-700" to="/privacy">
                        Gizlilik
                      </Link>
                    </span>
                  </span>
                  </label>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? "Hesap oluşturuluyor..." : "Hesap oluştur"}
                  </button>

                  {msg && (
                      <div
                          className={
                              "rounded-2xl px-4 py-3 text-sm ring-1 " +
                              (msg.type === "ok"
                                  ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                                  : "bg-rose-50 text-rose-800 ring-rose-100")
                          }
                      >
                        {msg.text}
                      </div>
                  )}

                  <div className="text-sm text-slate-600">
                    Zaten hesabın var mı?{" "}
                    <Link className="font-semibold text-blue-700 hover:text-blue-800" to="/login">
                      Giriş yap
                    </Link>
                  </div>
                </form>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                <span>© {new Date().getFullYear()} aiboxio</span>
                <span className="flex items-center gap-3">
                <Link className="hover:text-slate-700" to="/privacy">
                  Gizlilik
                </Link>
                <Link className="hover:text-slate-700" to="/terms">
                  Şartlar
                </Link>
                <a className="hover:text-slate-700" href="mailto:hello@aiboxio.com">
                  İletişim
                </a>
              </span>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}
