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

  const buscaValida = busca.trim().length >= 5;
  const temFiltro = Boolean(buscaValida || desde || ate);

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

  const pendentesCount = useMemo(() => ativos.filter((s) => s.status === "PENDENTE").length, [ativos]);
  const emCursoCount = useMemo(() => ativos.filter((s) => s.status === "EM_CURSO").length, [ativos]);

  return (
    <div className="min-h-screen bg-bg">
      <Topbar
        titulo="Painel de despacho"
        busca={busca}
        onBuscaChange={setBusca}
        desde={desde}
        ate={ate}
        onDesdeChange={setDesde}
        onAteChange={setAte}
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
        {!temFiltro && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard
                label="Pendentes na fila"
                value={pendentesCount}
                icon={<IconRequests className="h-4 w-4" />}
                accentColor="#F2B705"
              />
              <MetricCard
                label="Em curso"
                value={emCursoCount}
                icon={<IconTruck className="h-4 w-4" />}
                accentColor="#3EC1D3"
              />
              <MetricCard
                label="Entregas hoje"
                value={entreguesRecentes.length}
                icon={<IconDashboard className="h-4 w-4" />}
                accentColor="#4CAF6D"
              />
              <MetricCard
                label="Rotas atendidas hoje"
                value={rotasHoje.length}
                icon={<IconUsers className="h-4 w-4" />}
                accentColor="rgb(var(--color-accent))"
                subtitle={rotasHoje.length > 0 ? rotasHoje.slice(0, 3).join(", ") : undefined}
              />
            </div>

            {carregandoDashboard && <SkeletonList count={4} />}

            {!carregandoDashboard && grupos.length === 0 && (
              <EmptyState icon="✅" title="Nenhuma solicitação ativa" subtitle="A fila está limpa no momento" />
            )}

            {!carregandoDashboard && grupos.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {grupos.map(({ local, lista, temLinhaParada }) => (
                  <LocationCard key={local} local={local} contagem={lista.length} temLinhaParada={temLinhaParada}>
                    {lista.map((s) => (
                      <div key={s.id} className="rounded border border-panel-border/60 bg-bg/40 px-3 py-2">
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

        {temFiltro && (
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
                  <div key={s.id} className="rounded-2xl border border-panel-border bg-panel px-4 py-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s.temFoto && (
                          <button
                            type="button"
                            onClick={() => abrirFoto(s.id)}
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
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
      {carregandoFoto && (
        <div className="fixed bottom-4 left-4 z-50 rounded border border-panel-border bg-panel px-3 py-2 font-mono text-xs text-dim">
          Carregando foto...
        </div>
      )}
    </div>
  );
}