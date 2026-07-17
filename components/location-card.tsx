"use client";

import { useEffect, useState, type ReactNode } from "react";
import { corParaLocal } from "@/lib/domain";

interface LocationCardProps {
  local: string;
  contagem: number;
  temLinhaParada: boolean;
  children: ReactNode;
}

export function LocationCard({ local, contagem, temLinhaParada, children }: LocationCardProps) {
  const [aberto, setAberto] = useState(true);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    setAberto(desktop);
    setPronto(true);
  }, []);

  const corForte = corParaLocal(local, 1, 62);
  const corTexto = corParaLocal(local, 1, 78);

  return (
    <div
      className={`overflow-hidden rounded-lg border backdrop-blur-sm transition-colors ${
        temLinhaParada ? "border-parada" : ""
      }`}
      style={{
        borderColor: temLinhaParada ? undefined : corParaLocal(local, 0.4),
        backgroundColor: "#1B2024",
        backgroundImage: temLinhaParada
          ? "linear-gradient(135deg, rgba(255,31,75,0.18), rgba(255,31,75,0.03))"
          : `linear-gradient(135deg, ${corParaLocal(local, 0.24)}, ${corParaLocal(local, 0.03)})`,
      }}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: corForte }} />
          <span
            className="font-display text-sm font-semibold"
            style={{ color: temLinhaParada ? "#FF1F4B" : corTexto }}
          >
            {local}
          </span>
          {temLinhaParada && (
            <span className="animate-pulse-led rounded bg-parada/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parada">
              linha parada
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
            style={{ backgroundColor: corParaLocal(local, 0.18), color: corTexto }}
          >
            {contagem}
          </span>
          <span
            className="text-dim transition-transform"
            style={{ transform: aberto ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </div>
      </button>
      {pronto && aberto && <div className="space-y-2 border-t border-panel-border/50 px-4 py-3">{children}</div>}
    </div>
  );
}
