import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
