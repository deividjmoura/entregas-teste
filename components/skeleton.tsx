"use client";

import React from "react";
import { Inbox } from "lucide-react"; // Uso estrito de Lucide Icons para fallback padrão

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-panel-border bg-panel px-4 py-3.5 shadow-premium">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-3.5 w-2/3" />
          <SkeletonLine className="h-2.5 w-1/3" />
        </div>
        <SkeletonLine className="h-5 w-16 shrink-0 rounded" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-panel-border bg-panel px-4 py-3.5 shadow-premium">
      <SkeletonLine className="h-8 w-8 shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3.5 w-2/3" />
        <SkeletonLine className="h-2.5 w-1/3" />
      </div>
      <SkeletonLine className="h-5 w-16 rounded" />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({
  icon = <Inbox className="h-5 w-5 text-muted stroke-[1.5]" />,
  title,
  subtitle,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-panel-border bg-panel/30 px-6 py-10 text-center animate-fade-in">
      <div className="mb-2.5 flex items-center justify-center">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink font-display">{title}</p>
      {subtitle && (
        <p className="mt-1 font-mono text-[10.5px] text-muted max-w-sm mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
