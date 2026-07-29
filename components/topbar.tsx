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
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const temPeriodoConfigurado = Boolean(desde || ate);
  const mostraFiltroPeriodo = Boolean(onDesdeChange && onAteChange);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      const alvo = e.target as Node;
      const dentroDesktop = desktopRef.current?.contains(alvo);
      const dentroMobile = mobileRef.current?.contains(alvo);
      if (!dentroDesktop && !dentroMobile) setAberto(false);
    }
    if (aberto) document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  return (
    <header className="sticky top-0 z-10 border-b border-panel-border bg-bg/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 shrink truncate font-display text-sm font-semibold tracking-tight text-ink">
          {titulo}
        </h1>

        <div ref={desktopRef} className="relative mx-auto hidden w-full max-w-lg md:block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            onFocus={() => mostraFiltroPeriodo && setAberto(true)}
            placeholder={buscaPlaceholder}
            className="w-full rounded-xl border border-panel-border bg-surface-2 py-2 pl-9 pr-4 text-sm text-ink placeholder:text-dim/60 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
          />
          {temPeriodoConfigurado && (
            <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
          )}
          {mostraFiltroPeriodo && aberto && (
            <FiltroPeriodo
              desde={desde}
              ate={ate}
              onDesdeChange={onDesdeChange}
              onAteChange={onAteChange}
              onLimparFiltro={onLimparFiltro}
              busca={busca}
              temPeriodoConfigurado={temPeriodoConfigurado}
              onFechar={() => setAberto(false)}
            />
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {extra}
          {nomeUsuario && (
            <div className="hidden items-center gap-2 rounded-full border border-panel-border bg-surface-2 py-1 pl-1 pr-2.5 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 font-mono text-[10px] font-semibold text-accent">
                {nomeUsuario.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[110px] truncate text-xs text-ink">{nomeUsuario}</span>
            </div>
          )}
          {onSair && (
            <button
              onClick={onSair}
              title="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-panel-border text-dim transition hover:border-critical/30 hover:bg-critical/5 hover:text-critical"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div ref={mobileRef} className="relative mt-3 md:hidden">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          onFocus={() => mostraFiltroPeriodo && setAberto(true)}
          placeholder={buscaPlaceholder}
          className="w-full rounded-xl border border-panel-border bg-surface-2 py-2 pl-9 pr-4 text-sm text-ink placeholder:text-dim/60 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
        />
        {temPeriodoConfigurado && (
          <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent" />
        )}
        {mostraFiltroPeriodo && aberto && (
          <FiltroPeriodo
            desde={desde}
            ate={ate}
            onDesdeChange={onDesdeChange}
            onAteChange={onAteChange}
            onLimparFiltro={onLimparFiltro}
            busca={busca}
            temPeriodoConfigurado={temPeriodoConfigurado}
            onFechar={() => setAberto(false)}
          />
        )}
      </div>
    </header>
  );
}

function FiltroPeriodo({
  desde,
  ate,
  onDesdeChange,
  onAteChange,
  onLimparFiltro,
  busca,
  temPeriodoConfigurado,
  onFechar,
}: {
  desde?: string;
  ate?: string;
  onDesdeChange?: (v: string) => void;
  onAteChange?: (v: string) => void;
  onLimparFiltro?: () => void;
  busca: string;
  temPeriodoConfigurado: boolean;
  onFechar: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-panel-border bg-panel p-4 shadow-soft-lg animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-dim">
          Filtrar por período
        </span>
        <button
          onClick={onFechar}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-dim hover:bg-surface-2 hover:text-ink"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase text-dim">De</label>
          <input
            type="datetime-local"
            value={desde}
            onChange={(e) => onDesdeChange?.(e.target.value)}
            className="w-full rounded-lg border border-panel-border bg-bg px-2 py-1.5 text-xs text-ink outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase text-dim">Até</label>
          <input
            type="datetime-local"
            value={ate}
            onChange={(e) => onAteChange?.(e.target.value)}
            className="w-full rounded-lg border border-panel-border bg-bg px-2 py-1.5 text-xs text-ink outline-none focus:border-accent/50"
          />
        </div>
      </div>
      {(busca || temPeriodoConfigurado) && (
        <button
          onClick={() => {
            onLimparFiltro?.();
            onFechar();
          }}
          className="mt-3 font-mono text-[11px] text-dim underline decoration-dotted hover:text-ink"
        >
          limpar filtro
        </button>
      )}
    </div>
  );
}
