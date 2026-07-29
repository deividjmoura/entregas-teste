"use client";

import { useEffect, useState } from "react";

const CHAVE = "entregas:tema";

type Variant = "floating" | "menu" | "icon";

interface ThemeToggleProps {
  /**
   * floating — botão fixo no canto (legado; preferir menu)
   * menu — item de lista no side menu (AppShell)
   * icon — só o botão circular, sem posicionamento fixo
   */
  variant?: Variant;
  className?: string;
}

export function ThemeToggle({ variant = "menu", className = "" }: ThemeToggleProps) {
  const [tema, setTema] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE) as "dark" | "light" | null;
    setTema(salvo ?? "dark");
  }, []);

  useEffect(() => {
    if (!tema) return;
    document.documentElement.classList.toggle("light", tema === "light");
    localStorage.setItem(CHAVE, tema);
  }, [tema]);

  if (!tema) return null;

  const label = tema === "dark" ? "Tema claro" : "Tema escuro";
  const emoji = tema === "dark" ? "☀️" : "🌙";
  const title = tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";

  function alternar() {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={alternar}
        title={title}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-dim transition-colors hover:bg-accent/10 hover:text-ink ${className}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-base leading-none transition-colors group-hover:bg-accent/15">
          {emoji}
        </span>
        <span className="truncate">{label}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={alternar}
        title={title}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-panel-border bg-panel text-ink shadow-md transition hover:brightness-110 ${className}`}
      >
        {emoji}
      </button>
    );
  }

  // floating (legado)
  return (
    <button
      type="button"
      onClick={alternar}
      title={title}
      className={`fixed bottom-4 left-4 z-[200] flex h-10 w-10 items-center justify-center rounded-full border border-panel-border bg-panel text-ink shadow-md transition hover:brightness-110 ${className}`}
    >
      {emoji}
    </button>
  );
}
