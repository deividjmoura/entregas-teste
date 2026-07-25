import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const tipo = body.tipo;

  if (!["SOLICITANTE", "ENTREGADOR"].includes(tipo)) {
    return NextResponse.json({ erro: "tipo inválido" }, { status: 400 });
  }

  const campo = tipo === "ENTREGADOR" ? "lidaEntregadorEm" : "lidaSolicitanteEm";

  await prisma.solicitacao.update({
    where: { id: params.id },
    data: { [campo]: new Date() },
  });

  return NextResponse.json({ ok: true });
}