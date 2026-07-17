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
  const corGlow = temLinhaParada ? "#FF1F4B" : corForte;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors ${
        temLinhaParada ? "border-parada" : ""
      }`}
      style={{
        borderColor: temLinhaParada ? undefined : corParaLocal(local, 0.35),
        backgroundColor: "#181A22",
        backgroundImage: temLinhaParada
          ? "linear-gradient(160deg, rgba(255,31,75,0.22), rgba(255,31,75,0.02) 55%)"
          : `linear-gradient(160deg, ${corParaLocal(local, 0.28)}, transparent 55%)`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 8px 24px -8px ${corGlow}55`,
      }}
    >
      {/* Cabeçalho: número grande em destaque, tipo card de dashboard */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 pb-3 pt-4 text-left"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: corForte }} />
            <span
  className="font-display text-sm font-bold uppercase tracking-wide"
  style={{ color: temLinhaParada ? "#FF1F4B" : corTexto }}
>
  {local}
</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-display text-4xl font-bold leading-none"
              style={{ color: temLinhaParada ? "#FF1F4B" : corTexto }}
            >
              {contagem}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
              {contagem === 1 ? "pendente" : "pendentes"}
            </span>
          </div>
          {temLinhaParada && (
            <span className="mt-1 w-fit animate-pulse-led rounded bg-parada/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parada">
              linha parada
            </span>
          )}
        </div>

        {/* Anel decorativo com a cor do local, no estilo dos cards roxos de referência */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border-2"
            style={{
              borderColor: corParaLocal(local, 0.5),
              backgroundColor: corParaLocal(local, 0.12),
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: corForte }} />
          </span>
          <span
            className="text-dim transition-transform"
            style={{ transform: aberto ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </div>
      </button>

      {pronto && aberto && (
  <div className="h-[240px] space-y-2 overflow-y-auto border-t border-panel-border/50 px-4 py-3">
    {children}
  </div>
)}
    </div>
  );
}