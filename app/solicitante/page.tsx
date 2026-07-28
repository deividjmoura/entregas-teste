"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { StatusBadge } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { ImageLightbox } from "@/components/image-lightbox";
import { LinhaPredefinidaModal } from "@/components/linha-predefinida-modal";
import { resizeImageToBase64 } from "@/lib/image-utils";
import { TIPO_LABELS, URGENCIA_LABELS, URGENCIA_COR, formatarHora, formatarDuracao, type SolicitacaoDTO } from "@/lib/domain";
import { useAuthUser } from "@/lib/use-auth-user";
import { useFotoAmpliada } from "@/lib/use-foto-ampliada";
import { useLinhaPredefinida } from "@/lib/use-linha-predefinida";
import { auth } from "@/lib/firebase";  
import { EnderecoEstoque } from "@/components/endereco-estoque";
import { ChatPanel } from "@/components/chat-panel";
import { useNotificacoes } from "@/lib/use-notificacoes-chat";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RudderBar } from "@/components/rudder-bar";
import { BottomSheet } from "@/components/bottom-sheet";
import { ChatsListModal } from "@/components/chats-list-modal";

const HISTORICO_LIMITE = 5;
const FAVORITOS_LIMITE = 5;
const CHAVE_JA_PERGUNTOU = "entregas:linhaPerguntada";

