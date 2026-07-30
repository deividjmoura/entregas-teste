"use client";

import { useState } from "react";
import { Sliders } from "lucide-react";

interface LinhaPredefinidaModalProps {
  onDefinir: (linha: string) => void;
  onPular: () => void;
  valorInicial?: string;
}

export function LinhaPredefinidaModal({ onDefinir, onPular, valorInicial = "" }: LinhaPredefinidaModalProps) {
  const [valor, setValor] = useState(valorInicial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-[1px] animate-fade-in">
      <div className="w-full max-w-sm rounded-lg border border-panel-border bg-panel p-5 shadow-premium-lg">
        
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/10 text-indigo-500">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-dim">
            Configuração de Posto
          </span>
        </div>

        <h2 className="font-display text-sm font-medium tracking-tight text-ink">
          Hoje vai solicitar pra qual linha?
        </h2>
        <p className="mt-1 mb-4 text-xs text-dim leading-relaxed">
          Isso automatiza o campo "local de destino" para agilizar seus disparos operacionais. Modifique quando desejar.
        </p>

        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: LINHA DE MONTAGEM 03"
          className="mb-4 w-full rounded border border-panel-border bg-surface-2 px-3 py-1.5 text-xs uppercase text-ink placeholder:normal-case placeholder:text-muted outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          autoFocus
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onPular}
            className="btn-press interactive flex-1 rounded border border-panel-border bg-panel px-3 py-2 font-mono text-[11px] text-muted hover:text-ink transition-colors outline-none"
          >
            Pular agora
          </button>
          <button
            type="button"
            onClick={() => valor.trim() && onDefinir(valor)}
            className="btn-press interactive flex-1 rounded bg-indigo-600 px-3 py-2 font-display text-[11px] font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm outline-none"
          >
            Confirmar posto
          </button>
        </div>
      </div>
    </div>
  );
}
