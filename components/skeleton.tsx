export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-panel-border bg-panel px-4 py-3 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-3.5 w-2/3" />
          <SkeletonLine className="h-2.5 w-1/3" />
        </div>
        <SkeletonLine className="h-5 w-16 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-panel-border bg-panel px-4 py-3">
      <SkeletonLine className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3.5 w-2/3" />
        <SkeletonLine className="h-2.5 w-1/3" />
      </div>
      <SkeletonLine className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-panel-border bg-panel/50 px-6 py-10 text-center">
      <div className="mb-2 text-2xl">{icon}</div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {subtitle && (
        <p className="mt-1 font-mono text-[11px] text-dim">{subtitle}</p>
      )}
    </div>
  );
}
