import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "denied" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setState("sending");
    const { data: ok } = await supabase.rpc("is_email_allowed", { _email: clean });
    if (!ok) return setState("denied");
    const { error } = await supabase.auth.signInWithOtp({ email: clean, options: { emailRedirectTo: window.location.origin } });
    setState(error ? "error" : "sent");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4">
      <img src="/logo.png" alt="Catch up KET XUP" className="h-28 w-auto" />
      <div className="text-center">
        <h1 className="font-display text-4xl text-primary">Catch up</h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Equipe KET XUP</p>
      </div>
      {state === "sent" ? (
        <p className="rounded-xl bg-card p-4 text-center">Enviamos um link para <b>{email}</b>. Abra o e-mail neste aparelho e toque no link para entrar.</p>
      ) : (
        <form onSubmit={submit} className="flex w-full flex-col gap-3">
          <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setState("idle"); }} placeholder="seu@email.com" className="h-14 w-full rounded-xl border bg-card px-4 text-lg outline-none focus:border-primary" />
          {state === "denied" && <p className="text-sm text-destructive">Seu e-mail não tem acesso. Fale com o administrador.</p>}
          {state === "error" && <p className="text-sm text-destructive">Não foi possível enviar o link. Tente de novo.</p>}
          <button disabled={state === "sending"} className="h-14 rounded-xl bg-primary font-display text-lg text-primary-foreground disabled:opacity-60">
            {state === "sending" ? "Verificando…" : "Entrar"}
          </button>
        </form>
      )}
    </main>
  );
}
