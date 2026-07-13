"use client";

import { useEffect, useState } from "react";

function formatar(ms: number): string {
  const segundos = Math.floor(ms / 1000);
  if (segundos < 60) return `há ${segundos}s`;

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos}min`;

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return `há ${horas}h${minutosRestantes > 0 ? ` ${minutosRestantes}min` : ""}`;
}

interface ElapsedTimeProps {
  since: string; // ISO date string (ex: criadaEm)
  className?: string;
  /** Se true, fica vermelho depois de passar de alertAfterMinutes esperando */
  alertAfterMinutes?: number;
}

export function ElapsedTime({ since, className = "", alertAfterMinutes }: ElapsedTimeProps) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const inicio = new Date(since).getTime();
  const decorridoMs = Math.max(0, agora - inicio);
  const decorridoMin = decorridoMs / 60000;

  const emAlerta = alertAfterMinutes !== undefined && decorridoMin >= alertAfterMinutes;

  return (
    <span className={`${className} ${emAlerta ? "text-critical" : ""}`}>
      {formatar(decorridoMs)}
    </span>
  );
}
