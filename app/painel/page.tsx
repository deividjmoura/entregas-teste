"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { TIPO_LABELS, URGENCIA_LABELS, type SolicitacaoDTO } from "@/lib/domain";
import { useAuthUser } from "@/lib/use-auth-user";

export default function PainelPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<SolicitacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(false);

  const buscar = useCallback(async (termo: string) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (termo.trim()) params.set("q", termo.trim());
      const res = await fetch(`/api/solicitacoes?${params.toString()}`);
      if (res.ok) setResultados(await res.json());
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca inicial (sem filtro, mostra as mais recentes) + debounce ao digitar
  useEffect(() => {
    const timeout = setTimeout(() => buscar(busca), 350);
    return () => clearTimeout(timeout);
  }, [busca, buscar]);

  if (user === undefined) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">consulta geral</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Painel de solicitações</h1>
        </div>
        <button
          onClick={() => router.back()}
          className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
        >
          voltar
        </button>
      </header>

      <div className="mb-6">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por item, local, rack/slide ou solicitante..."
          className="w-full rounded border border-panel-border bg-panel px-4 py-3 text-sm text-ink placeholder:text-dim/60 focus:border-progress"
          autoFocus
        />
      </div>

      {carregando && <p className="mb-3 font-mono text-[11px] text-dim">buscando...</p>}

      {!carregando && resultados.length === 0 && (
        <p className="rounded border border-panel-border bg-panel px-4 py-6 text-center text-sm text-dim">
          Nenhuma solicitação encontrada.
        </p>
      )}

      <div className="space-y-2">
        {resultados.map((s) => (
          <div
            key={s.id}
            className="rounded border border-panel-border bg-panel px-4 py-3"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-sm text-ink">{s.descricaoItem}</span>
              <StatusBadge status={s.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-dim">
              <span>{TIPO_LABELS[s.tipo]}</span>
              <span>·</span>
              <span>{s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}</span>
              <span>·</span>
              <span>{URGENCIA_LABELS[s.urgencia]}</span>
              <span>·</span>
              <span>solicitado por {s.solicitanteNome}</span>
              {s.entregadorNome && (
                <>
                  <span>·</span>
                  <span>entregador: {s.entregadorNome}</span>
                </>
              )}
              {s.status === "PENDENTE" && (
                <>
                  <span>·</span>
                  <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
