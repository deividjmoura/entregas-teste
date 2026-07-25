import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const nome = request.nextUrl.searchParams.get("nome");
  const tipo = request.nextUrl.searchParams.get("tipo");

  if (!nome || !tipo) {
    return NextResponse.json({});
  }

  const campoFiltro = tipo === "ENTREGADOR" ? "entregadorNome" : "solicitanteNome";
  const campoLida = tipo === "ENTREGADOR" ? "lidaEntregadorEm" : "lidaSolicitanteEm";

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      [campoFiltro]: nome,
      status: "EM_CURSO",
    },
    select: {
      id: true,
      [campoLida]: true,
      mensagens: {
        where: { autorNome: { not: nome } },
        select: { criadaEm: true },
      },
    },
  });

  const naoLidas: Record<string, number> = {};

  solicitacoes.forEach((s: any) => {
    const lidaEm: Date | null = s[campoLida];
    const contagem = lidaEm
      ? s.mensagens.filter((m: { criadaEm: Date }) => new Date(m.criadaEm) > lidaEm).length
      : s.mensagens.length;
    if (contagem > 0) naoLidas[s.id] = contagem;
  });

  return NextResponse.json(naoLidas);
}