import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../lib/api";
import { resendVerification, verifyEmail } from "../lib/auth";
import { Brand } from "../components/Brand";

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

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const sp = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = sp.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [showResend, setShowResend] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setMsg({ type: "err", text: "Doğrulama token'ı bulunamadı. Linki kontrol et." });
      setShowResend(true);
      return;
    }

    (async () => {
      setLoading(true);
      setMsg(null);
      setShowResend(false);

      try {
        await verifyEmail(token);
        setMsg({ type: "ok", text: "Email doğrulandı. Artık giriş yapabilirsin." });
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          const body: any = err.body;
          const code = body?.error;

          if (err.status === 410 || code === "token_expired") {
            setMsg({ type: "err", text: "Doğrulama linkinin süresi dolmuş. Maili yeniden gönderebilirsin." });
            setShowResend(true);
          } else if (code === "token_invalid") {
            setMsg({ type: "err", text: "Doğrulama linki geçersiz. Maili yeniden gönderebilirsin." });
            setShowResend(true);
          } else {
            setMsg({ type: "err", text: "Doğrulama başarısız. Lütfen tekrar dene." });
            setShowResend(true);
          }
        } else {
          setMsg({ type: "err", text: "Doğrulama başarısız. Lütfen tekrar dene." });
          setShowResend(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function onResend() {
    if (loading) return;
    if (!email.trim()) {
      setMsg({ type: "err", text: "Maili yeniden göndermek için email gir." });
      return;
    }

    setLoading(true);
    try {
      await resendVerification(email.trim());
      setMsg({ type: "ok", text: "Doğrulama maili yeniden gönderildi. Lütfen gelen kutunu kontrol et." });
      setShowResend(false);
    } catch {
      setMsg({ type: "err", text: "Mail gönderilemedi. Lütfen tekrar dene." });
      setShowResend(true);
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
              <Link
                  to="/"
                  className="rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Landing
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-soft backdrop-blur">
            <div className="text-lg font-semibold">Email doğrulama</div>
            <div className="mt-1 text-sm text-slate-600">Hesabını aktif etmek için email doğrulaması.</div>

            <div className="mt-5">{msg && <Msg type={msg.type} text={msg.text} />}</div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                  disabled={loading}
                  onClick={() => navigate("/login?reason=verified", { replace: true })}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
              >
                Giriş sayfasına git
              </button>

              <Link
                  to="/register"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Yeni kayıt
              </Link>
            </div>

            {showResend && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Doğrulama mailini yeniden gönder</div>
                  <div className="mt-2">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@mail.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                    />
                  </div>
                  <button
                      onClick={onResend}
                      disabled={loading}
                      className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition disabled:opacity-60"
                  >
                    {loading ? "Gönderiliyor..." : "Maili yeniden gönder"}
                  </button>
                </div>
            )}
          </div>
        </main>
      </div>
  );
}
