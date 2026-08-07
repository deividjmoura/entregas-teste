import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint dedicado pra servir a foto sob demanda — assim a listagem
 * principal (GET /api/solicitacoes) não carrega o base64 de cada item
 * a cada poll de 2.5–4s.
 *
 * Se a solicitação foi aberta sem foto (solicitante não anexou), busca
 * a última foto conhecida do item no estoque e já grava na própria
 * solicitação — assim ela aparece preenchida a partir de agora.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id: params.id },
      select: { foto: true, descricaoItem: true },
    });

    if (!solicitacao) {
      return NextResponse.json({ erro: "Solicitação não encontrada" }, { status: 404 });
    }

    if (solicitacao.foto) {
      return NextResponse.json({ foto: solicitacao.foto });
    }

    const itemConhecido = await prisma.itemEstoque.findFirst({
      where: { nomeItem: { equals: solicitacao.descricaoItem, mode: "insensitive" } },
      select: { foto: true },
    });

    if (!itemConhecido?.foto) {
      return NextResponse.json({ erro: "Foto não encontrada" }, { status: 404 });
    }

    await prisma.solicitacao.update({
      where: { id: params.id },
      data: { foto: itemConhecido.foto, temFoto: true },
    });

    return NextResponse.json({ foto: itemConhecido.foto });
  } catch (e) {
    console.error("Erro ao buscar foto:", e);
    return NextResponse.json(
      { erro: "Erro ao buscar foto", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}