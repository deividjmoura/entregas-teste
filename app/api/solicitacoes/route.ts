import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CAMPOS_LISTAGEM = {
  id: true,
  tipo: true,
  descricaoItem: true,
  localDestino: true,
  rackOuSlide: true,
  temFoto: true,
  urgencia: true,
  status: true,
  solicitanteNome: true,
  entregadorNome: true,
  versao: true,
  criadaEm: true,
  atualizadaEm: true,
  entregueEm: true,
  enderecoEstoque: true,
  enderecoAlteradoPor: true,
  favorito: true,
} as const;

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const solicitanteNome = request.nextUrl.searchParams.get("solicitanteNome");
  const q = request.nextUrl.searchParams.get("q");
  const desde = request.nextUrl.searchParams.get("desde");
  const ate = request.nextUrl.searchParams.get("ate");
  const limit = request.nextUrl.searchParams.get("limit");

  // Aceita "status=PENDENTE" (um só) ou "status=PENDENTE,EM_CURSO,ENTREGUE"
  // (vários de uma vez) — usado pelo painel pra consolidar em 1 request
  // o que antes eram 3 chamadas separadas em paralelo.
  const statusList = status ? status.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      ...(statusList ? { status: { in: statusList } } : {}),
      ...(solicitanteNome ? { solicitanteNome } : {}),
      ...(desde || ate
        ? {
            criadaEm: {
              ...(desde ? { gte: new Date(desde) } : {}),
              ...(ate ? { lte: new Date(ate) } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { descricaoItem: { contains: q, mode: "insensitive" } },
              { localDestino: { contains: q, mode: "insensitive" } },
              { rackOuSlide: { contains: q, mode: "insensitive" } },
              { solicitanteNome: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: CAMPOS_LISTAGEM,
    orderBy: { criadaEm: "desc" },
    ...(limit ? { take: Number(limit) } : {}),
  });

  return NextResponse.json(solicitacoes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, descricaoItem, localDestino, rackOuSlide, foto, urgencia, solicitanteNome } = body;

    if (!tipo || !descricaoItem || !localDestino || !urgencia || !solicitanteNome) {
      return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const descricaoNormalizada = String(descricaoItem).trim().toUpperCase();
    const fotoInformada = foto ? String(foto) : null;

    // Se esse item já tem endereço cadastrado no estoque (de uma entrega
    // anterior), a nova solicitação já nasce com o endereço preenchido —
    // o entregador não precisa cadastrar de novo.
    const itemConhecido = await prisma.itemEstoque.findFirst({
      where: { nomeItem: { equals: descricaoNormalizada, mode: "insensitive" } },
    });

    // Mesma lógica pra foto: se o solicitante não anexou uma foto agora,
    // usa a última foto conhecida desse item (sempre a mais recente que
    // alguém já tirou). Se anexou, essa foto passa a ser a "última foto"
    // do item — substitui a anterior no estoque (ver upsert abaixo).
    const fotoParaUsar = fotoInformada ?? itemConhecido?.foto ?? null;

    const solicitacao = await prisma.solicitacao.create({
      data: {
        tipo,
        descricaoItem: descricaoNormalizada,
        localDestino: String(localDestino).trim().toUpperCase(),
        rackOuSlide: rackOuSlide ? String(rackOuSlide).trim().toUpperCase() : null,
        foto: fotoParaUsar,
        temFoto: Boolean(fotoParaUsar),
        urgencia,
        solicitanteNome: String(solicitanteNome).trim(),
        status: "PENDENTE",
        enderecoEstoque: itemConhecido?.endereco ?? null,
        enderecoAlteradoPor: itemConhecido?.endereco ? itemConhecido.ultimoAlteradoPor : null,
      },
      select: CAMPOS_LISTAGEM,
    });

    // Nova foto anexada agora → vira a foto atual do item no estoque,
    // sempre substituindo a que já existia (uma foto por item, a mais recente).
    if (fotoInformada) {
      await prisma.itemEstoque.upsert({
        where: { nomeItem: descricaoNormalizada },
        update: { foto: fotoInformada },
        create: { nomeItem: descricaoNormalizada, foto: fotoInformada },
      });
    }

    return NextResponse.json(solicitacao, { status: 201 });
  } catch (e) {
    console.error("Erro ao criar solicitação:", e);
    return NextResponse.json(
      { erro: "Erro ao criar solicitação", detalhe: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}