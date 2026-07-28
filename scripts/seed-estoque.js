// Cadastra/atualiza endereços de estoque em massa. Usa upsert por
// nomeItem — pode rodar quantas vezes quiser, não duplica.
//
// Rodar: node scripts/seed-estoque.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ALTERADO_POR = "seed";

// [nomeItem, endereco] — endereco null quando a planilha trazia "#N/D"
const ITENS = [
  ["321684532", "D01C03"],
  ["329920474", "D03A06"],
  ["518400270", "D03C02"],
  ["3203508M6", "D04A01"],
  ["3203520C9", "D00B01"],
  ["32165K28X", "D01B04"],
  ["32165K2PC", "D03D01"],
  ["32165K2Q7", "D04A04"],
  ["32165K2Z2", "D06B02"],
  ["32165K3HS", "D00B05"],
  ["32165K3WF", "D00B03"],
  ["32165K485", "D00B04"],
  ["32165K5B4", "D02A01"],
  ["3216716C8", "D05D02"],
  ["3216716D6", "D06D01"],
  ["3219502Z7", "D02B01"],
  ["321980F00", "D02B05"],
  ["329925S6G", "D02B03"],
  ["329925SKP", "D07B05"],
  ["329925SSH", "D00A04"],
  ["329959EA4", "D01D05"],
  ["329959HI4", "D00A01"],
  ["3299850Z7", "D03B02"],
  ["E00001262", "C01D01"],
  ["E00004782", "D01A03"],
  ["E00007111", "D06C03"],
  ["E00019470", "D01D01"],
  ["E01691300", "D00A02"],
  ["E02326900", "D07C04"],
  ["E05944600", "D02A05"],
  ["E06246500", "D03C03"],
  ["E06800500", "D02B04"],
  ["E06858600", "D05D03"],
  ["E06934600", "D03D03"],
  ["E06934700", "D06A03"],
  ["E07809000", "D06A01"],
  ["E07845400", "D06B05"],
  ["E07898200", "D03B01"],
  ["E07946100", "D06B01"],
  ["E07946200", "D06C01"],
  ["E08179800", "D06B04"],
  ["E08518300", "D07A02"],
  ["E08578700", "D07A05"],
  ["E08579300", "D07A01"],
  ["E08655400", "D03D04"],
  ["E08922100", "D06D02"],
  ["E08997000", "D07B01"],
  ["E09240600", "D01A01"],
  ["E09392800", "D02D02"],
  ["E09540000", "D02D01"],
  ["E10228000", "D06C04"],
  ["E10313600", "D09D03"],
  ["E10345500", "D08D01"],
  ["E10905100", "D05D04"],
  ["E11166500", "D03C01"],
  ["E11250600", "D03A01"],
  ["E11321100", "D05B01"],
  ["E11401200", "D01B02"],
  ["E11402200", "D01B01"],
  ["E11402300", "D01B03"],
  ["E11636000", "D02D04"],
  ["E11636300", "D04D04"],
  ["E11636600", "D08C06"],
  ["E11756300", "D03C04"],
  ["E12504600", "D06C02"],
  ["E13242800", "D05A01"],
  ["E14329001", "D07C02"],
  ["E14917000", "D07A04"],
  ["E16981800", "D02A04"],
  ["E18573800", "D01D02"],
  ["E23231500", "D06D03"],
  ["E25184900", "D04D02"],
  ["E25566000", "D00B06"],
  ["E29845000", "D07D01"],
  ["E31915000", "D04B04"],
  ["E35388800", "D05D05"],
  ["E35932700", "D09C03"],
  ["E37152700", "D08A01"],
  ["E38110800", "D07B03"],
  ["E39563900", "D08D04"],
  ["E40339200", "D07C03"],
  ["E41897000", "D08B04"],
  ["E41897100", "D08B01"],
  ["E41897200", "D08C01"],
  ["E41897300", "D08B02"],
  ["E42152000", null],
  ["E42291000", "D07C01"],
  ["E43889100", null],
  ["E50333400", "D09B01"],
  ["E50333500", "D09B04"],
];

async function main() {
  let criados = 0;
  let atualizados = 0;

  for (const [nomeItemBruto, endereco] of ITENS) {
    const nomeItem = nomeItemBruto.trim().toUpperCase();
    const existente = await prisma.itemEstoque.findUnique({ where: { nomeItem } });

    await prisma.itemEstoque.upsert({
      where: { nomeItem },
      update: { endereco, ultimoAlteradoPor: ALTERADO_POR },
      create: { nomeItem, endereco, ultimoAlteradoPor: ALTERADO_POR },
    });

    if (existente) atualizados++;
    else criados++;
  }

  console.log(`Concluído: ${criados} itens criados, ${atualizados} atualizados (total ${ITENS.length}).`);
}

main()
  .catch((e) => {
    console.error("Erro ao popular estoque:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });