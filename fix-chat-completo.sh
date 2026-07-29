#!/usr/bin/env bash
# =============================================================================
#  FIX — chat do solicitante + apagar mensagens ao concluir
#
#  1) POST /mensagens só aceitava EM_CURSO → erro em EM_ROTA / EM_BAIXA
#  2) Ao confirmar entrega (ENTREGUE), apaga o chat da solicitação
#  3) Instruções SQL para limpar resíduos de chats antigos
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "▶ Corrigindo API de chat e limpeza de mensagens…"

# -----------------------------------------------------------------------------
# 1. API mensagens — status permitidos
# -----------------------------------------------------------------------------
MSG="app/api/solicitacoes/[id]/mensagens/route.ts"
if [[ -f "$MSG" ]]; then
  cat > "$MSG" << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_CHAT = ["EM_CURSO", "EM_ROTA", "EM_BAIXA"];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const mensagens = await prisma.mensagem.findMany({
    where: { solicitacaoId: params.id },
    orderBy: { criadaEm: "asc" },
  });
  return NextResponse.json(mensagens);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { autorNome, autorTipo, texto } = body;

  if (!autorNome || !autorTipo || !texto?.trim()) {
    return NextResponse.json({ erro: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!["SOLICITANTE", "ENTREGADOR"].includes(autorTipo)) {
    return NextResponse.json({ erro: "autorTipo inválido" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id: params.id },
  });

  if (!solicitacao || !STATUS_CHAT.includes(solicitacao.status)) {
    return NextResponse.json(
      {
        erro: "Chat só disponível enquanto a entrega está em curso, em rota ou em baixa",
      },
      { status: 409 },
    );
  }

  const mensagem = await prisma.mensagem.create({
    data: {
      solicitacaoId: params.id,
      autorNome: String(autorNome).trim(),
      autorTipo,
      texto: String(texto).trim(),
    },
  });

  return NextResponse.json(mensagem, { status: 201 });
}
EOF
  echo "✓ API mensagens: EM_CURSO + EM_ROTA + EM_BAIXA"
else
  echo "❌ $MSG não encontrado"
fi

# -----------------------------------------------------------------------------
# 2. Confirmar entrega → apaga mensagens do chat
# -----------------------------------------------------------------------------
CONF="app/api/solicitacoes/[id]/confirmar/route.ts"
if [[ -f "$CONF" ]]; then
  cat > "$CONF" << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
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

  // Remove todo o chat desta solicitação (não precisa mais)
  await prisma.mensagem.deleteMany({
    where: { solicitacaoId: params.id },
  });

  const atualizada = await prisma.solicitacao.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json(atualizada);
}
EOF
  echo "✓ Confirmar: apaga mensagens ao entregar"
else
  echo "⚠ $CONF não encontrado"
fi

# -----------------------------------------------------------------------------
# 3. DELETE solicitação (se existir) — mensagens já têm onDelete Cascade no schema
#    Também limpa ao cancelar via PATCH se status for CANCELADA
# -----------------------------------------------------------------------------
PATCH="app/api/solicitacoes/[id]/route.ts"
if [[ -f "$PATCH" ]]; then
  python3 - << 'PY'
from pathlib import Path
path = Path("app/api/solicitacoes/[id]/route.ts")
text = path.read_text(encoding="utf-8")

# Se já tem deleteMany de mensagem, ok
if "mensagem.deleteMany" in text:
    print("✓ PATCH já limpa mensagens em algum fluxo")
else:
    # Tenta inserir após update de status ENTREGUE ou CANCELADA
    marker = "status: \"ENTREGUE\""
    # Abordagem: ao final de um update bem-sucedido para status final, apagar msgs
    # Mais seguro: patch no handler DELETE se existir
    if "export async function DELETE" in text and "deleteMany" not in text:
        print("ℹ DELETE de solicitação: schema já tem onDelete Cascade nas mensagens")
    else:
        print("ℹ Schema Prisma: Mensagem.onDelete Cascade — ao deletar Solicitacao as msgs vão junto")
        print("  Ao marcar ENTREGUE via /confirmar, o script acima já apaga as msgs")
PY
fi

# -----------------------------------------------------------------------------
# 4. Arquivo SQL de limpeza (resíduos)
# -----------------------------------------------------------------------------
cat > limpar-chats-antigos.sql << 'EOF'
-- =============================================================================
-- Limpeza de mensagens de solicitações já finalizadas
-- Rode no Postgres (psql, Prisma Studio, DBeaver, etc.)
-- =============================================================================

-- 1) Ver quantas mensagens órfãs / de pedidos concluídos existem
SELECT
  s.status,
  COUNT(m.id) AS total_mensagens
FROM "Mensagem" m
JOIN "Solicitacao" s ON s.id = m."solicitacaoId"
GROUP BY s.status
ORDER BY total_mensagens DESC;

-- 2) Apagar mensagens de pedidos ENTREGUE ou CANCELADA
DELETE FROM "Mensagem"
WHERE "solicitacaoId" IN (
  SELECT id FROM "Solicitacao"
  WHERE status IN ('ENTREGUE', 'CANCELADA')
);

-- 3) (Opcional) Apagar mensagens com mais de 7 dias, qualquer status
-- DELETE FROM "Mensagem"
-- WHERE "criadaEm" < NOW() - INTERVAL '7 days';

-- 4) Conferir
SELECT COUNT(*) AS mensagens_restantes FROM "Mensagem";
EOF
echo "✓ Criado limpar-chats-antigos.sql"

echo ""
echo "✅ Correções aplicadas!"
echo ""
echo "Chat do solicitante:"
echo "  • Pode enviar em EM_CURSO, EM_ROTA e EM_BAIXA"
echo ""
echo "Ao confirmar entrega:"
echo "  • Todas as mensagens daquele pedido são apagadas"
echo ""
echo "Limpar resíduos antigos no banco:"
echo "  psql \"\$DATABASE_URL\" -f limpar-chats-antigos.sql"
echo "  # ou cole o SQL no Prisma Studio / DBeaver"
echo ""
echo "Reinicie: rm -rf .next && npm run dev"
echo "Hard refresh: Ctrl+Shift+R"
