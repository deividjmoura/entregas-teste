import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Considera "online" quem mandou heartbeat nos últimos 15s.
const JANELA_ATIVOS_MS = 20_000;
// Limpa sessões velhas pra não acumular lixo na tabela.
const JANELA_LIMPEZA_MS = 60_000;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionId = String(body.sessionId ?? "").trim();

  if (!sessionId) {
    return NextResponse.json({ erro: "sessionId é obrigatório" }, { status: 400 });
  }

  await prisma.presenca.upsert({
    where: { sessionId },
    create: { sessionId },
    update: {}, // só toca @updatedAt mesmo
  });

  await prisma.presenca.deleteMany({
    where: { atualizadaEm: { lt: new Date(Date.now() - JANELA_LIMPEZA_MS) } },
  });

  const online = await prisma.presenca.count({
    where: { atualizadaEm: { gte: new Date(Date.now() - JANELA_ATIVOS_MS) } },
  });

  return NextResponse.json({ online });
}

export async function GET() {
  const online = await prisma.presenca.count({
    where: { atualizadaEm: { gte: new Date(Date.now() - JANELA_ATIVOS_MS) } },
  });

  return NextResponse.json({ online });
}
