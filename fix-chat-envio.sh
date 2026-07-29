#!/usr/bin/env bash
# =============================================================================
#  FIX DEFINITIVO — envio de mensagens (solicitante e entregador)
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "▶ Reescrevendo API de mensagens + ChatPanel…"

# -----------------------------------------------------------------------------
# 1. API — status corretos + erros claros
# -----------------------------------------------------------------------------
mkdir -p "app/api/solicitacoes/[id]/mensagens"

cat > "app/api/solicitacoes/[id]/mensagens/route.ts" << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_CHAT = ["EM_CURSO", "EM_ROTA", "EM_BAIXA"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const mensagens = await prisma.mensagem.findMany({
      where: { solicitacaoId: params.id },
      orderBy: { criadaEm: "asc" },
    });
    return NextResponse.json(mensagens);
  } catch (e) {
    console.error("[mensagens GET]", e);
    return NextResponse.json({ erro: "Falha ao carregar mensagens" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const autorNome = String(body?.autorNome ?? "").trim();
    const autorTipo = String(body?.autorTipo ?? "").trim();
    const texto = String(body?.texto ?? "").trim();

    if (!autorNome || !autorTipo || !texto) {
      return NextResponse.json(
        { erro: "Campos obrigatórios faltando (autorNome, autorTipo, texto)" },
        { status: 400 },
      );
    }
    if (!["SOLICITANTE", "ENTREGADOR"].includes(autorTipo)) {
      return NextResponse.json({ erro: "autorTipo inválido" }, { status: 400 });
    }

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!solicitacao) {
      return NextResponse.json({ erro: "Solicitação não encontrada" }, { status: 404 });
    }

    if (!STATUS_CHAT.includes(solicitacao.status as (typeof STATUS_CHAT)[number])) {
      return NextResponse.json(
        {
          erro: `Chat indisponível para status "${solicitacao.status}". Use quando estiver em curso, em rota ou em baixa.`,
          statusAtual: solicitacao.status,
        },
        { status: 409 },
      );
    }

    const mensagem = await prisma.mensagem.create({
      data: {
        solicitacaoId: params.id,
        autorNome,
        autorTipo,
        texto,
      },
    });

    return NextResponse.json(mensagem, { status: 201 });
  } catch (e) {
    console.error("[mensagens POST]", e);
    return NextResponse.json({ erro: "Falha interna ao salvar mensagem" }, { status: 500 });
  }
}
EOF
echo "✓ API mensagens reescrita"

# -----------------------------------------------------------------------------
# 2. Confirmar → apaga chat
# -----------------------------------------------------------------------------
mkdir -p "app/api/solicitacoes/[id]/confirmar"
cat > "app/api/solicitacoes/[id]/confirmar/route.ts" << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const resultado = await prisma.solicitacao.updateMany({
    where: { id: params.id, status: "EM_ROTA" },
    data: {
      status: "ENTREGUE",
      versao: { increment: 1 },
      entregueEm: new Date(),
    },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { erro: "Só é possível confirmar uma entrega que está em rota" },
      { status: 409 },
    );
  }

  await prisma.mensagem.deleteMany({ where: { solicitacaoId: params.id } });

  const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
  return NextResponse.json(atualizada);
}
EOF
echo "✓ Confirmar apaga mensagens"

# -----------------------------------------------------------------------------
# 3. ChatPanel robusto (sem prop obrigatória que quebre o pai)
# -----------------------------------------------------------------------------
cat > components/chat-panel.tsx << 'EOF'
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  onAbrir?: () => void;
}

const POLL_MS = 2500;

