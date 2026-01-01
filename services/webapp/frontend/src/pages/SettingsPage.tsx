// src/pages/SettingsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "../lib/api";
import { getAuthProvider, clearAuth } from "../lib/auth";
import {
  changePassword,
  deleteAccount,
  getAccount,
  updateAccountFullName,
  type UserResponse,
} from "../lib/account";

type Msg = { type: "ok" | "err"; text: string };

export default function SettingsPage() {
  const provider = useMemo(() => getAuthProvider(), []);
  const isLocal = provider === "LOCAL";

  const [me, setMe] = useState<UserResponse | null>(null);
  const [fullName, setFullName] = useState("");

  const [saving, setSaving] = useState(false);
  const [dangerBusy, setDangerBusy] = useState(false);

  const [pwBusy, setPwBusy] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const [pageMsg, setPageMsg] = useState<Msg | null>(null);
  const [pwMsg, setPwMsg] = useState<Msg | null>(null);

  const securityRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getAccount()
        .then((u) => {
          setMe(u);
          setFullName(u.fullName || "");
        })
        .catch((e: any) => {
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            clearAuth();
            window.location.href = "/login?reason=expired";
            return;
          }
          setPageMsg({ type: "err", text: e?.message || "Account bilgisi alınamadı." });
        });
  }, []);

  const onSaveName = async () => {
    if (!fullName.trim()) {
      setPageMsg({ type: "err", text: "Ad Soyad boş olamaz." });
      return;
    }
    setSaving(true);
    setPageMsg(null);
    try {
      const updated = await updateAccountFullName(fullName.trim());
      setMe(updated);
      setPageMsg({ type: "ok", text: "Profil güncellendi." });
    } catch (e: any) {
      setPageMsg({ type: "err", text: e?.message || "Güncelleme başarısız." });
    } finally {
      setSaving(false);
    }
  };

  function mapPwError(err: unknown): string {
    if (err instanceof ApiError) {
      const code = String(err.body?.error || err.body?.message || err.message || "").toLowerCase();

      if (err.status === 401) {
        if (code.includes("invalid_current_password")) return "Mevcut şifre hatalı.";
        return "Oturum süresi doldu. Lütfen tekrar giriş yap.";
      }
      if (err.status === 403) {
        if (code.includes("password_change_not_allowed")) {
          return "Bu hesap türünde şifre değiştirilemez (Google hesapları desteklenmez).";
        }
        return "Bu işlem için yetkin yok.";
      }
      if (err.status === 404) return "Şifre değiştirme servisi bulunamadı (backend endpoint eksik).";
      if (err.status === 400) return err.body?.message || "Yeni şifre geçersiz. En az 8 karakter olmalı.";
      return err.message || "Şifre değiştirilemedi.";
    }
    const anyErr = err as any;
    return anyErr?.message || "Şifre değiştirilemedi.";
  }

  const onChangePassword = async () => {
    setPwMsg(null);

    if (!isLocal) {
      setPwMsg({ type: "err", text: "Bu hesap türünde şifre değiştirilemez (Google hesapları desteklenmez)." });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!curPw) {
      setPwMsg({ type: "err", text: "Mevcut şifre gerekli." });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!newPw || newPw.length < 8) {
      setPwMsg({ type: "err", text: "Yeni şifre en az 8 karakter olmalı." });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (newPw === curPw) {
      setPwMsg({ type: "err", text: "Yeni şifre mevcut şifre ile aynı olamaz." });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (newPw !== newPw2) {
      setPwMsg({ type: "err", text: "Yeni şifreler eşleşmiyor." });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPwBusy(true);
    try {
      await changePassword(curPw, newPw);

      // Şifre değişince backend refresh tokenları revoke eder ve cookie'yi temizler.
      // Biz de local auth state'i temizleyip yeniden girişe gönderiyoruz.
      clearAuth();
      window.location.href = "/login?reason=password_changed";
    } catch (e) {
      setPwMsg({ type: "err", text: mapPwError(e) });
      securityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      setPwBusy(false);
    }
  };

  const onDelete = async () => {
    const ok = confirm("Hesabın kalıcı olarak silinecek. Emin misin?");
    if (!ok) return;

    setDangerBusy(true);
    setPageMsg(null);

    try {
      await deleteAccount();
      clearAuth();
      window.location.href = "/login?reason=deleted";
    } catch (e: any) {
      setPageMsg({ type: "err", text: e?.message || "Hesap silinemedi." });
    } finally {
      setDangerBusy(false);
    }
  };

  return (
      <div className="space-y-6">
        <div>
          <div className="text-sm text-slate-500">Ayarlar</div>
          <h1 className="text-2xl font-semibold text-slate-900">Hesap ve Güvenlik</h1>
          <p className="mt-1 text-slate-600">Profilini yönet, planını görüntüle, hesabını silebilirsin.</p>
        </div>

        {pageMsg && (
            <div
                className={
                  pageMsg.type === "ok"
                      ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                      : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                }
            >
              {pageMsg.text}
            </div>
        )}

        {/* Profil */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-lg font-semibold text-slate-900">Profil</div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ad Soyad</div>
              <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900">Email</div>
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {me?.email || "—"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
                onClick={onSaveName}
                disabled={saving}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </div>

        {/* Plan */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-lg font-semibold text-slate-900">Plan</div>
          <div className="mt-3 text-sm text-slate-600">
            Mevcut planın: <span className="font-semibold text-slate-900">{me?.plan || "—"}</span>
            {" • "}
            Kredi: <span className="font-semibold text-slate-900">{me?.credits ?? 0}</span>
          </div>

          <div className="mt-4">
            <a
                href="/app/pricing"
                className="inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition"
            >
              Paketleri yönet
            </a>
          </div>
        </div>

        {/* Güvenlik */}
        <div ref={securityRef} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-lg font-semibold text-slate-900">Güvenlik</div>
          <p className="mt-2 text-sm text-slate-600">Şifreni güvenli şekilde güncelle.</p>

          {pwMsg && (
              <div
                  className={
                    pwMsg.type === "ok"
                        ? "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        : "mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                  }
              >
                {pwMsg.text}
              </div>
          )}

          {!isLocal && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                Bu hesap türünde şifre değiştirilemez (Google hesapları desteklenmez).
              </div>
          )}

          {isLocal && (
              <>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Mevcut Şifre</div>
                    <input
                        type="password"
                        value={curPw}
                        onChange={(e) => setCurPw(e.target.value)}
                        disabled={pwBusy}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900">Yeni Şifre</div>
                    <input
                        type="password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        disabled={pwBusy}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-slate-900">Yeni Şifre (Tekrar)</div>
                    <input
                        type="password"
                        value={newPw2}
                        onChange={(e) => setNewPw2(e.target.value)}
                        disabled={pwBusy}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <button
                      onClick={onChangePassword}
                      disabled={pwBusy}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {pwBusy ? "Güncelleniyor..." : "Şifreyi Değiştir"}
                  </button>
                </div>
              </>
          )}
        </div>

        {/* Danger zone */}
        <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-red-700">Danger Zone</div>
          <p className="mt-1 text-sm text-slate-600">
            Hesabını sildiğinde kalıcı olarak kaldırılır. Bu işlem geri alınamaz.
          </p>

          <button
              onClick={onDelete}
              disabled={dangerBusy}
              className="mt-4 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
          >
            {dangerBusy ? "Siliniyor..." : "Hesabı Sil"}
          </button>
        </div>
      </div>
  );
}
