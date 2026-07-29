#!/usr/bin/env bash
# =============================================================================
#  FIX — favoritos em cards + menos delay no chat/badge
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "▶ Favoritos em cards + chat mais responsivo…"

# -----------------------------------------------------------------------------
# 1. Favoritos — mesmo layout dos cards "Em andamento"
# -----------------------------------------------------------------------------
SOL="app/solicitante/page.tsx"
if [[ -f "$SOL" ]]; then
  python3 - << 'PY'
from pathlib import Path
import re

path = Path("app/solicitante/page.tsx")
text = path.read_text(encoding="utf-8")

old = '''        {favoritos.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-base font-semibold text-ink">
              ⭐ Favoritos <span className="text-dim">({favoritos.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {favoritos.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => refazer(s)}
                  title="Solicitar de novo"
                  className="flex items-center gap-2 rounded-full border border-panel-border bg-surface-2 px-3 py-1.5 text-xs text-ink transition-colors hover:border-accent/50"
                >
                  <span>{s.descricaoItem}</span>
                  <span className="text-dim">· {s.localDestino}</span>
                  <span className="text-accent">↻</span>
                </button>
              ))}
            </div>
          </section>
        )}'''

new = '''        {favoritos.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-base font-semibold text-ink">
              ⭐ Favoritos <span className="text-dim">({favoritos.length})</span>
            </h2>
            <div className="space-y-2">
              {favoritos.map((s) => (
                <Card
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                  style={{ borderLeftWidth: 3, borderLeftColor: URGENCIA_COR[s.urgencia] ?? "rgb(var(--color-accent))" }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-ink">{s.descricaoItem}</div>
                    <div className="font-mono text-[11px] text-dim">
                      {s.localDestino}
                      {s.rackOuSlide ? ` (${s.rackOuSlide})` : ""}
                      {" · "}
                      {TIPO_LABELS[s.tipo] ?? s.tipo}
                      {s.urgencia ? ` · ${URGENCIA_LABELS[s.urgencia] ?? s.urgencia}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => favoritar(s.id, false)}
                      title="Remover dos favoritos"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-urgent transition-colors hover:bg-urgent/10"
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => refazer(s)}
                      title="Solicitar de novo"
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-panel-border bg-surface-2 px-2.5 text-xs font-medium text-ink transition-colors hover:border-accent/50 hover:bg-accent/10"
                    >
                      <span>↻</span>
                      <span>Refazer</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}'''

if old in text:
    path.write_text(text.replace(old, new), encoding="utf-8")
    print("✓ Favoritos: cards no estilo Em andamento")
else:
    # fallback regex mais flexível
    pattern = r'\{favoritos\.length > 0 && \(\s*<section className="mb-8">.*?</section>\s*\)\}'
    m = re.search(pattern, text, flags=re.DOTALL)
    if m:
        text = text[: m.start()] + new + text[m.end() :]
        path.write_text(text, encoding="utf-8")
        print("✓ Favoritos: cards (regex)")
    else:
        print("⚠ Bloco de favoritos não encontrado — edite app/solicitante/page.tsx manualmente")
PY
else
  echo "⚠ app/solicitante/page.tsx não encontrado"
fi

# -----------------------------------------------------------------------------
# 2. Chat mais rápido — poll 2s, marca lida na abertura, badge some na hora
# -----------------------------------------------------------------------------
cat > components/chat-panel.tsx << 'EOF'
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
  forcarFechar?: boolean;
  /** Limpa badge imediatamente ao abrir */
  onAbrir?: () => void;
}

