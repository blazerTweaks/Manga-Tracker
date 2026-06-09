import { runScrapers } from '@mangatracker/scraper';

const results = await runScrapers({ headless: true });

const success = results.filter((r) => r.price !== null).length;
const failed = results.filter((r) => r.error || r.price === null).length;

console.log(`Total: ${results.length}`);
console.log(`Sucesso: ${success}`);
console.log(`Falha: ${failed}`);

for (const r of results) {
  if (r.error) console.error(`[${r.productLinkId}] ${r.error}`);
  else if (r.price !== null) console.log(`[${r.productLinkId}] R$ ${r.price.toFixed(2)}`);
  else console.log(`[${r.productLinkId}] Indisponível`);
}

process.exit(0);
