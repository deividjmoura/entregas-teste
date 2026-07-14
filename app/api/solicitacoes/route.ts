import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const solicitanteNome = request.nextUrl.searchParams.get("solicitanteNome");
  // "q" é a busca livre usada pelo painel público de consulta
  const q = request.nextUrl.searchParams.get("q");
  const limit = request.nextUrl.searchParams.get("limit");

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(solicitanteNome ? { solicitanteNome } : {}),
      ...(q
        ? {
            OR: [
              { descricaoItem: { contains: q, mode: "insensitive" } },
              { localDestino: { contains: q, mode: "insensitive" } },
              { rackOuSlide: { contains: q, mode: "insensitive" } },
              { solicitanteNome: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { criadaEm: "desc" },
    ...(limit ? { take: Number(limit) } : {}),
  });

  return NextResponse.json(solicitacoes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tipo, descricaoItem, localDestino, rackOuSlide, foto, urgencia, solicitanteNome } = body;

  if (!tipo || !descricaoItem || !localDestino || !urgencia || !solicitanteNome) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.create({
    data: {
      tipo,
      descricaoItem: String(descricaoItem).trim().toUpperCase(),
      localDestino: String(localDestino).trim().toUpperCase(),
      rackOuSlide: rackOuSlide ? String(rackOuSlide).trim().toUpperCase() : null,
      foto: foto ? String(foto) : null,
      urgencia,
      solicitanteNome: String(solicitanteNome).trim(),
      status: "PENDENTE",
    },
  });

  return NextResponse.json(solicitacao, { status: 201 });
}
