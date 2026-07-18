"use client";

import { useEffect, useState } from "react";

const CHAVE = "entregas:tema";

export function ThemeToggle() {
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

  return (
    <button
      onClick={() => setTema((t) => (t === "dark" ? "light" : "dark"))}
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-panel-border bg-panel text-ink shadow-md transition hover:brightness-110"
      title={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {tema === "dark" ? "☀️" : "🌙"}
    </button>
  );
}