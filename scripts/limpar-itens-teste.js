// Apaga TODOS os itens de estoque (ItemEstoque) — por causa do onDelete:
// Cascade no schema, isso também apaga automaticamente as rotas
// (RotaItem) e o histórico de endereço (HistoricoEnderecoEstoque)
// desses itens. NÃO mexe em Solicitacao/Mensagem/Presenca — use o
// limpar-dados-teste.js pra isso, se precisar.
//
// Rodar: node scripts/limpar-itens-teste.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const itens = await prisma.itemEstoque.deleteMany({});
  console.log(`Limpeza concluída: ${itens.count} item(ns) de estoque removido(s) (rotas e histórico de endereço foram junto, em cascata).`);
}

main()
  .catch((e) => {
    console.error("Erro ao limpar itens de estoque:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
