import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "out" | "denied" | "in";

export function AccessGate({ children }: { children: (s: { isAdmin: boolean; email: string }) => ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<State>("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION" || event === "USER_UPDATED") setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return alive && setState("out");
      const [{ data: ok }, { data: admin }] = await Promise.all([
        supabase.rpc("is_allowed"),
        supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" }),
      ]);
      if (!alive) return;
      setIsAdmin(!!admin);
      setState(ok ? "in" : "denied");
    })();
    return () => { alive = false; };
  }, [session?.user?.id]);

  if (state === "loading") return <p className="py-20 text-center text-muted-foreground">carregando…</p>;
  if (state === "in") return <>{children({ isAdmin, email: session?.user?.email ?? "" })}</>;
  return <SignIn denied={state === "denied"} />;
}

function SignIn({ denied }: { denied: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return setError("Este e-mail não tem acesso. Peça ao administrador da equipe.");
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/logo.png" alt="Catch up KET XUP" className="h-24 w-auto" />
        <h1 className="font-display text-4xl text-primary">Catch up</h1>
        <p className="text-sm text-muted-foreground">Acesso restrito à equipe KET XUP</p>
      </div>
      {denied ? (
        <div className="flex flex-col gap-3 text-center">
          <p>Seu e-mail não está liberado.</p>
          <button onClick={() => supabase.auth.signOut()} className="h-12 rounded-xl border font-semibold">Sair</button>
        </div>
      ) : sent ? (
        <p className="rounded-xl bg-card p-4 text-center">Enviamos um link para <b>{email}</b>. Abra seu e-mail e toque no link para entrar.</p>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="h-14 rounded-xl border bg-card px-4 text-lg outline-none focus:border-primary" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button disabled={busy} className="h-14 rounded-xl bg-primary font-display text-lg text-primary-foreground disabled:opacity-60">{busy ? "Enviando…" : "Receber link de acesso"}</button>
        </form>
      )}
    </main>
  );
}
