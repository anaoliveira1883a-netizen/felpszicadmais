import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { THEMES, type Settings } from "@/lib/archive";
import { useArchive } from "@/lib/archive-context";
import { Field, SectionTitle, inputClass } from "@/components/archive-ui";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Archive" },
      {
        name: "description",
        content: "Escolha temas, personalize cores, ajuste privacidade e exporte seus dados.",
      },
      { property: "og:title", content: "Configurações — Archive" },
      { property: "og:description", content: "Aparência, privacidade e dados do seu arquivo." },
    ],
  }),
  component: SettingsPage,
});

const WALLPAPERS: { key: Settings["wallpaper"]; label: string; desc: string }[] = [
  { key: "clean", label: "Limpo", desc: "Fundo analógico suave" },
  { key: "dots", label: "Pontilhado", desc: "Dots retrô minimalistas" },
  { key: "grid", label: "Caderno", desc: "Papel quadriculado clássico" },
  { key: "crt", label: "CRT Monitor", desc: "Scanlines de monitor antigo" },
  { key: "paper", label: "Pergaminho", desc: "Textura de papel envelhecido" },
];

function SettingsPage() {
  const { settings, updateSettings, items, resetAll } = useArchive();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify({ items, settings }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo de backup baixado com sucesso!");
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.items && Array.isArray(data.items)) {
          localStorage.setItem("archive.items.v1", JSON.stringify(data.items));
          if (data.settings) {
            localStorage.setItem("archive.settings.v1", JSON.stringify(data.settings));
          }
          toast.success("Backup importado com sucesso! Recarregando...");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error("Formato de backup inválido.");
        }
      } catch {
        toast.error("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="px-4 pt-6">
      <PageHeader
        title="Configurações"
        subtitle="personalização, privacidade & dados"
        kaomoji="[ ⚙ ]"
        backTo="/"
        backLabel="← arquivo"
      />

      <section className="mt-4 grid gap-3">
        <SectionTitle>identidade do arquivo</SectionTitle>
        <Field label="Nome do arquivo">
          <input
            className={inputClass}
            value={settings.archiveName}
            onChange={(e) => updateSettings({ archiveName: e.target.value })}
          />
        </Field>
        <Field label="Frase favorita do cabeçalho">
          <input
            className={inputClass}
            value={settings.favoriteQuote}
            onChange={(e) => updateSettings({ favoriteQuote: e.target.value })}
          />
        </Field>
      </section>

      {/* Themes */}
      <section className="mt-6">
        <SectionTitle>tema retrô</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                updateSettings({ theme: t.key });
                toast.success(`Tema "${t.label}" aplicado ♡`);
              }}
              className={`card-object press p-3 text-left text-sm ${
                settings.theme === t.key ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <span className="font-medium block">{t.label}</span>
              <span className="mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                {settings.theme === t.key ? "em uso ✓" : "aplicar"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Wallpapers */}
      <section className="mt-6">
        <SectionTitle>papel de parede (estilo 90s / MySpace)</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.key}
              onClick={() => {
                updateSettings({ wallpaper: w.key });
                toast.success(`Fundo "${w.label}" ativado`);
              }}
              className={`card-object press p-3 text-left text-sm ${
                (settings.wallpaper ?? "clean") === w.key ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <span className="font-medium block">{w.label}</span>
              <span className="mt-0.5 block font-mono text-[0.55rem] text-muted-foreground">
                {w.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Hue customizer */}
      <section className="mt-6">
        <SectionTitle>ajuste fino de tom</SectionTitle>
        <div className="card-object p-4">
          <input
            type="range"
            min={0}
            max={360}
            value={settings.hue ?? 30}
            onChange={(e) => updateSettings({ hue: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-primary shadow-sm" />
              <span className="font-mono text-xs text-muted-foreground">
                {settings.hue ? `${settings.hue}°` : "padrão"}
              </span>
            </div>
            <button
              onClick={() => updateSettings({ hue: null })}
              className="label-chip press bg-card"
            >
              redefinir tom
            </button>
          </div>
        </div>
      </section>

      {/* Toggles */}
      <section className="mt-6 grid gap-2">
        <SectionTitle>preferências & acessibilidade</SectionTitle>
        <Toggle
          label="Animações analógicas e microinterações"
          on={settings.animations}
          onChange={(v) => updateSettings({ animations: v })}
        />
        <Toggle
          label="Decorações (fitas, selos, carimbos)"
          on={settings.decorations}
          onChange={(v) => updateSettings({ decorations: v })}
        />
        <Toggle
          label="Modo privado (ocultar prévias)"
          on={settings.privacy}
          onChange={(v) => updateSettings({ privacy: v })}
        />
      </section>

      {/* Backup and Data */}
      <section className="mt-6 grid gap-2">
        <SectionTitle>dados & backup</SectionTitle>
        <button onClick={exportData} className="card-object press p-3 text-left text-sm flex items-center justify-between">
          <span>Exportar backup (.json)</span>
          <span className="font-mono text-xs text-muted-foreground">↓ download</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="card-object press p-3 text-left text-sm flex items-center justify-between"
        >
          <span>Restaurar backup (.json)</span>
          <span className="font-mono text-xs text-muted-foreground">↑ upload</span>
        </button>

        <button
          onClick={() => {
            if (confirm("Tem certeza que deseja apagar todo o arquivo? Esta ação é irreversível.")) {
              resetAll();
              toast.success("Arquivo resetado.");
            }
          }}
          className="card-object press p-3 text-left text-sm text-destructive hover:bg-destructive/10"
        >
          Apagar todos os dados do arquivo
        </button>
        <p className="px-1 text-xs text-muted-foreground font-mono">
          Suas informações ficam salvas de forma 100% privada neste aparelho.
        </p>
      </section>
    </main>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="card-object press flex items-center justify-between p-3 text-left text-sm"
    >
      <span>{label}</span>
      <span
        className={`grid h-6 w-11 items-center rounded-full border border-border px-0.5 transition-colors ${
          on ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`size-5 rounded-full bg-card transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}
