import { usePlayer } from "@/lib/player-context";

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, openTurntable, progress } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-x-0 bottom-18 z-40 mx-auto max-w-md px-3 pointer-events-none md:inset-x-auto md:right-6 md:bottom-6 md:w-80">
      <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-border/90 bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-transform active:scale-[0.99] relative overflow-hidden">
        {/* Track progress bar on bottom edge */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />

        {/* Vinyl disc thumbnail */}
        <button
          onClick={openTurntable}
          className="relative size-9 shrink-0 rounded-full border border-border bg-neutral-900 shadow flex items-center justify-center cursor-pointer"
          aria-label="Abrir toca-discos"
        >
          <div
            className="size-full rounded-full flex items-center justify-center text-xs"
            style={{
              animation: isPlaying ? "spin-disc 3s linear infinite" : "none",
            }}
          >
            🎵
          </div>
        </button>

        {/* Title and subtitle / click to open turntable */}
        <button
          onClick={openTurntable}
          className="min-w-0 flex-1 text-left cursor-pointer"
        >
          <p className="truncate text-xs font-semibold leading-tight text-foreground">
            {currentTrack.title}
          </p>
          <p className="mt-0.5 truncate font-mono text-[0.6rem] text-muted-foreground">
            {currentTrack.subtitle || "Tocando no toca-discos"}
          </p>
        </button>

        {/* Play / Pause button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="press size-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-mono font-bold shadow"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>
    </div>
  );
}
