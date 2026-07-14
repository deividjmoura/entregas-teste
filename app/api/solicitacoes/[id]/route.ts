import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const URGENCIAS_VALIDAS = ["BAIXA", "MEDIA", "CRITICA"];

/**
 * Só permite editar a urgência enquanto a solicitação ainda não foi
 * entregue nem cancelada — depois disso não faz sentido de negócio.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { urgencia } = body;

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
