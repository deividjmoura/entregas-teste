"use client";
import { useEffect, useState, type ReactNode } from "react";
import { corParaLocal } from "@/lib/domain";
import { ChevronDown, AlertTriangle } from "lucide-react";
interface LocationCardProps { local: string; contagem: number; temLinhaParada: boolean; children: ReactNode; }
export function LocationCard({ local, contagem, temLinhaParada, children }: LocationCardProps) {
  const [aberto, setAberto] = useState(true);
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const desktop = window.matchMedia("(min-width: 768px)").matches; setAberto(desktop); setPronto(true); }, []);
  const corForte = corParaLocal(local, 1, 62);
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-lg border bg-panel transition-all duration-150 ${temLinhaParada ? "border-rose-500/30 bg-rose-500/[0.01] dark:bg-rose-500/[0.02]" : "border-panel-border hover:border-zinc-700 dark:hover:border-zinc-800 shadow-premium"}`}>
      {temLinhaParada && <div className="absolute inset-x-0 top-0 h-[2px] bg-rose-500 animate-pulse-led" />}
      <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-start justify-between gap-3 px-4 pb-3 pt-4 text-left focus:outline-none">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${temLinhaParada ? "bg-rose-500 animate-pulse-led" : ""}`} style={!temLinhaParada ? { backgroundColor: corForte } : {}} />
            <span className={`font-display text-xs font-semibold uppercase tracking-wider ${temLinhaParada ? "text-rose-500" : "text-ink"}`}>{local}</span>
            {temLinhaParada && <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-rose-500 animate-pulse-led"><AlertTriangle className="h-2.5 w-2.5" />Linha Parada</span>}
          </div>
          <div className="mt-1 flex items-baseline gap-2"><span className={`font-display text-3xl font-medium tracking-tight ${temLinhaParada ? "text-rose-500" : "text-ink"}`}>{contagem}</span><span className="font-mono text-[10px] uppercase tracking-wider text-dim">{contagem === 1 ? "demanda" : "demandas"}</span></div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5"><div className={`flex h-6 w-6 items-center justify-center rounded-md border text-dim transition-transform duration-150 ${aberto ? "rotate-180 text-ink bg-surface-2" : "bg-transparent"} ${temLinhaParada ? "border-rose-500/20" : "border-panel-border"}`}><ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" /></div></div>
      </button>
      {pronto && aberto && <div className={`scroll-area h-[220px] space-y-2 overflow-y-auto border-t px-4 py-3 bg-bg/20 ${temLinhaParada ? "border-rose-500/10" : "border-panel-border/60"}`}>{children}</div>}
    </div>
  );
}
