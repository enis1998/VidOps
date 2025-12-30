import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand";
import { login, loadMe, clearAuth, googleLogin } from "../lib/auth";

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

    // re-render safety
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

export default function LoginPage() {
  const navigate = useNavigate();

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMsg(null);

    try {
      await login(email.trim(), password);
      await loadMe();
      setMsg({ type: "ok", text: "Giriş başarılı. Yönlendiriliyorsun..." });
      navigate("/app", { replace: true });
    } catch (err: any) {
      clearAuth();
      setMsg({ type: "err", text: err?.message || "Giriş yapılamadı" });
    } finally {
      setLoading(false);
    }
  }

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

  return (
      <div className="min-h-screen text-slate-900">
        <PublicBg />

        {/* Top nav */}
        <header className="sticky top-[44px] z-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 backdrop-blur">
              <Brand />
              <nav className="flex items-center gap-2">
                <Link
                    to="/"
                    className="hidden sm:inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80 hover:text-slate-900"
                >
                  Ana sayfa
                </Link>
                <Link
                    to="/register"
                    className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                >
                  Kayıt ol
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 pt-10 pb-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <section>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                Erken erişim
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                İçerik üretimini <span className="text-blue-700">tek panelden</span> yönet.
              </h1>

              <p className="mt-4 text-base text-slate-600 sm:text-lg">
                Studio’da promptunu kur, taslaklarını düzenle, takvime yerleştir ve yayın akışını takip et.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Studio</div>
                  <div className="mt-1 text-sm text-slate-600">Konu + platform + süre seç, prompt otomatik oluşsun.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Yayın Takvimi</div>
                  <div className="mt-1 text-sm text-slate-600">İçerikleri sıraya al, haftalık planı tek ekranda gör.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Kütüphane</div>
                  <div className="mt-1 text-sm text-slate-600">Taslakları ve geçmiş içerikleri düzenli şekilde sakla.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 backdrop-blur">
                  <div className="text-sm font-semibold">Güven</div>
                  <div className="mt-1 text-sm text-slate-600">Oturum yönetimi güvenli şekilde yapılır.</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Türkçe arayüz
              </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Tek mavi tema
              </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Erken erişim güncellemeleri
              </span>
              </div>
            </section>

            {/* Right */}
            <section className="lg:justify-self-end lg:w-[440px]">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">Giriş yap</div>
                    <div className="mt-1 text-sm text-slate-600">aiboxio hesabınla devam et</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                  Beta
                </span>
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
                    <label className="text-sm font-semibold text-slate-700">E-posta</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="you@aiboxio.com"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Şifre</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder="••••••••"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
                  >
                    {loading ? "Giriş yapılıyor..." : "Giriş yap"}
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

                  <div className="text-xs text-slate-600">
                    Devam ederek{" "}
                    <Link className="font-semibold text-slate-800 hover:underline" to="/terms">
                      Kullanım Şartları
                    </Link>{" "}
                    ve{" "}
                    <Link className="font-semibold text-slate-800 hover:underline" to="/privacy">
                      Gizlilik Politikası
                    </Link>
                    'nı kabul etmiş olursun.
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-slate-500">Hesabın yok mu?</div>
                    <Link
                        to="/register"
                        className="mt-2 inline-flex w-full justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Kayıt ol
                    </Link>
                  </div>
                </form>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">
                Sorun mu var?{" "}
                <a className="font-semibold text-slate-700 hover:underline" href="mailto:support@aiboxio.com">
                  support@aiboxio.com
                </a>
              </div>
            </section>
          </div>

          <footer className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>© {new Date().getFullYear()} aiboxio</div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:underline">
                Gizlilik
              </Link>
              <Link to="/terms" className="hover:underline">
                Şartlar
              </Link>
              <a className="hover:underline" href="mailto:hello@aiboxio.com">
                İletişim
              </a>
            </div>
          </footer>
        </main>
      </div>
  );
}
