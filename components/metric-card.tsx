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
      className={`group relative overflow-hidden rounded-xl border bg-panel px-4 py-3.5 text-left shadow-soft transition-all duration-150 ${
        onClick ? "cursor-pointer hover:border-accent/40 hover:shadow-soft-md" : ""
      } ${
        ativo
          ? "border-accent ring-2 ring-accent/20"
          : "border-panel-border"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-dim">
          {label}
        </span>
        {icon && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight text-ink">
        {value}
      </div>
      {subtitle && (
        <div className="mt-0.5 truncate font-mono text-[10px] text-dim">
          {subtitle}
        </div>
      )}
    </Wrapper>
  );
}
