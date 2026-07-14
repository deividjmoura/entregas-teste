export const TIPO_LABELS: Record<string, string> = {
  COMPONENTE_FISICO: "Componente físico",
  CIRCUITO_ELETRONICO: "Circuito eletrônico",
};

export const URGENCIA_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  CRITICA: "Crítica",
};

// Usado pra ordenar a fila por urgência (maior peso primeiro)
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
}
