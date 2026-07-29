"use client";

import type { HTMLAttributes, ReactNode, CSSProperties } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({
  className = "",
  tilt: _tilt,
  children,
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-panel-border bg-panel shadow-soft transition-colors ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
