import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const paniniScraper: StoreScraper = {
  slug: 'panini',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('.product-info-price .price, span.price', { timeout: 10000 });
    } catch {
      return { price: null, available: false };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('.product-info-price .price')
        || document.querySelector('span.price');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: false };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: false };

    return { price, available: true };
  },
};
