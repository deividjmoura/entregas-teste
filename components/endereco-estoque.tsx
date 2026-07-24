"use client";

import { useState, useRef, useEffect } from "react";

interface EnderecoEstoqueProps {
  solicitacaoId: string;
  endereco: string | null;
  onAtualizado: (novoEndereco: string | null) => void;
  somenteLeitura?: boolean;
  /** Nome de quem está editando — obrigatório fora do modo somenteLeitura */
  nomeUsuario?: string;
}

export function EnderecoEstoque({
  solicitacaoId,
  endereco,
  onAtualizado,
  somenteLeitura = false,
  nomeUsuario,
}: EnderecoEstoqueProps) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(endereco ?? "");
  const [salvando, setSalvando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    if (aberto) document.addEventListener("mousedown", fecharFora);
    return () => document.removeEventListener("mousedown", fecharFora);
  }, [aberto]);

  async function salvar() {
    if (!nomeUsuario) return; // não deveria ser chamável sem nome (fora do modo somenteLeitura)
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

  if (somenteLeitura) {
    if (!endereco) return null;
    return (
      <span className="rounded bg-progress/15 px-1.5 py-0.5 font-mono text-[11px] text-progress">
        📍 {endereco}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`rounded px-1.5 py-0.5 font-mono text-[11px] underline decoration-dotted ${
          endereco ? "text-progress hover:text-ink" : "text-dim hover:text-ink"
        }`}
      >
        {endereco ? `📍 ${endereco}` : "+ endereço no estoque"}
      </button>

      {aberto && (
        <div className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-panel-border bg-panel p-3 shadow-lg">
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-dim">
            Endereço no estoque
          </label>
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value.toUpperCase())}
            placeholder="Ex: G03A05"
            className="mb-2 w-full rounded border border-panel-border bg-bg px-2 py-1.5 font-mono text-sm uppercase text-ink focus:border-progress"
            onKeyDown={(e) => e.key === "Enter" && salvar()}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="font-mono text-[11px] text-dim hover:text-ink"
            >
              cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="rounded bg-progress px-2.5 py-1 font-mono text-[11px] font-semibold text-bg hover:brightness-110 disabled:opacity-50"
            >
              {salvando ? "..." : "salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}