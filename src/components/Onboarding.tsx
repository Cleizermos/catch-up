import { useState } from "react";
import { Camera, Mic, Search, Users } from "lucide-react";

const STEPS = [
  { icon: Mic, title: "Ache em segundos", text: "Na aba Buscar, toque no microfone e fale o objeto que o apresentador pediu. A barraca e o local aparecem na hora." },
  { icon: Search, title: "Ou digite", text: "Sem voz? Digite o nome. Acentos, plural e erros pequenos não atrapalham." },
  { icon: Camera, title: "Cadastre rápido", text: "Na aba Cadastrar, escolha a barraca e fale o nome — ou use a câmera para cadastrar vários objetos de uma vez." },
  { icon: Users, title: "Tudo em equipe", text: "O que um cadastra aparece na hora para todos. Divida as barracas entre o time e preencha “outros nomes”." },
];

export const ONBOARDING_KEY = "has_seen_onboarding";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i]!;
  const last = i === STEPS.length - 1;
  const finish = () => { localStorage.setItem(ONBOARDING_KEY, "true"); onDone(); };
  const Icon = step.icon;
  return (
    <div role="dialog" aria-modal="true" aria-label="Primeiros passos" className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-xl">
        <div className="mb-5 flex justify-end">
          {!last && <button onClick={finish} className="text-sm font-semibold text-muted-foreground">Pular</button>}
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-10 w-10" /></div>
          <h2 className="font-display text-3xl text-primary">{step.title}</h2>
          <p className="text-base text-muted-foreground">{step.text}</p>
        </div>
        <div className="my-6 flex justify-center gap-2">
          {STEPS.map((_, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={`Passo ${n + 1}`} className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-primary" : "w-2 bg-border"}`} />
          ))}
        </div>
        <button onClick={() => (last ? finish() : setI(i + 1))} className="h-14 w-full rounded-xl bg-primary font-display text-lg text-primary-foreground">
          {last ? "Começar" : "Próximo"}
        </button>
      </div>
    </div>
  );
}
