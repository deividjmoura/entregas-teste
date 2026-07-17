"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { StatusBadge, UrgencyDot } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { ImageLightbox } from "@/components/image-lightbox";
import { OnlineBanner } from "@/components/online-banner";
import { SkeletonList, EmptyState } from "@/components/skeleton";
import { LocationCard } from "@/components/location-card";
import {
  TIPO_LABELS,
  URGENCIA_LABELS,
  URGENCIA_PESO,
  URGENCIA_COR,
  formatarHora,
  formatarDuracao,
  corParaLocal,
  mesmoDia,
  type SolicitacaoDTO,
} from "@/lib/domain";
import { useOptionalAuthUser } from "@/lib/use-optional-auth-user";
import { auth } from "@/lib/firebase";

const POLL_MS = 4000;

function ordenarGrupo(lista: SolicitacaoDTO[]): SolicitacaoDTO[] {
  return [...lista].sort((a, b) => {
    const pesoDiff = URGENCIA_PESO[b.urgencia] - URGENCIA_PESO[a.urgencia];
    if (pesoDiff !== 0) return pesoDiff;
    return new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime();
  });
}

export default function PainelPage() {
  const router = useRouter();
  const user = useOptionalAuthUser();
  const [perfil, setPerfil] = useState<string | null>(null);

  const [ativos, setAtivos] = useState<SolicitacaoDTO[]>([]);
  const [entreguesRecentes, setEntreguesRecentes] = useState<SolicitacaoDTO[]>([]);
  const [carregandoDashboard, setCarregandoDashboard] = useState(true);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [desde, setDesde] = useState("");
  const [ate, setAte] = useState("");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [resultadosBusca, setResultadosBusca] = useState<SolicitacaoDTO[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  const temFiltro = Boolean(busca.trim() || desde || ate);

  useEffect(() => {
    setPerfil(localStorage.getItem("entregas:perfil"));
  }, []);

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  const carregarDashboard = useCallback(async () => {
    const [resPendente, resEmCurso, resEntregue] = await Promise.all([
      fetch("/api/solicitacoes?status=PENDENTE&limit=200"),
      fetch("/api/solicitacoes?status=EM_CURSO&limit=200"),
      fetch("/api/solicitacoes?status=ENTREGUE&limit=200"),
    ]);
    const pendentes = resPendente.ok ? await resPendente.json() : [];
    const emCurso = resEmCurso.ok ? await resEmCurso.json() : [];
    const entregues = resEntregue.ok ? await resEntregue.json() : [];

    setAtivos([...pendentes, ...emCurso]);
    // Filtra client-side pelas entregues HOJE (entregueEm), já que o
    // endpoint só filtra por criadaEm.
    setEntreguesRecentes(
      (entregues as SolicitacaoDTO[]).filter((s) => s.entregueEm && mesmoDia(s.entregueEm)),
    );
    setCarregandoDashboard(false);
  }, []);

  useEffect(() => {
    if (temFiltro) return;
    carregarDashboard();
    const interval = setInterval(carregarDashboard, POLL_MS);
    return () => clearInterval(interval);
  }, [temFiltro, carregarDashboard]);

  useEffect(() => {
    if (!temFiltro) {
      setResultadosBusca(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setBuscando(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (busca.trim()) params.set("q", busca.trim());
        if (desde) params.set("desde", new Date(desde).toISOString());
        if (ate) params.set("ate", new Date(ate).toISOString());
        const res = await fetch(`/api/solicitacoes?${params.toString()}`);
        if (res.ok) setResultadosBusca(await res.json());
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [busca, desde, ate, temFiltro]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, SolicitacaoDTO[]>();
    for (const s of ativos) {
      const lista = mapa.get(s.localDestino) ?? [];
      lista.push(s);
      mapa.set(s.localDestino, lista);
    }
    return Array.from(mapa.entries())
      .map(([local, lista]) => ({
        local,
        lista: ordenarGrupo(lista),
        temLinhaParada: lista.some((s) => s.urgencia === "LINHA_PARADA"),
      }))
      .sort((a, b) => {
        if (a.temLinhaParada !== b.temLinhaParada) return a.temLinhaParada ? -1 : 1;
        return a.local.localeCompare(b.local);
      });
  }, [ativos]);

  const rotasHoje = useMemo(
    () => Array.from(new Set(entreguesRecentes.map((s) => s.localDestino))),
    [entreguesRecentes],
  );

  return (
    <main className="mx-auto flex h-screen max-w-4xl flex-col overflow-hidden px-6">
      <header className="mb-6 mt-10 flex shrink-0 items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">dashboard</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Painel de despacho</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && perfil && (
            <button
              onClick={() => router.push(`/${perfil}`)}
              className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
            >
              voltar
            </button>
          )}
          {user ? (
            <button onClick={sair} className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink">
              sair
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
            >
              início
            </button>
          )}
        </div>
      </header>

      <OnlineBanner />

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto pb-10 pr-1">
        {/* Resumo do dia */}
        <div className="mb-6 grid shrink-0 grid-cols-2 gap-3">
          <div className="rounded border border-panel-border bg-panel px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-wide text-dim">entregas hoje</div>
            <div className="font-display text-2xl font-semibold text-success">{entreguesRecentes.length}</div>
          </div>
          <div className="rounded border border-panel-border bg-panel px-4 py-3">
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-dim">rotas atendidas hoje</div>
            <div className="flex flex-wrap gap-1">
              {rotasHoje.length === 0 && <span className="font-mono text-xs text-dim">—</span>}
              {rotasHoje.map((r) => (
                <span
                  key={r}
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-bg"
                  style={{ backgroundColor: corParaLocal(r) }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Busca / período — colapsada, não carrega nada até ter filtro */}
        <div className="mb-6 shrink-0 rounded border border-panel-border bg-panel">
          <button
            type="button"
            onClick={() => setFiltroAberto((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-xs uppercase tracking-wide text-dim hover:text-ink"
          >
            🔍 Buscar no histórico / por período
            <span className={`transition-transform ${filtroAberto ? "rotate-180" : ""}`}>▾</span>
          </button>
          {filtroAberto && (
            <div className="space-y-3 border-t border-panel-border px-4 py-4">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por item, local, rack/slide ou solicitante..."
                className="w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60 focus:border-progress"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase text-dim">De</label>
                  <input
                    type="datetime-local"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="w-full rounded border border-panel-border bg-bg px-2 py-2 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Até</label>
                  <input
                    type="datetime-local"
                    value={ate}
                    onChange={(e) => setAte(e.target.value)}
                    className="w-full rounded border border-panel-border bg-bg px-2 py-2 text-xs text-ink"
                  />
                </div>
              </div>
              {temFiltro && (
                <button
                  onClick={() => {
                    setBusca("");
                    setDesde("");
                    setAte("");
                  }}
                  className="font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink"
                >
                  limpar filtro
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modo busca: lista plana de resultados */}
        {temFiltro && (
          <>
            {buscando && resultadosBusca === null && <SkeletonList count={5} />}
            {resultadosBusca !== null && resultadosBusca.length === 0 && !buscando && (
              <EmptyState icon="🔍" title="Nenhuma solicitação encontrada" subtitle="Tente outro termo ou período" />
            )}
            {resultadosBusca !== null && resultadosBusca.length > 0 && (
              <div className="space-y-2">
                {resultadosBusca.map((s) => (
                  <div key={s.id} className="rounded border border-panel-border bg-panel px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s.foto && (
                          <button
                            type="button"
                            onClick={() => setFotoAmpliada(s.foto)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-bg text-xs hover:bg-progress/20"
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
          </>
        )}

        {/* Modo dashboard: cards por local */}
        {!temFiltro && (
          <>
            {carregandoDashboard && <SkeletonList count={4} />}

            {!carregandoDashboard && grupos.length === 0 && (
              <EmptyState icon="✅" title="Nenhuma solicitação ativa" subtitle="A fila está limpa no momento" />
            )}

            {!carregandoDashboard && grupos.length > 0 && (
              <div className="space-y-3">
                {grupos.map(({ local, lista, temLinhaParada }) => (
                  <LocationCard
                    key={local}
                    local={local}
                    cor={corParaLocal(local)}
                    contagem={lista.length}
                    temLinhaParada={temLinhaParada}
                  >
                    {lista.map((s) => (
                      <div key={s.id} className="rounded border border-panel-border/60 bg-bg/40 px-3 py-2">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UrgencyDot
                              pulse={s.urgencia === "CRITICA" || s.urgencia === "LINHA_PARADA"}
                              color={URGENCIA_COR[s.urgencia]}
                            />
                            {s.foto && (
                              <button
                                type="button"
                                onClick={() => setFotoAmpliada(s.foto)}
                                className="text-xs"
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
                          {s.rackOuSlide && (
                            <>
                              <span>{s.rackOuSlide}</span>
                              <span>·</span>
                            </>
                          )}
                          <span style={{ color: URGENCIA_COR[s.urgencia] }}>{URGENCIA_LABELS[s.urgencia]}</span>
                          <span>·</span>
                          <span>{s.solicitanteNome}</span>
                          {s.entregadorNome && (
                            <>
                              <span>·</span>
                              <span>{s.entregadorNome}</span>
                            </>
                          )}
                          <span>·</span>
                          <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} />
                        </div>
                      </div>
                    ))}
                  </LocationCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ImageLightbox src={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </main>
  );
}