"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function ModalNome() {
  const router = useRouter();
  const { modalVisitanteAberto, fecharModalVisitante, entrarComoVisitante } = useAuth();
  const [valor, setValor] = useState("");
  const [perfil, setPerfil] = useState<"solicitante" | "entregador" | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!modalVisitanteAberto) return null;

  async function confirmar() {
    if (!valor.trim() || !perfil || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      await entrarComoVisitante(valor);
      localStorage.setItem("entregas:perfil", perfil);
      router.push(`/${perfil}`);
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function fechar() {
    setValor("");
    setPerfil(null);
    setErro(null);
    fecharModalVisitante();
  }

  return (
    <div
      onClick={fechar}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-panel-border bg-panel p-6"
      >
        <h2 className="mb-1 font-display text-sm font-semibold text-ink">
          Entrar como visitante
        </h2>
        <p className="mb-4 font-mono text-xs text-dim">
          Sem senha, sem conta Google — só um nome pra identificar suas ações.
        </p>

        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Seu nome"
          className="mb-3 w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-dim/60 focus:border-progress"
        />

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setPerfil("solicitante")}
            className={`rounded border px-3 py-2 font-mono text-xs ${
              perfil === "solicitante"
                ? "border-progress bg-progress/10 text-ink"
                : "border-panel-border text-dim hover:text-ink"
            }`}
          >
            Solicitante
          </button>
          <button
            onClick={() => setPerfil("entregador")}
            className={`rounded border px-3 py-2 font-mono text-xs ${
              perfil === "entregador"
                ? "border-urgent bg-urgent/10 text-ink"
                : "border-panel-border text-dim hover:text-ink"
            }`}
          >
            Entregador
          </button>
        </div>

        {erro && <p className="mb-3 text-xs text-critical">{erro}</p>}

        <div className="flex gap-2">
          <button
            onClick={fechar}
            className="flex-1 rounded border border-panel-border px-3 py-2 font-mono text-xs text-dim hover:text-ink"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!valor.trim() || !perfil || enviando}
            className="flex-1 rounded bg-urgent px-3 py-2 font-display text-xs font-semibold text-bg hover:brightness-110 disabled:opacity-40"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}