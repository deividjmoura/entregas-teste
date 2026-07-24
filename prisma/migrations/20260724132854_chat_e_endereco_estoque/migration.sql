-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricaoItem" TEXT NOT NULL,
    "localDestino" TEXT NOT NULL,
    "rackOuSlide" TEXT,
    "enderecoEstoque" TEXT,
    "foto" TEXT,
    "temFoto" BOOLEAN NOT NULL DEFAULT false,
    "urgencia" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "solicitanteNome" TEXT NOT NULL,
    "entregadorNome" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,
    "entregueEm" TIMESTAMP(3),

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "autorNome" TEXT NOT NULL,
    "autorTipo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Solicitacao_status_urgencia_idx" ON "Solicitacao"("status", "urgencia");

-- CreateIndex
CREATE INDEX "Mensagem_solicitacaoId_criadaEm_idx" ON "Mensagem"("solicitacaoId", "criadaEm");

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
