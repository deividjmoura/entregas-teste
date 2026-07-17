export const TIPO_LABELS: Record<string, string> = {
  COMPONENTE_FISICO: "Componente físico",
  CIRCUITO_ELETRONICO: "Circuito eletrônico",
};

export const URGENCIA_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  CRITICA: "Crítica",
  LINHA_PARADA: "🔴 Linha parada",
};

export const URGENCIA_PESO: Record<string, number> = {
  LINHA_PARADA: 10,
  CRITICA: 3,
  MEDIA: 2,
  BAIXA: 1,
};

export const URGENCIA_COR: Record<string, string> = {
  LINHA_PARADA: "#FF1F4B",
  CRITICA: "#E8552F",
  MEDIA: "#F2B705",
  BAIXA: "#3EC1D3",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_CURSO: "Em curso",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export interface SolicitacaoDTO {
  id: string;
  tipo: string;
  descricaoItem: string;
  localDestino: string;
  rackOuSlide: string | null;
  foto: string | null;
  urgencia: string;
  status: string;
  solicitanteNome: string;
  entregadorNome: string | null;
  criadaEm: string;
  atualizadaEm: string;
  entregueEm: string | null;
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatarDuracao(ms: number): string {
  const minutos = Math.max(0, Math.round(ms / 60000));
  if (minutos < 60) return `${minutos}min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h${resto > 0 ? ` ${resto}min` : ""}`;
}

function hueParaLocal(nome: string): number {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Cor determinística por nome de local (hash -> HSL), pra cada linha/destino
 * ter sempre a mesma cor entre reloads. `alpha` e `luminosidade` permitem
 * gerar variações translúcidas pro efeito "glass" dos cards do dashboard.
 * Provisório até definirmos uma paleta fixa por localidade.
 */
export function corParaLocal(nome: string, alpha = 1, luminosidade = 55): string {
  const matiz = hueParaLocal(nome);
  return `hsla(${matiz}, 65%, ${luminosidade}%, ${alpha})`;
}

export function mesmoDia(isoA: string, isoB: Date = new Date()): boolean {
  const a = new Date(isoA);
  return (
    a.getFullYear() === isoB.getFullYear() &&
    a.getMonth() === isoB.getMonth() &&
    a.getDate() === isoB.getDate()
  );
}