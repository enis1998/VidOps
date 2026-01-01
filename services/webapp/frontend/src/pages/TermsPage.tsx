import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";

function PublicBg() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-slate-50" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_12%_0%,rgba(37,99,235,0.22),transparent_60%),radial-gradient(70%_55%_at_88%_0%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(65%_60%_at_50%_100%,rgba(14,165,233,0.16),transparent_60%)]" />
      <div className="noiseOverlay" />
    </>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <PublicBg />

      <header className="sticky top-[44px] z-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur px-4 py-3 flex items-center justify-between">
            <Brand />
            <div className="flex items-center gap-2">
              <Link className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white" to="/">
                Ana sayfa
              </Link>
              <Link className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700" to="/register">
                Kayıt ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-10 pb-16">
        <div className="rounded-3xl border border-slate-200/70 bg-white/85 backdrop-blur p-7 shadow-sm">
          <h1 className="text-2xl font-semibold">Kullanım Şartları</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bu metin erken erişim sürümü için kısa bir özet şablondur. Yayına çıkmadan önce hukuki metinlerinizle
            güncelleyebilirsiniz.
          </p>

          <div className="mt-6 space-y-5 text-sm text-slate-700">
            <section>
              <div className="font-semibold text-slate-900">1) Hizmet</div>
              <p className="mt-2">
                aiboxio; içerik fikirleme, planlama, taslak üretme ve yayın akışını tek panelde yönetmen için sunulan bir
                yazılımdır.
              </p>
            </section>

            <section>
              <div className="font-semibold text-slate-900">2) Hesap ve güvenlik</div>
              <p className="mt-2">
                Hesabından yapılan işlemlerden sen sorumlusun. Şifreni kimseyle paylaşma. Şüpheli bir durum görürsen
                hesabını korumak için şifreni değiştir.
              </p>
            </section>

            <section>
              <div className="font-semibold text-slate-900">3) İçerik</div>
              <p className="mt-2">
                Ürettiğin içeriklerden ve telif haklarına uyumdan sen sorumlusun. Platform politikalarına aykırı içerik
                üretimi yasaktır.
              </p>
            </section>

            <section>
              <div className="font-semibold text-slate-900">4) Erken erişim</div>
              <p className="mt-2">
                Erken erişim döneminde özellikler değişebilir. Geri bildirimlerin ürünü iyileştirmemize yardımcı olur.
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700" to="/register">
              Ücretsiz başla
            </Link>
            <Link className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50" to="/privacy">
              Gizlilik Politikası
            </Link>
          </div>
        </div>
      </main>

      <footer className="pb-10">
        <div className="mx-auto max-w-6xl px-4 text-xs text-slate-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} aiboxio</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-700">
              Gizlilik
            </Link>
            <Link to="/terms" className="hover:text-slate-700">
              Şartlar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
