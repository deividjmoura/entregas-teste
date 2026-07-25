"use client";

import { useEffect, useRef, useState } from "react";

interface Mensagem {
  id: string;
  autorNome: string;
  autorTipo: "SOLICITANTE" | "ENTREGADOR";
  texto: string;
  criadaEm: string;
}

interface ChatPanelProps {
  solicitacaoId: string;
  autorNome: string;
  autorTipo: "SOLICITANTE" | "ENTREGADOR";
  onClose: () => void;
}

const POLL_MS = 2500;

export function ChatPanel({ solicitacaoId, autorNome, autorTipo, onClose }: ChatPanelProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const ultimaMensagemId = useRef<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`);
      if (res.ok && !cancelado) {
        const novasMensagens: Mensagem[] = await res.json();

        // Detectar se tem mensagem nova de outra pessoa
        const ultima = novasMensagens[novasMensagens.length - 1];
        if (
          ultima &&
          ultima.id !== ultimaMensagemId.current &&
          ultima.autorNome !== autorNome
        ) {
          // Notificação visual + sonora
          mostrarNotificacao(ultima);
        }

        ultimaMensagemId.current = ultima?.id || null;
        setMensagens(novasMensagens);
      }
    }

    carregar();
    const interval = setInterval(carregar, POLL_MS);

    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, [solicitacaoId, autorNome]);

  const mostrarNotificacao = (mensagem: Mensagem) => {
    // Notificação sonora
    const audio = new Audio("/notification.mp3"); // coloque um arquivo na pasta public
    audio.volume = 0.6;
    audio.play().catch(() => {});

    // Notificação visual (só dispara se o usuário já concedeu permissão
    // e o chat estiver fora de foco/fechado)
    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      (document.visibilityState === "hidden" || !document.hasFocus())
    ) {
      new Notification("Nova mensagem no chat", {
        body: `${mensagem.autorNome}: ${mensagem.texto.substring(0, 60)}${mensagem.texto.length > 60 ? "..." : ""}`,
        icon: "/favicon.ico",
      });
    }
  };

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);


  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autorNome, autorTipo, texto }),
      });
      if (res.ok) {
        setTexto("");
        const nova = await res.json();
        setMensagens((prev) => [...prev, nova]);
        ultimaMensagemId.current = nova.id;
      }
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

   
  return (
    <div className="fixed inset-x-4 bottom-4 z-30 mx-auto flex h-96 max-w-sm flex-col overflow-hidden rounded-xl border border-panel-border bg-panel shadow-2xl sm:right-4 sm:left-auto">
      <div className="flex shrink-0 items-center justify-between border-b border-panel-border px-3 py-2.5">
        <span className="font-display text-sm font-semibold text-ink">Chat</span>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs text-dim hover:text-ink"
          title="Fechar"
        >
          ✕
        </button>
      </div>

      <div className="scroll-area min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {mensagens.length === 0 && (
          <p className="pt-6 text-center font-mono text-xs text-dim">Nenhuma mensagem ainda</p>
        )}
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
              m.autorTipo === autorTipo ? "ml-auto bg-progress/20 text-ink" : "bg-bg text-ink"
            }`}
          >
            <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wide text-dim">{m.autorNome}</div>
            {m.texto}
          </div>
        ))}
        <div ref={fimRef} />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-panel-border p-2.5">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !enviando && enviar()}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-lg border border-panel-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim/60 focus:border-progress"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="shrink-0 rounded-lg bg-progress px-3 py-2 font-display text-xs font-semibold text-bg hover:brightness-110 disabled:opacity-50"
        >
          {enviando ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}