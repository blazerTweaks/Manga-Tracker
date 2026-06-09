import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const mangas = ['one-piece', 'berserk', 'vagabond', 'chainsaw-man'];

for (const slug of mangas) {
  const links = await p.productLink.findMany({
    where: { volume: { manga: { slug } } },
    include: { store: true, volume: true, priceRecords: { orderBy: { scrapedAt: 'desc' as const }, take: 1 } },
    orderBy: { volume: { number: 'asc' as const } },
    take: 14,
  });

  console.log(`\n=== ${slug.toUpperCase()} ===`);
  let lastVol = -1;
  for (const l of links) {
    if (l.volume.number !== lastVol) {
      console.log(`\nVol ${String(l.volume.number).padStart(2)}:`);
      lastVol = l.volume.number;
    }
    const current = l.priceRecords[0];
    console.log(`  ${l.store.name.padEnd(14)} R$ ${current ? current.price.toFixed(2).padStart(6) : 'N/A'}`);
  }
}

await p.$disconnect();
