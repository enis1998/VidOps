export default function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                <span className="text-lg font-semibold">VO</span>
            </div>
            <div className="leading-tight">
                <div className="text-sm text-white/70">VidOps</div>
                <div className="text-lg font-semibold">Prompt → Video → Publish</div>
            </div>
        </div>
    );
}
