"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nome, setNome] = useState("");

  function entrar(perfil: "solicitante" | "entregador") {
    if (!nome.trim()) return;
    localStorage.setItem("entregas:nome", nome.trim());
    localStorage.setItem("entregas:perfil", perfil);
    router.push(`/${perfil}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-dim">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-led rounded-full bg-urgent" />
            central de despacho
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-ink">
            Nenhum item entregue<br />duas vezes.
          </h1>
          <p className="mt-3 text-sm text-dim">
            Substitui rádio e WhatsApp por uma fila única, com atribuição
            travada por entregador em tempo real.
          </p>
        </div>

        <div className="rounded-lg border border-panel-border bg-panel p-6">
          <label className="mb-2 block font-mono text-xs uppercase tracking-wide text-dim">
            Seu nome
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex: Marcos Vinícius"
            className="mb-5 w-full rounded border border-panel-border bg-bg px-3 py-2 text-ink placeholder:text-dim/60 focus:border-progress"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => entrar("solicitante")}
              disabled={!nome.trim()}
              className="rounded border border-panel-border bg-bg px-4 py-3 text-left transition hover:border-progress disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="font-display text-sm font-semibold text-ink">Solicitante</div>
              <div className="mt-0.5 text-xs text-dim">Abrir e acompanhar urgência</div>
            </button>
            <button
              onClick={() => entrar("entregador")}
              disabled={!nome.trim()}
              className="rounded border border-panel-border bg-bg px-4 py-3 text-left transition hover:border-urgent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div className="font-display text-sm font-semibold text-ink">Entregador</div>
              <div className="mt-0.5 text-xs text-dim">Ver fila e assumir entregas</div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-dim">
          demo interna — sem login real ainda
        </p>
      </div>
    </main>
  );
}
