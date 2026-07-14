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

    async function heartbeat() {
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
      }
    }

    heartbeat();
    const interval = setInterval(heartbeat, HEARTBEAT_MS);
    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, []);

  return online;
}
