"use client";

import { useEffect, useState } from "react";

const HEARTBEAT_MS = 10000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem("entregas:sessionId");

  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("entregas:sessionId", id);
  }

  return id;
}

export function useOnlineCount(): number |null {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();

    let cancelado = false;
    let emVoo = false;

    async function heartbeat() {
      if (document.visibilityState !== "visible") return;
      if (emVoo) return;

      emVoo = true;

      try {
        const res = await fetch("/api/presenca", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok && !cancelado) {
          const data = await res.json();
          setOnline(data.online);
        }
      } catch {
        // Silencioso — não é crítico para o funcionamento do app.
      } finally {
        emVoo = false;
      }
    }

    // Executa imediatamente
    heartbeat();

    // Heartbeat periódico
    const interval = setInterval(heartbeat, HEARTBEAT_MS);

    // Quando a aba volta ao foco
    function aoFicarVisivel() {
      if (document.visibilityState === "visible") {
        heartbeat();
      }
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