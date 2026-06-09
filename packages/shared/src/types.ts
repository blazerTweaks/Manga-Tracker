// === Enums ===
export enum MangaStatus {
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  HIATUS = 'HIATUS',
}

export enum CollectionStatus {
  OWNED = 'OWNED',
  MISSING = 'MISSING',
  DESIRED = 'DESIRED',
}

export enum AlertDirection {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

// === Domain entities ===
export interface Manga {
  id: string;
  name: string;
  altName: string | null;
  publisher: string;
  status: MangaStatus;
  synopsis: string | null;
  coverUrl: string | null;
  totalVolumes: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Volume {
  id: string;
  mangaId: string;
  number: number;
  title: string | null;
  coverUrl: string | null;
  releaseDate: Date | null;
  manga?: Manga;
  productLinks?: ProductLink[];
  createdAt: Date;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  url: string;
  active: boolean;
}

export interface ProductLink {
  id: string;
  volumeId: string;
  storeId: string;
  url: string;
  active: boolean;
  lastScraped: Date | null;
  store?: Store;
  volume?: Volume;
  createdAt: Date;
}

export interface PriceRecord {
  id: string;
  productLinkId: string;
  price: number;
  available: boolean;
  scrapedAt: Date;
  productLink?: ProductLink;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
}

export interface Collection {
  id: string;
  userId: string;
  volumeId: string;
  status: CollectionStatus;
  volume?: Volume;
  createdAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  volumeId: string;
  volume?: Volume;
  createdAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  volumeId: string;
  targetPrice: number;
  direction: AlertDirection;
  active: boolean;
  notifiedAt: Date | null;
  volume?: Volume;
  createdAt: Date;
}

// === API types ===
export interface PriceSummary {
  currentPrice: number | null;
  lowestPrice: number | null;
  lowestDate: Date | null;
  highestPrice: number | null;
  averagePrice: number | null;
  available: boolean;
}

export interface StorePrice {
  store: Store;
  currentPrice: number | null;
  lowestPrice: number | null;
  lowestDate: Date | null;
  available: boolean;
  url: string;
  lastScraped: Date | null;
}

export interface VolumePrices {
  volume: Volume;
  prices: StorePrice[];
  stats: PriceSummary;
}

export interface PriceHistoryPoint {
  price: number;
  storeSlug: string;
  storeName: string;
  scrapedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// === Scraper types ===
export interface ScrapeResult {
  price: number | null;
  available: boolean;
  currency: string;
  scrapedAt: Date;
  error?: string;
}

export interface DashboardPromotion {
  volumeId: string;
  mangaName: string;
  volumeNumber: number;
  storeName: string;
  currentPrice: number;
  lowestPrice: number;
  discountPercent: number;
  storeSlug: string;
}

export interface DashboardBiggestDrop {
  volumeId: string;
  mangaName: string;
  volumeNumber: number;
  previousPrice: number;
  currentPrice: number;
  dropPercent: number;
  storeName: string;
  storeSlug: string;
}

export interface CollectionStats {
  totalVolumes: number;
  ownedVolumes: number;
  missingVolumes: number;
  desiredVolumes: number;
  completionPercent: number;
}
