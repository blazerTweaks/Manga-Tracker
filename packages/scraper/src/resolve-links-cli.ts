import { resolvePaniniLinks } from './link-resolver';

async function main() {
  console.log('Resolvendo links da Panini...\n');

  const results = await resolvePaniniLinks(800);

  const found = results.filter((r) => r.found);
  const notFound = results.filter((r) => !r.found);

  console.log(`\nResolvidos: ${found.length} de ${results.length}`);
  console.log(`Não encontrados: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log('\nNão encontrados:');
    for (const r of notFound) {
      console.log(`  ${r.mangaName} Vol ${r.volume}`);
    }
  }

  if (found.length > 0) {
    console.log('\nExemplos de URLs resolvidas:');
    for (const r of found.slice(0, 5)) {
      console.log(`  ${r.mangaName} Vol ${r.volume} -> ${r.url}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
