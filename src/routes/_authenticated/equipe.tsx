import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe — Catch up KET XUP" },
      { name: "description", content: "Libere ou remova e-mails com acesso ao Catch up." },
      { property: "og:title", content: "Equipe — Catch up KET XUP" },
      { property: "og:description", content: "Gerencie quem acessa o catálogo da equipe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Equipe,
});

function Equipe() {
  const [list, setList] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("allowed_emails").select("email").order("email");
    setList((data ?? []).map((r) => r.email));
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const { error } = await supabase.from("allowed_emails").insert({ email: clean });
    setMsg(error ? (error.code === "23505" ? "Esse e-mail já está liberado." : "Só o administrador pode liberar e-mails.") : "");
    if (!error) { setEmail(""); load(); }
  }
  async function remove(em: string) {
    if (!confirm(`Remover acesso de ${em}?`)) return;
    await supabase.from("allowed_emails").delete().eq("email", em);
    load();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-4 pb-10 pt-5">
      <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      <h1 className="font-display text-3xl text-primary">Equipe</h1>
      <form onSubmit={add} className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="novo@email.com" className="h-12 flex-1 rounded-xl border bg-card px-4 outline-none focus:border-primary" />
        <button className="rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Liberar</button>
      </form>
      {msg && <p className="text-sm text-destructive">{msg}</p>}
      <ul className="flex flex-col gap-2">
        {list.map((em) => (
          <li key={em} className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
            <span className="truncate">{em}</span>
            <button aria-label={`Remover ${em}`} onClick={() => remove(em)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </main>
  );
}