const POLL_MS = 2000;

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
  forcarFechar = false,
  onAbrir,
}: ChatPanelProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ultimaMensagemId = useRef<string | null>(null);

  useEffect(() => {
    if (forcarFechar) onClose();
  }, [forcarFechar, onClose]);

  // Ao abrir: foco + limpar badge + marcar lida na API na hora
  useEffect(() => {
    onAbrir?.();
    const t = setTimeout(() => inputRef.current?.focus(), 50);

    fetch(`/api/solicitacoes/${solicitacaoId}/mensagens/lida`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: autorTipo }),
    }).catch(() => {});

    return () => clearTimeout(t);
  }, [solicitacaoId, autorTipo, onAbrir]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function marcarComoLida() {
      try {
        await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens/lida`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: autorTipo }),
        });
      } catch {}
    }

    async function carregar() {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`);
      if (res.ok && !cancelado) {
        const novasMensagens: Mensagem[] = await res.json();

        const ultima = novasMensagens[novasMensagens.length - 1];
        if (
          ultima &&
          ultima.id !== ultimaMensagemId.current &&
          ultima.autorNome !== autorNome
        ) {
          mostrarNotificacao(ultima);
        }

        ultimaMensagemId.current = ultima?.id || null;
        setMensagens(novasMensagens);
        marcarComoLida();
      }
    }

    carregar();
    const interval = setInterval(carregar, POLL_MS);

    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, [solicitacaoId, autorNome, autorTipo]);

  const mostrarNotificacao = (mensagem: Mensagem) => {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});

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
  };

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  async function enviar() {
    const msg = texto.trim();
    if (!msg) return;
    setEnviando(true);
    setErro(null);
    // Optimistic: limpa input na hora
    setTexto("");
    try {
      const res = await fetch(`/api/solicitacoes/${solicitacaoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autorNome, autorTipo, texto: msg }),
      });
      if (res.ok) {
        const nova = await res.json();
        setMensagens((prev) => {
          if (prev.some((m) => m.id === nova.id)) return prev;
          return [...prev, nova];
        });
        ultimaMensagemId.current = nova.id;
      } else {
        setTexto(msg); // devolve texto se falhou
        const data = await res.json().catch(() => null);
        setErro(data?.erro ?? "Não foi possível enviar a mensagem");
      }
    } catch {
      setTexto(msg);
      setErro("Falha de rede ao enviar mensagem");
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
          <p className="pt-8 text-center font-mono text-xs text-dim">Nenhuma mensagem ainda</p>
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
                <span className="font-mono text-[10px] text-muted">{formatarHoraMsg(m.criadaEm)}</span>
              </div>
              <div className="leading-snug whitespace-pre-wrap break-words">{m.texto}</div>
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
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !enviando && enviar()}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-xl border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-dim/60 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
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
echo "✓ ChatPanel: poll 2s, envio otimista, marca lida ao abrir"

# -----------------------------------------------------------------------------
# 3. Provider — não ressuscita badge limpo por 8s; poll 4s
# -----------------------------------------------------------------------------
cat > lib/use-notificacoes-chat.tsx << 'EOF'
"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface NotificacoesContextType {
  mensagensNaoLidas: Record<string, number>;
  limparNotificacoes: (solicitacaoId: string) => void;
  recarregarNotificacoes: () => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | null>(null);

function lerPerfil(): "solicitante" | "entregador" | null {
  if (typeof window === "undefined") return null;
  const p = localStorage.getItem("entregas:perfil");
  if (p === "entregador" || p === "solicitante") return p;
  return null;
}

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState<Record<string, number>>({});
  const [perfil, setPerfil] = useState<"solicitante" | "entregador" | null>(null);
  // IDs limpos localmente — ignora contagem da API por alguns segundos
  const limposAte = useRef<Record<string, number>>({});

  useEffect(() => {
    setPerfil(lerPerfil());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "entregas:perfil") setPerfil(lerPerfil());
    };
    const onFocus = () => setPerfil(lerPerfil());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    const tick = setInterval(() => setPerfil(lerPerfil()), 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      clearInterval(tick);
    };
  }, []);

  const buscar = useCallback(async () => {
    if (!nome) return;
    const p = lerPerfil();
    if (!p) return;
    const tipo = p === "entregador" ? "ENTREGADOR" : "SOLICITANTE";
    try {
      const params = new URLSearchParams({ nome, tipo });
      const res = await fetch(`/api/solicitacoes/minhas-mensagens-nao-lidas?${params.toString()}`);
      if (res.ok) {
        const data: Record<string, number> = await res.json();
        const agora = Date.now();
        const filtrado: Record<string, number> = {};
        for (const [id, n] of Object.entries(data)) {
          const ate = limposAte.current[id];
          if (ate && agora < ate) continue; // ainda no grace period
          if (n > 0) filtrado[id] = n;
        }
        setMensagensNaoLidas(filtrado);
      }
    } catch (_) {}
  }, [nome]);

  useEffect(() => {
    if (!nome || !perfil) {
      setMensagensNaoLidas({});
      return;
    }
    buscar();
    const interval = setInterval(buscar, 4000);
    return () => clearInterval(interval);
  }, [nome, perfil, buscar]);

  const limparNotificacoes = (solicitacaoId: string) => {
    limposAte.current[solicitacaoId] = Date.now() + 8000; // 8s de graça
    setMensagensNaoLidas((prev) => {
      const novo = { ...prev };
      delete novo[solicitacaoId];
      return novo;
    });
  };

  return (
    <NotificacoesContext.Provider
      value={{ mensagensNaoLidas, limparNotificacoes, recarregarNotificacoes: buscar }}
    >
      {children}
    </NotificacoesContext.Provider>
  );
}

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de NotificacoesProvider");
  return ctx;
};
EOF
echo "✓ Notificações: badge limpo não volta por 8s; poll 4s"

# -----------------------------------------------------------------------------
# 4. Solicitante — passa onAbrir no ChatPanel
# -----------------------------------------------------------------------------
if [[ -f "$SOL" ]]; then
  python3 - << 'PY'
from pathlib import Path
path = Path("app/solicitante/page.tsx")
text = path.read_text(encoding="utf-8")
old = '''      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="SOLICITANTE"
          onClose={() => setChatAberto(null)}
        />
      )}'''
new = '''      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="SOLICITANTE"
          onClose={() => setChatAberto(null)}
          onAbrir={() => limparNotificacoes(chatAberto)}
        />
      )}'''
if old in text:
    path.write_text(text.replace(old, new), encoding="utf-8")
    print("✓ Solicitante: onAbrir limpa badge")
elif "onAbrir=" in text:
    print("✓ Solicitante já tem onAbrir")
else:
    print("⚠ Solicitante ChatPanel: confira onAbrir manualmente")
PY
fi

# Entregador
ENT="app/entregador/page.tsx"
if [[ -f "$ENT" ]]; then
  python3 - << 'PY'
from pathlib import Path
path = Path("app/entregador/page.tsx")
text = path.read_text(encoding="utf-8")
old = '''      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="ENTREGADOR"
          onClose={() => setChatAberto(null)}
        />
      )}'''
new = '''      {chatAberto && (
        <ChatPanel
          solicitacaoId={chatAberto}
          autorNome={nome!}
          autorTipo="ENTREGADOR"
          onClose={() => setChatAberto(null)}
          onAbrir={() => limparNotificacoes(chatAberto)}
        />
      )}'''
# variantes de indentação
if old in text:
    path.write_text(text.replace(old, new), encoding="utf-8")
    print("✓ Entregador: onAbrir limpa badge")
elif "onAbrir=" in text and "ENTREGADOR" in text:
    print("✓ Entregador já tem onAbrir")
else:
    text2 = text.replace(
        'autorTipo="ENTREGADOR"\n          onClose={() => setChatAberto(null)}',
        'autorTipo="ENTREGADOR"\n          onClose={() => setChatAberto(null)}\n          onAbrir={() => limparNotificacoes(chatAberto)}',
    )
    if text2 != text:
        path.write_text(text2, encoding="utf-8")
        print("✓ Entregador: onAbrir (fallback)")
    else:
        print("⚠ Entregador ChatPanel: confira onAbrir")
PY
fi

echo ""
echo "✅ Pronto!"
echo "  • Favoritos em cards (como Em andamento)"
echo "  • Chat: poll 2s, envio otimista, badge some na hora"
echo ""
echo "Hard refresh: Ctrl+Shift+R"
