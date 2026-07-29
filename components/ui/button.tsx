"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "warning"
  | "success"
  | "danger"
  | "outline"
  | "outline-progress";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent/90 shadow-soft border border-transparent",
  secondary:
    "border border-panel-border bg-surface-2 text-ink hover:bg-panel-border/40",
  ghost:
    "bg-transparent text-dim hover:text-ink hover:bg-surface-2 border border-transparent",
  warning:
    "bg-urgent text-white hover:brightness-110 border border-transparent",
  success:
    "bg-success text-white hover:brightness-110 border border-transparent",
  danger:
    "bg-critical text-white hover:brightness-110 border border-transparent",
  outline:
    "bg-transparent text-ink border border-panel-border hover:border-accent/50 hover:bg-accent/5",
  "outline-progress":
    "border border-progress/40 text-progress hover:bg-progress/10 bg-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-5 text-sm rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";
