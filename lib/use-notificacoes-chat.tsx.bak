"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface NotificacoesContextType {
  mensagensNaoLidas: Record<string, number>;
  limparNotificacoes: (solicitacaoId: string) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | null>(null);

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const { nome } = useAuth();
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!nome) return;

    const perfil = localStorage.getItem("entregas:perfil"); // "solicitante" | "entregador"
    if (!perfil) return;

    const tipo = perfil === "entregador" ? "ENTREGADOR" : "SOLICITANTE";

    const buscar = async () => {
      try {
        const params = new URLSearchParams({ nome, tipo });
        const res = await fetch(`/api/solicitacoes/minhas-mensagens-nao-lidas?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMensagensNaoLidas(data);
        }
      } catch (_) {}
    };

    buscar();
    const interval = setInterval(buscar, 4000);

    return () => clearInterval(interval);
  }, [nome]);

  const limparNotificacoes = (solicitacaoId: string) => {
    setMensagensNaoLidas((prev) => {
      const novo = { ...prev };
      delete novo[solicitacaoId];
      return novo;
    });
  };

  return (
    <NotificacoesContext.Provider value={{ mensagensNaoLidas, limparNotificacoes }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export const useNotificacoes = () => {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de NotificacoesProvider");
  return ctx;
};