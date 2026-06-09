import { CURRENCY, CURRENCY_LOCALE, CURRENCY_SYMBOL } from './constants.js';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
}

export function formatCompactPrice(value: number): string {
  return `${CURRENCY_SYMBOL} ${value.toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateDiscount(current: number, lowest: number): number {
  if (!lowest || lowest === 0) return 0;
  return Math.round(((lowest - current) / lowest) * 100);
}

export function calculateDrop(previous: number, current: number): number {
  if (!previous || previous === 0) return 0;
  return Math.round(((previous - current) / previous) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
