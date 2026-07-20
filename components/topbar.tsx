"use client";

import { useEffect, useRef, useState } from "react";
import { IconSearch, IconLogOut } from "@/components/icons";

interface TopbarProps {
  titulo: string;
  busca: string;
  onBuscaChange: (v: string) => void;
  buscaPlaceholder?: string;
  nomeUsuario?: string | null;
  onSair?: () => void;
  extra?: React.ReactNode;
  desde?: string;
  ate?: string;
  onDesdeChange?: (v: string) => void;
  onAteChange?: (v: string) => void;
  onLimparFiltro?: () => void;
}

export function Topbar({
  titulo,
  busca,
  onBuscaChange,
  buscaPlaceholder = "Buscar por item, local, rack/slide ou solicitante...",
  nomeUsuario,
  onSair,
  extra,
  desde,
  ate,
  onDesdeChange,
  onAteChange,
  onLimparFiltro,
}: TopbarProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const temPeriodoConfigurado = Boolean(desde || ate);
  const mostraFiltroPeriodo = Boolean(onDesdeChange && onAteChange);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-panel-border/60 bg-bg/70 px-6 py-4 backdrop-blur-md">
      <span className="shrink-0 font-display text-sm font-semibold text-ink">{titulo}</span>

      <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          onFocus={() => mostraFiltroPeriodo && setAberto(true)}
          placeholder={buscaPlaceholder}
          className="w-full rounded-full border border-panel-border bg-surface-2 py-2.5 pl-10 pr-4 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
        {temPeriodoConfigurado && (
          <span className="absolute right-3.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
        )}

        {mostraFiltroPeriodo && aberto && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-panel-border bg-panel p-4 shadow-premium">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wide text-dim">Filtrar por período</span>
              <button
                onClick={() => setAberto(false)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-dim hover:text-ink"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">De</label>
                <input
                  type="datetime-local"
                  value={desde}
                  onChange={(e) => onDesdeChange?.(e.target.value)}
                  className="w-full rounded border border-panel-border bg-bg px-2 py-2 text-xs text-ink"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase text-dim">Até</label>
                <input
                  type="datetime-local"
                  value={ate}
                  onChange={(e) => onAteChange?.(e.target.value)}
                  className="w-full rounded border border-panel-border bg-bg px-2 py-2 text-xs text-ink"
                />
              </div>
            </div>
            {(busca || temPeriodoConfigurado) && (
              <button
                onClick={() => {
                  onLimparFiltro?.();
                  setAberto(false);
                }}
                className="mt-3 font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink"
              >
                limpar filtro
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {extra}
        {nomeUsuario && (
          <div className="hidden items-center gap-2 rounded-full border border-panel-border bg-surface-2 py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 font-mono text-[10px] font-semibold text-accent">
              {nomeUsuario.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[120px] truncate text-xs text-ink">{nomeUsuario}</span>
          </div>
        )}
        {onSair && (
          <button
            onClick={onSair}
            title="Sair"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-panel-border text-dim transition hover:border-critical/40 hover:text-critical"
          >
            <IconLogOut />
          </button>
        )}
      </div>
    </header>
  );
}