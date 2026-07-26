"use client";

import { useRef, type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.02)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.23,1,.32,1), box-shadow .4s";
    el.style.transform = "";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 600);
  }

  function handleMouseEnter() {
    const el = ref.current;
    if (el) el.style.transition = "transform .12s ease, box-shadow .4s";
  }

  return (
    <div
      ref={ref}
      className={`glass-tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
}