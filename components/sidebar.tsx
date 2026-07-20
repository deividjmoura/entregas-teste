"use client";

import { IconDashboard, IconRequests, IconUsers, IconTruck } from "@/components/icons";

export type SecaoAdmin = "dashboard" | "solicitacoes" | "solicitantes" | "entregadores";

const ITENS: { id: SecaoAdmin; label: string; icon: (p: { className?: string }) => JSX.Element }[] = [
  { id: "dashboard", label: "Dashboard", icon: IconDashboard },
  { id: "solicitacoes", label: "Solicitações", icon: IconRequests },
  { id: "solicitantes", label: "Solicitantes Online", icon: IconUsers },
  { id: "entregadores", label: "Entregadores Online", icon: IconTruck },
];

interface SidebarProps {
  ativo: SecaoAdmin;
  onNavegar: (secao: SecaoAdmin) => void;
}

export function Sidebar({ ativo, onNavegar }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-panel-border bg-sidebar-bg px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--color-accent))]" />
        <span className="font-display text-sm font-semibold tracking-tight text-ink">
          Entregas Internas
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {ITENS.map(({ id, label, icon: Icon }) => {
          const ativoAtual = ativo === id;
          return (
            <button
              key={id}
              onClick={() => onNavegar(id)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-sm transition ${
                ativoAtual
                  ? "bg-accent/10 text-ink"
                  : "text-dim hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition ${
                  ativoAtual ? "text-accent" : "text-dim group-hover:text-ink"
                }`}
              />
              {label}
              {ativoAtual && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 px-2 font-mono text-[10px] uppercase tracking-wide text-dim/70">
        v0.1 · demo
      </div>
    </aside>
  );
}