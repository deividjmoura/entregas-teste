import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CAMPOS_LISTAGEM = {
  id: true,
  tipo: true,
  descricaoItem: true,
  localDestino: true,
  rackOuSlide: true,
  temFoto: true,
  urgencia: true,
  status: true,
  solicitanteNome: true,
  entregadorNome: true,
  versao: true,
  criadaEm: true,
  atualizadaEm: true,
  entregueEm: true,
  enderecoEstoque: true,
  enderecoAlteradoPor: true,
} as const;

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const solicitanteNome = request.nextUrl.searchParams.get("nome");
  const q = request.nextUrl.searchParams.get("q");
  const desde = request.nextUrl.searchParams.get("desde");
  const ate = request.nextUrl.searchParams.get("ate");
  const limit = request.nextUrl.searchParams.get("limit");

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(solicitanteNome ? { solicitanteNome } : {}),
      ...(desde || ate
        ? {
            criadaEm: {
              ...(desde ? { gte: new Date(desde) } : {}),
              ...(ate ? { lte: new Date(ate) } : {}),
            },
          }
        : {}),
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
    select: CAMPOS_LISTAGEM,
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
      temFoto: Boolean(foto),
      urgencia,
      solicitanteNome: String(solicitanteNome).trim(),
      status: "PENDENTE",
    },
    select: CAMPOS_LISTAGEM,
  });

  return NextResponse.json(solicitacao, { status: 201 });
}