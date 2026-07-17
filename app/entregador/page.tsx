"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { TIPO_LABELS, URGENCIA_LABELS, URGENCIA_PESO, URGENCIA_COR, type SolicitacaoDTO } from "@/lib/domain";
import { UrgencyDot } from "@/components/status-badge";
import { ElapsedTime } from "@/components/elapsed-time";
import { ImageLightbox } from "@/components/image-lightbox";
import { useAuthUser } from "@/lib/use-auth-user";
import { auth } from "@/lib/firebase";

export default function EntregadorPage() {
  const router = useRouter();
  const user = useAuthUser();
  const nome = user?.displayName ?? user?.email ?? null;
  const [pendentes, setPendentes] = useState<SolicitacaoDTO[]>([]);
  const [minhasEmCurso, setMinhasEmCurso] = useState<SolicitacaoDTO[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [assumindo, setAssumindo] = useState<string | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

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
      data.sort((a, b) => URGENCIA_PESO[b.urgencia] - URGENCIA_PESO[a.urgencia]);
      setPendentes(data);
    }
    if (resEmCurso.ok) {
      const data: SolicitacaoDTO[] = await resEmCurso.json();
      setMinhasEmCurso(data);
    }
  }, []);

  useEffect(() => {
    if (!nome) return;
    carregar();
    const interval = setInterval(carregar, 2500);
    return () => clearInterval(interval);
  }, [nome, carregar]);

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

  if (!nome) return null;

  const minhasProprias = minhasEmCurso.filter((s) => s.entregadorNome === nome);

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col overflow-hidden px-6">
      <header className="mb-8 mt-10 flex shrink-0 items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">entregador</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Olá, {nome}</h1>
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

      {erro && (
        <div className="mb-5 shrink-0 rounded border border-critical/40 bg-critical/10 px-4 py-2.5 text-sm text-critical">
          {erro}
        </div>
      )}

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto pb-10 pr-1">
        {minhasProprias.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-dim">
              Suas entregas em curso
            </h2>
            <div className="space-y-2">
              {minhasProprias.map((s) => (
                <div key={s.id} className="rounded border border-progress/40 bg-progress/10 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
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
                      <div>
                        <div className="text-sm text-ink">{s.descricaoItem}</div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-dim">
                          <UrgencyDot color={URGENCIA_COR[s.urgencia]} />
                          <span style={{ color: URGENCIA_COR[s.urgencia] }}>{URGENCIA_LABELS[s.urgencia]}</span>
                          <span>· {TIPO_LABELS[s.tipo]}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmar(s.id)}
                      className="shrink-0 rounded bg-success px-3 py-1.5 font-display text-xs font-semibold text-bg hover:brightness-110"
                    >
                      Confirmar entrega
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 border-t border-panel-border/50 pt-2 font-mono text-[11px] text-dim">
                    <span>→ {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}</span>
                    <span>·</span>
                    <span>solicitado por {s.solicitanteNome}</span>
                    <span>·</span>
                    <ElapsedTime since={s.criadaEm} alertAfterMinutes={5} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-dim">Fila de despacho</h2>
            <span className="font-mono text-[11px] text-dim">{pendentes.length} pendente(s)</span>
          </div>

          {pendentes.length === 0 && (
            <p className="rounded border border-panel-border bg-panel px-4 py-6 text-center text-sm text-dim">
              Nenhuma urgência pendente no momento.
            </p>
          )}

          <div className="overflow-hidden rounded-lg border border-panel-border">
            {pendentes.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-4 py-3 font-mono text-sm ${
                  i % 2 === 0 ? "bg-panel" : "bg-bg"
                } ${
                  s.urgencia === "LINHA_PARADA"
                    ? "border-l-2 border-parada"
                    : s.urgencia === "CRITICA"
                      ? "border-l-2 border-critical"
                      : "border-l-2 border-transparent"
                }`}
              >
                <UrgencyDot
                  pulse={s.urgencia === "CRITICA" || s.urgencia === "LINHA_PARADA"}
                  color={URGENCIA_COR[s.urgencia]}
                />
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
                <span
                  className="w-24 shrink-0 text-[11px] uppercase tracking-wide"
                  style={{ color: URGENCIA_COR[s.urgencia] }}
                >
                  {URGENCIA_LABELS[s.urgencia]}
                </span>
                <span className="flex-1 truncate text-ink">{s.descricaoItem}</span>
                <span className="hidden shrink-0 text-dim sm:inline">{TIPO_LABELS[s.tipo]}</span>
                <span className="shrink-0 text-dim">
                  → {s.localDestino}{s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}
                </span>
                <ElapsedTime
                  since={s.criadaEm}
                  alertAfterMinutes={5}
                  className="hidden shrink-0 text-[11px] text-dim md:inline"
                />
                <button
                  onClick={() => assumir(s.id)}
                  disabled={assumindo === s.id}
                  className="shrink-0 rounded bg-urgent px-3 py-1.5 font-display text-xs font-semibold text-bg transition hover:brightness-110 disabled:opacity-50"
                >
                  {assumindo === s.id ? "..." : "Assumir"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ImageLightbox src={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
    </main>
  );
}