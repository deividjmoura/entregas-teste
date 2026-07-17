"use client";

import { useEffect, useState, type ReactNode } from "react";

interface LocationCardProps {
  local: string;
  cor: string;
  contagem: number;
  temLinhaParada: boolean;
  children: ReactNode;
}

export function LocationCard({ local, cor, contagem, temLinhaParada, children }: LocationCardProps) {
  const [aberto, setAberto] = useState(true);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    setAberto(desktop);
    setPronto(true);
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-panel ${
        temLinhaParada ? "border-parada" : "border-panel-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        style={{ borderLeft: `4px solid ${cor}` }}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-ink">{local}</span>
          {temLinhaParada && (
            <span className="animate-pulse-led rounded bg-parada/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parada">
              linha parada
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] text-dim">{contagem}</span>
          <span className={`text-dim transition-transform ${aberto ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>
      {pronto && aberto && <div className="space-y-2 border-t border-panel-border px-4 py-3">{children}</div>}
    </div>
  );
}