export default function SolicitantePage() {
  const router = useRouter();
  const user = useAuthUser();
  const nome = user?.displayName ?? user?.email ?? null;
  const [minhas, setMinhas] = useState<SolicitacaoDTO[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [chatAberto, setChatAberto] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarChats, setMostrarChats] = useState(false);

  const { linha: linhaPredefinida, carregado: linhaCarregada, setLinha: definirLinhaPredefinida } =
    useLinhaPredefinida();
  const [mostrarModalLinha, setMostrarModalLinha] = useState(false);

  const [tipo, setTipo] = useState("COMPONENTE_FISICO");
  const [descricaoItem, setDescricaoItem] = useState("");
  const [localDestino, setLocalDestino] = useState("");
  const [rackOuSlide, setRackOuSlide] = useState("");
  const [urgencia, setUrgencia] = useState("MEDIA");
  const [foto, setFoto] = useState<string | null>(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const { foto: fotoAmpliada, carregando: carregandoFoto, abrir: abrirFoto, fechar: fecharFoto } = useFotoAmpliada();
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const { mensagensNaoLidas, limparNotificacoes } = useNotificacoes();

  useEffect(() => {
    if (!linhaCarregada) return;
    if (linhaPredefinida) {
      setLocalDestino((atual) => atual || linhaPredefinida);
      return;
    }
    if (!sessionStorage.getItem(CHAVE_JA_PERGUNTOU)) {
      setMostrarModalLinha(true);
    }
  }, [linhaCarregada, linhaPredefinida]);

  // Igual ao entregador — pede permissão de notificação (usada pelo chat)
  // assim que a página carrega, e não só ao abrir uma conversa.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function fecharModalLinha() {
    sessionStorage.setItem(CHAVE_JA_PERGUNTOU, "1");
    setMostrarModalLinha(false);
  }

  function confirmarLinhaPredefinida(valor: string) {
    definirLinhaPredefinida(valor);
    setLocalDestino(valor.trim().toUpperCase());
    fecharModalLinha();
  }

  async function sair() {
    await signOut(auth);
    router.push("/");
  }

  const carregar = useCallback(async (n: string) => {
    const res = await fetch(`/api/solicitacoes?solicitanteNome=${encodeURIComponent(n)}`);
    if (res.ok) setMinhas(await res.json());
  }, []);

  useEffect(() => {
  if (!nome) return;
  carregar(nome);
  const interval = setInterval(() => carregar(nome), 6000);
  return () => clearInterval(interval);
}, [nome, carregar]);


  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessandoFoto(true);
    try {
      const base64 = await resizeImageToBase64(file);
      setFoto(base64);
    } catch {
      setErro("Não foi possível processar a foto. Tente novamente.");
    } finally {
      setProcessandoFoto(false);
    }
  }

  function removerFoto() {
    setFoto(null);
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  }

  async function abrirSolicitacao(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          descricaoItem: descricaoItem.toUpperCase(),
          localDestino: localDestino.toUpperCase(),
          rackOuSlide: rackOuSlide ? rackOuSlide.toUpperCase() : undefined,
          foto: foto || undefined,
          urgencia,
          solicitanteNome: nome,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Falha ao abrir solicitação");
        return;
      }
      setDescricaoItem("");
      setLocalDestino(linhaPredefinida ?? "");
      setRackOuSlide("");
      setUrgencia("MEDIA");
      removerFoto();
      await carregar(nome);
      setMostrarFormulario(false);
    } finally {
      setEnviando(false);
    }
  }

  async function alterarUrgencia(id: string, novaUrgencia: string) {
    if (!nome) return;
    const res = await fetch(`/api/solicitacoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urgencia: novaUrgencia }),
    });
    if (res.ok) {
      await carregar(nome);
    } else {
      const data = await res.json();
      setErro(data.erro ?? "Falha ao alterar urgência");
    }
  }

  async function remover(id: string) {
    if (!nome) return;
    if (!confirm("Remover esta solicitação? Ela será marcada como cancelada.")) return;
    const res = await fetch(`/api/solicitacoes/${id}`, { method: "DELETE" });
    if (res.ok) {
      await carregar(nome);
    } else {
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Falha ao remover solicitação");
    }
  }

  // Reabre uma solicitação já concluída como uma nova PENDENTE, com os
  // mesmos dados — usado tanto pelo ícone "refazer" do histórico quanto
  // pelos favoritos.
  async function refazer(s: SolicitacaoDTO) {
    if (!nome) return;
    setErro(null);
    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: s.tipo,
          descricaoItem: s.descricaoItem,
          localDestino: s.localDestino,
          rackOuSlide: s.rackOuSlide || undefined,
          urgencia: s.urgencia,
          solicitanteNome: nome,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Falha ao refazer solicitação");
        return;
      }
      await carregar(nome);
    } catch {
      setErro("Falha ao refazer solicitação");
    }
  }

  async function favoritar(id: string, valor: boolean) {
    if (!nome) return;
    const res = await fetch(`/api/solicitacoes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorito: valor }),
    });
    if (res.ok) {
      await carregar(nome);
    } else {
      const data = await res.json().catch(() => null);
      setErro(data?.erro ?? "Falha ao favoritar");
    }
  }

  const STATUS_TERMINAIS = ["ENTREGUE", "CANCELADA"];
  const ativas = minhas.filter((s) => !STATUS_TERMINAIS.includes(s.status));
  const concluidas = minhas.filter((s) => STATUS_TERMINAIS.includes(s.status));
  const concluidasVisiveis = concluidas.slice(0, HISTORICO_LIMITE);
  const favoritos = [...minhas]
    .filter((s) => s.favorito)
    .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime())
    .filter((s, index, lista) => {
      const chave = `${s.descricaoItem}__${s.localDestino}__${s.rackOuSlide ?? ""}`;
      return (
        index ===
        lista.findIndex(
          (outro) => `${outro.descricaoItem}__${outro.localDestino}__${outro.rackOuSlide ?? ""}` === chave,
        )
      );
    });
  const favoritosVisiveis = favoritos.slice(0, FAVORITOS_LIMITE);

    useEffect(() => {
    if (!chatAberto) return;
    const atual = minhas.find((s) => s.id === chatAberto);
    if (!atual || STATUS_TERMINAIS.includes(atual.status)) {
      setChatAberto(null);
    }
  }, [minhas, chatAberto]);

  if (!nome) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-panel-border/60 bg-bg/70 px-6 py-4 backdrop-blur-md">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">solicitante</div>
          <h1 className="font-display text-lg font-semibold text-ink">Olá, {nome}</h1>
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

      <main className="mx-auto max-w-2xl px-6 py-6 pb-32">

        <section className="mb-8">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">
            Em andamento <span className="text-dim">({ativas.length})</span>
          </h2>
          {ativas.length === 0 && <p className="text-sm text-dim">Nenhuma solicitação em andamento.</p>}
          <div className="space-y-2">
            {ativas.map((s) => (
              <Card
                key={s.id}
                className="px-4 py-3"
                style={{ borderLeftWidth: 3, borderLeftColor: URGENCIA_COR[s.urgencia] }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {s.temFoto && (
                      <button type="button" onClick={() => abrirFoto(s.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs transition-colors hover:bg-accent/10" title="Ver foto">📷</button>
                    )}
                    <div>
                      <div className="text-sm text-ink">{s.descricaoItem}</div>
                      <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-dim">
                        <span>
                          {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""} · {TIPO_LABELS[s.tipo]}
                          {s.entregadorNome ? ` · ${s.entregadorNome}` : ""}
                          {" · aberto às "}{formatarHora(s.criadaEm)}
                        </span>
                        <EnderecoEstoque
                          solicitacaoId={s.id}
                          endereco={s.enderecoEstoque ?? null}
                          onAtualizado={() => {}}
                          somenteLeitura
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {s.status === "PENDENTE" && (
                      <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} className="font-mono text-[11px] text-dim" />
                    )}
                    {!STATUS_TERMINAIS.includes(s.status) && s.status !== "PENDENTE" && (
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
                    )}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-panel-border pt-2">
                  <Select
                    size="sm"
                    value={s.urgencia}
                    onChange={(e) => alterarUrgencia(s.id, e.target.value)}
                    className="font-mono"
                    title="Alterar urgência"
                  >
                    {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Select>
                  <button
                    onClick={() => remover(s.id)}
                    className="font-mono text-[11px] text-critical underline decoration-dotted hover:text-critical/80"
                  >
                    remover
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {favoritos.length > 0 && (
          <section className="mb-8">
            <button
              onClick={() => setMostrarFavoritos((v) => !v)}
              className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink hover:text-accent"
            >
              {mostrarFavoritos ? "▾" : "▸"} ⭐ Favoritos <span className="text-dim">({favoritos.length})</span>
            </button>

            {mostrarFavoritos && (
              <>
                <div className="space-y-2">
                  {favoritosVisiveis.map((s) => (
                    <Card key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.temFoto && (
                          <button type="button" onClick={() => abrirFoto(s.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs transition-colors hover:bg-accent/10" title="Ver foto">📷</button>
                        )}
                        <div>
                          <div className="text-sm text-ink">{s.descricaoItem}</div>
                          <div className="font-mono text-[11px] text-dim">
                            {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""} · {TIPO_LABELS[s.tipo]}
                            {s.entregadorNome ? ` · ${s.entregadorNome}` : ""}
                            {s.status === "ENTREGUE" && s.entregueEm ? (
                              <> · entregue às {formatarHora(s.entregueEm)} · {formatarDuracao(new Date(s.entregueEm).getTime() - new Date(s.criadaEm).getTime())}</>
                            ) : (
                              <> · aberto às {formatarHora(s.criadaEm)}</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => favoritar(s.id, !s.favorito)}
                          title="Remover dos favoritos"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-urgent transition-colors hover:bg-accent/10"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => refazer(s)}
                          title="Solicitar de novo"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-dim transition-colors hover:bg-accent/10 hover:text-ink"
                        >
                          ↻
                        </button>
                        <StatusBadge status={s.status} />
                      </div>
                    </Card>
                  ))}
                </div>
                {favoritos.length > FAVORITOS_LIMITE && (
                  <p className="mt-3 text-center font-mono text-[11px] text-dim">
                    mostrando {FAVORITOS_LIMITE} de {favoritos.length}
                  </p>
                )}
              </>
            )}
          </section>
        )}

        <section>
          <button
            onClick={() => setMostrarHistorico((v) => !v)}
            className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink hover:text-accent"
          >
            {mostrarHistorico ? "▾" : "▸"} Histórico <span className="text-dim">({concluidas.length})</span>
          </button>

          {mostrarHistorico && (
            <>
              <div className="space-y-2">
                {concluidasVisiveis.map((s) => (
                  <Card key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 opacity-70">
                    <div className="flex items-center gap-3">
                      {s.temFoto && (
                        <button type="button" onClick={() => abrirFoto(s.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs transition-colors hover:bg-accent/10" title="Ver foto">📷</button>
                      )}
                      <div>
                        <div className="text-sm text-ink">{s.descricaoItem}</div>
                        <div className="font-mono text-[11px] text-dim">
                          {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""} · {TIPO_LABELS[s.tipo]}
                          {s.entregadorNome ? ` · ${s.entregadorNome}` : ""}
                          {s.status === "ENTREGUE" && s.entregueEm ? (
                            <> · entregue às {formatarHora(s.entregueEm)} · {formatarDuracao(new Date(s.entregueEm).getTime() - new Date(s.criadaEm).getTime())}</>
                          ) : (
                            <> · aberto às {formatarHora(s.criadaEm)}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => favoritar(s.id, !s.favorito)}
                        title={s.favorito ? "Remover dos favoritos" : "Favoritar"}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent/10 ${
                          s.favorito ? "text-urgent" : "text-dim"
                        }`}
                      >
                        {s.favorito ? "★" : "☆"}
                      </button>
                      {s.status === "ENTREGUE" && (
                        <button
                          type="button"
                          onClick={() => refazer(s)}
                          title="Refazer esta solicitação"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-dim transition-colors hover:bg-accent/10 hover:text-ink"
                        >
                          ↻
                        </button>
                      )}
                      <StatusBadge status={s.status} />
                    </div>
                  </Card>
                ))}
              </div>
              {concluidas.length > HISTORICO_LIMITE && (
                <p className="mt-3 text-center font-mono text-[11px] text-dim">
                  mostrando {HISTORICO_LIMITE} de {concluidas.length} —{" "}
                  <button onClick={() => router.push("/painel")} className="underline decoration-dotted hover:text-ink">
                    ver tudo no painel
                  </button>
                </p>
              )}
            </>
          )}
        </section>
      </main>

      {mostrarModalLinha && (
        <LinhaPredefinidaModal
          onDefinir={confirmarLinhaPredefinida}
          onPular={fecharModalLinha}
          valorInicial={linhaPredefinida ?? ""}
        />
      )}

      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="SOLICITANTE"
          onClose={() => setChatAberto(null)}
        />
      )}
      <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
      {carregandoFoto && (
        <div className="fixed bottom-4 left-4 z-50 rounded-xl border border-panel-border bg-panel px-3 py-2 font-mono text-xs text-dim">
          Carregando foto...
        </div>
      )}

      {mostrarFormulario && (
        <BottomSheet titulo="Abrir urgência" onClose={() => setMostrarFormulario(false)}>
          <form onSubmit={abrirSolicitacao}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-dim">preencha os dados da solicitação</span>
              <button
                type="button"
                onClick={() => setMostrarModalLinha(true)}
                className="font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink"
              >
                {linhaPredefinida ? `linha padrão: ${linhaPredefinida} (trocar)` : "definir linha padrão"}
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Tipo</label>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  {Object.entries(TIPO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Urgência</label>
                <Select value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                  {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                Item <span className="text-critical">*</span>
              </label>
              <Input
                value={descricaoItem}
                onChange={(e) => setDescricaoItem(e.target.value)}
                placeholder="ex: resistor 10k"
                required
                className="uppercase placeholder:normal-case"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                  Local de destino <span className="text-critical">*</span>
                </label>
                <Input
                  value={localDestino}
                  onChange={(e) => setLocalDestino(e.target.value)}
                  placeholder="ex: Linha de montagem 3"
                  required
                  className="uppercase placeholder:normal-case"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                  Rack / Slide <span className="text-dim">(opcional)</span>
                </label>
                <Input
                  value={rackOuSlide}
                  onChange={(e) => setRackOuSlide(e.target.value)}
                  placeholder="ex: Rack A3 / Slide 12"
                  className="uppercase placeholder:normal-case"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                Foto <span className="text-dim">(opcional)</span>
              </label>

              {!foto && (
                <button
                  type="button"
                  onClick={() => inputFotoRef.current?.click()}
                  disabled={processandoFoto}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-panel-border bg-surface-2 px-3 py-4 text-sm text-dim transition-colors hover:border-accent/50 hover:text-ink disabled:opacity-50"
                >
                  {processandoFoto ? "Processando..." : "📷 Tirar foto"}
                </button>
              )}

              {foto && (
                <div className="relative w-fit">
                  <img src={foto} alt="Prévia da foto" className="h-32 w-32 rounded-xl border border-panel-border object-cover" />
                  <button
                    type="button"
                    onClick={removerFoto}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-critical text-xs font-bold text-white"
                    title="Remover foto"
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>

            {erro && <p className="mb-3 text-sm text-critical">{erro}</p>}

            <Button type="submit" disabled={enviando || processandoFoto} className="w-full">
              {enviando ? "Abrindo..." : "Abrir urgência"}
            </Button>
          </form>
        </BottomSheet>
      )}

      {mostrarChats && (
        <ChatsListModal
          solicitacoes={minhas}
          mensagensNaoLidas={mensagensNaoLidas}
          onAbrirChat={(id) => {
            limparNotificacoes(id);
            setChatAberto(id);
            setMostrarChats(false);
          }}
          onClose={() => setMostrarChats(false)}
        />
      )}

      {!chatAberto && !mostrarFormulario && !mostrarChats && (
  <RudderBar
    onAbrirFormulario={() => setMostrarFormulario(true)}
    onAbrirChats={() => setMostrarChats(true)}
    totalNaoLidas={Object.values(mensagensNaoLidas).reduce((a, b) => a + b, 0)}
  />
  )}
    </div>
  );
}