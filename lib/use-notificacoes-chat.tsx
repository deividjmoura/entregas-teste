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
