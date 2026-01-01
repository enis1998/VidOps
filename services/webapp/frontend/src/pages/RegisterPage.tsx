import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand";
import { ApiError } from "../lib/api";
import { register, clearAuth, googleLogin, isLoggedIn, loadMe } from "../lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

function PublicBg() {
  return (
      <>
        <div className="fixed inset-0 -z-10 bg-slate-50" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(65%_60%_at_50%_100%,rgba(14,165,233,0.16),transparent_60%)]" />
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
      </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
      {children}
    </span>
  );
}

function Field({
                 label,
                 type,
                 value,
                 onChange,
                 placeholder,
                 disabled,
                 hint,
               }: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
      <label className="block">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          {hint && <div className="text-xs text-slate-500">{hint}</div>}
        </div>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60"
        />
      </label>
  );
}

function Msg({ type, text }: { type: "ok" | "err"; text: string }) {
  return (
      <div
          className={
            type === "ok"
                ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          }
      >
        {text}
      </div>
  );
}

function GoogleButton({
                        clientId,
                        onCredential,
                        disabled,
                      }: {
  clientId: string;
  onCredential: (idToken: string) => void;
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

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: any) => {
          const cred = resp?.credential;
          if (typeof cred === "string" && cred.length > 0) onCredential(cred);
        },
      });

      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 320,
      });
    } catch {
      // ignore
    }
  }, [ready, clientId, disabled, onCredential]);

  return (
      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <div ref={divRef} />
      </div>
  );
}

function strengthLabel(pw: string) {
  if (!pw) return "—";
  const s = scorePw(pw);
  if (s >= 80) return "Güçlü";
  if (s >= 50) return "Orta";
  return "Zayıf";
}

function scorePw(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[a-z]/.test(pw)) score += 15;
  if (/\d/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;
  return Math.min(score, 100);
}

function safeNextParam(next: string | null): string {
  if (!next) return "/app";
  if (!next.startsWith("/")) return "/app";
  if (next.startsWith("/login") || next.startsWith("/register") || next.startsWith("/verify-email")) return "/app";
  return next;
}

function mapRegisterError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.";
    if (err.status === 400) return "Eksik/yanlış bilgi var. Lütfen alanları kontrol et.";
    if (err.status >= 500) return "Sunucu hatası. Lütfen tekrar dene.";
    return err.message || "Kayıt oluşturulamadı.";
  }
  const anyErr = err as any;
  return anyErr?.message || "Kayıt oluşturulamadı.";
}

function mapGoogleError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400 || err.status === 401 || err.status === 403)
      return "Google oturumu doğrulanamadı. Lütfen tekrar dene.";
    if (err.status >= 500) return "Sunucu hatası. Lütfen tekrar dene.";
    return err.message || "Google ile kayıt/giriş başarısız.";
  }
  const anyErr = err as any;
  return anyErr?.message || "Google ile kayıt/giriş başarısız.";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";

  const sp = new URLSearchParams(location.search);
  const next = safeNextParam(sp.get("next"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [accepted, setAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Zaten giriş yapılmışsa register sayfasında bekletme
  useEffect(() => {
    if (!isLoggedIn()) return;
    (async () => {
      try {
        await loadMe();
        navigate(next, { replace: true });
      } catch {
        clearAuth();
      }
    })();
  }, [next, navigate]);

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
      navigate(next, { replace: true });
    } catch (err: unknown) {
      clearAuth();
      setMsg({ type: "err", text: mapGoogleError(err) });
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

    if (!fullName.trim()) {
      setMsg({ type: "err", text: "Ad Soyad boş olamaz." });
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
      const out = await register(fullName.trim(), email.trim(), password);

      setMsg({ type: "ok", text: out?.message || "Kayıt oluşturuldu. Lütfen email doğrulama bağlantısını kontrol et." });

      // Register sonrası token yok → login’e yönlendir
      navigate(
          `/login?next=${encodeURIComponent(next)}&reason=verify_sent&email=${encodeURIComponent(email.trim())}`,
          { replace: true }
      );
    } catch (err: unknown) {
      clearAuth();
      setMsg({ type: "err", text: mapRegisterError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen text-slate-900">
        <PublicBg />

        <header className="sticky top-[44px] z-20">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur">
              <Brand />
              <div className="hidden sm:flex items-center gap-2">
                <Badge>Launch: Jan 2, 2026</Badge>
                <Link to="/" className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                  Landing
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                aiboxio • Prompt → Video → Publish
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Hesap oluştur</h1>

              <p className="mt-3 max-w-xl text-slate-600">
                Studio ve yayınlama akışını kullanmak için hızlıca kayıt ol. Kayıttan sonra email doğrulaması gerekir.
              </p>
            </section>

            <section className="lg:pl-10">
              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Başlayalım</div>
                    <div className="text-lg font-semibold">Kayıt</div>
                  </div>
                  <Link
                      to={`/login?next=${encodeURIComponent(next)}`}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                  >
                    Giriş yap
                  </Link>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <Field label="Ad Soyad" type="text" value={fullName} onChange={setFullName} placeholder="Enis Kaan Keskin" disabled={loading} />
                  <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" disabled={loading} />
                  <Field label="Şifre" type="password" value={password} onChange={setPassword} placeholder="••••••••" disabled={loading} hint={`Güç: ${pw}`} />
                  <Field label="Şifre (tekrar)" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" disabled={loading} />

                  {mismatch && <Msg type="err" text="Şifreler eşleşmiyor." />}
                  {msg && <Msg type={msg.type} text={msg.text} />}

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>Kullanım Şartları ve Gizlilik Politikası’nı kabul ediyorum.</span>
                  </label>

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {loading ? "İşleniyor..." : "Kayıt ol"}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <div className="text-xs font-semibold text-slate-500">veya</div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="flex justify-center">
                  <GoogleButton clientId={googleClientId} onCredential={onGoogleCredential} disabled={loading || !googleClientId} />
                </div>

                {!googleClientId && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Google kayıt için <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span> gerekli.
                    </div>
                )}

                <div className="mt-6 text-xs text-slate-500">
                  Devam ederek <span className="font-semibold text-slate-700">Kullanım Şartları</span> ve{" "}
                  <span className="font-semibold text-slate-700">Gizlilik Politikası</span>’nı kabul etmiş olursun.
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}
