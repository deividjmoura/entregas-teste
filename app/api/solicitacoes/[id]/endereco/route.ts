import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const enderecoEstoque = body.enderecoEstoque
    ? String(body.enderecoEstoque).trim().toUpperCase()
    : null;
  const alteradoPor = String(body.alteradoPor ?? "").trim();

  if (!alteradoPor) {
    return NextResponse.json({ erro: "alteradoPor é obrigatório" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.findUnique({ where: { id: params.id } });
  if (!solicitacao) {
    return NextResponse.json({ erro: "Solicitação não encontrada" }, { status: 404 });
  }

  let item = await prisma.itemEstoque.findFirst({
    where: { nomeItem: { equals: solicitacao.descricaoItem, mode: "insensitive" } },
  });

  const enderecoAntigo = item?.endereco ?? null;
  const mudou = enderecoAntigo !== enderecoEstoque;

  if (item) {
    if (mudou) {
      item = await prisma.itemEstoque.update({
        where: { id: item.id },
        data: { endereco: enderecoEstoque },
      });
    }
  } else {
    item = await prisma.itemEstoque.create({
      data: { nomeItem: solicitacao.descricaoItem, endereco: enderecoEstoque },
    });
  }

  if (mudou) {
    await prisma.historicoEnderecoEstoque.create({
      data: {
        itemId: item.id,
        enderecoAntigo,
        enderecoNovo: enderecoEstoque,
        alteradoPor,
      },
    });
  }

  const atualizada = await prisma.solicitacao.update({
    where: { id: params.id },
    data: {
      enderecoEstoque,
      enderecoAlteradoPor: mudou ? alteradoPor : solicitacao.enderecoAlteradoPor,
    },
  });

  return NextResponse.json(atualizada);
}