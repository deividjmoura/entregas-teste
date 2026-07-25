"use client";

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

type FieldSize = "sm" | "md";

const FIELD_SIZES: Record<FieldSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2.5 text-sm",
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FieldSize;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: FieldSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", size = "md", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-panel-border bg-surface-2 text-ink outline-none transition-colors placeholder:text-dim/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/20 ${FIELD_SIZES[size]} ${className}`}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", size = "md", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-xl border border-panel-border bg-surface-2 text-ink outline-none transition-colors focus:border-accent/60 focus:ring-2 focus:ring-accent/20 ${FIELD_SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";