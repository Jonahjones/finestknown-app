// src/api/index.ts
export * from './categories';
export * from './products';

// Utility functions for formatting
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatMetal(metal: string | null): string {
  if (!metal) return '';
  return metal.charAt(0).toUpperCase() + metal.slice(1);
}

export function getProductImageUrl(photos: string[], index = 0): string {
  if (!photos || photos.length === 0) {
    return 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=No+Image';
  }
  return photos[index] || photos[0];
}
