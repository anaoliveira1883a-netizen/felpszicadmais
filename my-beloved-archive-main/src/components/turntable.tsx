import { usePlayer } from "@/lib/player-context";
import { catMeta, type Item } from "@/lib/archive";

export function Turntable({ track, onClose }: { track?: Item | null; onClose?: () => void }) {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    rpm,
    volume,
    togglePlay,
    seek,
    setRpm,
    setVolume,
  } = usePlayer();

  const active = track ?? currentTrack;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const spinDuration = rpm === 45 ? "1.33s" : "1.8s";

  return (
    <div className="card-object relative overflow-hidden rounded-xl border border-border bg-paper p-5 shadow-2xl">
      {/* Top Header / Brand Plate */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-foreground font-semibold">
            HI-FI STEREO TURNTABLE · MODEL T-1994
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar toca-discos"
            className="press rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ✕ minimizar
          </button>
        )}
      </div>

      {/* Turntable Platter and Mechanical Tonearm Area */}
      <div className="relative mt-4 flex flex-col md:flex-row items-center justify-center gap-6 py-2">
        {/* Vinyl Platter */}
        <div className="relative size-60 sm:size-68 shrink-0 rounded-full border-4 border-foreground/20 bg-neutral-950 p-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.9),0_10px_25px_rgba(0,0,0,0.5)]">
          {/* Concentric Vinyl Sound Grooves */}
          <div
            className="relative size-full rounded-full flex items-center justify-center transition-transform"
            style={{
              animation: isPlaying ? `spin-disc ${spinDuration} linear infinite` : "none",
              backgroundImage:
                "repeating-radial-gradient(circle, rgba(255,255,255,0.06) 0, rgba(255,255,255,0.06) 1px, transparent 2px, transparent 4px)",
            }}
          >
            {/* Vinyl Sheen Reflection Effect */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />

            {/* Center Record Label Sticker */}
            <div className="size-24 rounded-full border-2 border-border bg-primary/90 p-2 text-center text-primary-foreground shadow-inner flex flex-col items-center justify-center overflow-hidden">
              <span className="text-xl">🎵</span>
              <p className="w-20 truncate font-mono text-[0.55rem] font-bold uppercase tracking-wider">
                {active?.title || "ARCHIVE"}
              </p>
              <p className="w-20 truncate text-[0.5rem] opacity-80">
                {active?.subtitle || "Side A · 33 RPM"}
              </p>
              {/* Spindle Hole */}
              <div className="size-3 rounded-full border border-black/40 bg-zinc-300 mt-0.5 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Tonearm (Mechanical Arm with Stylus / Needle) */}
        <div className="relative h-48 w-24 shrink-0 hidden sm:block">
          {/* Tonearm Pivot Base */}
          <div className="absolute right-4 top-2 size-8 rounded-full border border-border bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-md">
            <div className="absolute inset-2 rounded-full bg-neutral-700" />
          </div>

          {/* Metal Arm Shaft */}
          <div
            className="absolute right-7 top-6 origin-top transition-transform duration-700 ease-out"
            style={{
              transform: isPlaying ? "rotate(-24deg)" : "rotate(0deg)",
              height: "150px",
              width: "4px",
            }}
          >
            {/* Metal Arm Rod */}
            <div className="h-full w-full rounded-full bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 shadow" />

            {/* Cartridge & Needle Head */}
            <div className="absolute -bottom-2 -left-2.5 h-6 w-5 rounded-sm bg-neutral-800 border border-amber-600/70 shadow-md flex items-center justify-center">
              <div className="h-1 w-2 bg-amber-400 rounded-full" />
            </div>
          </div>

          {/* Arm Rest Cradle */}
          <div className="absolute right-6 bottom-4 h-3 w-5 rounded-sm border border-neutral-600 bg-neutral-400" />
        </div>
      </div>

      {/* VFD / LCD Phosphor Digital Display */}
      <div className="mt-4 rounded-lg border border-primary/40 bg-neutral-950 p-3 text-primary-foreground font-mono shadow-inner">
        <div className="flex items-center justify-between text-[0.68rem] text-emerald-400">
          <span className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-neutral-600"}`} />
            {isPlaying ? "PLAYING [AUDIO OK]" : "STANDBY [PAUSED]"}
          </span>
          <span className="tracking-widest">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <p className="truncate text-base font-bold tracking-wide text-emerald-300">
            {active ? active.title : "Nenhuma faixa selecionada"}
          </p>
          <span className="text-xs text-emerald-400/80 uppercase ml-2 shrink-0">
            {rpm} RPM · STEREO
          </span>
        </div>
        {active?.subtitle && (
          <p className="truncate text-xs text-emerald-400/70">{active.subtitle}</p>
        )}

        {/* Vintage Stereo VU-Meter Bar simulation */}
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[0.55rem] text-emerald-500 font-bold w-4">L</span>
          <div className="flex flex-1 gap-0.5 h-1.5 bg-neutral-900 rounded overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={`l-${i}`}
                className={`flex-1 transition-opacity duration-100 ${
                  i < 12
                    ? "bg-emerald-500"
                    : i < 15
                    ? "bg-amber-400"
                    : "bg-red-500"
                }`}
                style={{
                  opacity: isPlaying && i < (Math.sin(currentTime * 4 + i) * 6 + 10) ? 1 : 0.15,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="text-[0.55rem] text-emerald-500 font-bold w-4">R</span>
          <div className="flex flex-1 gap-0.5 h-1.5 bg-neutral-900 rounded overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={`r-${i}`}
                className={`flex-1 transition-opacity duration-100 ${
                  i < 12
                    ? "bg-emerald-500"
                    : i < 15
                    ? "bg-amber-400"
                    : "bg-red-500"
                }`}
                style={{
                  opacity: isPlaying && i < (Math.cos(currentTime * 3 + i) * 6 + 9) ? 1 : 0.15,
                }}
              />
            ))}
          </div>
        </div>

        {/* Interactive Seek Bar */}
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={100}
            value={progress || 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* Tactile Hardware Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* RPM Speed Selector */}
        <div className="flex items-center gap-1.5 bg-secondary/80 p-1 rounded-md border border-border">
          <button
            onClick={() => setRpm(33)}
            className={`press px-2.5 py-1 text-xs font-mono font-bold rounded ${
              rpm === 33
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            33 RPM
          </button>
          <button
            onClick={() => setRpm(45)}
            className={`press px-2.5 py-1 text-xs font-mono font-bold rounded ${
              rpm === 45
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            45 RPM
          </button>
        </div>

        {/* Central Play/Pause Tactile Switch */}
        <button
          onClick={togglePlay}
          className="press flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mono text-sm font-bold text-primary-foreground shadow-lg hover:brightness-110"
        >
          <span>{isPlaying ? "❚❚" : "▶"}</span>
          <span>{isPlaying ? "PAUSAR" : "TOCAR"}</span>
        </button>

        {/* Volume Knobs */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-primary"
          />
        </div>
      </div>
    </div>
  );
}
