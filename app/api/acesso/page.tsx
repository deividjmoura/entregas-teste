"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AcessoPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      if (!res.ok) {
        setErro("Código inválido");
        return;
      }
      router.push(params.get("redirect") || "/");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={confirmar} className="w-full max-w-xs rounded-2xl border border-panel-border bg-panel p-6">
        <h1 className="mb-1 font-display text-base font-semibold text-ink">Acesso restrito</h1>
        <p className="mb-4 font-mono text-xs text-dim">Digite o código de acesso fornecido pela sua empresa.</p>
        <input
          autoFocus
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="mb-3 w-full rounded-xl border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent/60"
          placeholder="Código de acesso"
        />
        {erro && <p className="mb-3 text-xs text-critical">{erro}</p>}
        <button
          disabled={enviando || !codigo}
          className="w-full rounded-xl bg-accent px-4 py-2 font-display text-sm font-semibold text-white disabled:opacity-50"
        >
          {enviando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}