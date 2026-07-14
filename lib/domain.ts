export const TIPO_LABELS: Record<string, string> = {
  COMPONENTE_FISICO: "Componente físico",
  CIRCUITO_ELETRONICO: "Circuito eletrônico",
};

export const URGENCIA_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  CRITICA: "Crítica",
};

export const URGENCIA_PESO: Record<string, number> = {
  CRITICA: 3,
  MEDIA: 2,
  BAIXA: 1,
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