import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, loadMe, clearAuth } from "../lib/auth";
import LaunchCountdown from "../components/LaunchCountdown";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await register(fullName.trim(), email.trim(), password);
      await loadMe();
      setMsg({ type: "ok", text: "Kayıt başarılı. Yönlendiriliyorsun..." });
      navigate("/app", { replace: true });
    } catch (err: any) {
      clearAuth();
      setMsg({ type: "err", text: err?.message || "Register failed" });
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
              <div className="text-lg font-semibold leading-5">Create • Render • Publish</div>
            </div>
          </div>
          <a href="/login" className="text-sm text-white/70 hover:text-white transition">
            Login →
          </a>
        </header>

        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-14 pt-6 lg:grid-cols-2 lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-white/80">Free plan ile başla • Sonra yükselt</span>
            </div>

            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Hesap oluştur{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              ve üretime başla
            </span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed">
              Auth + User servisleri üzerinden kayıt olursun. Token’lar gateway üzerinden yönetilir.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-white/70">Plan</div>
                <div className="mt-2 text-xl font-semibold">Free</div>
                <div className="mt-1 text-sm text-white/60">Başlangıç kredisi</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-white/70">Güvenlik</div>
                <div className="mt-2 text-xl font-semibold">JWT + Refresh</div>
                <div className="mt-1 text-sm text-white/60">Refresh cookie ile</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm text-white/70">Mimari</div>
                <div className="mt-2 text-xl font-semibold">Gateway</div>
                <div className="mt-1 text-sm text-white/60">Tek giriş noktası</div>
              </div>
            </div>
          </section>

          <section className="lg:justify-self-end w-full max-w-md">
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Register</h2>
                  <p className="text-sm text-white/70">Hesabını oluştur</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">Beta</span>
              </div>

              {/* UPGRADED countdown */}
              <div className="mt-4">
                <LaunchCountdown />
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-white/70">Full name</label>
                  <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/25"
                      placeholder="Enis Kaan Keskin"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Email</label>
                  <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      className="mt-2 w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/25"
                      placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Password</label>
                  <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      minLength={8}
                      required
                      className="mt-2 w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/25"
                      placeholder="Minimum 8 karakter"
                  />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-900 font-medium hover:bg-white/90 transition disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Register"}
                </button>

                <a
                    href="/login"
                    className="block w-full text-center rounded-xl bg-white/5 px-4 py-3 text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Zaten hesabım var → Login
                </a>

                {msg && (
                    <div
                        className={
                            "rounded-xl px-4 py-3 text-sm " +
                            (msg.type === "ok"
                                ? "bg-emerald-500/15 ring-1 ring-emerald-500/25 text-emerald-200"
                                : "bg-rose-500/15 ring-1 ring-rose-500/25 text-rose-200")
                        }
                    >
                      {msg.text}
                    </div>
                )}
              </form>

              <p className="mt-6 text-xs text-white/50 leading-relaxed">
                Not: Bu ekran mikroservis auth altyapısına bağlıdır. LocalStorage sadece access token saklamak içindir.
              </p>
            </div>
          </section>
        </main>
      </div>
  );
}
