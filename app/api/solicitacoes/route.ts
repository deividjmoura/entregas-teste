import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const solicitanteNome = request.nextUrl.searchParams.get("solicitanteNome");

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(solicitanteNome ? { solicitanteNome } : {}),
    },
    orderBy: { criadaEm: "desc" },
  });

  return NextResponse.json(solicitacoes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tipo, descricaoItem, localDestino, urgencia, solicitanteNome } = body;

  if (!tipo || !descricaoItem || !localDestino || !urgencia || !solicitanteNome) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.create({
    data: {
      tipo,
      descricaoItem: String(descricaoItem).trim(),
      localDestino: String(localDestino).trim(),
      urgencia,
      solicitanteNome: String(solicitanteNome).trim(),
      status: "PENDENTE",
    },
  });

  return NextResponse.json(solicitacao, { status: 201 });
}
