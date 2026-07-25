"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  TIPO_LABELS,
  URGENCIA_LABELS,
  URGENCIA_PESO,
  URGENCIA_COR,
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

function ordenarGrupo(lista: SolicitacaoDTO[]): SolicitacaoDTO[] {
  return [...lista].sort((a, b) => {
    const pesoDiff = URGENCIA_PESO[b.urgencia] - URGENCIA_PESO[a.urgencia];
    if (pesoDiff !== 0) return pesoDiff;
    return new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime();
  });
}

// Notifica só quando a urgência é NOVA (não existia no poll anterior) —
// evita disparar notificação pra tudo que já estava pendente no primeiro load.
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
  const [assumindo, setAssumindo] = useState<string | null>(null);
  const { foto: fotoAmpliada, carregando: carregandoFoto, abrir: abrirFoto, fechar: fecharFoto } = useFotoAmpliada();
  const [chatAberto, setChatAberto] = useState<string | null>(null);
  const { mensagensNaoLidas, limparNotificacoes } = useNotificacoes();
  const pendentesIdsRef = useRef<Set<string> | null>(null);

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  const carregar = useCallback(async () => {
    const [resPendentes, resEmCurso] = await Promise.all([
      fetch("/api/solicitacoes?status=PENDENTE"),
      fetch("/api/solicitacoes?status=EM_CURSO"),
    ]);
    if (resPendentes.ok) {
      const data: SolicitacaoDTO[] = await resPendentes.json();

      if (pendentesIdsRef.current) {
        const novas = data.filter((s) => !pendentesIdsRef.current!.has(s.id));
        novas.forEach(notificarNovaUrgencia);
      }
      pendentesIdsRef.current = new Set(data.map((s) => s.id));

      setPendentes(data);
    }
    if (resEmCurso.ok) {
      const data: SolicitacaoDTO[] = await resEmCurso.json();
      setMinhasEmCurso(data);
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
    const interval = setInterval(carregar, 2500);
    return () => clearInterval(interval);
  }, [nome, carregar]);
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  async function assumir(id: string) {
    if (!nome) return;
    setAssumindo(id);
    setErro(null);
    try {
      const res = await fetch(`/api/solicitacoes/${id}/assumir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entregadorNome: nome }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível assumir");
      }
      await carregar();
    } finally {
      setAssumindo(null);
    }
  }

  async function confirmar(id: string) {
    await fetch(`/api/solicitacoes/${id}/confirmar`, { method: "POST" });
    await carregar();
  }

  const minhasProprias = useMemo(
    () => minhasEmCurso.filter((s) => s.entregadorNome === nome),
    [minhasEmCurso, nome],
  );

  // Agrupa a fila por local de destino, igual ao painel geral
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
    if (!atual || atual.status !== "EM_CURSO") {
      setChatAberto(null);
    }
  }, [minhasEmCurso, chatAberto]);

  if (!nome) return null;

  return (
    <main className="mx-auto w-full max-w-[1800px] px-6">
      <header className="mb-8 mt-10 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">entregador</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Olá, {nome}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono normal-case font-medium"
            onClick={() => router.push("/painel")}
          >
            painel geral
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="font-mono normal-case font-medium"
            onClick={sair}
          >
            sair
          </Button>
        </div>
      </header>

      {erro && (
        <div className="mb-5 rounded-xl border border-critical/40 bg-critical/10 px-4 py-2.5 text-sm text-critical">
          {erro}
        </div>
      )}

      <div className="pb-10">
        {minhasProprias.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-dim">
              Suas entregas em curso
            </h2>
            <div className="space-y-2">
              {minhasProprias.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-progress/40 bg-progress/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                    <div className="flex shrink-0 gap-2">
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
                      <Button variant="success" size="sm" onClick={() => confirmar(s.id)}>
                        Confirmar entrega
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
                <LocationCard
                  key={local}
                  local={local}
                  contagem={lista.length}
                  temLinhaParada={temLinhaParada}
                >
                  {lista.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border px-3 py-2"
                      style={{ borderColor: "var(--card-row-border)", backgroundColor: "var(--card-row-bg)" }}
                      >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <UrgencyDot
                            pulse={s.urgencia === "CRITICA" || s.urgencia === "LINHA_PARADA"}
                            color={URGENCIA_COR[s.urgencia]}
                          />
                          {s.temFoto && (
                            <button
                              type="button"
                              onClick={() => abrirFoto(s.id)}
                              className="text-xs"
                              title="Ver foto"
                            >
                              📷
                            </button>
                          )}
                          <span className="text-sm text-card-ink">{s.descricaoItem}</span>
                        </div>
                        <Button
                          variant="warning"
                          size="sm"
                          disabled={assumindo === s.id}
                          onClick={() => assumir(s.id)}
                        >
                          {assumindo === s.id ? "..." : "Assumir"}
                        </Button>
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

      <ImageLightbox
        src={fotoAmpliada}
        onClose={fecharFoto}
      />
      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="ENTREGADOR"
          onClose={() => setChatAberto(null)}
        />
      )}
    </main>
  );
}