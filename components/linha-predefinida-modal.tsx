"use client";

import { useState } from "react";

interface LinhaPredefinidaModalProps {
  onDefinir: (linha: string) => void;
  onPular: () => void;
}

export function LinhaPredefinidaModal({ onDefinir, onPular }: LinhaPredefinidaModalProps) {
  const [valor, setValor] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-sm rounded-lg border border-panel-border bg-panel p-5">
        <h2 className="mb-1 font-display text-sm font-semibold text-ink">Hoje vai solicitar pra qual linha?</h2>
        <p className="mb-4 text-xs text-dim">
          Isso só pré-preenche o campo "local de destino" pra agilizar. Você pode mudar a qualquer momento ou deixar em branco.
        </p>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="ex: Linha de montagem 3"
          className="mb-4 w-full rounded border border-panel-border bg-bg px-3 py-2 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onPular}
            className="flex-1 rounded border border-panel-border px-3 py-2 font-mono text-xs text-dim hover:text-ink"
          >
            Não definir agora
          </button>
          <button
            onClick={() => valor.trim() && onDefinir(valor)}
            className="flex-1 rounded bg-urgent px-3 py-2 font-display text-xs font-semibold text-bg hover:brightness-110"
          >
            Definir
          </button>
        </div>
      </div>
    </div>
  );
}