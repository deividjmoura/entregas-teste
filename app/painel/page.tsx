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
import { Topbar } from "@/components/topbar";
import { MetricCard } from "@/components/metric-card";
import { Card } from "@/components/ui/card";
import { IconRequests, IconTruck, IconUsers, IconDashboard } from "@/components/icons";
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
import { useFotoAmpliada } from "@/lib/use-foto-ampliada";
import { auth } from "@/lib/firebase";

const POLL_MS = 4000;

type FiltroRapido = "PENDENTE" | "EM_CURSO" | "ENTREGUE" | "ROTAS" | null;

const FILTRO_LABELS: Record<Exclude<FiltroRapido, null>, string> = {
  PENDENTE: "Pendentes na fila",
  EM_CURSO: "Em curso",
  ENTREGUE: "Entregas de hoje",
  ROTAS: "Rotas atendidas hoje",
};

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
  const { foto: fotoAmpliada, carregando: carregandoFoto, abrir: abrirFoto, fechar: fecharFoto } = useFotoAmpliada();

  const [busca, setBusca] = useState("");
  const [desde, setDesde] = useState("");
  const [ate, setAte] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<SolicitacaoDTO[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>(null);

  const buscaValida = busca.trim().length >= 5;
  const temFiltroBusca = Boolean(buscaValida || desde || ate);

  useEffect(() => {
    setPerfil(localStorage.getItem("entregas:perfil"));
  }, []);

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  function limparFiltro() {
    setBusca("");
    setDesde("");
    setAte("");
  }

  function alternarFiltroRapido(valor: Exclude<FiltroRapido, null>) {
    setBusca("");
    setDesde("");
    setAte("");
    setFiltroRapido((atual) => (atual === valor ? null : valor));
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
    setEntreguesRecentes(
      (entregues as SolicitacaoDTO[]).filter((s) => s.entregueEm && mesmoDia(s.entregueEm)),
    );
    setCarregandoDashboard(false);
  }, []);

  useEffect(() => {
    carregarDashboard();
    const interval = setInterval(carregarDashboard, POLL_MS);
    return () => clearInterval(interval);
  }, [carregarDashboard]);

  useEffect(() => {
    if (!temFiltroBusca) {
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
  }, [busca, desde, ate, temFiltroBusca]);

  // Quando ha filtro rapido de status, restringe os grupos so aquele status;
  // sem filtro, mantem o comportamento original (PENDENTE + EM_CURSO juntos).
  const gruposBase = useMemo(() => {
    if (filtroRapido === "PENDENTE") return ativos.filter((s) => s.status === "PENDENTE");
    if (filtroRapido === "EM_CURSO") return ativos.filter((s) => s.status === "EM_CURSO");
    if (filtroRapido === "ENTREGUE" || filtroRapido === "ROTAS") return [];
    return ativos;
  }, [ativos, filtroRapido]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, SolicitacaoDTO[]>();
    for (const s of gruposBase) {
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
  }, [gruposBase]);

  const rotasHoje = useMemo(
    () => Array.from(new Set(entreguesRecentes.map((s) => s.localDestino))),
    [entreguesRecentes],
  );

  const entregasPorRota = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of entreguesRecentes) {
      mapa.set(s.localDestino, (mapa.get(s.localDestino) ?? 0) + 1);
    }
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [entreguesRecentes]);

  const pendentesCount = useMemo(() => ativos.filter((s) => s.status === "PENDENTE").length, [ativos]);
  const emCursoCount = useMemo(() => ativos.filter((s) => s.status === "EM_CURSO").length, [ativos]);

  const mostrandoFiltroRapido = filtroRapido !== null;

  return (
    <div className="min-h-screen bg-bg">
      <Topbar
        titulo="Painel de despacho"
        busca={busca}
        onBuscaChange={(v) => {
          setFiltroRapido(null);
          setBusca(v);
        }}
        desde={desde}
        ate={ate}
        onDesdeChange={(v) => {
          setFiltroRapido(null);
          setDesde(v);
        }}
        onAteChange={(v) => {
          setFiltroRapido(null);
          setAte(v);
        }}
        onLimparFiltro={limparFiltro}
        nomeUsuario={user?.displayName ?? user?.email ?? null}
        onSair={user ? sair : undefined}
        extra={
          <div className="flex items-center gap-3">
            <OnlineBanner />
            {user && perfil && (
              <button
                onClick={() => router.push(`/${perfil}`)}
                className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
              >
                voltar
              </button>
            )}
            {!user && (
              <button
                onClick={() => router.push("/")}
                className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
              >
                início
              </button>
            )}
          </div>
        }
      />

      <main className="mx-auto max-w-[1800px] px-6 py-6">
        {!temFiltroBusca && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                label="Pendentes na fila"
                value={pendentesCount}
                icon={<IconRequests className="h-3.5 w-3.5" />}
                accentColor="#F2B705"
                onClick={() => alternarFiltroRapido("PENDENTE")}
                ativo={filtroRapido === "PENDENTE"}
              />
              <MetricCard
                label="Em curso"
                value={emCursoCount}
                icon={<IconTruck className="h-3.5 w-3.5" />}
                accentColor="#3EC1D3"
                onClick={() => alternarFiltroRapido("EM_CURSO")}
                ativo={filtroRapido === "EM_CURSO"}
              />
              <MetricCard
                label="Entregas hoje"
                value={entreguesRecentes.length}
                icon={<IconDashboard className="h-3.5 w-3.5" />}
                accentColor="#4CAF6D"
                onClick={() => alternarFiltroRapido("ENTREGUE")}
                ativo={filtroRapido === "ENTREGUE"}
              />
              <MetricCard
                label="Rotas atendidas hoje"
                value={rotasHoje.length}
                icon={<IconUsers className="h-3.5 w-3.5" />}
                accentColor="rgb(var(--color-accent))"
                subtitle={rotasHoje.length > 0 ? rotasHoje.slice(0, 3).join(", ") : undefined}
                onClick={() => alternarFiltroRapido("ROTAS")}
                ativo={filtroRapido === "ROTAS"}
              />
            </div>

            {mostrandoFiltroRapido && (
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent">
                  {FILTRO_LABELS[filtroRapido]}
                </span>
                <button
                  onClick={() => setFiltroRapido(null)}
                  className="font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink"
                >
                  limpar filtro
                </button>
              </div>
            )}

            {carregandoDashboard && <SkeletonList count={4} />}

            {!carregandoDashboard && (filtroRapido === "PENDENTE" || filtroRapido === "EM_CURSO" || filtroRapido === null) && (
              <>
                {grupos.length === 0 && (
                  <EmptyState
                    icon="✅"
                    title={filtroRapido ? `Nenhuma solicitação ${filtroRapido === "PENDENTE" ? "pendente" : "em curso"}` : "Nenhuma solicitação ativa"}
                    subtitle="A fila está limpa no momento"
                  />
                )}

                {grupos.length > 0 && (
                  <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                    {grupos.map(({ local, lista, temLinhaParada }) => (
                      <LocationCard key={local} local={local} contagem={lista.length} temLinhaParada={temLinhaParada}>
                        {lista.map((s) => (
                          <div key={s.id} className="rounded-lg border border-panel-border/60 bg-bg/40 px-3 py-2">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <UrgencyDot
                                  pulse={s.urgencia === "CRITICA" || s.urgencia === "LINHA_PARADA"}
                                  color={URGENCIA_COR[s.urgencia]}
                                />
                                {s.temFoto && (
                                  <button type="button" onClick={() => abrirFoto(s.id)} className="text-xs" title="Ver foto">
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

            {!carregandoDashboard && filtroRapido === "ENTREGUE" && (
              <>
                {entreguesRecentes.length === 0 && (
                  <EmptyState icon="📭" title="Nenhuma entrega hoje ainda" />
                )}
                {entreguesRecentes.length > 0 && (
                  <div className="space-y-2">
                    {entreguesRecentes.map((s) => (
                      <Card key={s.id} className="px-4 py-3">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {s.temFoto && (
                              <button
                                type="button"
                                onClick={() => abrirFoto(s.id)}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bg text-xs hover:bg-progress/20"
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
                          <span>
                            {s.localDestino}
                            {s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}
                          </span>
                          <span>·</span>
                          <span>solicitado por {s.solicitanteNome}</span>
                          {s.entregadorNome && (
                            <>
                              <span>·</span>
                              <span>entregador: {s.entregadorNome}</span>
                            </>
                          )}
                          {s.entregueEm && (
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
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {!carregandoDashboard && filtroRapido === "ROTAS" && (
              <>
                {entregasPorRota.length === 0 && (
                  <EmptyState icon="🧭" title="Nenhuma rota atendida hoje ainda" />
                )}
                {entregasPorRota.length > 0 && (
                  <div className="space-y-2">
                    {entregasPorRota.map(([rota, contagem]) => (
                      <Card key={rota} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: corParaLocal(rota, 1, 62) }}
                          />
                          <span className="font-display text-sm font-semibold uppercase text-ink">{rota}</span>
                        </div>
                        <span className="font-mono text-[11px] text-dim">
                          {contagem} {contagem === 1 ? "entrega" : "entregas"} hoje
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {temFiltroBusca && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Resultado da busca</h2>
              {resultadosBusca !== null && (
                <span className="font-mono text-[11px] text-dim">{resultadosBusca.length} resultado(s)</span>
              )}
            </div>

            {buscando && resultadosBusca === null && <SkeletonList count={5} />}
            {resultadosBusca !== null && resultadosBusca.length === 0 && !buscando && (
              <EmptyState icon="🔍" title="Nenhuma solicitação encontrada" subtitle="Tente outro termo ou período" />
            )}
            {resultadosBusca !== null && resultadosBusca.length > 0 && (
              <div className="space-y-2">
                {resultadosBusca.map((s) => (
                  <Card key={s.id} className="px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s.temFoto && (
                          <button
                            type="button"
                            onClick={() => abrirFoto(s.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bg text-xs hover:bg-progress/20"
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
                      <span>
                        {s.localDestino}
                        {s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}
                      </span>
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
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
      {carregandoFoto && (
        <div className="fixed bottom-4 left-4 z-50 rounded-xl border border-panel-border bg-panel px-3 py-2 font-mono text-xs text-dim">
          Carregando foto...
        </div>
      )}
    </div>
  );
}