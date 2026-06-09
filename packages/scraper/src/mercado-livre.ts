import type { Page } from 'playwright';
import type { StoreScraper } from './types';

export const mercadoLivreScraper: StoreScraper = {
  slug: 'mercado-livre',

  async extractPrice(page: Page, url: string) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('.andes-money-amount__fraction, .ui-pdp-price__second-line', { timeout: 10000 });
    } catch {
      return { price: null, available: false };
    }

    const priceText = await page.evaluate(() => {
      const sel = document.querySelector('.andes-money-amount.ui-pdp-price__part--big .andes-money-amount__fraction')
        || document.querySelector('.andes-money-amount__fraction');
      return sel ? (sel as HTMLElement).innerText.trim() : null;
    });

    if (!priceText) return { price: null, available: false };

    const cleaned = priceText.replace(/\./g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return { price: null, available: false };

    return { price, available: true };
  },
};
