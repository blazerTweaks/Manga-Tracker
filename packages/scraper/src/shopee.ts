import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const shopeeScraper: StoreScraper = {
  slug: 'shopee',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('[data-sqe="price"], .HP2J0m, ._1w9jLI', { timeout: 10000 });
    } catch {
      return { price: null, available: true };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('[data-sqe="price"]')
        || document.querySelector('.HP2J0m')
        || document.querySelector('._1w9jLI');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: true };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: true };

    return { price, available: true };
  },
};
