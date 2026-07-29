import { STATUS_LABELS } from "@/lib/domain";

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: "text-urgent border-urgent/40 bg-urgent/10",
  EM_CURSO: "text-progress border-progress/40 bg-progress/10",
  EM_ROTA: "text-progress border-progress/40 bg-progress/10",
  EM_BAIXA: "text-critical border-critical/40 bg-critical/10",
  ENTREGUE: "text-success border-success/40 bg-success/10",
  CANCELADA: "text-cancel border-cancel/40 bg-cancel/10",
};

export function UrgencyDot({
  pulse = false,
  color = "currentColor",
}: {
  pulse?: boolean;
  color?: string;
}) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${pulse ? "animate-pulse-led" : ""}`}
      style={{ backgroundColor: color }}
    />
  );
}

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[status] ?? "bg-surface-2 text-dim border-panel-border"} ${className}`}
    >
      {status === "PENDENTE" && <UrgencyDot pulse />}
      {status === "EM_BAIXA" && <UrgencyDot pulse />}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
