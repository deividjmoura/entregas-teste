import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { nome: string } },
) {
  const nomeItem = decodeURIComponent(params.nome);

  const item = await prisma.itemEstoque.findFirst({
    where: { nomeItem: { equals: nomeItem, mode: "insensitive" } },
  });

  if (!item) return NextResponse.json([]);

  const historico = await prisma.historicoEnderecoEstoque.findMany({
    where: { itemId: item.id },
    orderBy: { alteradoEm: "desc" },
  });

  return NextResponse.json(historico);
}