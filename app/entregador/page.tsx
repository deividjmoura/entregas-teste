"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  TIPO_LABELS,
  URGENCIA_LABELS,
  URGENCIA_PESO,
  URGENCIA_COR,
  STATUS_LABELS,
  type SolicitacaoDTO,
} from "@/lib/domain";
import { UrgencyDot } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { ImageLightbox } from "@/components/image-lightbox";
import { EnderecoEstoque } from "@/components/endereco-estoque";
import { ChatPanel } from "@/components/chat-panel";
import { LocationCard } from "@/components/location-card";
import { useAuthUser } from "@/lib/use-auth-user";
import { useFotoAmpliada } from "@/lib/use-foto-ampliada";
import { auth } from "@/lib/firebase";
import { useNotificacoes } from "@/lib/use-notificacoes-chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/app-shell";

function ordenarGrupo(lista: SolicitacaoDTO[]): SolicitacaoDTO[] {
  return [...lista].sort((a, b) => {
    const pesoDiff = URGENCIA_PESO[b.urgencia] - URGENCIA_PESO[a.urgencia];
    if (pesoDiff !== 0) return pesoDiff;
    return new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime();
  });
}

function notificarNovaUrgencia(s: SolicitacaoDTO) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && document.hasFocus()) return;

  new Notification("Nova urgência na fila", {
    body: `${s.descricaoItem} · ${s.localDestino}${s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}`,
    icon: "/favicon.ico",
  });
}

