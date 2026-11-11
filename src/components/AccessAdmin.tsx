import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AccessAdmin({ me }: { me: string }) {
  const [list, setList] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase.from("allowed_emails").select("email").order("created_at");
    setList((data ?? []).map((r) => r.email));
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const v = email.trim().toLowerCase();
    if (!v) return;
    const { error } = await supabase.from("allowed_emails").insert({ email: v });
    if (error) return setError("Não foi possível adicionar (já está na lista?).");
    setEmail("");
    load();
  }

  async function remove(v: string) {
    if (!confirm(`Remover acesso de ${v}?`)) return;
    await supabase.from("allowed_emails").delete().eq("email", v);
    load();
  }

  return (
    <section className="flex flex-col gap-4">
      <form onSubmit={add} className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@da-pessoa.com" className="h-12 min-w-0 flex-1 rounded-xl border bg-card px-4 outline-none focus:border-primary" />
        <button className="h-12 rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Liberar</button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="flex flex-col gap-2">
        {list.map((v) => (
          <li key={v} className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
            <span className="truncate">{v}</span>
            {v !== me && (
              <button aria-label={`Remover ${v}`} onClick={() => remove(v)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
