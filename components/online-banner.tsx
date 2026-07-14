"use client";

import { useOnlineCount } from "@/lib/use-online-count";

export function OnlineBanner() {
  const online = useOnlineCount();

  return (
    <div className="mb-6 flex shrink-0 items-center justify-center gap-2 rounded border border-panel-border bg-panel px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-dim">
      <span className="inline-block h-1.5 w-1.5 animate-pulse-led rounded-full bg-success" />
      Demo — {online ?? "..."} usuário{online === 1 ? "" : "s"} online
    </div>
  );
}
