export const TIPO_LABELS: Record<string, string> = {
  COMPONENTE_FISICO: "Componente",
  CIRCUITO_ELETRONICO: "Circuito",
  OUTROS: "Outros",
};

export const URGENCIA_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  CRITICA: "Crítica",
  LINHA_PARADA: "Linha parada",
};

export const URGENCIA_PESO: Record<string, number> = {
  LINHA_PARADA: 10,
  CRITICA: 3,
  MEDIA: 2,
  BAIXA: 1,
};

// Sincronização estrita com os valores RGBA/Tokens do Design System (Amber, Rose, Sky, Indigo)
export const URGENCIA_COR: Record<string, string> = {
  LINHA_PARADA: "rgb(244 63 94)", // Rose 500
  CRITICA: "rgb(245 158 11)",      // Amber 500
  MEDIA: "rgb(14 165 233)",        // Sky 500
  BAIXA: "rgb(113 113 122)",       // Zinc 500
};

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_CURSO: "Aceito",
  EM_ROTA: "Em rota",
  EM_BAIXA: "Em baixa",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};

export interface SolicitacaoDTO {
  id: string;
  tipo: string;
  descricaoItem: string;
  localDestino: string;
  rackOuSlide: string | null;
  enderecoEstoque: string | null;
  temFoto: boolean;
  urgencia: string;
  status: string;
  favorito: boolean;
  solicitanteNome: string;
  entregadorNome: string | null;
  criadaEm: string;
  atualizadaEm: string;
  entregueEm: string | null;
  enderecoAlteradoPor: string | null;
}

export interface ItemEstoqueResumoDTO {
  nomeItem: string;
  descricao: string | null;
  quantidade: number;
  endereco: string | null;
  temFoto: boolean;
  totalSolicitacoes: number;
}

export interface RotaItemDTO {
  id: string;
  itemId: string;
  destino: string;
  automatica: boolean;
  observacao: string | null;
  criadaPor: string | null;
  criadaEm: string;
}

export interface ItemEstoqueDetalheDTO {
  id?: string;
  nomeItem: string;
  descricao: string | null;
  quantidade: number;
  endereco: string | null;
  ultimoAlteradoPor: string | null;
  foto: string | null;
  rotas: RotaItemDTO[];
  totalSolicitacoes: number;
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
