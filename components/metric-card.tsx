"use client";
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: string;
  subtitle?: string;
  onClick?: () => void;
  ativo?: boolean;
}
export function MetricCard({ label, value, icon, accentColor = "rgb(var(--color-accent))", subtitle, onClick, ativo = false }: MetricCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper onClick={onClick} className={`group relative overflow-hidden rounded-lg border bg-panel px-4 py-3.5 text-left transition-all duration-150 shadow-premium outline-none ${onClick ? "btn-press cursor-pointer hover:border-zinc-700 dark:hover:border-zinc-800 hover:bg-surface-2/40" : ""} ${ativo ? "border-indigo-500/50 bg-indigo-500/[0.02]" : "border-panel-border"}`}>
      {ativo && <div className="absolute inset-y-0 left-0 w-[2px]" style={{ backgroundColor: accentColor }} />}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-dim">{label}</span>
        {icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>{icon}</span>}
      </div>
      <div className="font-display text-2xl font-medium tracking-tight text-ink">{value}</div>
      {subtitle && <div className="mt-1 truncate font-mono text-[9.5px] uppercase tracking-wide text-muted">{subtitle}</div>}
    </Wrapper>
  );
}
