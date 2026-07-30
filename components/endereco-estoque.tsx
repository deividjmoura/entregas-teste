"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Plus, X } from "lucide-react"; // Uso estrito de Lucide Icons

interface EnderecoEstoqueProps {
  solicitacaoId: string;
  endereco: string | null;
  onAtualizado: (novoEndereco: string | null) => void;
  somenteLeitura?: boolean;
  nomeUsuario?: string;
  alteradoPor?: string | null;
}

export function EnderecoEstoque({
  solicitacaoId,
  endereco,
  onAtualizado,
  somenteLeitura = false,
  nomeUsuario,
  alteradoPor,
}: EnderecoEstoqueProps) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(endereco ?? "");
  const [salvando, setSalvando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValor(endereco ?? "");
  }, [endereco]);

  useEffect(() => {
    function fecharFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    if (aberto) document.addEventListener("mousedown", fecharFora);
    return () => document.removeEventListener("mousedown", fecharFora);
  }, [aberto]);

  async function salvar() {
    if (!nomeUsuario) return;
    setSalvando(true);
    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/endereco`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enderecoEstoque: valor.trim() || null,
          alteradoPor: nomeUsuario,
        }),
      });
      if (res.ok) {
        onAtualizado(valor.trim() || null);
        setAberto(false);
      }
    } finally {
      setSalvando(false);
    }
  }

  const badge = (conteudo: string, classe: string, mostrarIcone = false) => (
    <span className={`group/end relative inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10.5px] uppercase font-medium tracking-wide transition-all border ${classe}`}>
      {mostrarIcone && <MapPin className="h-3 w-3 shrink-0" />}
      <span>{conteudo}</span>
      {endereco && alteradoPor && (
        <span className="pointer-events-none absolute -top-8 left-1/2 z-40 w-max -translate-x-1/2 rounded border border-panel-border bg-panel px-2 py-1 text-[9.5px] font-sans normal-case text-ink opacity-0 shadow-premium transition-opacity duration-150 group-hover/end:opacity-100">
          Última alteração por: {alteradoPor}
        </span>
      )}
    </span>
  );

  if (somenteLeitura) {
    if (!endereco) return null;
    return badge(endereco, "bg-indigo-500/5 text-indigo-500 border-indigo-500/10", true);
  }

  return (
    <div ref={ref} className="relative inline-block align-middle">
      <button type="button" onClick={() => setAberto((v) => !v)} className="btn-press outline-none flex items-center">
        {endereco
          ? badge(endereco, "text-indigo-500 border-indigo-500/10 bg-indigo-500/5 hover:border-indigo-500/30 cursor-pointer", true)
          : (
            <span className="inline-flex items-center gap-1 rounded-md border border-panel-border bg-panel px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-dim hover:text-ink hover:border-zinc-700 transition-colors cursor-pointer">
              <Plus className="h-3 w-3" /> endereço estoque
            </span>
          )}
      </button>

      {aberto && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-56 rounded-md border border-panel-border bg-panel p-3 shadow-premium-lg animate-fade-in [animation-duration:140ms]">
          <label className="mb-1 block font-mono text-[10px] uppercase font-semibold tracking-wider text-dim">
            Endereço no estoque
          </label>
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value.toUpperCase())}
            placeholder="EX: G03A05"
            className="mb-2 w-full rounded border border-panel-border bg-surface-2 px-2 py-1 font-mono text-xs uppercase text-ink outline-none transition-colors focus:border-indigo-500/50"
            onKeyDown={(e) => e.key === "Enter" && salvar()}
          />
          {endereco && alteradoPor && (
            <p className="mb-2 font-mono text-[9px] text-muted">Operador atual: {alteradoPor}</p>
          )}
          <div className="flex justify-end gap-2 border-t border-panel-border/40 pt-2">
            <button 
              type="button" 
              onClick={() => setAberto(false)} 
              className="btn-press font-mono text-[11px] text-muted hover:text-ink transition-colors"
            >
              cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="btn-press rounded bg-indigo-600 px-2.5 py-1 font-mono text-[11px] font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-40"
            >
              {salvando ? "..." : "salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
