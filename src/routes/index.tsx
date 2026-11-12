import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CircleHelp, Mic, Plus, Search, Trash2, X } from "lucide-react";
import { CameraScan } from "@/components/CameraScan";
import { ONBOARDING_KEY, Onboarding } from "@/components/Onboarding";
import { supabase } from "@/integrations/supabase/client";
import { useItems } from "@/hooks/use-items";
import { useVoice } from "@/hooks/use-voice";
import { search } from "@/lib/search";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Catch up — Catálogo da equipe KET XUP" },
      { name: "description", content: "Pesquise por voz e descubra em segundos em qual barraca está cada objeto da gincana." },
      { property: "og:title", content: "Catch up — Catálogo da equipe KET XUP" },
      { property: "og:description", content: "Busca por voz para achar objetos em segundos entre as barracas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<"buscar" | "cadastrar">("buscar");
  const { items, loading } = useItems();
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) !== "true") setHelp(true);
  }, []);
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-10 pt-5">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Catch up KET XUP" className="h-12 w-auto" />
          <div>
            <h1 className="font-display text-3xl leading-none tracking-tight text-primary">Catch up</h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Equipe KET XUP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{loading ? "carregando…" : `${items.length} objetos`}</span>
          <button onClick={() => setHelp(true)} aria-label="Ajuda / Primeiros passos" className="p-1 text-primary"><CircleHelp className="h-6 w-6" /></button>
        </div>
      </header>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-card p-1">
        {(["buscar", "cadastrar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-2.5 font-semibold capitalize transition ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {m}
          </button>
        ))}
      </div>
      {help && <Onboarding onDone={() => setHelp(false)} />}
      {mode === "buscar" ? <SearchView items={items} /> : <AddView items={items} />}
    </main>
  );
}

function MicButton({ listening, onClick, size = "lg" }: { listening: boolean; onClick: () => void; size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "h-28 w-28" : "h-12 w-12";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? "Parar de ouvir" : "Falar"}
      className={`${dim} flex shrink-0 items-center justify-center rounded-full transition active:scale-95 ${listening ? "mic-live bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
    >
      <Mic className={size === "lg" ? "h-12 w-12" : "h-5 w-5"} />
    </button>
  );
}

function SearchView({ items }: { items: ReturnType<typeof useItems>["items"] }) {
  const [q, setQ] = useState("");
  const voice = useVoice((t) => setQ(t));
  const results = useMemo(() => search(items, q), [items, q]);
  const top = results[0];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2">
        {voice.supported ? (
          <>
            <MicButton listening={voice.listening} onClick={() => (voice.listening ? voice.stop() : (setQ(""), voice.start()))} />
            <p className="text-sm text-muted-foreground">{voice.listening ? "Ouvindo… diga o objeto" : "Toque e fale o objeto"}</p>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">Voz indisponível neste navegador — use o Chrome. Digite abaixo.</p>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ou digite: guarda-chuva…"
          className="h-14 w-full rounded-xl border bg-card pl-12 pr-12 text-lg outline-none focus:border-primary"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Limpar" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {q && !top && <p className="py-6 text-center text-muted-foreground">Nada encontrado para “{q}”.</p>}

      {top && (
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="text-sm font-semibold uppercase opacity-70">{top.name}</p>
          <p className="font-display text-5xl leading-tight">{top.tent}</p>
          {top.spot && <p className="mt-1 text-xl font-semibold">{top.spot}</p>}
        </div>
      )}
      {results.slice(1).map((i) => (
        <div key={i.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
          <span className="font-medium">{i.name}</span>
          <span className="text-right">
            <span className="font-display text-primary">{i.tent}</span>
            {i.spot && <span className="block text-xs text-muted-foreground">{i.spot}</span>}
          </span>
        </div>
      ))}
    </section>
  );
}

function AddView({ items }: { items: ReturnType<typeof useItems>["items"] }) {
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tent, setTent] = useState("");
  const [spot, setSpot] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cam, setCam] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const voice = useVoice((t) => setName(t));

  useEffect(() => {
    setTent(localStorage.getItem("tent") ?? "");
    setSpot(localStorage.getItem("spot") ?? "");
  }, []);

  const tents = useMemo(() => [...new Set(items.map((i) => i.tent))].sort(), [items]);
  const dup = useMemo(() => name.trim() && search(items, name, 1)[0], [items, name]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !tent.trim()) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("items").insert({ name: name.trim(), keywords: keywords.trim(), tent: tent.trim(), spot: spot.trim() });
    setSaving(false);
    if (error) return setError("Não foi possível salvar. Tente de novo.");
    localStorage.setItem("tent", tent.trim());
    localStorage.setItem("spot", spot.trim());
    setName("");
    setKeywords("");
    nameRef.current?.focus();
  }

  const field = "h-12 w-full rounded-xl border bg-card px-4 text-base outline-none focus:border-primary";

  return (
    <section className="flex flex-col gap-6">
      {cam ? (
        <CameraScan tent={tent} spot={spot} onClose={() => setCam(false)} />
      ) : (
        <button type="button" onClick={() => setCam(true)} className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary font-semibold text-primary">
          <Camera className="h-5 w-5" /> Cadastrar pela câmera
        </button>
      )}
      <form onSubmit={save} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted-foreground">
            Barraca
            <input list="tents" value={tent} onChange={(e) => setTent(e.target.value)} placeholder="Barraca 1" className={`${field} mt-1 text-foreground`} required />
            <datalist id="tents">{tents.map((t) => <option key={t} value={t} />)}</datalist>
          </label>
          <label className="text-sm text-muted-foreground">
            Local na barraca
            <input value={spot} onChange={(e) => setSpot(e.target.value)} placeholder="Caixa A" className={`${field} mt-1 text-foreground`} />
          </label>
        </div>
        <label className="text-sm text-muted-foreground">
          Objeto
          <div className="mt-1 flex gap-2">
            <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: guarda-chuva amarelo" className={`${field} text-foreground`} required autoFocus />
            {voice.supported && <MicButton size="sm" listening={voice.listening} onClick={() => (voice.listening ? voice.stop() : voice.start())} />}
          </div>
        </label>
        {dup && <p className="text-sm text-accent">Já existe: {dup.name} → {dup.tent}</p>}
        <label className="text-sm text-muted-foreground">
          Outros nomes (opcional)
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="sombrinha, chuva" className={`${field} mt-1 text-foreground`} />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={saving} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg text-primary-foreground disabled:opacity-60">
          <Plus className="h-5 w-5" /> {saving ? "Salvando…" : "Salvar objeto"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Últimos cadastrados</h2>
        <ul className="flex flex-col gap-2">
          {items.slice(0, 15).map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-card px-4 py-3">
              <span className="min-w-0 truncate">{i.name}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm text-primary">{i.tent}{i.spot && ` · ${i.spot}`}</span>
                <button aria-label={`Apagar ${i.name}`} onClick={() => confirm(`Apagar "${i.name}"?`) && supabase.from("items").delete().eq("id", i.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
