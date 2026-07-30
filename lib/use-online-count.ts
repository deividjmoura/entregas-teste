"use client";

import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, onDisconnect, off } from "firebase/database";
import { firebaseApp } from "./firebase";

/**
 * Hook de batimento cardíaco (Heartbeat) de conexões de operadores ativos.
 * Atualizado com tratamento estrito de encerramento de listeners para evitar
 * vazamento de memória (memory leaks) e inflação de conexões fantasmas.
 */
export function useOnlineCount() {
  const [contagem, setContagem] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const db = getDatabase(firebaseApp);
    const statusConexaoRef = ref(db, ".info/connected");
    const contadorGeralRef = ref(db, "presenca_contagem");

    // Registro da sessão única deste navegador
    const idSessao = Math.random().toString(36).substring(2, 11);
    const minhaPresencaRef = ref(db, `conexoes_ativas/${idSessao}`);

    const unsubscribeConexao = onValue(statusConexaoRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Quando desconectar, remove automaticamente o nó do banco temporário do Firebase
        onDisconnect(minhaPresencaRef).remove();
        
        // Define que este operador está ativo e online
        set(minhaPresencaRef, {
          timestamp: Date.now(),
          dispositivo: window.navigator.userAgent.slice(0, 40)
        });
      }
    });

    // Escuta e computa em tempo real o volume de conexões ativas na planta
    const unsubscribeContador = onValue(contadorGeralRef, (snapshot) => {
      const valor = snapshot.val();
      setContagem(valor !== null ? Number(valor) : 1);
    });

    // Desmontagem estrita (Remoção total de listeners pendurados e conexões fantasmas)
    return () => {
      // 1. Desliga os ouvintes ativos no Realtime Database
      off(statusConexaoRef);
      off(contadorGeralRef);
      
      // 2. Limpa imediatamente a presença local de forma síncrona para não inflar o banner
      set(minhaPresencaRef, null);
    };
  }, []);

  return contagem;
}
