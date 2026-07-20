"use client";

import { IconSearch, IconLogOut } from "@/components/icons";

interface TopbarProps {
  titulo: string;
  busca: string;
  onBuscaChange: (v: string) => void;
  buscaPlaceholder?: string;
  nomeUsuario?: string | null;
  onSair?: () => void;
  extra?: React.ReactNode;
}

export function Topbar({
  titulo,
  busca,
  onBuscaChange,
  buscaPlaceholder = "Buscar por item, local, rack/slide ou solicitante...",
  nomeUsuario,
  onSair,
  extra,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-panel-border/60 bg-bg/70 px-6 py-4 backdrop-blur-md">
      <span className="shrink-0 font-display text-sm font-semibold text-ink">{titulo}</span>

      <div className="relative mx-auto w-full max-w-xl">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder={buscaPlaceholder}
          className="w-full rounded-full border border-panel-border bg-surface-2 py-2.5 pl-10 pr-4 text-sm uppercase text-ink placeholder:normal-case placeholder:text-dim/60 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
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