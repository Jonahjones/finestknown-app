import * as ImagePicker from 'expo-image-picker';
import { supabase } from "../lib/supabase";

export interface AdminProduct {
  id?: string;
  title: string;
  sku: string;
  category_primary?: string;
  category_slug?: string;
  price_cents: number;
  compare_at_cents?: number;
  stock: number;
  photos?: string[];
  description?: string;
  metal?: string;
  fineness?: number;
  weight_grams?: number;
  year?: number;
  mint?: string;
  grade?: string;
  grader?: string;
  cert_number?: string;
  population_url?: string;
  inventory_qty?: number;
  is_active?: boolean;
  is_auction?: boolean;
  auction_end_at?: string;
  rarity_score?: number;
  sold_at?: string;
  created_at?: string;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AdminProductFilters {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * List all products for admin management
 */
export async function adminListProducts(filters: AdminProductFilters = {}) {
  console.log('🔧 adminListProducts: Starting with filters:', filters);
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true) // Only show active products
    .order('created_at', { ascending: false });

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }

  if (filters.category) {
    query = query.eq('category_slug', filters.category);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ adminListProducts error:', error);
    throw error;
  }

  console.log('✅ adminListProducts: Found', data?.length || 0, 'products');
  return data as AdminProduct[];
}

/**
 * Get single product for admin editing
 */
export async function adminGetProduct(id: string) {
  console.log('🔧 adminGetProduct: Fetching product:', id);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ adminGetProduct error:', error);
    throw error;
  }

  console.log('✅ adminGetProduct: Found product:', data.title);
  return data as AdminProduct;
}

/**
 * Create new product
 */
export async function adminCreateProduct(product: Omit<AdminProduct, 'id' | 'created_at' | 'updated_at'>) {
  console.log('🔧 adminCreateProduct: Creating product:', product.title);
  
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select('*')
    .single();

  if (error) {
    console.error('❌ adminCreateProduct error:', error);
    throw error;
  }

  console.log('✅ adminCreateProduct: Created product:', data.id);
  return data as AdminProduct;
}

/**
 * Update existing product
 */
export async function adminUpdateProduct(id: string, updates: Partial<AdminProduct>) {
  console.log('🔧 adminUpdateProduct: Updating product:', id);
  
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('❌ adminUpdateProduct error:', error);
    throw error;
  }

  console.log('✅ adminUpdateProduct: Updated product:', data.title);
  return data as AdminProduct;
}

/**
 * Delete product (admin only) - Soft delete by setting is_active to false
 */
export async function adminDeleteProduct(id: string) {
  console.log('🔧 adminDeleteProduct: Soft deleting product:', id);
  
  // First check if product is referenced in orders
  const { data: orderItems, error: checkError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', id)
    .limit(1);

  if (checkError) {
    console.error('❌ adminDeleteProduct check error:', checkError);
    throw checkError;
  }

  if (orderItems && orderItems.length > 0) {
    // Product is referenced in orders, use soft delete
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ adminDeleteProduct soft delete error:', error);
      throw error;
    }

    console.log('✅ adminDeleteProduct: Soft deleted product (deactivated):', id);
  } else {
    // Product is not referenced in orders, use hard delete
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ adminDeleteProduct hard delete error:', error);
      throw error;
    }

    console.log('✅ adminDeleteProduct: Hard deleted product:', id);
  }
}

/**
 * Upload product image to storage
 */
export async function uploadProductImage(imageUri: string, fileName?: string): Promise<string> {
  console.log('🔧 uploadProductImage: Starting upload...');
  
  try {
    // Generate unique filename if not provided
    const timestamp = Date.now();
    const finalFileName = fileName || `product_${timestamp}.jpg`;
    
    // For React Native, we need to read the file as base64 and convert to ArrayBuffer
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(finalFileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('❌ uploadProductImage error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    console.log('✅ uploadProductImage: Uploaded to:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('❌ uploadProductImage exception:', err);
    throw err;
  }
}

/**
 * Delete product image from storage
 */
export async function deleteProductImage(imagePath: string) {
  console.log('🔧 deleteProductImage: Deleting image:', imagePath);
  
  // Extract path from URL if needed
  const path = imagePath.includes('product-images/') 
    ? imagePath.split('product-images/')[1] 
    : imagePath;
  
  const { error } = await supabase.storage
    .from('product-images')
    .remove([path]);

  if (error) {
    console.error('❌ deleteProductImage error:', error);
    throw error;
  }

  console.log('✅ deleteProductImage: Deleted image:', path);
}

/**
 * Pick image using expo-image-picker
 */
export async function pickProductImage(): Promise<string | null> {
  console.log('🔧 pickProductImage: Requesting permissions...');
  
  // Request permissions
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (permissionResult.granted === false) {
    throw new Error('Permission to access camera roll is required!');
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 5], // Product image aspect ratio
    quality: 0.8,
  });

  if (result.canceled) {
    console.log('🔧 pickProductImage: User cancelled');
    return null;
  }

  console.log('✅ pickProductImage: Selected image:', result.assets[0].uri);
  return result.assets[0].uri;
}


