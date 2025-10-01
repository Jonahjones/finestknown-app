import { supabase } from '../lib/supabase';
import { Discount, DiscountForm, FlashSaleItem, FlashSalesResponse } from '../types/discount';

// Utility function for precise decimal calculations with 2 decimal places
function calculateSalePrice(basePrice: number, type: 'PERCENT' | 'AMOUNT', value: number): number {
  if (type === 'AMOUNT') {
    return Math.max(0, Math.round((basePrice - value) * 100) / 100);
  } else {
    // PERCENT
    const discountAmount = basePrice * (value / 100);
    return Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);
  }
}

function calculatePercentOff(basePrice: number, salePrice: number): number {
  if (basePrice === 0) return 0;
  return Math.round((1 - salePrice / basePrice) * 100);
}

// Get active flash sales for landing page
export async function getActiveFlashSales(limit: number = 12): Promise<FlashSalesResponse> {
  const now = new Date().toISOString();
  console.log('🔍 getActiveFlashSales: Fetching flash sales at', now);
  
  const { data, error } = await supabase
    .from('discounts')
    .select(`
      id,
      item_id,
      type,
      value,
      starts_at,
      ends_at,
      is_featured,
      active
    `)
    .eq('active', true)
    .gte('ends_at', now)
    .lte('starts_at', now)
    .order('ends_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching flash sales:', error);
    throw new Error('Failed to fetch flash sales');
  }

  console.log('📊 getActiveFlashSales: Raw data from Supabase:', data);
  console.log('📊 getActiveFlashSales: Data length:', data?.length || 0);
  console.log('📊 getActiveFlashSales: Sample discount:', data?.[0]);

  if (!data || data.length === 0) {
    console.log('📭 No flash sales found');
    return {
      items: [],
      serverTime: now,
    };
  }

  // Fetch product data for each discount
  const productIds = data.map(d => d.item_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, title, price_cents, photos, stock, is_active')
    .in('id', productIds);

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    throw new Error('Failed to fetch products');
  }

  console.log('📦 Products data:', products);
  console.log('📦 Products count:', products?.length || 0);

  const items: FlashSaleItem[] = (data || [])
    .map(discount => {
      console.log('🔄 Processing discount:', discount.id, 'for product:', discount.item_id);
      const product = products?.find(p => p.id === discount.item_id);
      console.log('🔄 Found product:', product ? product.title : 'NOT FOUND');
      
      if (!product) {
        console.log('❌ Product not found for discount:', discount.item_id);
        return null;
      }
      
      if (!product.is_active) {
        console.log('❌ Product not active:', product.title);
        return null;
      }
      
      if (product.stock <= 0) {
        console.log('❌ Product out of stock:', product.title, 'stock:', product.stock);
        return null;
      }

      const basePrice = product.price_cents / 100;
      const salePrice = calculateSalePrice(basePrice, discount.type, discount.value);
      const percentOff = calculatePercentOff(basePrice, salePrice);

      console.log('✅ Creating flash sale item for:', product.title, 'basePrice:', basePrice, 'salePrice:', salePrice, 'percentOff:', percentOff);

      return {
        id: product.id,
        slug: product.id, // Use product ID as slug
        name: product.title,
        imageUrl: product.photos?.[0] || 'https://via.placeholder.com/200x200/F8F7F4/C9D1D9?text=No+Image',
        basePrice,
        salePrice,
        percentOff,
        endsAt: discount.ends_at,
        inventory: product.stock,
      };
    })
    .filter(Boolean) // Remove null values
    .sort((a, b) => {
      // Sort by time remaining, then by discount percentage
      const timeA = new Date(a.endsAt).getTime();
      const timeB = new Date(b.endsAt).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return b.percentOff - a.percentOff;
    });

  console.log('✨ getActiveFlashSales: Final processed items:', items);

  return {
    items,
    serverTime: now,
  };
}

// Get discounts for a specific product
export async function getProductDiscounts(itemId: string): Promise<Discount[]> {
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product discounts:', error);
    throw new Error('Failed to fetch product discounts');
  }

  return data || [];
}

// Create a new discount
export async function createDiscount(itemId: string, discount: DiscountForm): Promise<Discount> {
  // Validate no overlapping active discounts
  const { data: existing } = await supabase
    .from('discounts')
    .select('id')
    .eq('item_id', itemId)
    .eq('active', true)
    .gte('ends_at', discount.starts_at)
    .lte('starts_at', discount.ends_at);

  if (existing && existing.length > 0) {
    throw new Error('Cannot create overlapping active discounts for the same item');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('discounts')
    .insert({
      item_id: itemId,
      type: discount.type,
      value: parseFloat(discount.value),
      starts_at: discount.starts_at,
      ends_at: discount.ends_at,
      is_featured: discount.is_featured,
      active: discount.active,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating discount:', error);
    throw new Error('Failed to create discount');
  }

  return data;
}

// Update a discount
export async function updateDiscount(discountId: string, discount: DiscountForm): Promise<Discount> {
  // Get the item_id first
  const { data: existing } = await supabase
    .from('discounts')
    .select('item_id')
    .eq('id', discountId)
    .single();

  if (!existing) {
    throw new Error('Discount not found');
  }

  // Validate no overlapping active discounts (excluding current one)
  const { data: overlapping } = await supabase
    .from('discounts')
    .select('id')
    .eq('item_id', existing.item_id)
    .eq('active', true)
    .neq('id', discountId)
    .gte('ends_at', discount.starts_at)
    .lte('starts_at', discount.ends_at);

  if (overlapping && overlapping.length > 0) {
    throw new Error('Cannot create overlapping active discounts for the same item');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('discounts')
    .update({
      type: discount.type,
      value: parseFloat(discount.value),
      starts_at: discount.starts_at,
      ends_at: discount.ends_at,
      is_featured: discount.is_featured,
      active: discount.active,
      updated_by: user.id,
    })
    .eq('id', discountId)
    .select()
    .single();

  if (error) {
    console.error('Error updating discount:', error);
    throw new Error('Failed to update discount');
  }

  return data;
}

// Delete a discount
export async function deleteDiscount(discountId: string): Promise<void> {
  const { error } = await supabase
    .from('discounts')
    .delete()
    .eq('id', discountId);

  if (error) {
    console.error('Error deleting discount:', error);
    throw new Error('Failed to delete discount');
  }
}

// Get current sale price for a product
export async function getCurrentSalePrice(itemId: string): Promise<{ basePrice: number; salePrice: number; percentOff: number } | null> {
  const now = new Date().toISOString();
  
  const { data: product } = await supabase
    .from('products')
    .select('price_cents')
    .eq('id', itemId)
    .single();

  if (!product) return null;

  const { data: discount } = await supabase
    .from('discounts')
    .select('type, value')
    .eq('item_id', itemId)
    .eq('active', true)
    .gte('ends_at', now)
    .lte('starts_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const basePrice = product.price_cents / 100;
  
  if (!discount) {
    return { basePrice, salePrice: basePrice, percentOff: 0 };
  }

  const salePrice = calculateSalePrice(basePrice, discount.type, discount.value);
  const percentOff = calculatePercentOff(basePrice, salePrice);

  return { basePrice, salePrice, percentOff };
}
