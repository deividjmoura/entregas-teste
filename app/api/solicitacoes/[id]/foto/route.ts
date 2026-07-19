import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint dedicado pra servir a foto sob demanda — assim a listagem
 * principal (GET /api/solicitacoes) não carrega o base64 de cada item
 * a cada poll de 2.5–4s.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id: params.id },
    select: { foto: true },
  });

  if (!solicitacao?.foto) {
    return NextResponse.json({ erro: "Foto não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ foto: solicitacao.foto });
}