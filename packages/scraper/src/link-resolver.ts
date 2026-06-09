import * as cheerio from 'cheerio';
import { prisma } from '@mangatracker/database';

const PANINI_SEARCH = 'https://panini.com.br/catalogsearch/result/?q=';

const PT_NAMES: Record<string, string> = {
  'Attack on Titan': 'Ataque dos Titãs',
  'Demon Slayer': 'Demon Slayer - Kimetsu no Yaiba',
  "Hell's Paradise": "Hell's Paradise",
  'Goodbye, Eri': 'Adeus, Eri',
  'Jujutsu Kaisen': 'Jujutsu Kaisen: Batalha de Feiticeiros',
};

function searchQueryFor(mangaName: string, volume: number): string {
  const ptName = PT_NAMES[mangaName] || mangaName;
  return encodeURIComponent(`${ptName} Vol ${volume}`);
}

export async function searchPaniniProduct(mangaName: string, volume: number): Promise<string | null> {
  const query = searchQueryFor(mangaName, volume);
  const url = `${PANINI_SEARCH}${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!res.ok) return null;

    const finalUrl = res.url;
    const html = await res.text();
    const $ = cheerio.load(html);

    let bestMatch: string | null = null;
    const ptName = ptNameFrom(mangaName).toLowerCase();

    $(`a.product-item-link`).each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().toLowerCase();

      const volPattern = new RegExp(`vol\\.?\\s*${volume}[^0-9]?$`, 'i');
      if (volPattern.test(text) && href && text.includes(ptName)) {
        bestMatch = href;
        return false;
      }
    });

    if (bestMatch) return bestMatch;

    const isProductPage = $('.product-info-main').length > 0;
    if (isProductPage && !finalUrl.includes('/catalogsearch/')) {
      return finalUrl;
    }

    return null;
  } catch {
    return null;
  }
}

function ptNameFrom(mangaName: string): string {
  return PT_NAMES[mangaName] || mangaName;
}

export interface ResolveResult {
  productLinkId: string;
  mangaName: string;
  volume: number;
  found: boolean;
  url: string | null;
}

export async function resolvePaniniLinks(delayMs = 800): Promise<ResolveResult[]> {
  const links = await prisma.productLink.findMany({
    where: { store: { slug: 'panini' }, active: true },
    include: { volume: { include: { manga: true } } },
  });

  const results: ResolveResult[] = [];

  for (const link of links) {
    const mangaName = link.volume.manga.name;
    const volume = link.volume.number;

    const correctUrl = await searchPaniniProduct(mangaName, volume);

    if (correctUrl && correctUrl !== link.url) {
      await prisma.productLink.update({
        where: { id: link.id },
        data: { url: correctUrl },
      });
    }

    results.push({
      productLinkId: link.id,
      mangaName,
      volume,
      found: !!correctUrl,
      url: correctUrl,
    });

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}
