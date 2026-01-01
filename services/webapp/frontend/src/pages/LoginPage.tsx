import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand";
import { ApiError } from "../lib/api";
import { clearAuth, googleLogin, login, loadMe, resendVerification } from "../lib/auth";

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

function Field({
                 label,
                 type,
                 value,
                 onChange,
                 placeholder,
                 disabled,
               }: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
      <label className="block">
        <div className="mb-2 text-sm font-semibold text-slate-900">{label}</div>
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

function safeNextParam(next: string | null): string {
  if (!next) return "/app";
  if (!next.startsWith("/")) return "/app";
  if (next.startsWith("/login") || next.startsWith("/register") || next.startsWith("/verify-email")) return "/app";
  return next;
}

function isEmailNotVerified(err: unknown) {
  if (!(err instanceof ApiError)) return false;
  if (err.status !== 403) return false;
  const msg = (err.message || "").toLowerCase();
  const bodyErr = (err.body?.error || err.body?.message || "").toLowerCase();
  return msg.includes("email_not_verified") || bodyErr.includes("email_not_verified");
}

function mapLoginError(err: unknown): string {
  if (err instanceof ApiError) {
    if (isEmailNotVerified(err)) return "Email doğrulanmadı. Gelen kutunu kontrol et veya doğrulama mailini yeniden gönder.";
    if (err.status === 401) return "Email veya şifre hatalı.";
    if (err.status === 403) return "Bu işlem için yetkin yok.";
    if (err.status >= 500) return "Sunucu hatası. Lütfen tekrar dene.";
    return err.message || "Giriş başarısız.";
  }
  const anyErr = err as any;
  return anyErr?.message || "Giriş başarısız.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";

  const sp = new URLSearchParams(location.search);
  const next = safeNextParam(sp.get("next"));
  const reason = sp.get("reason") || "";
  const prefillEmail = sp.get("email") || "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);

  useEffect(() => {
    if (reason === "verify_sent") {
      setMsg({ type: "ok", text: "Kayıt oluşturuldu. Lütfen email doğrulama bağlantısını kontrol et." });
    }
    if (reason === "verified") {
      setMsg({ type: "ok", text: "Email doğrulandı. Şimdi giriş yapabilirsin." });
    }
    if (reason === "expired") {
      setMsg({ type: "err", text: "Oturum süresi doldu. Lütfen tekrar giriş yap." });
    }
    if (reason === "password_changed") {
      setMsg({ type: "ok", text: "Şifren güncellendi. Lütfen yeniden giriş yap." });
    }
    if (reason === "deleted") {
      setMsg({ type: "ok", text: "Hesabın silindi." });
    }
    if (reason === "error") {
      setMsg({ type: "err", text: "Bir hata oluştu. Lütfen tekrar giriş yap." });
    }
  }, [reason]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setMsg(null);
    setNeedsVerify(false);
    setLoading(true);

    try {
      await login(email.trim(), password);
      await loadMe();
      navigate(next, { replace: true });
    } catch (err: unknown) {
      if (isEmailNotVerified(err)) setNeedsVerify(true);
      clearAuth();
      setMsg({ type: "err", text: mapLoginError(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (loading) return;
    if (!email.trim()) {
      setMsg({ type: "err", text: "Doğrulama maili göndermek için email gir." });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      await resendVerification(email.trim());
      setMsg({ type: "ok", text: "Doğrulama maili yeniden gönderildi. Lütfen gelen kutunu kontrol et." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: mapLoginError(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleCredential(idToken: string) {
    if (loading) return;

    setLoading(true);
    setMsg(null);
    setNeedsVerify(false);

    try {
      await googleLogin(idToken);
      await loadMe();
      navigate(next, { replace: true });
    } catch {
      clearAuth();
      setMsg({ type: "err", text: "Google ile giriş başarısız. Lütfen tekrar dene." });
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

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Giriş yap</h1>

              <p className="mt-3 max-w-xl text-slate-600">
                Hesabına giriş yap. Local hesaplarda email doğrulama gerekir.
              </p>
            </section>

            <section className="lg:pl-10">
              <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-soft backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Hoş geldin</div>
                    <div className="text-lg font-semibold">Giriş</div>
                  </div>
                  <Link
                      to={`/register?next=${encodeURIComponent(next)}`}
                      className="rounded-2xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                  >
                    Kayıt ol
                  </Link>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" disabled={loading} />
                  <Field label="Şifre" type="password" value={password} onChange={setPassword} placeholder="••••••••" disabled={loading} />

                  {msg && <Msg type={msg.type} text={msg.text} />}

                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {loading ? "İşleniyor..." : "Giriş yap"}
                  </button>

                  {needsVerify && (
                      <button
                          type="button"
                          onClick={onResend}
                          disabled={loading}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition disabled:opacity-60"
                      >
                        Doğrulama mailini yeniden gönder
                      </button>
                  )}
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
                      Google giriş için <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span> gerekli.
                    </div>
                )}

                <div className="mt-6 text-xs text-slate-500">
                  Email doğrulama linkini açtıysan:{" "}
                  <Link className="font-semibold text-blue-700 hover:underline" to="/verify-email">
                    Doğrulama sayfası
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
  );
}
