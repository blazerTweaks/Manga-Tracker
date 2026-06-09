import { chromium, type Page } from 'playwright';
import { prisma } from '@mangatracker/database';
import { amazonScraper } from './amazon';
import { mercadoLivreScraper } from './mercado-livre';
import { olxScraper } from './olx';
import { enjoeiScraper } from './enjoei';
import { shopeeScraper } from './shopee';
import { magaluScraper } from './magalu';
import { paniniScraper } from './panini';
import type { ScrapeResult, ScraperConfig } from './types';

const scrapers = [paniniScraper, amazonScraper, mercadoLivreScraper, olxScraper, enjoeiScraper, shopeeScraper, magaluScraper];
const scraperMap = new Map(scrapers.map((s) => [s.slug, s]));

async function scrapeLink(page: Page, link: { id: string; url: string; store: { slug: string } }): Promise<ScrapeResult> {
  const scraper = scraperMap.get(link.store.slug);
  if (!scraper) {
    return { productLinkId: link.id, price: null, available: false, error: `No scraper for ${link.store.slug}` };
  }

  try {
    const result = await scraper.extractPrice(page, link.url);
    return { productLinkId: link.id, ...result };
  } catch (err: any) {
    return { productLinkId: link.id, price: null, available: false, error: err.message };
  }
}

export async function runScrapers(config: ScraperConfig = {}): Promise<ScrapeResult[]> {
  const { concurrency = 3, headless = true, timeout = 30000 } = config;

  const links = await prisma.productLink.findMany({
    where: { active: true, store: { active: true } },
    include: { store: true },
  });

  if (!links.length) return [];

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const results: ScrapeResult[] = [];

  for (let i = 0; i < links.length; i += concurrency) {
    const batch = links.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (link) => {
        const page = await context.newPage();
        page.setDefaultTimeout(timeout);
        try {
          return await scrapeLink(page, link);
        } finally {
          await page.close();
        }
      }),
    );
    results.push(...batchResults);
  }

  await browser.close();

  for (const r of results) {
    await prisma.productLink.update({
      where: { id: r.productLinkId },
      data: { lastScraped: new Date() },
    });

    if (r.price !== null) {
      await prisma.priceRecord.create({
        data: {
          productLinkId: r.productLinkId,
          price: r.price,
          available: r.available,
        },
      });
    }
  }

  return results;
}

export async function scrapeSingle(productLinkId: string): Promise<ScrapeResult> {
  const link = await prisma.productLink.findUnique({
    where: { id: productLinkId },
    include: { store: true },
  });

  if (!link) throw new Error(`ProductLink ${productLinkId} not found`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  try {
    const result = await scrapeLink(page, link);
    if (result.price !== null) {
      await prisma.priceRecord.create({
        data: {
          productLinkId: result.productLinkId,
          price: result.price,
          available: result.available,
        },
      });
    }
    return result;
  } finally {
    await page.close();
    await browser.close();
  }
}
