"use client";

import { useOnlineCount } from "@/lib/use-online-count";

export function OnlineBanner() {
  const online = useOnlineCount();

  return (
    <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-dim">
      <span className="inline-block h-1.5 w-1.5 animate-pulse-led rounded-full bg-success" />
      {online ?? "..."} usuário{online === 1 ? "" : "s"} online
    </div>
  );
}