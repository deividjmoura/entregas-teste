import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_CHAT = ["EM_CURSO", "EM_ROTA", "EM_BAIXA"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const mensagens = await prisma.mensagem.findMany({
      where: { solicitacaoId: params.id },
      orderBy: { criadaEm: "asc" },
    });
    return NextResponse.json(mensagens);
  } catch (e) {
    console.error("[mensagens GET]", e);
    return NextResponse.json({ erro: "Falha ao carregar mensagens" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const autorNome = String(body?.autorNome ?? "").trim();
    const autorTipo = String(body?.autorTipo ?? "").trim();
    const texto = String(body?.texto ?? "").trim();

    if (!autorNome || !autorTipo || !texto) {
      return NextResponse.json(
        { erro: "Campos obrigatórios faltando (autorNome, autorTipo, texto)" },
        { status: 400 },
      );
    }
    if (!["SOLICITANTE", "ENTREGADOR"].includes(autorTipo)) {
      return NextResponse.json({ erro: "autorTipo inválido" }, { status: 400 });
    }

    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!solicitacao) {
      return NextResponse.json({ erro: "Solicitação não encontrada" }, { status: 404 });
    }

    if (!STATUS_CHAT.includes(solicitacao.status as (typeof STATUS_CHAT)[number])) {
      return NextResponse.json(
        {
          erro: `Chat indisponível para status "${solicitacao.status}". Use quando estiver em curso, em rota ou em baixa.`,
          statusAtual: solicitacao.status,
        },
        { status: 409 },
      );
    }

    const mensagem = await prisma.mensagem.create({
      data: {
        solicitacaoId: params.id,
        autorNome,
        autorTipo,
        texto,
      },
    });

    return NextResponse.json(mensagem, { status: 201 });
  } catch (e) {
    console.error("[mensagens POST]", e);
    return NextResponse.json({ erro: "Falha interna ao salvar mensagem" }, { status: 500 });
  }
}