function formatarHoraMsg(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatPanel({
  solicitacaoId,
  autorNome,
  autorTipo,
  onClose,
  onAbrir,
}: ChatPanelProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ultimaMensagemId = useRef<string | null>(null);
  const onAbrirRef = useRef(onAbrir);
  onAbrirRef.current = onAbrir;

  // Abertura: foco + limpar badge + marcar lida
  useEffect(() => {
    onAbrirRef.current?.();
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    fetch(`/api/solicitacoes/${solicitacaoId}/mensagens/lida`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: autorTipo }),
    }).catch(() => {});
    return () => clearTimeout(t);
  }, [solicitacaoId, autorTipo]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const mostrarNotificacao = useCallback((mensagem: Mensagem) => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}

    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      (document.visibilityState === "hidden" || !document.hasFocus())
    ) {
      new Notification("Nova mensagem no chat", {
        body: `${mensagem.autorNome}: ${mensagem.texto.substring(0, 60)}${
          mensagem.texto.length > 60 ? "..." : ""
        }`,
        icon: "/favicon.ico",
      });
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      try {
        const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`);
        if (!res.ok || cancelado) return;
        const novasMensagens: Mensagem[] = await res.json();

        const ultima = novasMensagens[novasMensagens.length - 1];
        if (
          ultima &&
          ultima.id !== ultimaMensagemId.current &&
          ultima.autorNome !== autorNome
        ) {
          mostrarNotificacao(ultima);
        }

        ultimaMensagemId.current = ultima?.id ?? null;
        setMensagens(novasMensagens);

        fetch(`/api/solicitacoes/${solicitacaoId}/mensagens/lida`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: autorTipo }),
        }).catch(() => {});
      } catch {}
    }

    carregar();
    const interval = setInterval(carregar, POLL_MS);
    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, [solicitacaoId, autorNome, autorTipo, mostrarNotificacao]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  async function enviar() {
    const msg = texto.trim();
    if (!msg || enviando) return;

    if (!autorNome?.trim()) {
      setErro("Nome do usuário não carregado. Recarregue a página.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autorNome: autorNome.trim(),
          autorTipo,
          texto: msg,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setTexto("");
        setMensagens((prev) => {
          if (data?.id && prev.some((m) => m.id === data.id)) return prev;
          return data?.id ? [...prev, data as Mensagem] : prev;
        });
        if (data?.id) ultimaMensagemId.current = data.id;
      } else {
        setErro(
          (data as { erro?: string })?.erro ??
            `Erro ao enviar (${res.status}). Tente de novo.`,
        );
      }
    } catch {
      setErro("Falha de rede. Verifique a conexão.");
    } finally {
      setEnviando(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel shadow-soft-lg"
      role="dialog"
      aria-label="Chat"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-panel-border px-3.5 py-2.5">
        <span className="font-display text-sm font-semibold text-ink">Chat</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg font-mono text-sm text-dim transition hover:bg-surface-2 hover:text-ink"
          title="Fechar"
          aria-label="Fechar chat"
        >
          ✕
        </button>
      </div>

      <div className="scroll-area min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {mensagens.length === 0 && (
          <p className="pt-8 text-center font-mono text-xs text-dim">
            Nenhuma mensagem ainda
          </p>
        )}
        {mensagens.map((m) => {
          const minha = m.autorTipo === autorTipo;
          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-1.5 text-sm ${
                minha ? "ml-auto bg-accent/20 text-ink" : "bg-surface-2 text-ink"
              }`}
            >
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-dim">
                  {m.autorNome}
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {formatarHoraMsg(m.criadaEm)}
                </span>
              </div>
              <div className="leading-snug break-words whitespace-pre-wrap">{m.texto}</div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      {erro && (
        <div className="border-t border-critical/30 bg-critical/10 px-3 py-1.5 font-mono text-[11px] text-critical">
          {erro}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2 border-t border-panel-border p-2.5">
        <input
          ref={inputRef}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            if (erro) setErro(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          placeholder="Digite uma mensagem..."
          disabled={enviando}
          className="flex-1 rounded-xl border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-dim/60 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="shrink-0 rounded-xl bg-accent px-3.5 py-2 font-display text-xs font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
        >
          {enviando ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
EOF
echo "✓ ChatPanel reescrito"

# -----------------------------------------------------------------------------
# 4. Solicitante — garante onAbrir seguro
# -----------------------------------------------------------------------------
SOL="app/solicitante/page.tsx"
if [[ -f "$SOL" ]]; then
  python3 - << 'PY'
from pathlib import Path
path = Path("app/solicitante/page.tsx")
text = path.read_text(encoding="utf-8")

# Garante bloco ChatPanel correto
import re
pattern = r"\{chatAberto && \(\s*<ChatPanel[\s\S]*?/>\s*\)\}"
replacement = '''{chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="SOLICITANTE"
          onClose={() => setChatAberto(null)}
          onAbrir={() => limparNotificacoes(chatAberto)}
        />
      )}'''
new_text, n = re.subn(pattern, replacement, text, count=1)
if n:
    path.write_text(new_text, encoding="utf-8")
    print("✓ Solicitante ChatPanel atualizado")
else:
    print("ℹ Solicitante: bloco ChatPanel não alterado (já ok ou padrão diferente)")
PY
fi

ENT="app/entregador/page.tsx"
if [[ -f "$ENT" ]]; then
  python3 - << 'PY'
from pathlib import Path
import re
path = Path("app/entregador/page.tsx")
text = path.read_text(encoding="utf-8")
pattern = r"\{chatAberto && \(\s*<ChatPanel[\s\S]*?/>\s*\)\}"
replacement = '''{chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="ENTREGADOR"
          onClose={() => setChatAberto(null)}
          onAbrir={() => limparNotificacoes(chatAberto)}
        />
      )}'''
new_text, n = re.subn(pattern, replacement, text, count=1)
if n:
    path.write_text(new_text, encoding="utf-8")
    print("✓ Entregador ChatPanel atualizado")
else:
    print("ℹ Entregador: bloco ChatPanel não alterado")
PY
fi

echo ""
echo "✅ Fix aplicado."
echo ""
echo "IMPORTANTE — reinicie limpo:"
echo "  rm -rf .next"
echo "  npm run dev"
echo ""
echo "Depois hard refresh (Ctrl+Shift+R)."
echo ""
echo "Se ainda falhar, abra o DevTools (F12) → Network →"
echo "filtre por 'mensagens' → clique Enviar → veja o status e o body"
echo "da resposta (erro / statusAtual). Me mande esse JSON se precisar."
