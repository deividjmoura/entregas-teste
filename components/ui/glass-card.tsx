import { HTMLAttributes } from "react";

/** Mantido por compatibilidade — agora é um card flat premium */
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      className={`rounded-xl border border-panel-border bg-panel shadow-soft transition-all duration-150 hover:border-accent/30 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
