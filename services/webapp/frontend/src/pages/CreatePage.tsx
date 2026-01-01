import { useMemo, useState } from "react";
import { isLoggedIn } from "../lib/auth";
import { useNavigate } from "react-router-dom";

type VideoJob = {
  id: string;
  title: string;
  platform: string;
  status: "READY" | "RENDERING";
  watermark: boolean;
  createdAt: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function getJobs(): VideoJob[] {
  try {
    return JSON.parse(localStorage.getItem("videoJobs") || "[]") || [];
  } catch {
    return [];
  }
}
function setJobs(j: VideoJob[]) {
  localStorage.setItem("videoJobs", JSON.stringify(j));
}

export default function CreatePage() {
  const navigate = useNavigate();

  const [format, setFormat] = useState<"summary" | "top3" | "story">("summary");
  const [duration, setDuration] = useState("25–35 sn");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [tone, setTone] = useState("Enerjik");
  const [voice, setVoice] = useState("Erkek (TR)");
  const [captions, setCaptions] = useState("Auto + Highlight");
  const [prompt, setPrompt] = useState("");

  const finalPrompt = useMemo(() => {
    const typeText = format === "top3" ? "Top 3" : format === "story" ? "Story mode" : "Özet";
    return `Konu: ${prompt || "(boş)"}
Format: ${typeText}
Süre: ${duration}
Platform: ${platform}
Ton: ${tone}
Ses: ${voice}
Altyazı: ${captions}`;
  }, [prompt, format, duration, platform, tone, voice, captions]);

  function generateDemo() {
    const watermark = !isLoggedIn();
    if (!isLoggedIn()) {
      const used = localStorage.getItem("guestDemoUsed") === "true";
      if (used) {
        alert("Demo limit bitti. Üretmek için login olman gerekiyor.");
        navigate("/login");
        return;
      }
      localStorage.setItem("guestDemoUsed", "true");
    }

    const title = (prompt.trim() || "Untitled").slice(0, 42);
    const j: VideoJob = {
      id: uid(),
      title,
      platform,
      status: "READY",
      watermark,
      createdAt: Date.now(),
    };
    setJobs([j, ...getJobs()]);
    navigate("/app/library");
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Create</h1>
          <p className="text-white/60 mt-1">Prompt → ayarlar → generate (demo)</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="text-sm font-semibold">Prompt</div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="mt-3 w-full rounded-2xl bg-black/20 ring-1 ring-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-300/40"
                placeholder="Örn: 'Bu hafta yapay zekada en önemli 3 gelişme'..."
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select label="Format" value={format} onChange={(v) => setFormat(v as any)} options={["summary", "top3", "story"]} />
              <Select label="Duration" value={duration} onChange={setDuration} options={["15–20 sn", "25–35 sn", "45–60 sn"]} />
              <Select label="Platform" value={platform} onChange={setPlatform} options={["Instagram Reels", "TikTok", "YouTube Shorts"]} />
              <Select label="Tone" value={tone} onChange={setTone} options={["Enerjik", "Profesyonel", "Mizahi", "Minimal"]} />
              <Select label="Voice" value={voice} onChange={setVoice} options={["Erkek (TR)", "Kadın (TR)", "No voice"]} />
              <Select label="Captions" value={captions} onChange={setCaptions} options={["Auto + Highlight", "Auto", "Off"]} />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-xs text-white/50">
                Guest: 1 demo generate. Login: limits later.
              </div>
              <button
                  onClick={generateDemo}
                  className="rounded-xl bg-white px-4 py-2 text-slate-900 font-medium hover:bg-white/90 transition"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="text-sm font-semibold">Preview</div>
            <div className="mt-3 rounded-2xl bg-black/20 ring-1 ring-white/10 p-4">
              <div className="text-xs text-white/50">Generated prompt</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-white/80 leading-relaxed">{finalPrompt}</pre>
            </div>
          </div>
        </div>
      </div>
  );
}

function Select({
                  label,
                  value,
                  onChange,
                  options,
                }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
      <div>
        <div className="text-xs text-white/55">{label}</div>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-300/40"
        >
          {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
          ))}
        </select>
      </div>
  );
}
