import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const resultado = await prisma.solicitacao.updateMany({
    where: { id: params.id, status: "EM_CURSO" },
    data: { status: "ENTREGUE", versao: { increment: 1 } },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { erro: "Só é possível confirmar uma entrega que está em curso" },
      { status: 409 },
    );
  }

  const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
  return NextResponse.json(atualizada);
}
