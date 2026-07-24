import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type PrismaType = typeof prisma;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const mensagens = await prisma.mensagem.findMany({
    where: { solicitacaoId: params.id },
    orderBy: { criadaEm: "asc" },
  });
  return NextResponse.json(mensagens);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { autorNome, autorTipo, texto } = body;

  if (!autorNome || !autorTipo || !texto?.trim()) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!["SOLICITANTE", "ENTREGADOR"].includes(autorTipo)) {
    return NextResponse.json({ erro: "autorTipo inválido" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.findUnique({ where: { id: params.id } });
  if (!solicitacao || solicitacao.status !== "EM_CURSO") {
    return NextResponse.json(
      { erro: "Chat só está disponível enquanto a entrega está em curso" },
      { status: 409 },
    );
  }

  const mensagem = await prisma.mensagem.create({
    data: {
      solicitacaoId: params.id,
      autorNome: String(autorNome).trim(),
      autorTipo,
      texto: String(texto).trim(),
    },
  });

  return NextResponse.json(mensagem, { status: 201 });
}