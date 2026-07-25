"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "warning"
  | "success"
  | "danger"
  | "outline-progress";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:brightness-110",
  secondary: "border border-panel-border bg-surface-2 text-ink hover:border-accent/50",
  ghost: "text-dim hover:text-ink hover:bg-surface-2",
  warning: "bg-urgent text-bg hover:brightness-110",
  success: "bg-success text-bg hover:brightness-110",
  danger: "bg-critical text-white hover:brightness-110",
  "outline-progress": "border border-progress/40 text-progress hover:bg-progress/10",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-xl font-display font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";