"use client";

import { StatusBadge } from "@/components/status-badge";
import { BottomSheet } from "@/components/bottom-sheet";
import type { SolicitacaoDTO } from "@/lib/domain";

interface ChatsListModalProps {
  solicitacoes: SolicitacaoDTO[];
  mensagensNaoLidas: Record<string, number>;
  onAbrirChat: (id: string) => void;
  onClose: () => void;
}

export function ChatsListModal({ solicitacoes, mensagensNaoLidas, onAbrirChat, onClose }: ChatsListModalProps) {
  const emCurso = solicitacoes.filter((s) => s.status === "EM_CURSO");

  return (
    <BottomSheet titulo="Conversas" onClose={onClose}>
      {emCurso.length === 0 && (
        <p className="py-8 text-center text-sm text-dim">
          Nenhuma entrega em curso no momento — o chat abre assim que um entregador assumir sua urgência.
        </p>
      )}
      <div className="space-y-2">
        {emCurso.map((s) => (
          <button
            key={s.id}
            onClick={() => onAbrirChat(s.id)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-panel-border bg-surface-2 px-4 py-3 text-left transition-colors hover:border-accent/50"
          >
            <div>
              <div className="text-sm text-ink">{s.descricaoItem}</div>
              <div className="font-mono text-[11px] text-dim">
                {s.localDestino} · {s.entregadorNome ?? "aguardando entregador"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              {mensagensNaoLidas[s.id] > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-critical px-1.5 font-mono text-[10px] font-bold text-white">
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