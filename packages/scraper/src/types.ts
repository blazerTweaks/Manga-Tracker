export interface ScrapeResult {
  productLinkId: string;
  price: number | null;
  available: boolean;
  error?: string;
}

export interface StoreScraper {
  slug: string;
  extractPrice(page: import('playwright').Page, url: string): Promise<{ price: number | null; available: boolean }>;
}

export interface ScraperConfig {
  concurrency?: number;
  headless?: boolean;
  timeout?: number;
}
