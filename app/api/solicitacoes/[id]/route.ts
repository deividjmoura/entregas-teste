import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const URGENCIAS_VALIDAS = ["BAIXA", "MEDIA", "CRITICA", "LINHA_PARADA"];

// De onde cada novo status pode vir. EM_ROTA ainda pode nascer de EM_BAIXA
// (o entregador corrige um "não achei" anterior e confirma que achou),
// mas o caminho contrário — ir de EM_ROTA pra EM_BAIXA — não é mais
// permitido: depois de marcar "achei" não faz sentido voltar a "não achei".
const STATUS_TRANSICOES_VALIDAS: Record<string, string[]> = {
  EM_ROTA: ["EM_CURSO", "EM_BAIXA"],
  EM_BAIXA: ["EM_CURSO"],
};

/**
 * Endpoint único pra tudo que é "editar campo de uma solicitação existente":
 * urgência, transição de status do entregador (achei / não achei) e
 * favoritar. Em vez de criar uma rota nova pra cada ação, o body decide
 * qual bloco roda — mantém o número de arquivos de API baixo.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { urgencia, status, favorito } = body;

  // Favoritar independe de status — funciona até em solicitação já
  // concluída, é só uma marcação do solicitante no histórico.
  if (favorito !== undefined) {
    const atualizada = await prisma.solicitacao.update({
      where: { id: params.id },
      data: { favorito: Boolean(favorito) },
    });
    return NextResponse.json(atualizada);
  }

  // Transição de status feita pelo entregador (achei / não achei o item).
  if (status !== undefined) {
    const origensValidas = STATUS_TRANSICOES_VALIDAS[status];
    if (!origensValidas) {
      return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
    }
    const resultado = await prisma.solicitacao.updateMany({
      where: { id: params.id, status: { in: origensValidas } },
      data: { status },
    });
    if (resultado.count === 0) {
      return NextResponse.json(
        { erro: "Não é possível fazer essa mudança de status agora" },
        { status: 409 },
      );
    }
    const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
    return NextResponse.json(atualizada);
  }

  // Alterar urgência (comportamento original).
  if (urgencia !== undefined) {
    if (!URGENCIAS_VALIDAS.includes(urgencia)) {
      return NextResponse.json({ erro: "Urgência inválida" }, { status: 400 });
    }
    const resultado = await prisma.solicitacao.updateMany({
      where: { id: params.id, status: { in: ["PENDENTE", "EM_CURSO"] } },
      data: { urgencia },
    });
    if (resultado.count === 0) {
      return NextResponse.json(
        { erro: "Só é possível alterar a urgência de solicitações pendentes ou em curso" },
        { status: 409 },
      );
    }
    const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
    return NextResponse.json(atualizada);
  }

  return NextResponse.json({ erro: "Nenhum campo válido para atualizar" }, { status: 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const resultado = await prisma.solicitacao.updateMany({
    where: { id: params.id, status: { not: "ENTREGUE" } },
    data: { status: "CANCELADA" },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { erro: "Não é possível cancelar uma solicitação já entregue" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
