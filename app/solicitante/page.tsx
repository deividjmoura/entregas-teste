"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { TIPO_LABELS, URGENCIA_LABELS, type SolicitacaoDTO } from "@/lib/domain";

export default function SolicitantePage() {
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [minhas, setMinhas] = useState<SolicitacaoDTO[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [tipo, setTipo] = useState("COMPONENTE_FISICO");
  const [descricaoItem, setDescricaoItem] = useState("");
  const [localDestino, setLocalDestino] = useState("");
  const [urgencia, setUrgencia] = useState("MEDIA");

  useEffect(() => {
    const n = localStorage.getItem("entregas:nome");
    if (!n) {
      router.push("/");
      return;
    }
    setNome(n);
  }, [router]);

  const carregar = useCallback(async (n: string) => {
    const res = await fetch(`/api/solicitacoes?solicitanteNome=${encodeURIComponent(n)}`);
    if (res.ok) setMinhas(await res.json());
  }, []);

  useEffect(() => {
    if (!nome) return;
    carregar(nome);
    const interval = setInterval(() => carregar(nome), 3000);
    return () => clearInterval(interval);
  }, [nome, carregar]);

  async function abrirSolicitacao(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, descricaoItem, localDestino, urgencia, solicitanteNome: nome }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Falha ao abrir solicitação");
        return;
      }
      setDescricaoItem("");
      setLocalDestino("");
      setUrgencia("MEDIA");
      await carregar(nome);
    } finally {
      setEnviando(false);
    }
  }

  if (!nome) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">solicitante</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Olá, {nome}</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
        >
          trocar perfil
        </button>
      </header>

      <form onSubmit={abrirSolicitacao} className="mb-10 rounded-lg border border-panel-border bg-panel p-5">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-dim">
          Abrir urgência
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Urgência</label>
            <select
              value={urgencia}
              onChange={(e) => setUrgencia(e.target.value)}
              className="w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm text-ink"
            >
              {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Item</label>
          <input
            value={descricaoItem}
            onChange={(e) => setDescricaoItem(e.target.value)}
            placeholder="ex: resistor 10k"
            required
            className="w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim/60"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Local de destino</label>
          <input
            value={localDestino}
            onChange={(e) => setLocalDestino(e.target.value)}
            placeholder="ex: Linha de montagem 3"
            required
            className="w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim/60"
          />
        </div>

        {erro && <p className="mb-3 text-sm text-critical">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded bg-urgent px-4 py-2.5 font-display text-sm font-semibold text-bg transition hover:brightness-110 disabled:opacity-50"
        >
          {enviando ? "Abrindo..." : "Abrir urgência"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-dim">
          Suas solicitações
        </h2>
        {minhas.length === 0 && (
          <p className="text-sm text-dim">Nenhuma solicitação ainda.</p>
        )}
        <div className="space-y-2">
          {minhas.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded border border-panel-border bg-panel px-4 py-3"
            >
              <div>
                <div className="text-sm text-ink">{s.descricaoItem}</div>
                <div className="font-mono text-[11px] text-dim">
                  {s.localDestino} · {URGENCIA_LABELS[s.urgencia]}
                  {s.entregadorNome ? ` · ${s.entregadorNome}` : ""}
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
