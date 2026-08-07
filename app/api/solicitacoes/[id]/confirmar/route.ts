import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const antes = await prisma.solicitacao.findUnique({ where: { id: params.id } });

    const resultado = await prisma.solicitacao.updateMany({
      where: { id: params.id, status: "EM_ROTA" },
      data: {
        status: "ENTREGUE",
        versao: { increment: 1 },
        entregueEm: new Date(),
      },
    });

    if (resultado.count === 0) {
      return NextResponse.json(
        { erro: "Só é possível confirmar uma entrega que está em rota" },
        { status: 409 },
      );
    }

    await prisma.mensagem.deleteMany({ where: { solicitacaoId: params.id } });

    // Toda entrega confirmada baixa 1 unidade do estoque do item (não passa
    // de 0) e registra a rota (destino) automaticamente no histórico do item.
    if (antes) {
      const item = await prisma.itemEstoque.upsert({
        where: { nomeItem: antes.descricaoItem },
        update: {},
        create: { nomeItem: antes.descricaoItem },
      });

      await prisma.itemEstoque.update({
        where: { id: item.id },
        data: { quantidade: { decrement: item.quantidade > 0 ? 1 : 0 } },
      });

      await prisma.rotaItem.create({
        data: {
          itemId: item.id,
          destino: antes.localDestino,
          automatica: true,
          criadaPor: antes.entregadorNome,
        },
      });
    }

    const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
    return NextResponse.json(atualizada);
  } catch (e) {
    console.error("Erro ao confirmar entrega:", e);
    return NextResponse.json(
      { erro: "Erro ao confirmar entrega", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
