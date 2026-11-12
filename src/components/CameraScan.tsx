import { useEffect, useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COCO_PT, boxColor } from "@/lib/vision";

type Found = { key: number; name: string; keywords: string; on: boolean };
type Model = { detect: (el: HTMLCanvasElement) => Promise<{ class: string; score: number; bbox: number[] }[]> };

export function CameraScan({ tent, spot, onClose }: { tent: string; spot: string; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const model = useRef<Model | null>(null);
  const [status, setStatus] = useState("Abrindo câmera…");
  const [found, setFound] = useState<Found[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (video.current) { video.current.srcObject = stream; await video.current.play(); }
        setStatus("Carregando reconhecimento (só na 1ª vez)…");
        await import("@tensorflow/tfjs");
        const coco = await import("@tensorflow-models/coco-ssd");
        model.current = (await coco.load({ base: "lite_mobilenet_v2" })) as unknown as Model;
        setStatus("");
      } catch {
        setStatus("Não foi possível abrir a câmera. Permita o acesso e tente de novo.");
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  async function scan() {
    const v = video.current;
    if (!v || !model.current) return;
    setBusy(true);
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(v, 0, 0);
    const preds = (await model.current.detect(c)).filter((p) => p.score > 0.45 && p.class !== "person");
    setFound(preds.map((p, i) => {
      const base = COCO_PT[p.class] ?? p.class;
      const color = boxColor(ctx, p.bbox);
      return { key: Date.now() + i, name: `${base} ${color}`, keywords: `${base}, ${color}, ${p.class}`, on: true };
    }));
    setStatus(preds.length ? "" : "Nenhum objeto reconhecido. Aproxime ou mude o ângulo.");
    setBusy(false);
  }

  async function saveAll() {
    const rows = found.filter((f) => f.on && f.name.trim()).map((f) => ({ name: f.name.trim(), keywords: f.keywords, tent: tent.trim(), spot: spot.trim() }));
    if (!rows.length) return;
    setBusy(true);
    const { error } = await supabase.from("items").insert(rows);
    setBusy(false);
    if (error) return setStatus("Não foi possível salvar. Tente de novo.");
    setFound([]);
    setStatus(`${rows.length} objeto(s) salvos em ${tent}.`);
  }

  const upd = (key: number, patch: Partial<Found>) => setFound((cur) => cur.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Câmera → {tent || "escolha a barraca"}</p>
        <button onClick={onClose} aria-label="Fechar câmera" className="p-1 text-muted-foreground"><X className="h-5 w-5" /></button>
      </div>
      <video ref={video} playsInline muted className="aspect-[4/3] w-full rounded-xl bg-foreground object-cover" />
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
      <button onClick={scan} disabled={busy || !model.current || !tent.trim()} className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg text-primary-foreground disabled:opacity-60">
        <Camera className="h-5 w-5" /> Identificar objetos
      </button>
      {found.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {found.map((f) => (
              <li key={f.key} className="flex items-center gap-2">
                <input type="checkbox" checked={f.on} onChange={(e) => upd(f.key, { on: e.target.checked })} className="h-5 w-5 accent-primary" />
                <input value={f.name} onChange={(e) => upd(f.key, { name: e.target.value })} className="h-11 w-full rounded-lg border bg-background px-3 outline-none focus:border-primary" />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">Corrija o nome se precisar (ex.: “garrafa azul de água”).</p>
          <button onClick={saveAll} disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">
            <Check className="h-5 w-5" /> Salvar marcados
          </button>
        </>
      )}
    </div>
  );
}
