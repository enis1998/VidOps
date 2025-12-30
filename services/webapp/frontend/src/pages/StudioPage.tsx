import React, { useMemo, useRef, useState } from "react";

type Platform = "Instagram" | "TikTok" | "YouTube";
type Duration = "15 sn" | "30 sn" | "60 sn";

type Attach = {
    id: string;
    file: File;
    url: string;
    kind: "image" | "video";
};

type Msg = { role: "assistant" | "user"; text: string };

function cx(...c: Array<string | false | undefined | null>) {
    return c.filter(Boolean).join(" ");
}

const TRENDING_TOPICS = [
    "AI gündemi: haftalık özet",
    "Startup / ürün fikri",
    "Teknik içerik: kısa öğretici",
] as const;

const PLATFORMS: Platform[] = ["Instagram", "TikTok", "YouTube"];
const DURATIONS: Duration[] = ["15 sn", "30 sn", "60 sn"];

export default function StudioPage() {
    const [topic, setTopic] = useState<string>("");
    const [platform, setPlatform] = useState<Platform>("TikTok");
    const [duration, setDuration] = useState<Duration>("30 sn");

    const [prompt, setPrompt] = useState<string>("");
    const [similarMode, setSimilarMode] = useState<boolean>(true);

    const [attachments, setAttachments] = useState<Attach[]>([]);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [messages, setMessages] = useState<Msg[]>([
        {
            role: "assistant",
            text:
                "Studio’ya hoş geldin. Üstten konu seçebilir, platform/süre belirleyebilirsin. İstersen görsel/video ekleyip “benzer üret” akışına da geçebiliriz. Ne yapmak istiyorsun?",
        },
    ]);

    const autoPrompt = useMemo(() => {
        const t = topic?.trim() || "Bu hafta gündeminden 3 başlık seç";
        const attachHint =
            attachments.length > 0 && similarMode
                ? "Eklediğim referans görsel/video stiline benzer olacak şekilde"
                : "";
        return `${attachHint} ${t}. ${platform} için ${duration} uzunluğunda bir video senaryosu yaz. Hook + CTA ekle. Shot list + ekranda yazı önerileri de ver.`;
    }, [topic, platform, duration, attachments.length, similarMode]);

    function buildPromptFromSelections() {
        setPrompt(autoPrompt);
        pushAssistant(
            "Seçimlerinden bir taslak prompt oluşturdum. İstersen düzenleyebilirsin. Hazırsan alttaki sohbetten “üret” diyerek ilerleyelim."
        );
    }

    function onPickFile() {
        fileRef.current?.click();
    }

    function onFilesSelected(files: FileList | null) {
        if (!files || files.length === 0) return;

        const next: Attach[] = [];
        Array.from(files).forEach((f) => {
            const kind = f.type.startsWith("video") ? "video" : "image";
            const url = URL.createObjectURL(f);
            next.push({
                id: crypto.randomUUID(),
                file: f,
                url,
                kind,
            });
        });

        setAttachments((prev) => [...prev, ...next]);
        pushAssistant(
            `Referans dosyaları eklendi (${next.length}). İstersen “benzer üret” açık kalsın, istersen kapatıp sadece prompt ile üretelim.`
        );
    }

    function removeAttach(id: string) {
        setAttachments((prev) => {
            const a = prev.find((x) => x.id === id);
            if (a) URL.revokeObjectURL(a.url);
            return prev.filter((x) => x.id !== id);
        });
    }

    function pushUser(text: string) {
        setMessages((m) => [...m, { role: "user", text }]);
    }

    function pushAssistant(text: string) {
        setMessages((m) => [...m, { role: "assistant", text }]);
    }

    function onSend(text: string) {
        const t = text.trim();
        if (!t) return;

        pushUser(t);

        // Demo assistant behavior (backend yokken)
        if (t.toLowerCase().includes("üret")) {
            const effectivePrompt = prompt.trim() ? prompt.trim() : autoPrompt;
            pushAssistant(
                "Tamam. Aşağıdaki prompt ile ilerliyorum:\n\n" +
                `• Platform: ${platform}\n• Süre: ${duration}\n• Benzer üret: ${similarMode && attachments.length > 0 ? "Açık" : "Kapalı"}\n\n` +
                `PROMPT:\n${effectivePrompt}\n\n` +
                "İstersen önce şu iki şeyi netleştirelim:\n1) Video tonu: ciddi mi, eğlenceli mi?\n2) Hedef kitle: yeni başlayan mı, teknik mi?"
            );
            return;
        }

        if (t.toLowerCase().includes("kısalt")) {
            pushAssistant("Tamam. Süreyi 15 sn’ye çekmek ister misin? Bir tıkla değiştirebilirsin.");
            return;
        }

        pushAssistant("Anladım. İstersen üstte konu/platform/süre seçerek prompt’u netleştirelim. Sonra “üret” yaz.");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold text-blue-700">STUDIO</div>
                    <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                        İçerik üretimi
                    </h1>
                    <p className="mt-1 text-slate-600">
                        Seçimlerle prompt üret ya da manuel yaz. Referans görsel/video ekleyerek benzer stil üretimine hazırlan.
                    </p>
                </div>
            </div>

            {/* Top builder */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Prompt Builder */}
                <div className="lg:col-span-2 rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between">
                        <div>
                            <div className="font-semibold">Prompt</div>
                            <div className="text-sm text-slate-600">Tek satır hedef: ne üretmek istiyorsun?</div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
              Beta
            </span>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Trending chips */}
                        <div>
                            <div className="text-xs text-slate-500 font-semibold">Güncel konular</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {TRENDING_TOPICS.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTopic(t)}
                                        className={cx(
                                            "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                                            topic === t
                                                ? "bg-blue-600 text-white ring-blue-600 shadow-sm"
                                                : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-sm text-slate-600">
                                Seçilen konu:{" "}
                                <span className="font-semibold text-slate-900">
                  {topic ? topic : "Henüz seçilmedi"}
                </span>
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <div className="text-xs text-slate-500 font-semibold">Platform</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {PLATFORMS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={cx(
                                            "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
                                            platform === p
                                                ? "bg-slate-950 text-white ring-slate-900 shadow-sm"
                                                : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <div className="text-xs text-slate-500 font-semibold">Video süresi</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {DURATIONS.map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={cx(
                                            "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition",
                                            duration === d
                                                ? "bg-blue-50 text-blue-800 ring-blue-100"
                                                : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt textarea */}
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500 font-semibold">Manuel prompt</div>
                                <button
                                    onClick={buildPromptFromSelections}
                                    className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                                >
                                    Seçimlerle prompt üret
                                </button>
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="mt-2 w-full min-h-[110px] rounded-3xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder='Örn: "Bu hafta AI gündeminden 3 başlık seç, 30sn TikTok script’i yaz, hook + CTA ekle."'
                            />

                            <div className="mt-2 rounded-3xl bg-slate-50 ring-1 ring-slate-200 p-4">
                                <div className="text-xs text-slate-500 font-semibold">Otomatik öneri</div>
                                <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                                    {autoPrompt}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachments + Similar */}
                <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200/70">
                        <div className="font-semibold">Referans dosyalar</div>
                        <div className="text-sm text-slate-600">
                            Görsel/video ekle, benzer stil üretimine hazırlan.
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="rounded-3xl bg-slate-50 ring-1 ring-slate-200 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold">“Benzer üret” modu</div>
                                    <div className="text-xs text-slate-600 mt-1">
                                        Referans eklediğinde stil/kompozisyonu taklit etmeye çalışır.
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSimilarMode((v) => !v)}
                                    className={cx(
                                        "rounded-2xl px-3 py-2 text-xs font-semibold ring-1 transition",
                                        similarMode
                                            ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                                            : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {similarMode ? "Açık" : "Kapalı"}
                                </button>
                            </div>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => onFilesSelected(e.target.files)}
                        />

                        <button
                            onClick={onPickFile}
                            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition shadow-sm"
                        >
                            Görsel / Video ekle
                        </button>

                        {attachments.length === 0 ? (
                            <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-4">
                                <div className="text-sm font-semibold">Henüz dosya yok</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Örn: beğendiğin bir Reels videosu, kapak görseli ya da örnek bir görsel stil.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attachments.map((a) => (
                                    <div key={a.id} className="rounded-3xl bg-white ring-1 ring-slate-200 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold truncate">{a.file.name}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {a.kind === "video" ? "Video" : "Görsel"} • {(a.file.size / (1024 * 1024)).toFixed(2)} MB
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAttach(a.id)}
                                                className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                                            >
                                                Kaldır
                                            </button>
                                        </div>

                                        <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-50">
                                            {a.kind === "video" ? (
                                                <video src={a.url} controls className="w-full h-40 object-cover" />
                                            ) : (
                                                <img src={a.url} className="w-full h-40 object-cover" alt="ref" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="rounded-3xl bg-blue-50 ring-1 ring-blue-100 p-4">
                            <div className="text-sm font-semibold text-blue-900">Kısa yönlendirme</div>
                            <div className="mt-1 text-sm text-blue-900/80">
                                Seçimleri yaptıktan sonra alttaki sohbete <span className="font-semibold">“üret”</span> yaz.
                                Backend gelince burada gerçek üretim başlatacağız.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation */}
            <div className="rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between">
                    <div>
                        <div className="font-semibold">Sohbet</div>
                        <div className="text-sm text-slate-600">
                            Karşılıklı konuşarak netleştirelim. (Ekstra buton yok, sadece yaz ve gönder.)
                        </div>
                    </div>
                    <span className="text-xs text-slate-500">
            İpucu: “üret” yaz → taslak çıktı akışı simüle olur
          </span>
                </div>

                <div className="p-6">
                    <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cx(
                                    "flex",
                                    m.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cx(
                                        "max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ring-1",
                                        m.role === "user"
                                            ? "bg-blue-600 text-white ring-blue-600"
                                            : "bg-white text-slate-900 ring-slate-200"
                                    )}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <ChatComposer onSend={onSend} />
                </div>
            </div>
        </div>
    );
}

function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
    const [value, setValue] = useState("");

    const send = () => {
        const t = value.trim();
        if (!t) return;
        onSend(t);
        setValue("");
    };

    return (
        <div className="mt-5 rounded-3xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-end gap-3">
      <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 min-h-[52px] max-h-[140px] rounded-2xl bg-white px-4 py-3 text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-200"
          placeholder='Mesaj yaz... (örn: "üret", "tonu eğlenceli yap", "kısalt")'
          onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
              }
          }}
      />
            <button
                onClick={send}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition shadow-sm"
            >
                Gönder
            </button>
        </div>
    );
}
