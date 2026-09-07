import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { catMeta, type Category } from "@/lib/archive";
import { useArchive } from "@/lib/archive-context";
import { usePlayer } from "@/lib/player-context";
import { Chip, Field, HeartButton, inputClass } from "@/components/archive-ui";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do registro — Archive" },
      { name: "description", content: "Veja e edite os detalhes deste item do arquivo." },
      { property: "og:title", content: "Detalhe do registro — Archive" },
      { property: "og:description", content: "Um pedacinho guardado no arquivo pessoal." },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const { items, updateItem, removeItem, addItem, ready } = useArchive();
  const { playTrack, openTurntable } = usePlayer();
  const navigate = useNavigate();
  const item = items.find((i) => i.id === id);

  if (!ready) return <main className="px-4 pt-10 text-sm text-muted-foreground">abrindo…</main>;
  if (!item)
    return (
      <main className="px-4 pt-10">
        <p className="font-hand text-xl">Esse registro não está mais no arquivo.</p>
        <Link to="/" className="label-chip press mt-3 inline-block">
          voltar ao início
        </Link>
      </main>
    );

  const meta = catMeta(item.category);

  return (
    <main className="anim-box px-4 pt-6">
      <div className="flex items-center justify-between">
        <button onClick={() => history.back()} className="label-chip press bg-card">
          ← voltar
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{meta.kaomoji}</span>
          <HeartButton item={item} />
        </div>
      </div>

      {/* Image Preview if item has photo */}
      {item.image && (
        <div className="mt-4 flex justify-center">
          <div className="polaroid max-w-[280px] w-full rotate-[-1deg] shadow-lg">
            <img
              src={item.image}
              alt={item.title}
              className="aspect-square w-full object-cover rounded-sm border border-border/40"
            />
            <p className="mt-1 text-center font-hand text-sm text-muted-foreground">
              {item.title} ♡
            </p>
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <div className="card-object mt-4 p-4">
        <div className="flex items-center justify-between">
          <Chip>{meta.label}</Chip>
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold leading-tight">{item.title}</h1>
        {item.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground font-mono">{item.subtitle}</p>
        ) : null}

        {/* Music Play Button */}
        {item.category === "music" && (
          <button
            onClick={() => {
              playTrack(item);
              openTurntable();
            }}
            className="press mt-3 flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-xs font-bold text-primary-foreground shadow"
          >
            <span>▶</span> Tocar no Toca-Discos
          </button>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.status ? <Chip>{item.status}</Chip> : null}
          {item.date ? <Chip>{item.date}</Chip> : null}
          {item.place ? <Chip>{item.place}</Chip> : null}
          {item.tags.map((t) => (
            <span key={t} className="font-hand text-base">
              #{t}
            </span>
          ))}
        </div>
        {item.rating ? (
          <p className="mt-3 text-lg text-primary">{"★".repeat(item.rating)}</p>
        ) : null}
      </div>

      {item.reason ? (
        <div className="card-object mt-3 bg-secondary/80 p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            por que importa
          </p>
          <p className="mt-1 font-hand text-lg">{item.reason}</p>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3">
        <Field label="Observações & Memórias">
          <textarea
            rows={4}
            className={inputClass}
            value={item.notes ?? ""}
            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
            placeholder="escreva aqui observações, notas ou lembretes..."
          />
        </Field>
      </div>

      {/* "Ele mencionou isso" -> Convert to Gift button */}
      {item.category === "said" ? (
        <button
          onClick={() => {
            const gift = addItem({
              category: "gift" as Category,
              title: item.title,
              subtitle: "vindo de um comentário dele",
              status: "ideia",
              tags: ["presentes", "mencionado"],
            });
            toast.success("Ideia de presente criada a partir deste comentário!");
            navigate({ to: "/item/$id", params: { id: gift.id } });
          }}
          className="press mt-3 w-full rounded-[var(--radius)] bg-primary px-4 py-3 font-medium text-primary-foreground shadow"
        >
          🎁 Transformar em ideia de presente
        </button>
      ) : null}

      <button
        onClick={() => {
          if (confirm("Remover este registro do arquivo?")) {
            removeItem(item.id);
            toast.success("Item removido.");
            navigate({ to: "/c/$category", params: { category: item.category } });
          }
        }}
        className="press mt-4 w-full rounded-[var(--radius)] border border-border p-3 text-xs text-destructive hover:bg-destructive/10"
      >
        Excluir este registro
      </button>
    </main>
  );
}
