import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { nome: string } },
) {
  try {
    const nomeItem = decodeURIComponent(params.nome).trim().toUpperCase();

    const [item, totalSolicitacoes] = await Promise.all([
      prisma.itemEstoque.findFirst({
        where: { nomeItem: { equals: nomeItem, mode: "insensitive" } },
        include: { rotas: { orderBy: { criadaEm: "desc" }, take: 5 } },
      }),
      prisma.solicitacao.count({ where: { descricaoItem: { equals: nomeItem, mode: "insensitive" } } }),
    ]);

    if (!item) {
      // Item ainda não tem cadastro no estoque, mas pode já ter sido
      // solicitado — devolve um "esqueleto" pra página conseguir exibir
      // e permitir o primeiro cadastro (descrição/quantidade/endereço).
      if (totalSolicitacoes === 0) {
        return NextResponse.json({ erro: "Item não encontrado" }, { status: 404 });
      }
      return NextResponse.json({
        nomeItem,
        descricao: null,
        quantidade: 0,
        endereco: null,
        ultimoAlteradoPor: null,
        foto: null,
        rotas: [],
        totalSolicitacoes,
      });
    }

    return NextResponse.json({ ...item, totalSolicitacoes });
  } catch (e) {
    console.error("Erro ao buscar item:", e);
    return NextResponse.json(
      { erro: "Erro ao buscar item", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { nome: string } },
) {
  try {
    const nomeItem = decodeURIComponent(params.nome).trim().toUpperCase();
    const body = await request.json();
    const { descricao, quantidade, endereco, alteradoPor } = body ?? {};

    const data: Record<string, unknown> = {};
    if (descricao !== undefined) data.descricao = descricao ? String(descricao).trim() : null;
    if (endereco !== undefined) data.endereco = endereco ? String(endereco).trim().toUpperCase() : null;
    if (quantidade !== undefined) {
      const n = Number(quantidade);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ erro: "Quantidade inválida" }, { status: 400 });
      }
      data.quantidade = Math.round(n);
    }
    if (alteradoPor !== undefined) data.ultimoAlteradoPor = String(alteradoPor).trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ erro: "Nada para atualizar" }, { status: 400 });
    }

    const item = await prisma.itemEstoque.upsert({
      where: { nomeItem },
      update: data,
      create: { nomeItem, ...data },
      include: { rotas: { orderBy: { criadaEm: "desc" }, take: 5 } },
    });

    return NextResponse.json(item);
  } catch (e) {
    console.error("Erro ao atualizar item:", e);
    return NextResponse.json(
      { erro: "Erro ao atualizar item", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
