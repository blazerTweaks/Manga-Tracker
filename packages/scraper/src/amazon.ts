import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const amazonScraper: StoreScraper = {
  slug: 'amazon',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('.a-price, #corePrice_desktop, .a-price-whole', { timeout: 10000 });
    } catch {
      return { price: null, available: false };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('#corePrice_desktop .a-price .a-offscreen')
        || document.querySelector('.a-price .a-offscreen')
        || document.querySelector('.a-price-whole');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: false };

    const cleaned = priceText.replace(/[R$\s\.]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: false };

    return { price, available: true };
  },
};
