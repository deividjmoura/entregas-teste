"use client";

interface RudderBarProps {
  onAbrirFormulario: () => void;
  onAbrirChats: () => void;
  totalNaoLidas?: number;
}

export function RudderBar({ onAbrirFormulario, onAbrirChats, totalNaoLidas = 0 }: RudderBarProps) {
  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-panel-border bg-panel/90 p-1.5 shadow-premium backdrop-blur-md">
      <button
        type="button"
        onClick={onAbrirChats}
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-dim transition-colors hover:bg-surface-2 hover:text-ink"
        title="Conversas"
      >
        💬
        {totalNaoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 font-mono text-[9px] font-bold text-white">
            {totalNaoLidas}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onAbrirFormulario}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-bold text-white transition-transform hover:scale-105 active:scale-95"
        title="Abrir urgência"
      >
        +
      </button>
    </div>
  );
}