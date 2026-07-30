-- AlterTable
ALTER TABLE "ItemEstoque" ADD COLUMN     "ultimoAlteradoPor" TEXT;

-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "enderecoAlteradoPor" TEXT,
ADD COLUMN     "favorito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lidaEntregadorEm" TIMESTAMP(3),
ADD COLUMN     "lidaSolicitanteEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "HistoricoEnderecoEstoque" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "enderecoAntigo" TEXT,
    "enderecoNovo" TEXT,
    "alteradoPor" TEXT NOT NULL,
    "alteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoEnderecoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoEnderecoEstoque_itemId_alteradoEm_idx" ON "HistoricoEnderecoEstoque"("itemId", "alteradoEm");

-- CreateIndex
CREATE INDEX "Solicitacao_status_idx" ON "Solicitacao"("status");

-- CreateIndex
CREATE INDEX "Solicitacao_solicitanteNome_idx" ON "Solicitacao"("solicitanteNome");

-- CreateIndex
CREATE INDEX "Solicitacao_criadaEm_idx" ON "Solicitacao"("criadaEm" DESC);

-- CreateIndex
CREATE INDEX "Solicitacao_descricaoItem_localDestino_idx" ON "Solicitacao"("descricaoItem", "localDestino");

-- AddForeignKey
ALTER TABLE "HistoricoEnderecoEstoque" ADD CONSTRAINT "HistoricoEnderecoEstoque_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemEstoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
