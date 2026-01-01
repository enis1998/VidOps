import LaunchCountdown from "../components/LaunchCountdown";
import { Brand } from "../components/Brand";

export default function LandingPage() {
    return (
        <>
            <div className="premiumBg" />
            <LaunchCountdown />

            <div className="nav">
                <div className="container">
                    <div className="navInner">
                        <Brand />

                        <div className="navLinks">
                            <a href="#ozellikler">Özellikler</a>
                            <a href="#nasil">Nasıl çalışır?</a>
                            <a href="#paketler">Paketler</a>
                        </div>

                        <div className="navCtas">
                            <a className="btn btnGhost" href="/login">
                                Giriş
                            </a>
                            <a className="btn btnPrimary" href="/register">
                                Kayıt ol
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* HERO */}
            <div className="container">
                <section className="hero">
                    <div className="heroGrid">
                        <div>
                            <div className="pill">
                                <span className="dot" />
                                Yayın takvimi • taslak • otomasyon
                            </div>

                            <h1 className="h1">
                                Sosyal medya içeriklerini{" "}
                                <span className="grad">planla, sıraya al ve yayınla</span>
                            </h1>

                            <p className="lead">
                                aiboxio ile içerik üretim sürecini tek panelden yönet: gündem seç, platformu belirle,
                                prompt’u otomatik kur ve yayın takviminde gör.
                            </p>

                            <div className="heroCtas">
                                <a className="btn btnPrimary btnWide" href="/register">
                                    Hemen başla
                                </a>
                                <a className="btn btnWide" href="/app">
                                    Demo’ya göz at
                                </a>
                            </div>

                            <div className="kpiRow">
                                <div className="card cardPad kpiCard">
                                    <div className="label">Takvim görünümü</div>
                                    <div className="value">Haftalık</div>
                                </div>
                                <div className="card cardPad kpiCard">
                                    <div className="label">Taslak alanı</div>
                                    <div className="value">Hazır</div>
                                </div>
                                <div className="card cardPad kpiCard">
                                    <div className="label">Platform</div>
                                    <div className="value">3 seçenek</div>
                                </div>
                                <div className="card cardPad kpiCard">
                                    <div className="label">Otomasyon</div>
                                    <div className="value">Yakında</div>
                                </div>
                            </div>
                        </div>

                        {/* Mock screenshot */}
                        <div className="mock" aria-label="mock">
                            <div className="mockTop">
                                <b>Yayın Takvimi</b>
                                <span>Haftalık görünüm</span>
                            </div>
                            <div className="mockBody">
                                <div className="weekGrid">
                                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                                        <div key={d} className="day">
                                            {d}
                                        </div>
                                    ))}
                                    {Array.from({ length: 21 }).map((_, i) => (
                                        <div key={i} className="cell" />
                                    ))}
                                </div>

                                <div className="badges">
                                    <div className="title">Taslaklar</div>
                                    <div className="chips">
                                        <span className="chip">Reels • Taslak</span>
                                        <span className="chip">TikTok • Planlandı</span>
                                        <span className="chip">Shorts • Fikir</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* FEATURES */}
            <section id="ozellikler" className="section">
                <div className="container">
                    <div className="secHead">
                        <h2>Kurumsal panel hissi</h2>
                        <p>
                            Stackposts tarzı “publish calendar” mantığı + teleskop benzeri premium arka plan.
                            İçerik üretimi, taslaklar, hesap bağlantıları ve yayınlama tek yerde.
                        </p>
                    </div>

                    <div className="featureGrid">
                        <div className="feature">
                            <div className="featureIcon">📅</div>
                            <h3>Yayın Takvimi</h3>
                            <p>Haftanın hangi günü ne yayınlanacak tek ekranda. Planla, sıraya al, takip et.</p>
                        </div>
                        <div className="feature">
                            <div className="featureIcon">🧩</div>
                            <h3>Akıllı Prompt Akışı</h3>
                            <p>Gündem + platform + süre seçimleriyle prompt otomatik oluşur. İstersen manuel yaz.</p>
                        </div>
                        <div className="feature">
                            <div className="featureIcon">🗂️</div>
                            <h3>Medya & Taslak Kütüphanesi</h3>
                            <p>Üretilen içerikler ve yüklenen medya tek yerde. “Benzer üret” akışı için temel hazır.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="nasil" className="section">
                <div className="container">
                    <div className="split">
                        <div className="bigMedia" aria-label="how-it-works-visual">
                            <div className="bigMediaInner">
                                <span className="cap">3 Adımda Kurulum</span>
                                <h3>Planını seç, hesaplarını bağla, otomatik yayına başla</h3>
                                <p>
                                    Hesap bağlantıları ve yayın saati planı adım adım ilerler. İlk etapta 3 platform ile
                                    başlıyoruz; admin panelden platform ekleme/çıkarma sonra gelecek.
                                </p>
                            </div>
                        </div>

                        <div className="card cardPad">
                            <div style={{ fontWeight: 950, fontSize: 16 }}>Nasıl çalışır?</div>
                            <div className="hr" />

                            <div style={{ display: "grid", gap: 12 }}>
                                <Step no="1" title="Planını oluştur" desc="Hedefini seç: içerik türü, platform, süre." />
                                <Step no="2" title="Hesaplarını bağla" desc="Instagram/TikTok/YouTube bağlama akışı." />
                                <Step
                                    no="3"
                                    title="Takvime yerleştir"
                                    desc="Gün + saat belirle, taslakları sıraya al ve yayınla."
                                />
                            </div>

                            <div className="hr" />
                            <div className="row">
                                <a className="btn btnPrimary btnWide" href="/register">
                                    Ücretsiz başla
                                </a>
                                <a className="btn btnWide" href="/app">
                                    Demo’yu aç
                                </a>
                            </div>

                            <p className="helper">
                                Not: Şu an backend endpointleri aynı kalacak. Sayfa içerikleri Türkçe; ileride TR/EN seçeneği ekleriz.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="paketler" className="section">
                <div className="container">
                    <div className="pricingTop">
                        <div className="left">
                            <h2>Paketler</h2>
                            <p>
                                Şimdilik vitrin amaçlı. Sonra billing-service ile gerçek fiyatlandırmaya bağlarız.
                                Butonlar tek mavi tema.
                            </p>
                        </div>

                        <div className="toggle" aria-label="pricing-toggle">
                            <button className="active">Aylık</button>
                            <button>Yıllık</button>
                            <button>Ömür boyu</button>
                        </div>
                    </div>

                    <div className="pricingGrid">
                        <div className="priceCard">
                            <div className="priceHead">
                                <div>
                                    <div className="name">BAŞLANGIÇ</div>
                                    <div className="sub">Hızlı denemek için</div>
                                </div>
                            </div>
                            <div className="price">
                                ₺0 <small>/ ay</small>
                            </div>
                            <a className="btn btnPrimary priceBtn" href="/register">
                                Ücretsiz başla
                            </a>
                            <ul className="ul">
                                <li>Takvim (temel)</li>
                                <li>Taslak alanı</li>
                                <li>3 platform (demo)</li>
                                <li>JWT giriş</li>
                            </ul>
                        </div>

                        <div className="priceCard featured">
                            <div className="ribbon">ÖNERİLEN</div>
                            <div className="priceHead">
                                <div>
                                    <div className="name">PRO</div>
                                    <div className="sub">Büyüyen içerik üreticileri</div>
                                </div>
                            </div>
                            <div className="price">
                                ₺499 <small>/ ay</small>
                            </div>
                            <a className="btn btnPrimary priceBtn" href="/register">
                                Plan seç
                            </a>
                            <ul className="ul">
                                <li>Gelişmiş takvim</li>
                                <li>Otomasyon akışları (yakında)</li>
                                <li>Kütüphane & medya</li>
                                <li>Öncelikli destek</li>
                            </ul>
                        </div>

                        <div className="priceCard">
                            <div className="priceHead">
                                <div>
                                    <div className="name">EKİP</div>
                                    <div className="sub">Ajans & takım</div>
                                </div>
                            </div>
                            <div className="price">
                                ₺1299 <small>/ ay</small>
                            </div>
                            <a className="btn btnPrimary priceBtn" href="/register">
                                Plan seç
                            </a>
                            <ul className="ul">
                                <li>Onay akışı (yakında)</li>
                                <li>Takım üyeleri</li>
                                <li>Analitik (yakında)</li>
                                <li>Kurumsal destek</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="footer">
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>© {new Date().getFullYear()} aiboxio • aiboxio.com</div>
                    <div style={{ color: "rgba(10,16,32,.55)" }}>
                        Güvenli giriş • Planlama • Yayın takvimi • Taslaklar
                    </div>
                </div>
            </div>
        </>
    );
}

function Step({ no, title, desc }: { no: string; title: string; desc: string }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "start" }}>
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(37,99,235,.10)",
                    border: "1px solid rgba(37,99,235,.16)",
                    color: "rgb(37,99,235)",
                    fontWeight: 950,
                }}
            >
                {no}
            </div>
            <div>
                <div style={{ fontWeight: 900 }}>{title}</div>
                <div style={{ color: "rgba(10,16,32,.65)", marginTop: 4, lineHeight: 1.6 }}>{desc}</div>
            </div>
        </div>
    );
}
