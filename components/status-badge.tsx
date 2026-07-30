import { STATUS_LABELS } from "@/lib/domain";

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: "text-amber-500 border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10",
  EM_CURSO: "text-sky-500 border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10",
  EM_ROTA: "text-indigo-500 border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10",
  EM_BAIXA: "text-rose-500 border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10",
  ENTREGUE: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10",
  CANCELADA: "text-zinc-500 border-panel-border bg-surface-2",
};

export function UrgencyDot({ pulse = false, color = "currentColor" }: { pulse?: boolean; color?: string; }) {
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full transition-transform ${pulse ? "animate-pulse-led" : ""}`} style={{ backgroundColor: color }} />;
}

export function StatusBadge({ status, className = "" }: { status: string; className?: string; }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider interactive ${STATUS_STYLES[status] ?? "bg-surface-2 text-dim border-panel-border"} ${className}`}>
      {status === "PENDENTE" && <UrgencyDot pulse color="rgb(245 158 11)" />}
      {status === "EM_BAIXA" && <UrgencyDot pulse color="rgb(244 63 94)" />}
      <span>{STATUS_LABELS[status] ?? status}</span>
    </span>
  );
}
