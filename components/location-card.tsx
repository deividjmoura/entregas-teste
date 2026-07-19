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
      className={`group relative flex flex-col overflow-hidden rounded-[20px] border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
        temLinhaParada ? "animate-pulse-led" : ""
      }`}
      style={{
        borderColor: temLinhaParada ? "#FF1F4B" : corParaLocal(local, 0.55),
        backgroundColor: "var(--card-bg)",
        backgroundImage: temLinhaParada
          ? "linear-gradient(160deg, rgba(255,31,75,0.22), rgba(255,31,75,0.02) 55%)"
          : `linear-gradient(160deg, ${corParaLocal(local, 0.28)}, transparent 55%)`,
        boxShadow: [
          `0 0 24px -4px ${corGlow}99`,
          `0 0 70px -12px ${corGlow}55`,
          `0 18px 40px -20px rgba(0,0,0,0.6)`,
          `inset 0 1px 0 var(--card-highlight)`,
          `0 0 0 1px ${corGlow}33`,
        ].join(", "),
      }}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 pb-2.5 pt-3.5 text-left"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: corForte, boxShadow: `0 0 8px 1px ${corForte}` }}
            />
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
              style={{
                color: temLinhaParada ? "#FF1F4B" : corTexto,
                textShadow: `0 0 20px ${corGlow}66`,
              }}
            >
              {contagem}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-card-dim">
              {contagem === 1 ? "pendente" : "pendentes"}
            </span>
          </div>
          {temLinhaParada && (
            <span className="mt-1 w-fit animate-pulse-led rounded bg-parada/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-parada">
              linha parada
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border-2"
            style={{
              borderColor: corParaLocal(local, 0.5),
              backgroundColor: corParaLocal(local, 0.12),
              boxShadow: `0 0 16px -2px ${corGlow}88`,
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: corForte }} />
          </span>
          <span
            className="text-card-dim transition-transform"
            style={{ transform: aberto ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </div>
      </button>

      {pronto && aberto && (
        <div className="scroll-area h-[204px] space-y-1.5 overflow-y-auto border-t border-white/10 px-4 py-2.5">
          {children}
        </div>
      )}
    </div>
  );
}