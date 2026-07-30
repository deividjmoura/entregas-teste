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
  const limposAte = useRef<Record<string, number>>({});

  useEffect(() => {
    setPerfil(lerPerfil());

    const atualizarPerfil = () => setPerfil(lerPerfil());

    // Escuta tanto modificações externas (outras abas) quanto internas (mesma aba via evento customizado)
    window.addEventListener("storage", atualizarPerfil);
    window.addEventListener("focus", atualizarPerfil);
    window.addEventListener("entregas:perfilMudou", atualizarPerfil);

    const tick = setInterval(atualizarPerfil, 3000);

    return () => {
      window.removeEventListener("storage", atualizarPerfil);
      window.removeEventListener("focus", atualizarPerfil);
      window.removeEventListener("entregas:perfilMudou", atualizarPerfil);
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
          if (ate && agora < ate) continue;
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
    limposAte.current[solicitacaoId] = Date.now() + 8000;
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
