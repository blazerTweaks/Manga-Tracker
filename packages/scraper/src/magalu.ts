import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const magaluScraper: StoreScraper = {
  slug: 'magalu',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('.price__sc-1p4s1k-0, .sc-kpDqfm, [data-testid="price-value"]', { timeout: 10000 });
    } catch {
      return { price: null, available: true };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('.price__sc-1p4s1k-0')
        || document.querySelector('.sc-kpDqfm')
        || document.querySelector('[data-testid="price-value"]');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: true };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: true };

    return { price, available: true };
  },
};
