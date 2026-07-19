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
      }
    } finally {
      setCarregando(false);
    }
  }

  function fechar() {
    setFoto(null);
  }

  return { foto, carregando, abrir, fechar };
}