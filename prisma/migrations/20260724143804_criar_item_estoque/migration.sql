-- CreateTable
CREATE TABLE "ItemEstoque" (
    "id" TEXT NOT NULL,
    "nomeItem" TEXT NOT NULL,
    "endereco" TEXT,
    "foto" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemEstoque_nomeItem_key" ON "ItemEstoque"("nomeItem");

-- CreateIndex
CREATE INDEX "ItemEstoque_nomeItem_idx" ON "ItemEstoque"("nomeItem");
