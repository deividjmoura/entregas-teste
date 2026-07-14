"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { ImageLightbox } from "@/components/image-lightbox";
import { OnlineBanner } from "@/components/online-banner";
import { SkeletonList, EmptyState } from "@/components/skeleton";
import { TIPO_LABELS, URGENCIA_LABELS, formatarHora, formatarDuracao, type SolicitacaoDTO } from "@/lib/domain";

export default function PainelPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<SolicitacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [carregouUmaVez, setCarregouUmaVez] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  const buscar = useCallback(async (termo: string) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (termo.trim()) params.set("q", termo.trim());
      const res = await fetch(`/api/solicitacoes?${params.toString()}`);
      if (res.ok) setResultados(await res.json());
    } finally {
      setCarregando(false);
      setCarregouUmaVez(true);
    }
  }, []);

  // Busca inicial (sem filtro, mostra as mais recentes) + debounce ao digitar
  useEffect(() => {
    const timeout = setTimeout(() => buscar(busca), 350);
    return () => clearTimeout(timeout);
  }, [busca, buscar]);

  // Sem gate de autenticação de propósito: essa tela é o painel público
  // de acompanhamento de fila (ex: TV no estoque), não precisa de login.

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col overflow-hidden px-6">
      <header className="mb-6 mt-10 flex shrink-0 items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">consulta geral</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Painel de solicitações</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
        >
          início
        </button>
      </header>

      <OnlineBanner />

      <div className="mb-6 shrink-0">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por item, local, rack/slide ou solicitante..."
          className="w-full rounded border border-panel-border bg-panel px-4 py-3 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60 focus:border-progress"
          autoFocus
        />
      </div>

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto pb-10 pr-1">
        {!carregouUmaVez && carregando && <SkeletonList count={6} />}

        {carregouUmaVez && !carregando && resultados.length === 0 && (
          <EmptyState
            icon="🔍"
            title="Nenhuma solicitação encontrada"
            subtitle={busca ? "Tente outro termo de busca" : "Ainda não há solicitações registradas"}
          />
        )}

        {resultados.length > 0 && (
          <div className="space-y-2">
            {resultados.map((s) => (
              <div key={s.id} className="rounded border border-panel-border bg-panel px-4 py-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {s.foto && (
                      <button
                        type="button"
                        onClick={() => setFotoAmpliada(s.foto)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-bg text-xs transition hover:bg-progress/20"
                        title="Ver foto"
                      >
                        📷
                      </button>
                    )}
                    <span className="text-sm text-ink">{s.descricaoItem}</span>
                  </div>
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
                  <span>·</span>
                  <span>aberto às {formatarHora(s.criadaEm)}</span>
                  {s.status === "PENDENTE" && (
                    <>
                      <span>·</span>
                      <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} />
                    </>
                  )}
                  {s.status === "ENTREGUE" && s.entregueEm && (
                    <>
                      <span>·</span>
                      <span>entregue às {formatarHora(s.entregueEm)}</span>
                      <span>·</span>
                      <span className="text-success">
                        levou {formatarDuracao(new Date(s.entregueEm).getTime() - new Date(s.criadaEm).getTime())}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox src={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </main>
  );
}