"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/icons";

const CHAVE = "entregas:tema";

type Variant = "floating" | "menu" | "icon";

interface ThemeToggleProps {
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
  const title = tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
  const Icon = tema === "dark" ? IconSun : IconMoon;

  function alternar() {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={alternar}
        title={title}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-dim transition-colors hover:bg-surface-2 hover:text-ink ${className}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-accent/10 group-hover:text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate font-medium">{label}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={alternar}
        title={title}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-dim transition hover:bg-surface-2 hover:text-ink ${className}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={alternar}
      title={title}
      className={`fixed bottom-4 left-4 z-[200] flex h-10 w-10 items-center justify-center rounded-xl border border-panel-border bg-panel text-ink shadow-soft transition hover:bg-surface-2 ${className}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
