"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const CHAVE_COLAPSADA = "entregas:sidebarColapsada";

export interface AppShellItem {
  label: string;
  icon: string; // emoji — mesmo estilo visual usado no resto do app (💬, 📷, 🛒...)
  onClick: () => void;
}

interface AppShellProps {
  papel: string;
  nome: string;
  items: AppShellItem[];
  children: React.ReactNode;
}

/**
 * Navegação lateral no mesmo idioma visual do resto do app: vidro
 * translúcido, glow de aurora, cantos bem arredondados — a mesma família
 * do Card, da Topbar e do RudderBar.
 *
 * Desktop:
 *  - Expandida: painel cheio encostado na borda esquerda, com avatar,
 *    nome/papel e rótulos completos.
 *  - Recolhida: em vez de uma faixa fina ocupando a tela inteira de cima
 *    a baixo, vira uma pílula flutuante grudada na borda — só os ícones,
 *    centralizada verticalmente, "escapando" pro canto sem tomar o
 *    espaço do conteúdo.
 * Mobile: gaveta (drawer) acionada pelo botão hambúrguer flutuante,
 * igual ao padrão já usado no resto do app.
 */
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
      {/* Hambúrguer — só mobile */}
      <button
        type="button"
        onClick={() => setAbertaMobile(true)}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-panel-border bg-panel/90 text-ink shadow-premium-sm backdrop-blur-md transition-transform active:scale-95 md:hidden"
        aria-label="Abrir menu"
      >
        <span className="text-lg leading-none">☰</span>
      </button>

      {/* Overlay — só mobile, com a gaveta aberta */}
      {abertaMobile && (
        <div
          onClick={() => setAbertaMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}

      {/* Painel completo — gaveta no mobile, sidebar expandida no desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden rounded-r-3xl border border-l-0 border-panel-border/70 bg-panel/90 shadow-premium backdrop-blur-xl transition-transform duration-300 ease-out md:w-64 ${
          abertaMobile ? "translate-x-0" : "-translate-x-full"
        } ${colapsada ? "md:-translate-x-full" : "md:translate-x-0"}`}
      >
        {/* glow decorativo, ecoando as aurora-blobs do fundo */}
        <div
          className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(129,140,248,0.6), transparent 70%)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(45,212,191,0.55), transparent 70%)" }}
          aria-hidden
        />

        <div className="relative flex items-center gap-3 border-b border-panel-border/60 px-4 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 font-display text-sm font-bold text-accent ring-1 ring-accent/30">
            {iniciais}
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{papel}</div>
            <div className="truncate font-display text-sm font-semibold text-ink">{nome}</div>
          </div>

          {/* Recolher — só desktop */}
          <button
            type="button"
            onClick={alternarColapso}
            title="Recolher menu"
            className="ml-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-dim transition-colors hover:bg-surface-2 hover:text-ink md:flex"
          >
            <span className="text-xs">◂</span>
          </button>
          {/* Fechar gaveta — só mobile */}
          <button
            type="button"
            onClick={() => setAbertaMobile(false)}
            title="Fechar menu"
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-dim transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => acionar(item.onClick)}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-dim transition-colors hover:bg-accent/10 hover:text-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-base leading-none transition-colors group-hover:bg-accent/15">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}

          {/* Tema — fica no menu, sem botão flutuante permanente */}
          <div className="mt-auto border-t border-panel-border/60 pt-2">
            <ThemeToggle variant="menu" />
          </div>
        </nav>
      </aside>

      {/* Pílula flutuante — só desktop, só quando recolhida: os ícones
         "espiando" pela borda, sem ocupar a altura inteira da tela nem
         empurrar o conteúdo. */}
      <div
        className={`fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-panel-border bg-panel/90 p-1.5 shadow-premium ring-1 ring-accent/10 backdrop-blur-xl transition-opacity duration-300 md:flex ${
          colapsada && pronto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={alternarColapso}
          title={`${nome} — expandir menu`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-display text-xs font-bold text-accent ring-1 ring-accent/30 transition-transform hover:scale-105"
        >
          {iniciais}
        </button>

        <span className="my-0.5 h-px w-6 bg-panel-border" />

        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            title={item.label}
            className="flex h-10 w-10 items-center justify-center rounded-full text-base text-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {item.icon}
          </button>
        ))}

        <ThemeToggle variant="icon" className="!h-10 !w-10 !border-0 !bg-transparent !shadow-none" />

        <span className="my-0.5 h-px w-6 bg-panel-border" />

        <button
          type="button"
          onClick={alternarColapso}
          title="Expandir menu"
          className="flex h-8 w-8 items-center justify-center rounded-full text-dim transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <span className="text-xs">▸</span>
        </button>
      </div>

      <div className={`transition-[padding] duration-300 ${colapsada ? "md:pl-24" : "md:pl-64"}`}>{children}</div>
    </div>
  );
}
