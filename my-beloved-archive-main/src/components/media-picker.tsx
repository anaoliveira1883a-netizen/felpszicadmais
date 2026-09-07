import { useRef, useState } from "react";
import { Field, inputClass } from "./archive-ui";

export function MediaPicker({
  imageUrl,
  onImageChange,
  audioUrl,
  onAudioChange,
  showAudio = false,
}: {
  imageUrl?: string;
  onImageChange: (url: string) => void;
  audioUrl?: string;
  onAudioChange?: (url: string) => void;
  showAudio?: boolean;
}) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Compress image on client side using Canvas to prevent localStorage quota exhaustion
  const processImageFile = (file: File) => {
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.72);
          onImageChange(compressed);
        } else {
          onImageChange(src);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        onImageChange(src);
        setIsCompressing(false);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const processAudioFile = (file: File) => {
    if (!onAudioChange) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      onAudioChange(src);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="card-object p-3.5 space-y-3 bg-secondary/50">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Mídia visual & áudio
        </span>
        <div className="flex gap-1 bg-card rounded-md p-0.5 border border-border">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`press px-2 py-0.5 text-[0.65rem] font-mono rounded ${
              tab === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Arquivo local
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`press px-2 py-0.5 text-[0.65rem] font-mono rounded ${
              tab === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Link URL
          </button>
        </div>
      </div>

      {tab === "file" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processImageFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="press flex-1 rounded-[var(--radius-sm)] border border-dashed border-border bg-paper px-3 py-2 text-xs font-mono text-center hover:bg-muted"
            >
              {isCompressing ? "Otimizando imagem..." : "📷 Escolher foto ou polaroid"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => onImageChange("")}
                className="press rounded-md border border-border px-2 py-2 text-xs text-destructive hover:bg-destructive/10"
                title="Remover foto"
              >
                ✕
              </button>
            )}
          </div>

          {showAudio && onAudioChange && (
            <div className="flex items-center gap-2">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processAudioFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="press flex-1 rounded-[var(--radius-sm)] border border-dashed border-border bg-paper px-3 py-2 text-xs font-mono text-center hover:bg-muted"
              >
                {audioUrl ? "🎵 Áudio carregado (alterar)" : "🎵 Enviar áudio / gravação (opcional)"}
              </button>
              {audioUrl && (
                <button
                  type="button"
                  onClick={() => onAudioChange("")}
                  className="press rounded-md border border-border px-2 py-2 text-xs text-destructive hover:bg-destructive/10"
                  title="Remover áudio"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Field label="URL da Imagem">
            <input
              className={inputClass}
              value={imageUrl ?? ""}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </Field>
          {showAudio && onAudioChange && (
            <Field label="URL do Áudio / Stream">
              <input
                className={inputClass}
                value={audioUrl ?? ""}
                onChange={(e) => onAudioChange(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3"
              />
            </Field>
          )}
        </div>
      )}

      {/* Image Preview Polaroid */}
      {imageUrl && (
        <div className="flex justify-center pt-1">
          <div className="polaroid max-w-[180px] rotate-1 shadow-md">
            <img
              src={imageUrl}
              alt="Pré-visualização"
              className="aspect-square w-full object-cover rounded-sm border border-border/40"
            />
            <p className="mt-1 text-center font-hand text-xs text-muted-foreground">
              foto anexada ♡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
