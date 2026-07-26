"use client";

import type { HTMLAttributes } from "react";
import { useTilt } from "@/lib/use-tilt";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
}

export function Card({ className = "", tilt = true, ...props }: CardProps) {
  const { ref, onMouseMove, onMouseLeave, onMouseEnter } = useTilt<HTMLDivElement>();

  if (!tilt) {
    return <div className={`glass-tilt-card rounded-2xl ${className}`} {...props} />;
  }

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