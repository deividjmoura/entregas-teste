"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, AlertCircle } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-[1px] animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-panel-border bg-panel p-6 shadow-premium-lg"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 text-indigo-500">
            <UserPlus className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-dim">
            Acesso Temporário
          </span>
        </div>

        <h2 className="font-display text-sm font-medium tracking-tight text-ink">
          Entrar como visitante
        </h2>
        <p className="mt-1 mb-4 text-xs text-dim leading-relaxed">
          Sem credenciais ou autenticação externa — informe apenas um identificador para assinar suas interações.
        </p>

        <Input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Seu nome ou apelido operacional"
          className="mb-3 border-panel-border bg-surface-2 focus:border-indigo-500 text-xs"
        />

        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setPerfil("solicitante")}
            className={`btn-press interactive rounded-md border px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide transition-all outline-none ${
              perfil === "solicitante"
                ? "border-indigo-500/40 bg-indigo-500/5 text-indigo-500"
                : "border-panel-border text-muted hover:text-ink hover:bg-surface-2/40"
            }`}
          >
            Solicitante
          </button>
          <button
            type="button"
            onClick={() => setPerfil("entregador")}
            className={`btn-press interactive rounded-md border px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide transition-all outline-none ${
              perfil === "entregador"
                ? "border-sky-500/40 bg-sky-500/5 text-sky-500"
                : "border-panel-border text-muted hover:text-ink hover:bg-surface-2/40"
            }`}
          >
            Entregador
          </button>
        </div>

        {erro && (
          <div className="mb-4 flex items-center gap-2 rounded border border-rose-500/10 bg-rose-500/5 p-2 font-mono text-[11px] text-rose-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="flex gap-2.5">
          <Button 
            variant="secondary" 
            className="btn-press interactive flex-1 rounded-md border border-panel-border bg-panel text-muted hover:text-ink text-xs font-medium h-9" 
            onClick={fechar}
          >
            Cancelar
          </Button>
          <Button
            className="btn-press interactive flex-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium h-9 shadow-sm"
            disabled={!valor.trim() || !perfil || enviando}
            onClick={confirmar}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
