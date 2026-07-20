"use client";

import { usePresence } from "@/lib/presence-context";

export function OnlineBanner() {
  const online = usePresence();

  return (
    <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-dim">
      <span className="inline-block h-1.5 w-1.5 animate-pulse-led rounded-full bg-success" />
      {online ?? "..."} usuário{online === 1 ? "" : "s"} online
    </div>
  );
}