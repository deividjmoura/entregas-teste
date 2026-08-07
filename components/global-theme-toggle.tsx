"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

// Rotas que já exibem o próprio toggle de tema (via AppShell ou no topo)
// e por isso não devem repetir o rodapé flutuante global.
const ROTAS_SEM_RODAPE = ["/painel", "/pesquisa"];

export function GlobalThemeToggle() {
  const pathname = usePathname();
  const ocultar = ROTAS_SEM_RODAPE.some((rota) => pathname?.startsWith(rota));

  if (ocultar) return null;

  return <ThemeToggle />;
}
