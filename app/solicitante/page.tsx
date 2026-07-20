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

const HISTORICO_LIMITE = 5;
const CHAVE_JA_PERGUNTOU = "entregas:linhaPerguntada";

export default function SolicitantePage() {
  const router = useRouter();
  const user = useAuthUser();
  const nome = user?.displayName ?? user?.email ?? null;
  const [minhas, setMinhas] = useState<SolicitacaoDTO[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

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
    const interval = setInterval(() => carregar(nome), 3000);
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
    if (res.ok) await carregar(nome);
  }

  const ativas = minhas.filter((s) => s.status === "PENDENTE" || s.status === "EM_CURSO");
  const concluidas = minhas.filter((s) => s.status === "ENTREGUE" || s.status === "CANCELADA");
  const concluidasVisiveis = concluidas.slice(0, HISTORICO_LIMITE);

  if (!nome) return null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-panel-border/60 bg-bg/70 px-6 py-4 backdrop-blur-md">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">solicitante</div>
          <h1 className="font-display text-lg font-semibold text-ink">Olá, {nome}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/painel")}
            className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink"
          >
            painel geral
          </button>
          <button onClick={sair} className="font-mono text-xs text-dim underline decoration-dotted hover:text-ink">
            sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-6 pb-16">
        
        <form onSubmit={abrirSolicitacao} className="mb-8 rounded-2xl border border-panel-border bg-panel p-5 shadow-premium-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Abrir urgência</h2>
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
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-lg border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink"
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
                className="w-full rounded-lg border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink"
              >
                {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
              Item <span className="text-critical">*</span>
            </label>
            <input
              value={descricaoItem}
              onChange={(e) => setDescricaoItem(e.target.value)}
              placeholder="ex: resistor 10k"
              required
              className="w-full rounded-lg border border-panel-border bg-surface-2 px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                Local de destino <span className="text-critical">*</span>
              </label>
              <input
                value={localDestino}
                onChange={(e) => setLocalDestino(e.target.value)}
                placeholder="ex: Linha de montagem 3"
                required
                className="w-full rounded-lg border border-panel-border bg-surface-2 px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[11px] uppercase text-dim">
                Rack / Slide <span className="text-dim">(opcional)</span>
              </label>
              <input
                value={rackOuSlide}
                onChange={(e) => setRackOuSlide(e.target.value)}
                placeholder="ex: Rack A3 / Slide 12"
                className="w-full rounded-lg border border-panel-border bg-surface-2 px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60"
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-panel-border bg-surface-2 px-3 py-4 text-sm text-dim transition hover:border-accent/50 hover:text-ink disabled:opacity-50"
              >
                {processandoFoto ? "Processando..." : "📷 Tirar foto"}
              </button>
            )}

            {foto && (
              <div className="relative w-fit">
                <img src={foto} alt="Prévia da foto" className="h-32 w-32 rounded-lg border border-panel-border object-cover" />
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

          <button
            type="submit"
            disabled={enviando || processandoFoto}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {enviando ? "Abrindo..." : "Abrir urgência"}
          </button>
        </form>

        <section className="mb-8">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">
            Em andamento <span className="text-dim">({ativas.length})</span>
          </h2>
          {ativas.length === 0 && <p className="text-sm text-dim">Nenhuma solicitação em andamento.</p>}
          <div className="space-y-2">
            {ativas.map((s) => (
              <div
                key={s.id}
                className="premium-card rounded-2xl border border-panel-border bg-panel px-4 py-3"
                style={{ borderLeftWidth: 3, borderLeftColor: URGENCIA_COR[s.urgencia] }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {s.temFoto && (
                      <button type="button" onClick={() => abrirFoto(s.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-2 text-xs transition hover:bg-accent/10" title="Ver foto">📷</button>
                    )}
                    <div>
                      <div className="text-sm text-ink">{s.descricaoItem}</div>
                      <div className="font-mono text-[11px] text-dim">
                        {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""} · {TIPO_LABELS[s.tipo]}
                        {s.entregadorNome ? ` · ${s.entregadorNome}` : ""}
                        {" · aberto às "}{formatarHora(s.criadaEm)}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {s.status === "PENDENTE" && (
                      <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} className="font-mono text-[11px] text-dim" />
                    )}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-panel-border pt-2">
                  <select
                    value={s.urgencia}
                    onChange={(e) => alterarUrgencia(s.id, e.target.value)}
                    className="rounded-lg border border-panel-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink"
                    title="Alterar urgência"
                  >
                    {Object.entries(URGENCIA_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remover(s.id)}
                    className="font-mono text-[11px] text-critical underline decoration-dotted hover:text-critical/80"
                  >
                    remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

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
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-panel-border bg-panel px-4 py-3 opacity-70">
                    <div className="flex items-center gap-3">
                      {s.temFoto && (
                        <button type="button" onClick={() => abrirFoto(s.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-2 text-xs transition hover:bg-accent/10" title="Ver foto">📷</button>
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
                    <StatusBadge status={s.status} />
                  </div>
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

      <ImageLightbox src={fotoAmpliada} onClose={fecharFoto} />
      {carregandoFoto && (
        <div className="fixed bottom-4 left-4 z-50 rounded border border-panel-border bg-panel px-3 py-2 font-mono text-xs text-dim">
          Carregando foto...
        </div>
      )}
    </div>
  );
}