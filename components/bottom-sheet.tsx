"use client";

import { type ReactNode } from "react";

interface BottomSheetProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ titulo, onClose, children }: BottomSheetProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scroll-area max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-panel-border bg-panel p-5 shadow-premium sm:rounded-3xl"
>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">{titulo}</h2>
          <button type="button" onClick={onClose} className="font-mono text-sm text-dim hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}