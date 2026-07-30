"use client";

import { usePresence } from "@/lib/presence-context";

export function OnlineBanner() {
  const online = usePresence();

  return (
    <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-dim select-none animate-fade-in">
      <span 
        className={`inline-block h-1.5 w-1.5 rounded-full shadow-sm ${
          online !== null && online > 0 ? "bg-emerald-500 animate-pulse-led" : "bg-zinc-600"
        }`} 
      />
      <span>
        {online !== null ? `${online} usuário${online === 1 ? "" : "s"} online` : "sincronizando..."}
      </span>
    </div>
  );
}
