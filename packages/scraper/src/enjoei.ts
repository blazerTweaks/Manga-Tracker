import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const enjoeiScraper: StoreScraper = {
  slug: 'enjoei',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('.crd-price, .styles__Price-sc-1fu3d6b-0, [data-testid="price"]', { timeout: 10000 });
    } catch {
      return { price: null, available: true };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('.crd-price')
        || document.querySelector('.styles__Price-sc-1fu3d6b-0')
        || document.querySelector('[data-testid="price"]');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: true };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: true };

    return { price, available: true };
  },
};
