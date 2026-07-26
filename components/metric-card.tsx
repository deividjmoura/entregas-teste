"use client";

import { useTilt } from "@/lib/use-tilt";

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
  // cast simples: useTilt é tipado por elemento único, mas Wrapper alterna
  // entre <button> e <div> dependendo se onClick foi passado
  const tilt = useTilt<HTMLDivElement>();

  return (
    <Wrapper
      ref={tilt.ref as never}
      onClick={onClick}
      onMouseMove={tilt.onMouseMove as never}
      onMouseLeave={tilt.onMouseLeave as never}
      onMouseEnter={tilt.onMouseEnter as never}
      className={`glass-tilt-card rounded-xl px-4 py-3 text-left transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${ativo ? "border-accent ring-2 ring-accent/30" : ""}`}
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