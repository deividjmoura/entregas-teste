import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`premium-card rounded-2xl border border-panel-border bg-panel shadow-premium-sm ${className}`}
      {...props}
    />
  );
}