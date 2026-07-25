import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const nome = request.nextUrl.searchParams.get("nome");
  const tipo = request.nextUrl.searchParams.get("tipo"); // "SOLICITANTE" | "ENTREGADOR"

  if (!nome || !tipo) {
    return NextResponse.json({});
  }

  const campoFiltro = tipo === "ENTREGADOR" ? "entregadorNome" : "solicitanteNome";

  const solicitacoesComMensagens = await prisma.solicitacao.findMany({
    where: {
      [campoFiltro]: nome,
      status: "EM_CURSO",
    },
    select: {
      id: true,
      mensagens: {
        where: {
          autorNome: { not: nome },
        },
        select: { id: true },
      },
    },
  });

  const naoLidas: Record<string, number> = {};

  solicitacoesComMensagens.forEach((s) => {
    if (s.mensagens.length > 0) {
      naoLidas[s.id] = s.mensagens.length;
    }
  });

  return NextResponse.json(naoLidas);
}