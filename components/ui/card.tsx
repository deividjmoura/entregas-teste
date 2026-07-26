"use client";

import type { HTMLAttributes } from "react";
import { useTilt } from "@/lib/use-tilt";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const { ref, onMouseMove, onMouseLeave, onMouseEnter } = useTilt<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`glass-tilt-card rounded-2xl ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      {...props}
    />
  );
}