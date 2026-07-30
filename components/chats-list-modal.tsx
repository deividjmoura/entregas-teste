"use client";

import { StatusBadge } from "@/components/status-badge";
import { BottomSheet } from "@/components/bottom-sheet";
import { MessageSquareX } from "lucide-react"; // Uso estrito de Lucide Icons
import type { SolicitacaoDTO } from "@/lib/domain";

const STATUS_CHAT = ["EM_CURSO", "EM_ROTA", "EM_BAIXA"];

interface ChatsListModalProps {
  solicitacoes: SolicitacaoDTO[];
  mensagensNaoLidas: Record<string, number>;
  onAbrirChat: (id: string) => void;
  onClose: () => void;
}

export function ChatsListModal({
  solicitacoes,
  mensagensNaoLidas,
  onAbrirChat,
  onClose,
}: ChatsListModalProps) {
  const comChat = solicitacoes.filter((s) => STATUS_CHAT.includes(s.status));

  return (
    <BottomSheet titulo="Conversas ativas" onClose={onClose}>
      {comChat.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
          <MessageSquareX className="h-5 w-5 text-muted stroke-[1.5] mb-2" />
          <p className="font-display text-xs text-dim">Nenhum canal ativo no momento</p>
          <span className="mt-1 font-mono text-[10px] text-muted max-w-[240px] leading-relaxed">
            As salas de chat abrem automaticamente assim que a logística assume a sua urgência.
          </span>
        </div>
      )}
      <div className="space-y-2 max-w-2xl mx-auto">
        {comChat.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onAbrirChat(s.id)}
            className="btn-press interactive flex w-full items-center justify-between gap-3 rounded-md border border-panel-border bg-surface-2 px-4 py-3 text-left outline-none focus:border-indigo-500/50"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium tracking-tight text-ink truncate">{s.descricaoItem}</div>
              <div className="font-mono text-[11px] text-dim mt-0.5 truncate">
                <span className="font-semibold text-ink/70 uppercase">{s.localDestino}</span> · {s.entregadorNome ?? "Aguardando operador"}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={s.status} />
              {mensagensNaoLidas[s.id] > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-bold text-white animate-pulse">
                  {mensagensNaoLidas[s.id]}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
