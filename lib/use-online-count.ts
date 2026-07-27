"use client";

import { useEffect, useState } from "react";

const HEARTBEAT_MS = 5000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("entregas:sessionId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("entregas:sessionId", id);
  }
  return id;
}

export function useOnlineCount(): number | null {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();
    let cancelado = false;
    let emVoo = false; // evita empilhar heartbeats se um anterior ainda não voltou

    async function heartbeat() {
      if (emVoo) return;
      emVoo = true;
      try {
        const res = await fetch("/api/presenca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (res.ok && !cancelado) {
          const data = await res.json();
          setOnline(data.online);
        }
      } catch {
        // Silencioso — não é crítico pro funcionamento do app.
      } finally {
        emVoo = false;
      }
    }

    heartbeat();
    const interval = setInterval(heartbeat, HEARTBEAT_MS);

    // Reforça o heartbeat assim que a aba volta a ficar visível —
    // mobile pausa/atrasa o setInterval em segundo plano.
    function aoFicarVisivel() {
      if (document.visibilityState === "visible") heartbeat();
    }
    document.addEventListener("visibilitychange", aoFicarVisivel);

    return () => {
      cancelado = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", aoFicarVisivel);
    };
  }, []);

  return online;
}
