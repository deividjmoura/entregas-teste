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
