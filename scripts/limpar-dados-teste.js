// Apaga todos os dados de teste (solicitações, mensagens, presença e
// histórico de endereço). NÃO apaga o cadastro de ItemEstoque — isso é
// feito à parte pelo seed-estoque.js, que faz upsert (não duplica).
//
// Rodar: node scripts/limpar-dados-teste.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const mensagens = await prisma.mensagem.deleteMany({});
  const solicitacoes = await prisma.solicitacao.deleteMany({});
  const presencas = await prisma.presenca.deleteMany({});
  const historico = await prisma.historicoEnderecoEstoque.deleteMany({});

  console.log("Limpeza concluída:");
  console.log(`  Mensagens removidas: ${mensagens.count}`);
  console.log(`  Solicitações removidas: ${solicitacoes.count}`);
  console.log(`  Presenças removidas: ${presencas.count}`);
  console.log(`  Histórico de endereço removido: ${historico.count}`);
  console.log("ItemEstoque NÃO foi tocado — rode seed-estoque.js pra atualizar os endereços.");
}

main()
  .catch((e) => {
    console.error("Erro ao limpar dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });