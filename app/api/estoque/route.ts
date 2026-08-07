import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface ItemEstoqueResumo {
  nomeItem: string;
  descricao: string | null;
  quantidade: number;
  endereco: string | null;
  temFoto: boolean;
  totalSolicitacoes: number;
}

/**
 * Pesquisa de itens pra página dedicada de pesquisa. O universo de itens
 * é a união de tudo que já foi solicitado (descricaoItem em Solicitacao)
 * com o que já tem cadastro no estoque (ItemEstoque) — assim um item
 * aparece na busca mesmo antes de alguém preencher descrição/endereço/foto.
 *
 * Sem termo de busca, devolve só os itens mais recentes (evita carregar
 * o estoque inteiro na tela ociosa); o resto aparece digitando um termo.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim().toUpperCase();

    if (!q) {
      const LIMITE_RECENTES = 5;

      const itensRecentes = await prisma.itemEstoque.findMany({
        select: { nomeItem: true, descricao: true, quantidade: true, endereco: true, foto: true },
        orderBy: { atualizadoEm: "desc" },
        take: LIMITE_RECENTES,
      });

      const contagens = itensRecentes.length
        ? await prisma.solicitacao.groupBy({
            by: ["descricaoItem"],
            where: { descricaoItem: { in: itensRecentes.map((i) => i.nomeItem) } },
            _count: { _all: true },
          })
        : [];
      const contagemPorItem = new Map(contagens.map((c) => [c.descricaoItem, c._count._all]));

      const resultado: ItemEstoqueResumo[] = itensRecentes.map((item) => ({
        nomeItem: item.nomeItem,
        descricao: item.descricao,
        quantidade: item.quantidade,
        endereco: item.endereco,
        temFoto: Boolean(item.foto),
        totalSolicitacoes: contagemPorItem.get(item.nomeItem) ?? 0,
      }));

      return NextResponse.json(resultado);
    }

    const limite = 50;

    const [solicitados, itensEstoque] = await Promise.all([
      prisma.solicitacao.groupBy({
        by: ["descricaoItem"],
        where: { descricaoItem: { contains: q, mode: "insensitive" } },
        _count: { _all: true },
        orderBy: { _count: { descricaoItem: "desc" } },
        take: 200,
      }),
      prisma.itemEstoque.findMany({
        where: {
          OR: [
            { nomeItem: { contains: q, mode: "insensitive" } },
            { descricao: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { nomeItem: true, descricao: true, quantidade: true, endereco: true, foto: true },
        take: 200,
      }),
    ]);

    const mapa = new Map<string, ItemEstoqueResumo>();

    for (const s of solicitados) {
      mapa.set(s.descricaoItem, {
        nomeItem: s.descricaoItem,
        descricao: null,
        quantidade: 0,
        endereco: null,
        temFoto: false,
        totalSolicitacoes: s._count._all,
      });
    }

    for (const item of itensEstoque) {
      const existente = mapa.get(item.nomeItem);
      mapa.set(item.nomeItem, {
        nomeItem: item.nomeItem,
        descricao: item.descricao,
        quantidade: item.quantidade,
        endereco: item.endereco,
        temFoto: Boolean(item.foto),
        totalSolicitacoes: existente?.totalSolicitacoes ?? 0,
      });
    }

    const resultado = Array.from(mapa.values())
      .sort((a, b) => a.nomeItem.localeCompare(b.nomeItem))
      .slice(0, limite);

    return NextResponse.json(resultado);
  } catch (e) {
    console.error("Erro ao pesquisar itens:", e);
    return NextResponse.json(
      { erro: "Erro ao pesquisar itens", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
