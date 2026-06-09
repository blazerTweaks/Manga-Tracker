import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const olxScraper: StoreScraper = {
  slug: 'olx',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('[data-ds-component="ad-card"], .olx-ad-card__price, .ad__price', { timeout: 10000 });
    } catch {
      return { price: null, available: true };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('[data-ds-component="ad-card"] [data-ds-component="price"]')
        || document.querySelector('.olx-ad-card__price')
        || document.querySelector('.ad__price');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: true };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: true };

    return { price, available: true };
  },
};