export default function EntregadorPage() {
  const router = useRouter();
  const user = useAuthUser();
  const nome = user?.displayName ?? user?.email ?? null;
  const [pendentes, setPendentes] = useState<SolicitacaoDTO[]>([]);
  const [minhasEmCurso, setMinhasEmCurso] = useState<SolicitacaoDTO[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [assumindo, setAssumindo] = useState(false);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);
  const [concluindoLista, setConcluindoLista] = useState(false);
  const { foto: fotoAmpliada, carregando: carregandoFoto, abrir: abrirFoto, fechar: fecharFoto } = useFotoAmpliada();
  const [chatAberto, setChatAberto] = useState<string | null>(null);
  const { mensagensNaoLidas, limparNotificacoes } = useNotificacoes();
  const pendentesIdsRef = useRef<Set<string> | null>(null);

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("entregas:perfil", "entregador");
  }, []);

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  const carregar = useCallback(async () => {
    const res = await fetch("/api/solicitacoes?status=PENDENTE,EM_CURSO,EM_ROTA,EM_BAIXA");
    if (res.ok) {
      const todas: SolicitacaoDTO[] = await res.json();
      const data = todas.filter((s) => s.status === "PENDENTE");
      const dataEmCurso = todas.filter((s) => s.status !== "PENDENTE");

      if (pendentesIdsRef.current) {
        const novas = data.filter((s) => !pendentesIdsRef.current!.has(s.id));
        novas.forEach(notificarNovaUrgencia);
      }
      pendentesIdsRef.current = new Set(data.map((s) => s.id));

      setPendentes(data);
      setMinhasEmCurso(dataEmCurso);
    }
  }, []);

  const atualizarLocal = useCallback((id: string, novoEndereco: string | null, novoAlteradoPor: string) => {
    const atualizarLista = (lista: SolicitacaoDTO[]) =>
      lista.map((s) =>
        s.id === id ? { ...s, enderecoEstoque: novoEndereco, enderecoAlteradoPor: novoAlteradoPor } : s,
      );

    setPendentes(atualizarLista);
    setMinhasEmCurso(atualizarLista);
  }, []);

  useEffect(() => {
    if (!nome) return;
    carregar();
    const interval = setInterval(carregar, 5000);
    return () => clearInterval(interval);
  }, [nome, carregar]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function aceitarSelecionados() {
    if (!nome || selecionados.size === 0) return;
    setAssumindo(true);
    setErro(null);
    try {
      const resultados = await Promise.all(
        Array.from(selecionados).map((id) =>
          fetch(`/api/solicitacoes/${id}/assumir`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entregadorNome: nome }),
          }),
        ),
      );
      const falhas = resultados.filter((r) => !r.ok).length;
      if (falhas > 0) {
        setErro(
          falhas === resultados.length
            ? "Não foi possível aceitar os itens selecionados"
            : `${falhas} item(ns) já tinham sido assumidos por outro entregador`,
        );
      }
      setSelecionados(new Set());
      await carregar();
    } finally {
      setAssumindo(false);
    }
  }

  async function marcarStatus(id: string, novoStatus: "EM_ROTA" | "EM_BAIXA") {
    setAtualizandoId(id);
    setErro(null);
    try {
      const res = await fetch(`/api/solicitacoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível atualizar o status");
      }
      await carregar();
    } finally {
      setAtualizandoId(null);
    }
  }

  async function confirmarItem(id: string) {
    setAtualizandoId(id);
    setErro(null);
    try {
      const res = await fetch(`/api/solicitacoes/${id}/confirmar`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível confirmar a entrega");
      }
      await carregar();
    } finally {
      setAtualizandoId(null);
    }
  }

  async function concluirLista() {
    if (!nome) return;
    const emRota = minhasEmCurso.filter((s) => s.entregadorNome === nome && s.status === "EM_ROTA");
    if (emRota.length === 0) return;
    setConcluindoLista(true);
    setErro(null);
    try {
      await Promise.all(emRota.map((s) => fetch(`/api/solicitacoes/${s.id}/confirmar`, { method: "POST" })));
      await carregar();
    } finally {
      setConcluindoLista(false);
    }
  }

  const minhasProprias = useMemo(
    () => minhasEmCurso.filter((s) => s.entregadorNome === nome),
    [minhasEmCurso, nome],
  );
  const totalEmRota = useMemo(() => minhasProprias.filter((s) => s.status === "EM_ROTA").length, [minhasProprias]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, SolicitacaoDTO[]>();
    for (const s of pendentes) {
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
  }, [pendentes]);

  useEffect(() => {
    if (!chatAberto) return;
    const atual = minhasEmCurso.find((s) => s.id === chatAberto);
    if (!atual || atual.status === "ENTREGUE") {
      setChatAberto(null);
    }
  }, [minhasEmCurso, chatAberto]);

  if (!nome) return null;

  return (
    <AppShell
      papel="entregador"
      nome={nome}
      items={[
        {
          label: "Trocar p/ solicitante",
          icon: "🔄",
          onClick: () => {
            localStorage.setItem("entregas:perfil", "solicitante");
            router.push("/solicitante");
          },
        },
        { label: "Painel geral", icon: "📋", onClick: () => router.push("/painel") },
        { label: "Sair", icon: "🚪", onClick: sair },
      ]}
    >
      <main className="mx-auto w-full max-w-[1800px] px-6 pb-10 pt-20 md:pt-10">
        {erro && (
          <div className="mb-5 rounded-xl border border-critical/40 bg-critical/10 px-4 py-2.5 text-sm text-critical">
            {erro}
          </div>
        )}

        <div className="pb-28">
          {minhasProprias.length > 0 && (
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-dim">
                  Sua lista
                </h2>
                {totalEmRota > 0 && (
                  <Button variant="success" size="sm" disabled={concluindoLista} onClick={concluirLista}>
                    {concluindoLista ? "Concluindo..." : `Concluir lista (${totalEmRota} em rota)`}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {minhasProprias.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      borderColor: s.status === "EM_BAIXA" ? "#E8552F" : "#3EC1D3",
                      backgroundColor:
                        s.status === "EM_BAIXA" ? "rgba(232, 85, 47, 0.08)" : "rgba(62, 193, 211, 0.08)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {s.temFoto && (
                        <button
                          type="button"
                          onClick={() => abrirFoto(s.id)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bg text-xs transition-colors hover:bg-progress/20"
                          title="Ver foto"
                        >
                          📷
                        </button>
                      )}
                      <div>
                        <div className="text-sm text-ink">{s.descricaoItem}</div>
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-dim">
                          <UrgencyDot color={URGENCIA_COR[s.urgencia]} />
                          <span style={{ color: URGENCIA_COR[s.urgencia] }}>{URGENCIA_LABELS[s.urgencia]}</span>
                          <span>· {TIPO_LABELS[s.tipo]}</span>
                          <span>· {s.localDestino}</span>
                          <span>· {STATUS_LABELS[s.status]}</span>
                          <span>·</span>
                          <EnderecoEstoque
                            solicitacaoId={s.id}
                            endereco={s.enderecoEstoque}
                            alteradoPor={s.enderecoAlteradoPor}
                            onAtualizado={(novo) => atualizarLocal(s.id, novo, nome!)}
                            nomeUsuario={nome}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {(s.status === "EM_CURSO" || s.status === "EM_BAIXA") && (
                        <Button
                          variant="success"
                          size="sm"
                          disabled={atualizandoId === s.id}
                          onClick={() => marcarStatus(s.id, "EM_ROTA")}
                        >
                          {atualizandoId === s.id ? "..." : "✅ Achei"}
                        </Button>
                      )}
                      {s.status === "EM_ROTA" && (
                        <Button
                          variant="success"
                          size="sm"
                          disabled={atualizandoId === s.id}
                          onClick={() => confirmarItem(s.id)}
                        >
                          {atualizandoId === s.id ? "..." : "📦 Confirmar entrega"}
                        </Button>
                      )}
                      {s.status === "EM_CURSO" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="border border-critical/50 text-critical hover:bg-critical/10"
                          disabled={atualizandoId === s.id}
                          onClick={() => marcarStatus(s.id, "EM_BAIXA")}
                        >
                          {atualizandoId === s.id ? "..." : "🚫 Não achei"}
                        </Button>
                      )}
                      <Button
                        variant="outline-progress"
                        size="sm"
                        className="relative"
                        onClick={() => {
                          limparNotificacoes(s.id);
                          setChatAberto(s.id);
                        }}
                      >
                        💬 Chat
                        {mensagensNaoLidas[s.id] > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 font-mono text-[9px] font-bold text-white">
                            {mensagensNaoLidas[s.id]}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-dim">
                Fila de despacho
              </h2>
              <span className="font-mono text-[11px] text-dim">{pendentes.length} pendente(s)</span>
            </div>

            {grupos.length === 0 && (
              <Card className="px-4 py-6 text-center text-sm text-dim">
                Nenhuma urgência pendente no momento.
              </Card>
            )}

            {grupos.length > 0 && (
              <div className="grid items-start gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                {grupos.map(({ local, lista, temLinhaParada }) => (
                  <LocationCard key={local} local={local} contagem={lista.length} temLinhaParada={temLinhaParada}>
                    {lista.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border px-3 py-2"
                        style={{
                          borderColor: selecionados.has(s.id) ? "#F2B705" : "var(--card-row-border)",
                          backgroundColor: selecionados.has(s.id)
                            ? "rgba(242, 183, 5, 0.12)"
                            : "var(--card-row-bg)",
                        }}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selecionados.has(s.id)}
                              onChange={() => alternarSelecao(s.id)}
                              className="h-4 w-4 accent-urgent"
                            />
                            <UrgencyDot
                              pulse={s.urgencia === "CRITICA" || s.urgencia === "LINHA_PARADA"}
                              color={URGENCIA_COR[s.urgencia]}
                            />
                            {s.temFoto && (
                              <button type="button" onClick={() => abrirFoto(s.id)} className="text-xs" title="Ver foto">
                                📷
                              </button>
                            )}
                            <span className="text-sm text-card-ink">{s.descricaoItem}</span>
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] text-card-dim">
                          {s.rackOuSlide && (
                            <>
                              <span>{s.rackOuSlide}</span>
                              <span>·</span>
                            </>
                          )}
                          <span style={{ color: URGENCIA_COR[s.urgencia] }}>{URGENCIA_LABELS[s.urgencia]}</span>
                          <span>· {TIPO_LABELS[s.tipo]}</span>
                          <span>·</span>
                          <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} />
                          {s.enderecoEstoque && (
                            <>
                              <span>·</span>
                              <EnderecoEstoque
                                solicitacaoId={s.id}
                                endereco={s.enderecoEstoque}
                                alteradoPor={s.enderecoAlteradoPor}
                                onAtualizado={() => {}}
                                somenteLeitura
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </LocationCard>
                ))}
              </div>
            )}
          </section>
        </div>

        {selecionados.size > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-panel-border bg-panel/95 px-6 py-3 backdrop-blur-md md:pl-60">
            <div className="mx-auto flex max-w-[1800px] items-center justify-between">
              <span className="font-mono text-sm text-ink">
                🛒 {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelecionados(new Set())}>
                  limpar
                </Button>
                <Button variant="warning" size="sm" disabled={assumindo} onClick={aceitarSelecionados}>
                  {assumindo ? "Aceitando..." : `Aceitar selecionados (${selecionados.size})`}
                </Button>
              </div>
            </div>
          </div>
        )}

        <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
        {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="ENTREGADOR"
          onClose={() => setChatAberto(null)}
          onAbrir={() => limparNotificacoes(chatAberto)}
        />
      )}
      </main>
    </AppShell>
  );
}

