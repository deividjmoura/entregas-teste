"use client";
import { MessageSquare, Plus } from "lucide-react";
interface RudderBarProps {
  onAbrirFormulario: () => void;
  onAbrirChats: () => void;
  totalNaoLidas?: number;
}
export function RudderBar({ onAbrirFormulario, onAbrirChats, totalNaoLidas = 0 }: RudderBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-panel-border bg-panel/80 p-1.5 shadow-premium-lg backdrop-blur-md animate-fade-in">
      <button type="button" onClick={onAbrirChats} className="btn-press relative flex h-10 w-10 items-center justify-center rounded-full text-dim hover:bg-surface-2 hover:text-ink transition-colors outline-none" title="Conversas">
        <MessageSquare className="h-4 w-4" />
        {totalNaoLidas > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-bold text-white animate-pulse">{totalNaoLidas}</span>}
      </button>
      <button type="button" onClick={onAbrirFormulario} className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-premium outline-none" title="Abrir urgência">
        <Plus className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
