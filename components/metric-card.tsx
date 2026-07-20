interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: string;
  subtitle?: string;
}

export function MetricCard({ label, value, icon, accentColor = "rgb(var(--color-accent))", subtitle }: MetricCardProps) {
  return (
    <div className="premium-card rounded-2xl border border-panel-border bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-dim">{label}</span>
        {icon && (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-semibold text-ink">{value}</div>
      {subtitle && <div className="mt-1 font-mono text-[11px] text-dim">{subtitle}</div>}
    </div>
  );
}