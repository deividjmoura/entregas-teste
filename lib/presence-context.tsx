"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useOnlineCount } from "./use-online-count";

const PresenceContext = createContext<number | null>(null);

/**
 * Roda o heartbeat UMA vez, na raiz do app — assim qualquer página
 * (painel, solicitante, entregador, ou até a home sem login) conta
 * como "online", em vez de só quem está com /painel aberto.
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const online = useOnlineCount();
  return <PresenceContext.Provider value={online}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  return useContext(PresenceContext);
}