-- AlterTable
ALTER TABLE "ItemEstoque" ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "quantidade" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RotaItem" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "automatica" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadaPor" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RotaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RotaItem_itemId_criadaEm_idx" ON "RotaItem"("itemId", "criadaEm");

-- AddForeignKey
ALTER TABLE "RotaItem" ADD CONSTRAINT "RotaItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemEstoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
