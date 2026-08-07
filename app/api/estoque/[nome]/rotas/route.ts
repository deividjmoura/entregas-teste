import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { nome: string } },
) {
  try {
    const nomeItem = decodeURIComponent(params.nome).trim().toUpperCase();

    const item = await prisma.itemEstoque.findFirst({
      where: { nomeItem: { equals: nomeItem, mode: "insensitive" } },
    });

    if (!item) return NextResponse.json([]);

    const rotas = await prisma.rotaItem.findMany({
      where: { itemId: item.id },
      orderBy: { criadaEm: "desc" },
      take: 50,
    });

    return NextResponse.json(rotas);
  } catch (e) {
    console.error("Erro ao buscar rotas do item:", e);
    return NextResponse.json(
      { erro: "Erro ao buscar rotas do item", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

/**
 * Adiciona uma rota/anotação manual ao histórico do item (ex: "também já
 * foi levado pra LINHA 3" ou uma observação sobre um destino). As rotas
 * automáticas são criadas pelo próprio fluxo de confirmação de entrega.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { nome: string } },
) {
  try {
    const nomeItem = decodeURIComponent(params.nome).trim().toUpperCase();
    const body = await request.json();
    const { destino, observacao, criadaPor } = body ?? {};

    if (!destino || !String(destino).trim()) {
      return NextResponse.json({ erro: "Informe o destino da rota" }, { status: 400 });
    }

    const item = await prisma.itemEstoque.upsert({
      where: { nomeItem },
      update: {},
      create: { nomeItem },
    });

    const rota = await prisma.rotaItem.create({
      data: {
        itemId: item.id,
        destino: String(destino).trim().toUpperCase(),
        observacao: observacao ? String(observacao).trim() : null,
        criadaPor: criadaPor ? String(criadaPor).trim() : null,
        automatica: false,
      },
    });

    return NextResponse.json(rota, { status: 201 });
  } catch (e) {
    console.error("Erro ao adicionar rota:", e);
    return NextResponse.json(
      { erro: "Erro ao adicionar rota", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
