"use client";

import { useState } from "react";

export function useFotoAmpliada() {
  const [foto, setFoto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function abrir(id: string) {
    setCarregando(true);
    try {
      const res = await fetch(`/api/solicitacoes/${id}/foto`);
      if (res.ok) {
        const data = await res.json();
        setFoto(data.foto);
      } else {
        console.error("Erro na API ao recuperar anexo fotográfico:", res.statusText);
      }
    } catch (error) {
      // Correção de bug: Evita que o estado fique preso em true se houver queda de rede
      console.error("Falha de conectividade ou timeout ao buscar foto:", error);
    } finally {
      setCarregando(false);
    }
  }

  function fechar() {
    setFoto(null);
  }

  return { foto, carregando, abrir, fechar };
}
