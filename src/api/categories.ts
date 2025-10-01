import { supabase } from '../lib/supabase';

export type Category = { 
  id: string; 
  name: string; 
  slug: string; 
  parent_id: string | null; 
  sort_order: number;
};

export type ProductRow = {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  price_cents: number;
  photos: string[];
  metal: string | null;
  fineness: number | null;
  weight_grams: number | null;
  year: number | null;
  grade: string | null;
  grader: string | null;
  cert_number: string | null;
  population_url: string | null;
  inventory_qty: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_primary: string | null;
  category_name: string | null;
  category_slug: string | null;
  parent_id: string | null;
  stock: number;
  sold_at: string | null;
};

/**
 * List products by category slug using hierarchical search
 * Includes all products in the category and its subcategories
 */
export async function listByCategorySlug(slug: string, page = 1, pageSize = 20): Promise<ProductRow[]> {
  const from = (page - 1) * pageSize;
  const { data, error } = await supabase
    .rpc('list_products_by_category_slug', { 
      slug, 
      limit_n: pageSize, 
      offset_n: from 
    });
  if (error) throw error;
  return data ?? [];
}

/**
 * Get direct children of a category by parent slug
 */
export async function listCategoryChildren(parentSlug: string): Promise<Category[]> {
  // Get the parent, then its direct children
  const { data: parent } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', parentSlug)
    .single();
    
  if (!parent) return [];
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, sort_order')
    .eq('parent_id', parent.id)
    .order('sort_order', { ascending: true });
    
  if (error) throw error;
  return data as Category[];
}

/**
 * Get all categories in a flat list
 */
export async function listAllCategories(): Promise<Category[]> {
  console.log('📋 listAllCategories: Starting...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, sort_order')
    .order('sort_order', { ascending: true });
    
  if (error) {
    console.error('❌ listAllCategories error:', error);
    throw error;
  }
  
  console.log('📋 listAllCategories: Fetched', data?.length, 'categories');
  return data as Category[];
}

/**
 * Get a category by its slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, sort_order')
    .eq('slug', slug)
    .single();
    
  if (error) return null;
  return data as Category;
}

/**
 * Get the full category path (breadcrumbs) for a given category slug
 */
export async function getCategoryPath(slug: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentSlug = slug;
  
  while (currentSlug) {
    const category = await getCategoryBySlug(currentSlug);
    if (!category) break;
    
    path.unshift(category); // Add to beginning of array
    
    // Find parent category
    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('slug')
        .eq('id', category.parent_id)
        .single();
      currentSlug = parent?.slug || '';
    } else {
      currentSlug = '';
    }
  }
  
  return path;
}

/**
 * Get category tree structure starting from root categories
 */
export async function getCategoryTree(): Promise<(Category & { children?: Category[] })[]> {
  console.log('🌳 getCategoryTree: Starting...');
  
  try {
    const allCategories = await listAllCategories();
    console.log('🌳 getCategoryTree: Fetched categories:', allCategories.length);
    
    // Build a map for quick lookup
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });
    
    // Build the tree structure
    const rootCategories: (Category & { children: Category[] })[] = [];
    
    allCategories.forEach(category => {
      const cat = categoryMap.get(category.id)!;
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        rootCategories.push(cat);
      }
    });
    
    console.log('🌳 getCategoryTree: Root categories:', rootCategories.length);
    console.log('🌳 getCategoryTree: Sample root categories:', rootCategories.slice(0, 3).map(c => c.name));
    
    return rootCategories;
  } catch (error) {
    console.error('❌ getCategoryTree error:', error);
    throw error;
  }
}

/**
 * Get product count for a category (including subcategories)
 */
export async function getCategoryProductCount(slug: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('category_family_ids', { root_slug: slug });
    
  if (error) return 0;
  
  const categoryIds = data.map((item: any) => item.id);
  
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .in('category_primary', categoryIds)
    .eq('is_active', true);
    
  if (countError) return 0;
  return count || 0;
}