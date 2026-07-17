"use client";

import { useEffect, useState } from "react";

const CHAVE = "entregas:linhaPredefinida";

export function useLinhaPredefinida() {
  const [linha, setLinhaState] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setLinhaState(localStorage.getItem(CHAVE));
    setCarregado(true);
  }, []);

  function setLinha(valor: string) {
    const limpo = valor.trim().toUpperCase();
    if (limpo) {
      localStorage.setItem(CHAVE, limpo);
      setLinhaState(limpo);
    } else {
      localStorage.removeItem(CHAVE);
      setLinhaState(null);
    }
  }

  return { linha, carregado, setLinha };
}