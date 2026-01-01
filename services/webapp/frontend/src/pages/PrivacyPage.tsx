import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";

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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <PublicBg />

      <header className="sticky top-[44px] z-20 border-b border-slate-200/70 bg-white/65 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Brand />
          <nav className="hidden sm:flex items-center gap-2">
            <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/">
              Ana sayfa
            </Link>
            <Link className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" to="/login">
              Giriş
            </Link>
            <Link className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700" to="/register">
              Kayıt ol
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-10 pb-16">
        <div className="rounded-3xl bg-white/80 ring-1 ring-slate-200 shadow-sm p-8">
          <div className="text-sm text-slate-500">aiboxio</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gizlilik Politikası</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Bu metin, aiboxio’yu kullanırken hangi verilerin işlendiğini ve temel prensiplerimizi özetler.
            (Bu sayfa erken erişim sürümüdür; hukuki metinler yayın öncesi netleştirilecektir.)
          </p>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-lg font-semibold">1) Topladığımız veriler</h2>
              <p className="mt-2 text-slate-600 leading-relaxed">
                Hesap bilgileri (ad, e‑posta), uygulama içi tercihlerin (platform seçimi, içerik ayarları) ve
                ürün performansını iyileştirmek için anonim kullanım metrikleri.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">2) Neden topluyoruz?</h2>
              <ul className="mt-2 list-disc pl-5 text-slate-600 space-y-2">
                <li>Hesabını oluşturmak ve oturumunu güvenli şekilde sürdürmek</li>
                <li>İçerik planlama ve üretim akışlarını çalıştırmak</li>
                <li>Ürünü iyileştirmek (hata ayıklama, performans, kalite)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold">3) Paylaşım</h2>
              <p className="mt-2 text-slate-600 leading-relaxed">
                Verilerini satmayız. Yalnızca hizmetin çalışması için zorunlu olan servis sağlayıcılarla (ör.
                barındırma) ve yasal yükümlülükler kapsamında paylaşım olabilir.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold">4) İletişim</h2>
              <p className="mt-2 text-slate-600 leading-relaxed">
                Gizlilikle ilgili soruların için bize uygulama içinden ya da destek kanalımızdan ulaşabilirsin.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200" to="/terms">
              Kullanım Şartları
            </Link>
            <Link className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" to="/">
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
