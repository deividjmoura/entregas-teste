import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const entregadorNome = String(body.entregadorNome ?? "").trim();

  if (!entregadorNome) {
    return NextResponse.json(
      { erro: "Nome do entregador é obrigatório" },
      { status: 400 },
    );
  }

  const resultado = await prisma.solicitacao.updateMany({
    where: {
      id: params.id,
      status: "PENDENTE",
    },
    data: {
      status: "EM_CURSO",
      entregadorNome,
      versao: {
        increment: 1,
      },
    },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { erro: "Essa urgência já foi assumida por outro entregador" },
      { status: 409 },
    );
  }

  await prisma.mensagem.deleteMany({
    where: {
      solicitacaoId: params.id,
    },
  });

  const atualizada = await prisma.solicitacao.findUnique({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json(atualizada);
}