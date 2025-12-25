import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, loadMe, clearAuth } from "../lib/auth";
import LaunchCountdown from "../components/LaunchCountdown";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await login(email.trim(), password);
      await loadMe();
      setMsg({ type: "ok", text: "Giriş başarılı." });
      navigate("/app", { replace: true });
    } catch (err: any) {
      clearAuth();
      setMsg({ type: "err", text: err?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/30 via-slate-950 to-fuchsia-700/25"></div>
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl"></div>
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"></div>
        </div>

        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
              <span className="text-lg font-semibold">VO</span>
            </div>
            <div>
              <div className="text-sm text-white/70">VidOps</div>
              <div className="text-lg font-semibold leading-5">Prompt → Video → Publish</div>
            </div>
          </div>
          <a href="/app" className="text-sm text-white/70 hover:text-white transition">
            Guest mod →
          </a>
        </header>

        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-14 pt-6 lg:grid-cols-2 lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-white/80">Gateway + Auth + User microservices</span>
            </div>

            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Tek yerden{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              üret → sıraya al → paylaş
            </span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed">
              Login olunca access token tarayıcıda saklanır, refresh token HttpOnly cookie olarak gelir.
            </p>

            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-white/70">
              <div className="font-semibold text-white">Not</div>
              <p className="mt-1">
                Şimdilik e-posta + şifre ile giriş var. Google/OAuth eklemesi auth-service üzerinden yapılacak.
              </p>
            </div>
          </section>

          <section className="lg:justify-self-end w-full max-w-md">
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Giriş yap</h2>
                  <p className="text-sm text-white/70">VidOps hesabınla devam et</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">Beta</span>
              </div>

              {/* UPGRADED countdown */}
              <div className="mt-4">
                <LaunchCountdown />
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-3">
                <div>
                  <label className="text-sm text-white/70">E-posta</label>
                  <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/50"
                      placeholder="enis@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Şifre</label>
                  <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      className="mt-1 w-full rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/50"
                      placeholder="••••••••"
                  />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-white px-4 py-3 text-slate-900 font-medium hover:bg-white/90 transition disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <a
                    href="/register"
                    className="block w-full text-center rounded-xl bg-white/5 px-4 py-3 text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Hesabın yok mu? Register →
                </a>

                {msg && (
                    <div
                        className={
                            "mt-4 rounded-xl px-4 py-3 text-sm " +
                            (msg.type === "ok"
                                ? "bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-200"
                                : "bg-red-500/10 ring-1 ring-red-500/20 text-red-200")
                        }
                    >
                      {msg.text}
                    </div>
                )}
              </form>

              <p className="mt-6 text-xs text-white/50 leading-relaxed">
                Backend endpointleri: <span className="text-white/70">/api/auth/*</span> ve{" "}
                <span className="text-white/70">/api/users/*</span> (gateway üzerinden).
              </p>
            </div>
          </section>
        </main>
      </div>
  );
}
