// Core types for Finest Known app

export interface Product {
  id: string;
  title: string;
  price_cents: number;
  photos: string[];
  sku?: string;
  stock?: number;
  category?: string;
  metal?: string;
  year?: number;
  grade?: string;
  grader?: string;
}

export interface SearchFilters {
  query?: string;
  metal?: string;
  grade?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
}

