// src/api/products.ts
import { supabase } from '../lib/supabase';
import { listByCategorySlug } from './categories';

export type ProductRow = {
  id: string;
  title: string;
  description?: string;
  price_cents: number;
  photos: string[];
  sku: string | null;
  metal: string | null;
  year: number | null;
  grade: string | null;
  grader: string | null;
  cert_number: string | null;
  population_url: string | null;
  category_name: string | null;
  stock: number;
  sold_at: string | null;
};

type ListArgs = {
  page?: number;
  pageSize?: number;
  query?: string;
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  categorySlug?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rarity';
};

export async function listProducts(args: ListArgs = {}) {
  const {
    page = 1, pageSize = 20, query, metal, minPrice, maxPrice,
    yearMin, yearMax, categorySlug, sort = 'newest'
  } = args;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from('products_public').select('*', { count: 'exact' });

  if (query && query.trim()) {
    // Use enhanced full-text search for better results
    // Note: For complex queries with filters, we fall back to ILIKE
    // For pure search, use searchProductsFTS() for better ranking
    q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  if (metal) q = q.eq('metal', metal);
  if (typeof minPrice === 'number') q = q.gte('price_cents', minPrice);
  if (typeof maxPrice === 'number') q = q.lte('price_cents', maxPrice);
  if (typeof yearMin === 'number') q = q.gte('year', yearMin);
  if (typeof yearMax === 'number') q = q.lte('year', yearMax);
  if (categorySlug) {
    // translate slug to id on the fly
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (cat?.id) q = q.eq('category_primary', cat.id);
  }

  if (sort === 'newest') q = q.order('created_at', { ascending: false });
  if (sort === 'price_asc') q = q.order('price_cents', { ascending: true });
  if (sort === 'price_desc') q = q.order('price_cents', { ascending: false });
  if (sort === 'rarity') q = q.order('rarity_score', { ascending: false, nullsFirst: false });

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  return { items: data as ProductRow[], count: count ?? 0, page, pageSize };
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products_public')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as ProductRow;
}

export async function getProductBySku(sku: string) {
  const { data, error } = await supabase
    .from('products_public')
    .select('*')
    .eq('sku', sku)
    .single();
  
  if (error) throw error;
  return data as ProductRow;
}

export async function searchProductsFTS(term: string, limit = 20) {
  const { data, error } = await supabase
    .rpc('search_products', { q: term, lim: limit });
  if (error) throw error;
  return data as ProductRow[];
}

export async function upsertProduct(p: Partial<ProductRow> & { id?: string }) {
  const { data, error } = await supabase.from('products').upsert(p).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function updateProductInventory(id: string, quantity: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ inventory_qty: quantity, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}

export async function listProductsByCategory(categorySlug: string, page = 1, pageSize = 20) {
  return listByCategorySlug(categorySlug, page, pageSize);
}

/**
 * Get best selling products based on actual order data
 */
export async function getBestSellingProducts(limit = 4) {
  const { data, error } = await supabase
    .rpc('get_best_selling_products', { product_limit: limit });
  
  if (error) {
    console.error('Error fetching best selling products:', error);
    // Fallback to highest priced products if the function doesn't exist yet
    const fallback = await listProducts({ pageSize: limit, sort: 'price_desc' });
    return fallback.items;
  }
  
  return (data as ProductRow[]) ?? [];
}
