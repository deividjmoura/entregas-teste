"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconMenu,
  IconClose,
  IconChevronLeft,
  IconChevronRight,
  IconTruck,
  IconDashboard,
  IconLogOut,
  IconRequests,
  IconUsers,
} from "@/components/icons";

const CHAVE_COLAPSADA = "entregas:sidebarColapsada";

export interface AppShellItem {
  label: string;
  icon: string; // emoji legado — mapeado para SVG abaixo
  onClick: () => void;
}

interface AppShellProps {
  papel: string;
  nome: string;
  items: AppShellItem[];
  children: React.ReactNode;
}

/** Mapeia label/emoji → ícone de linha consistente */
function IconForItem({ label, className = "h-4 w-4" }: { label: string; className?: string }) {
  const l = label.toLowerCase();
  if (l.includes("entregador") || l.includes("trocar")) return <IconTruck className={className} />;
  if (l.includes("solicitante")) return <IconRequests className={className} />;
  if (l.includes("painel") || l.includes("geral") || l.includes("dashboard"))
    return <IconDashboard className={className} />;
  if (l.includes("sair") || l.includes("logout")) return <IconLogOut className={className} />;
  if (l.includes("user") || l.includes("online")) return <IconUsers className={className} />;
  return <IconRequests className={className} />;
}

export function AppShell({ papel, nome, items, children }: AppShellProps) {
  const [colapsada, setColapsada] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [abertaMobile, setAbertaMobile] = useState(false);

  useEffect(() => {
    setColapsada(localStorage.getItem(CHAVE_COLAPSADA) === "1");
    setPronto(true);
  }, []);

  function alternarColapso() {
    setColapsada((atual) => {
      const novo = !atual;
      localStorage.setItem(CHAVE_COLAPSADA, novo ? "1" : "0");
      return novo;
    });
  }

  function acionar(fn: () => void) {
    fn();
    setAbertaMobile(false);
  }

  const iniciais = nome.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-bg">
      {/* Hambúrguer mobile */}
      <button
        type="button"
        onClick={() => setAbertaMobile(true)}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-panel-border bg-panel text-ink shadow-soft transition active:scale-95 md:hidden"
        aria-label="Abrir menu"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {abertaMobile && (
        <div
          onClick={() => setAbertaMobile(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}

      {/* Sidebar expandida */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-panel-border bg-sidebar-bg transition-transform duration-200 ease-out ${
          abertaMobile ? "translate-x-0" : "-translate-x-full"
        } ${colapsada ? "md:-translate-x-full" : "md:translate-x-0"}`}
      >
        {/* Header usuário */}
        <div className="flex items-center gap-3 border-b border-panel-border px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-semibold text-accent">
            {iniciais}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-dim">
              {papel}
            </div>
            <div className="truncate text-sm font-medium text-ink">{nome}</div>
          </div>
          <button
            type="button"
            onClick={alternarColapso}
            title="Recolher menu"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dim transition hover:bg-surface-2 hover:text-ink md:flex"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setAbertaMobile(false)}
            title="Fechar menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dim transition hover:bg-surface-2 hover:text-ink md:hidden"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => acionar(item.onClick)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dim transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                <IconForItem label={item.label} />
              </span>
              <span className="truncate font-medium">{item.label}</span>
            </button>
          ))}

          <div className="mt-auto border-t border-panel-border pt-2">
            <ThemeToggle variant="menu" />
          </div>
        </nav>
      </aside>

      {/* Rail colapsado (desktop) */}
      <div
        className={`fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-panel-border bg-panel p-1.5 shadow-soft-md transition-opacity duration-200 md:flex ${
          colapsada && pronto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={alternarColapso}
          title={`${nome} — expandir menu`}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 font-display text-xs font-semibold text-accent transition hover:scale-105"
        >
          {iniciais}
        </button>
        <span className="my-0.5 h-px w-5 bg-panel-border" />
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            title={item.label}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-dim transition hover:bg-surface-2 hover:text-ink"
          >
            <IconForItem label={item.label} className="h-4 w-4" />
          </button>
        ))}
        <ThemeToggle variant="icon" className="!h-9 !w-9 !border-0 !bg-transparent !shadow-none" />
        <span className="my-0.5 h-px w-5 bg-panel-border" />
        <button
          type="button"
          onClick={alternarColapso}
          title="Expandir menu"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-dim transition hover:bg-surface-2 hover:text-ink"
        >
          <IconChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          colapsada ? "md:pl-20" : "md:pl-[240px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
