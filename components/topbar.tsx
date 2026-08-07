"use client";
import { useEffect, useRef, useState } from "react";
import { Search, LogOut, Calendar, X } from "lucide-react";
interface TopbarProps { titulo: string; busca?: string; onBuscaChange?: (v: string) => void; buscaPlaceholder?: string; nomeUsuario?: string | null; onSair?: () => void; extra?: React.ReactNode; desde?: string; ate?: string; onDesdeChange?: (v: string) => void; onAteChange?: (v: string) => void; onLimparFiltro?: () => void; }
export function Topbar({ titulo, busca = "", onBuscaChange, buscaPlaceholder = "Buscar por item, local, rack/slide ou solicitante...", nomeUsuario, onSair, extra, desde, ate, onDesdeChange, onAteChange, onLimparFiltro }: TopbarProps) {
  const [aberto, setAberto] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const temPeriodoConfigurado = Boolean(desde || ate);
  const mostraFiltroPeriodo = Boolean(onDesdeChange && onAteChange);
  const mostraBusca = Boolean(onBuscaChange);
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) { const alvo = e.target as Node; if (!desktopRef.current?.contains(alvo) && !mobileRef.current?.contains(alvo)) setAberto(false); }
    if (aberto) document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);
  return (
    <header className="sticky top-0 z-30 border-b border-panel-border bg-bg/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <h1 className="min-w-0 shrink truncate font-display text-xs font-semibold uppercase tracking-wider text-ink">{titulo}</h1>
        {mostraBusca && (
        <div ref={desktopRef} className="relative mx-auto hidden w-full max-w-lg md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
          <input value={busca} onChange={(e) => onBuscaChange!(e.target.value)} onFocus={() => mostraFiltroPeriodo && setAberto(true)} placeholder={buscaPlaceholder} className="w-full rounded-md border border-panel-border bg-surface-2 py-1.5 pl-9 pr-8 text-xs text-ink placeholder:text-muted outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10" />
          {temPeriodoConfigurado && <span className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded bg-indigo-500/10 text-indigo-500"><Calendar className="h-2.5 w-2.5" /></span>}
          {mostraFiltroPeriodo && aberto && <FiltroPeriodo desde={desde} ate={ate} onDesdeChange={onDesdeChange} onAteChange={onAteChange} onLimparFiltro={onLimparFiltro} busca={busca} temPeriodoConfigurado={temPeriodoConfigurado} onFechar={() => setAberto(false)} />}
        </div>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          {extra}
          {nomeUsuario && <div className="hidden items-center gap-2 rounded-md border border-panel-border bg-panel py-1 pl-1 pr-2.5 sm:flex shadow-sm"><span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/10 font-mono text-[9px] font-bold text-indigo-500">{nomeUsuario.slice(0, 1).toUpperCase()}</span><span className="max-w-[110px] truncate font-sans text-xs font-medium text-ink">{nomeUsuario}</span></div>}
          {onSair && <button onClick={onSair} className="btn-press flex h-7 w-7 items-center justify-center rounded-md border border-panel-border bg-panel text-dim transition-colors hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-500"><LogOut className="h-3.5 w-3.5" /></button>}
        </div>
      </div>
      {mostraBusca && (
      <div ref={mobileRef} className="relative mt-3 md:hidden">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
        <input value={busca} onChange={(e) => onBuscaChange!(e.target.value)} onFocus={() => mostraFiltroPeriodo && setAberto(true)} placeholder={buscaPlaceholder} className="w-full rounded-md border border-panel-border bg-surface-2 py-1.5 pl-9 pr-8 text-xs text-ink placeholder:text-muted outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10" />
        {temPeriodoConfigurado && <span className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded bg-indigo-500/10 text-indigo-500"><Calendar className="h-2.5 w-2.5" /></span>}
        {mostraFiltroPeriodo && aberto && <FiltroPeriodo desde={desde} ate={ate} onDesdeChange={onDesdeChange} onAteChange={onAteChange} onLimparFiltro={onLimparFiltro} busca={busca} temPeriodoConfigurado={temPeriodoConfigurado} onFechar={() => setAberto(false)} />}
      </div>
      )}
    </header>
  );
}
function FiltroPeriodo({ desde, ate, onDesdeChange, onAteChange, onLimparFiltro, busca, temPeriodoConfigurado, onFechar }: { desde?: string; ate?: string; onDesdeChange?: (v: string) => void; onAteChange?: (v: string) => void; onLimparFiltro?: () => void; busca: string; temPeriodoConfigurado: boolean; onFechar: () => void; }) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-md border border-panel-border bg-panel p-4 shadow-premium-lg animate-fade-in [animation-duration:150ms]">
      <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-dim">Filtrar por período</span><button onClick={onFechar} className="btn-press flex h-5 w-5 items-center justify-center rounded hover:bg-surface-2 text-dim hover:text-ink transition-colors"><X className="h-3.5 w-3.5" /></button></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="mb-1 block font-mono text-[10px] uppercase font-medium text-muted tracking-wide">Início</label><input type="datetime-local" value={desde} onChange={(e) => onDesdeChange?.(e.target.value)} className="w-full rounded border border-panel-border bg-surface-2 px-2 py-1 text-xs text-ink outline-none transition-colors focus:border-indigo-500/50" /></div>
        <div><label className="mb-1 block font-mono text-[10px] uppercase font-medium text-muted tracking-wide">Término</label><input type="datetime-local" value={ate} onChange={(e) => onAteChange?.(e.target.value)} className="w-full rounded border border-panel-border bg-surface-2 px-2 py-1 text-xs text-ink outline-none transition-colors focus:border-indigo-500/50" /></div>
      </div>
      {(busca || temPeriodoConfigurado) && <button onClick={() => { onLimparFiltro?.(); onFechar(); }} className="mt-3 font-mono text-[11px] text-muted transition-colors hover:text-ink underline underline-offset-4">Limpar filtros ativos</button>}
    </div>
  );
}
