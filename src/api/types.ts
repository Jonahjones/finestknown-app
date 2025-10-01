// src/api/types.ts

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rarity';

export interface FilterOptions {
  query?: string;
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  categorySlug?: string;
  sort?: SortOption;
}

export interface CreateProductData {
  title: string;
  description?: string;
  sku?: string;
  category_primary?: string;
  metal?: string;
  fineness?: number;
  weight_grams?: number;
  year?: number;
  mint?: string;
  grade?: string;
  grader?: string;
  cert_number?: string;
  population_url?: string;
  price_cents: number;
  compare_at_cents?: number;
  inventory_qty?: number;
  is_active?: boolean;
  is_auction?: boolean;
  auction_end_at?: string;
  rarity_score?: number;
  photos?: string[];
}
