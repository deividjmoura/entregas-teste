"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { AppShell, type AppShellItem } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonList, EmptyState } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ImageLightbox } from "@/components/image-lightbox";
import {
  TIPO_LABELS,
  URGENCIA_LABELS,
  formatarHora,
  formatarDuracao,
  type SolicitacaoDTO,
  type ItemEstoqueResumoDTO,
  type ItemEstoqueDetalheDTO,
} from "@/lib/domain";
import { useOptionalAuthUser } from "@/lib/use-optional-auth-user";
import { useFotoAmpliada } from "@/lib/use-foto-ampliada";
import { auth } from "@/lib/firebase";

type Aba = "itens" | "solicitacoes";

const PAPEL_LABELS: Record<string, string> = {
  entregador: "Entregador",
  solicitante: "Solicitante",
};

function PesquisaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useOptionalAuthUser();
  const [perfil, setPerfil] = useState<string | null>(null);
  const nome = user?.displayName ?? user?.email ?? null;

  const [aba, setAba] = useState<Aba>("itens");

  const [termo, setTermo] = useState(searchParams.get("item") ?? "");
  const [resultados, setResultados] = useState<ItemEstoqueResumoDTO[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Busca de solicitações (movida do painel pra ficar tudo num só lugar)
  const [buscaSol, setBuscaSol] = useState("");
  const [desdeSol, setDesdeSol] = useState("");
  const [ateSol, setAteSol] = useState("");
  const [resultadosSol, setResultadosSol] = useState<SolicitacaoDTO[] | null>(null);
  const [buscandoSol, setBuscandoSol] = useState(false);
  const { foto: fotoAmpliada, carregando: carregandoFoto, abrir: abrirFoto, fechar: fecharFoto } = useFotoAmpliada();

  const [selecionado, setSelecionado] = useState<string | null>(searchParams.get("item"));
  const [detalhe, setDetalhe] = useState<ItemEstoqueDetalheDTO | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [quantidadeEdit, setQuantidadeEdit] = useState("0");
  const [enderecoEdit, setEnderecoEdit] = useState("");

  const [novoDestino, setNovoDestino] = useState("");
  const [novaObs, setNovaObs] = useState("");
  const [adicionandoRota, setAdicionandoRota] = useState(false);

  const primeiraCarga = useRef(true);

  useEffect(() => {
    setPerfil(localStorage.getItem("entregas:perfil"));
  }, []);

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  const buscar = useCallback(async (q: string) => {
    setBuscando(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/estoque?${params.toString()}`);
      if (res.ok) setResultados(await res.json());
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => buscar(termo), primeiraCarga.current ? 0 : 300);
    primeiraCarga.current = false;
    return () => clearTimeout(timeout);
  }, [termo, buscar]);

  const limparFiltroSol = useCallback(() => {
    setBuscaSol("");
    setDesdeSol("");
    setAteSol("");
  }, []);

  useEffect(() => {
    if (aba !== "solicitacoes") return;
    const timeout = setTimeout(async () => {
      setBuscandoSol(true);
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (buscaSol.trim()) params.set("q", buscaSol.trim());
        if (desdeSol) params.set("desde", new Date(desdeSol).toISOString());
        if (ateSol) params.set("ate", new Date(ateSol).toISOString());
        const res = await fetch(`/api/solicitacoes?${params.toString()}`);
        if (res.ok) setResultadosSol(await res.json());
      } finally {
        setBuscandoSol(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [aba, buscaSol, desdeSol, ateSol]);

  const carregarDetalhe = useCallback(async (nomeItem: string) => {
    setCarregandoDetalhe(true);
    setErro(null);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(nomeItem)}`);
      if (res.ok) {
        const data: ItemEstoqueDetalheDTO = await res.json();
        setDetalhe(data);
        setDescricaoEdit(data.descricao ?? "");
        setQuantidadeEdit(String(data.quantidade));
        setEnderecoEdit(data.endereco ?? "");
      } else {
        setDetalhe(null);
      }
    } finally {
      setCarregandoDetalhe(false);
    }
  }, []);

  useEffect(() => {
    if (selecionado) carregarDetalhe(selecionado);
  }, [selecionado, carregarDetalhe]);

  function abrirItem(nomeItem: string) {
    setSelecionado(nomeItem);
    router.replace(`/pesquisa?item=${encodeURIComponent(nomeItem)}`, { scroll: false });
  }

  function fecharDetalhe() {
    setSelecionado(null);
    setDetalhe(null);
    router.replace("/pesquisa", { scroll: false });
  }

  async function salvarInformacoes() {
    if (!selecionado) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(selecionado)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: descricaoEdit,
          quantidade: quantidadeEdit,
          endereco: enderecoEdit,
          alteradoPor: nome ?? "desconhecido",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível salvar");
        return;
      }
      await carregarDetalhe(selecionado);
      await buscar(termo);
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarRota() {
    if (!selecionado || !novoDestino.trim()) return;
    setAdicionandoRota(true);
    setErro(null);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(selecionado)}/rotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destino: novoDestino, observacao: novaObs, criadaPor: nome ?? "desconhecido" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível adicionar a rota");
        return;
      }
      setNovoDestino("");
      setNovaObs("");
      await carregarDetalhe(selecionado);
    } finally {
      setAdicionandoRota(false);
    }
  }

  const menuItems: AppShellItem[] = [
    ...(perfil
      ? [
          {
            label: perfil === "entregador" ? "Ir para entregador" : "Ir para solicitante",
            icon: "🔄",
            onClick: () => router.push(`/${perfil}`),
          },
        ]
      : [{ label: "Início", icon: "🏠", onClick: () => router.push("/") }]),
    { label: "Painel geral", icon: "📋", onClick: () => router.push("/painel") },
    ...(user ? [{ label: "Sair", icon: "🚪", onClick: sair }] : []),
  ];

  return (
    <AppShell
      papel={(perfil && PAPEL_LABELS[perfil]) || "Pesquisa"}
      nome={nome ?? "Visitante"}
      items={menuItems}
    >
      <div className="lg:flex lg:h-screen lg:flex-col">
      <header className="sticky top-0 z-20 shrink-0 border-b border-panel-border bg-bg/80 px-4 py-3.5 pl-16 backdrop-blur-md sm:px-6 md:pl-6">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4">
          <h1 className="min-w-0 shrink truncate font-display text-xs font-semibold uppercase tracking-wider text-ink">
            🔍 Pesquisar itens
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="mb-4 flex gap-2 lg:shrink-0">
          <button
            onClick={() => setAba("itens")}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              aba === "itens"
                ? "border-accent/50 bg-accent/10 text-ink"
                : "border-panel-border text-dim hover:text-ink"
            }`}
          >
            Itens em estoque
          </button>
          <button
            onClick={() => setAba("solicitacoes")}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
              aba === "solicitacoes"
                ? "border-accent/50 bg-accent/10 text-ink"
                : "border-panel-border text-dim hover:text-ink"
            }`}
          >
            Solicitações
          </button>
        </div>

        {aba === "itens" && (
        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[380px_1fr] lg:overflow-hidden">
          {/* Coluna de busca */}
          <section className="lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <div className="relative mb-4 lg:shrink-0">
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar por código do item ou descrição..."
                autoFocus
                className="w-full rounded-md border border-panel-border bg-surface-2 py-2 px-3 text-sm text-ink placeholder:text-muted outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {buscando && resultados === null && <SkeletonList count={6} />}
            {resultados !== null && resultados.length === 0 && (
              <EmptyState icon="📦" title="Nenhum item encontrado" subtitle="Tente outro termo de busca" />
            )}
            {resultados !== null && resultados.length > 0 && !termo.trim() && (
              <p className="mb-2 font-mono text-[10.5px] text-muted">
                mostrando os {resultados.length} mais recentes — digite pra buscar os demais
              </p>
            )}
            {resultados !== null && resultados.length > 0 && (
              <div className="space-y-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {resultados.map((item) => (
                  <button
                    key={item.nomeItem}
                    onClick={() => abrirItem(item.nomeItem)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      selecionado === item.nomeItem
                        ? "border-accent/50 bg-accent/10"
                        : "border-panel-border bg-panel hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-ink">{item.nomeItem}</span>
                      {item.temFoto && <span className="text-xs">📷</span>}
                    </div>
                    {item.descricao && (
                      <div className="mt-0.5 truncate text-xs text-dim">{item.descricao}</div>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[10.5px] text-dim">
                      <span>qtd: {item.quantidade}</span>
                      {item.endereco && (
                        <>
                          <span>·</span>
                          <span>{item.endereco}</span>
                        </>
                      )}
                      {item.totalSolicitacoes > 0 && (
                        <>
                          <span>·</span>
                          <span>{item.totalSolicitacoes} solicitação(ões)</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Coluna de detalhe */}
          <section className="lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {!selecionado && (
              <Card className="flex h-full min-h-[300px] items-center justify-center px-6 py-10 text-center text-sm text-dim">
                Selecione um item na lista para ver e editar as informações.
              </Card>
            )}

            {selecionado && carregandoDetalhe && <SkeletonList count={4} />}

            {selecionado && !carregandoDetalhe && detalhe && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-lg font-semibold text-ink">{detalhe.nomeItem}</div>
                    <div className="font-mono text-[11px] text-dim">
                      {detalhe.totalSolicitacoes} solicitação(ões) já feita(s) desse item
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fecharDetalhe}>
                    fechar
                  </Button>
                </div>

                {erro && (
                  <div className="rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">
                    {erro}
                  </div>
                )}

                <Card className="space-y-3 px-4 py-4">
                  {detalhe.foto && (
                    <img
                      src={detalhe.foto}
                      alt={detalhe.nomeItem}
                      className="mb-2 max-h-48 w-full rounded-lg object-contain bg-surface-2"
                    />
                  )}

                  <div>
                    <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
                      Descrição
                    </label>
                    <textarea
                      value={descricaoEdit}
                      onChange={(e) => setDescricaoEdit(e.target.value)}
                      placeholder="O que é esse item, pra que serve..."
                      rows={2}
                      className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
                        Quantidade em estoque
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={quantidadeEdit}
                        onChange={(e) => setQuantidadeEdit(e.target.value)}
                        className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
                        Endereço no estoque
                      </label>
                      <input
                        value={enderecoEdit}
                        onChange={(e) => setEnderecoEdit(e.target.value)}
                        placeholder="ex: D03C02"
                        className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  {detalhe.ultimoAlteradoPor && (
                    <div className="font-mono text-[10.5px] text-dim">
                      última alteração por {detalhe.ultimoAlteradoPor}
                    </div>
                  )}

                  <Button variant="primary" size="sm" disabled={salvando} onClick={salvarInformacoes}>
                    {salvando ? "Salvando..." : "Salvar informações"}
                  </Button>
                </Card>

                <Card className="space-y-3 px-4 py-4">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-dim">
                    Rotas / destinos
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    <input
                      value={novoDestino}
                      onChange={(e) => setNovoDestino(e.target.value)}
                      placeholder="destino (ex: LINHA 3)"
                      className="flex-1 rounded-md border border-panel-border bg-surface-2 px-3 py-1.5 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
                    />
                    <input
                      value={novaObs}
                      onChange={(e) => setNovaObs(e.target.value)}
                      placeholder="observação (opcional)"
                      className="flex-1 rounded-md border border-panel-border bg-surface-2 px-3 py-1.5 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={adicionandoRota || !novoDestino.trim()}
                      onClick={adicionarRota}
                    >
                      {adicionandoRota ? "..." : "+ Adicionar"}
                    </Button>
                  </div>

                  {detalhe.rotas.length === 0 && (
                    <p className="text-sm text-dim">Nenhuma rota registrada ainda para esse item.</p>
                  )}
                  {detalhe.rotas.length > 0 && (
                    <div className="space-y-1.5">
                      {detalhe.rotas.map((rota) => (
                        <div
                          key={rota.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-panel-border bg-surface-2 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-sm text-ink">{rota.destino}</span>
                              <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[9px] uppercase text-dim">
                                {rota.automatica ? "entrega" : "manual"}
                              </span>
                            </div>
                            {rota.observacao && (
                              <div className="truncate text-xs text-dim">{rota.observacao}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right font-mono text-[10.5px] text-dim">
                            {new Date(rota.criadaEm).toLocaleDateString("pt-BR")}
                            {rota.criadaPor && <div>{rota.criadaPor}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </section>
        </div>
        )}

        {aba === "solicitacoes" && (
          <div className="lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2 lg:shrink-0">
              <input
                value={buscaSol}
                onChange={(e) => setBuscaSol(e.target.value)}
                placeholder="Buscar por item, local ou solicitante..."
                className="min-w-[220px] flex-1 rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
              />
              <input
                type="date"
                value={desdeSol}
                onChange={(e) => setDesdeSol(e.target.value)}
                className="rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500/50"
              />
              <input
                type="date"
                value={ateSol}
                onChange={(e) => setAteSol(e.target.value)}
                className="rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500/50"
              />
              {(buscaSol || desdeSol || ateSol) && (
                <button
                  onClick={limparFiltroSol}
                  className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
                >
                  limpar
                </button>
              )}
            </div>

            <div className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              {buscandoSol && resultadosSol === null && <SkeletonList count={5} />}
              {resultadosSol !== null && resultadosSol.length === 0 && !buscandoSol && (
                <EmptyState icon="🔍" title="Nenhuma solicitação encontrada" subtitle="Tente outro termo ou período" />
              )}
              {resultadosSol !== null &&
                resultadosSol.map((s) => (
                  <Card key={s.id} tilt={false} className="px-4 py-3">
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
          </div>
        )}
      </main>

      <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
      {carregandoFoto && (
        <div className="fixed bottom-4 left-4 z-50 rounded-xl border border-panel-border bg-panel px-3 py-2 font-mono text-xs text-dim">
          Carregando foto...
        </div>
      )}
    </div>
    </AppShell>
  );
}

export default function PesquisaPage() {
  return (
    <Suspense fallback={null}>
      <PesquisaConteudo />
    </Suspense>
  );
}
