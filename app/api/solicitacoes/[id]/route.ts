import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const URGENCIAS_VALIDAS = ["BAIXA", "MEDIA", "CRITICA", "LINHA_PARADA"];

// Correção Lógica 1: Permite a transição mútua bidirecional e o reprocessamento 
// sem deixar o entregador preso se realizar uma triagem incorreta em estoque.
const STATUS_TRANSICOES_VALIDAS: Record<string, string[]> = {
  EM_ROTA: ["EM_CURSO", "EM_BAIXA", "EM_ROTA"],
  EM_BAIXA: ["EM_CURSO", "EM_ROTA", "EM_BAIXA"],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { urgencia, status, favorito } = body;

  // Bloco Favorito (Sempre liberado)
  if (favorito !== undefined) {
    const atualizada = await prisma.solicitacao.update({
      where: { id: params.id },
      data: { favorito: Boolean(favorito) },
    });
    return NextResponse.json(atualizada);
  }

  // Bloco de Atualização de Status (Logística do Entregador)
  if (status !== undefined) {
    const origensValidas = STATUS_TRANSICOES_VALIDAS[status];
    if (!origensValidas) {
      return NextResponse.json({ erro: "Status inválido" }, { status: 400 });
    }
    const resultado = await prisma.solicitacao.updateMany({
      where: { id: params.id, status: { in: origensValidas } },
      data: { status },
    });
    if (resultado.count === 0) {
      return NextResponse.json(
        { erro: "Não é possível fazer essa mudança de status agora" },
        { status: 409 },
      );
    }
    const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
    return NextResponse.json(atualizada);
  }

  // Bloco de Alteração de Urgência (Autonomia Total do Solicitante)
  // Correção Lógica 2: Permite mutações mesmo se o item estiver EM_BAIXA ou EM_ROTA,
  // bloqueando apenas se a demanda operacional já estiver encerrada.
  if (urgencia !== undefined) {
    if (!URGENCIAS_VALIDAS.includes(urgencia)) {
      return NextResponse.json({ erro: "Urgência inválida" }, { status: 400 });
    }
    const resultado = await prisma.solicitacao.updateMany({
      where: { id: params.id, status: { notIn: ["ENTREGUE", "CANCELADA"] } },
      data: { urgencia },
    });
    if (resultado.count === 0) {
      return NextResponse.json(
        { erro: "Só é possível alterar a urgência de solicitações em andamento" },
        { status: 409 },
      );
    }
    const atualizada = await prisma.solicitacao.findUnique({ where: { id: params.id } });
    return NextResponse.json(atualizada);
  }

  return NextResponse.json({ erro: "Nenhum campo válido para atualizar" }, { status: 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const resultado = await prisma.solicitacao.updateMany({
    where: { id: params.id, status: { not: "ENTREGUE" } },
    data: { status: "CANCELADA" },
  });

  if (resultado.count === 0) {
    return NextResponse.json(
      { erro: "Não é possível cancelar uma solicitação já entregue" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
