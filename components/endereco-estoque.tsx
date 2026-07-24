"use client";

import { useState, useRef, useEffect } from "react";

interface EnderecoEstoqueProps {
  solicitacaoId: string;
  endereco: string | null;
  onAtualizado: (novoEndereco: string | null) => void;
  somenteLeitura?: boolean;
  nomeUsuario?: string;
  /** Quem foi o último a alterar o endereço deste item */
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

  const badge = (conteudo: string, classe: string) => (
    <span className={`group/end relative inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] ${classe}`}>
      {conteudo}
      {endereco && alteradoPor && (
        <span className="pointer-events-none absolute -top-7 left-1/2 z-30 w-max -translate-x-1/2 rounded bg-bg px-2 py-1 text-[10px] normal-case text-ink opacity-0 shadow-lg ring-1 ring-panel-border transition-opacity group-hover/end:opacity-100">
          alterado por {alteradoPor}
        </span>
      )}
    </span>
  );

  if (somenteLeitura) {
    if (!endereco) return null;
    return badge(`📍 ${endereco}`, "bg-progress/15 text-progress");
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setAberto((v) => !v)} className="align-middle">
        {endereco
          ? badge(`📍 ${endereco}`, "text-progress underline decoration-dotted hover:text-ink")
          : (
            <span className="rounded px-1.5 py-0.5 font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink">
              + endereço no estoque
            </span>
          )}
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
            className="mb-1 w-full rounded border border-panel-border bg-bg px-2 py-1.5 font-mono text-sm uppercase text-ink focus:border-progress"
            onKeyDown={(e) => e.key === "Enter" && salvar()}
          />
          {endereco && alteradoPor && (
            <p className="mb-2 font-mono text-[10px] text-dim">último a alterar: {alteradoPor}</p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAberto(false)} className="font-mono text-[11px] text-dim hover:text-ink">
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