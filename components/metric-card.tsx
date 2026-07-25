interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accentColor?: string;
  subtitle?: string;
  onClick?: () => void;
  ativo?: boolean;
}

export function MetricCard({
  label,
  value,
  icon,
  accentColor = "rgb(var(--color-accent))",
  subtitle,
  onClick,
  ativo = false,
}: MetricCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`premium-card rounded-xl border bg-panel px-4 py-3 text-left transition-all duration-200 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${ativo ? "border-accent ring-2 ring-accent/30" : "border-panel-border"}`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide text-dim">{label}</span>
        {icon && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-xl font-semibold text-ink sm:text-2xl">{value}</div>
      {subtitle && <div className="mt-0.5 truncate font-mono text-[10px] text-dim">{subtitle}</div>}
    </Wrapper>
  );
}