import { supabase } from "../lib/supabase";
import { getCurrentSalePrice } from "./discounts";

export async function getOrCreateCart() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  let { data: cart } = await supabase.from("carts").select("*").eq("user_id", user.id).single();
  if (!cart) {
    const { data: created, error } = await supabase.from("carts").insert({ user_id: user.id }).select("*").single();
    if (error) throw error;
    cart = created!;
  }
  return cart;
}

export async function addToCart(productId: string, qty: number, price_cents?: number) {
  console.log('🛒 addToCart: Starting...', { productId, qty, price_cents });
  
  try {
    const cart = await getOrCreateCart();
    console.log('🛒 addToCart: Got cart:', cart.id);
    
    // Get current sale price if not provided
    let finalPriceCents = price_cents;
    if (!finalPriceCents) {
      const salePrice = await getCurrentSalePrice(productId);
      finalPriceCents = Math.round((salePrice?.salePrice || 0) * 100);
    }
    
    const { data: existing, error: selectError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .maybeSingle();
      
    if (selectError) {
      console.error('❌ addToCart: Error checking existing item:', selectError);
      throw selectError;
    }
    
    if (existing) {
      console.log('🛒 addToCart: Updating existing item, current qty:', existing.qty);
      const { error } = await supabase
        .from("cart_items")
        .update({ qty: existing.qty + qty, price_snapshot_cents: finalPriceCents })
        .eq("cart_id", cart.id)
        .eq("product_id", productId);
      if (error) {
        console.error('❌ addToCart: Error updating item:', error);
        throw error;
      }
      console.log('✅ addToCart: Successfully updated item');
    } else {
      console.log('🛒 addToCart: Inserting new item');
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        qty,
        price_snapshot_cents: finalPriceCents
      });
      if (error) {
        console.error('❌ addToCart: Error inserting item:', error);
        throw error;
      }
      console.log('✅ addToCart: Successfully inserted item');
    }
  } catch (err) {
    console.error('❌ addToCart: Exception:', err);
    throw err;
  }
}

export async function listCartItems() {
  console.log('📦 listCartItems: Starting...');
  const cart = await getOrCreateCart();
  console.log('📦 listCartItems: Got cart:', cart.id);
  
  // First, get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("product_id, qty, price_snapshot_cents")
    .eq("cart_id", cart.id);
  
  console.log('📦 listCartItems: Cart items result:', { cartItems, cartError });
  
  if (cartError) {
    console.error('❌ listCartItems cart error:', cartError);
    throw cartError;
  }
  
  if (!cartItems || cartItems.length === 0) {
    console.log('📦 listCartItems: No items in cart');
    return [];
  }
  
  // Then, get product details for each item (including stock)
  const productIds = cartItems.map(item => item.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, title, photos, stock")
    .in("id", productIds);
  
  console.log('📦 listCartItems: Products result:', { products, productsError });
  
  if (productsError) {
    console.error('❌ listCartItems products error:', productsError);
    throw productsError;
  }
  
  // Combine cart items with product details
  const result = cartItems.map(item => {
    const product = products?.find(p => p.id === item.product_id);
    return {
      product_id: item.product_id,
      qty: item.qty,
      price_snapshot_cents: item.price_snapshot_cents,
      products: product ? { 
        title: product.title, 
        photos: product.photos,
        stock: product.stock 
      } : null
    };
  });
  
  console.log('📦 listCartItems: Returning', result.length, 'items with products');
  return result;
}

export async function removeFromCart(productId: string) {
  console.log('🗑️ removeFromCart: Starting for product:', productId);
  const cart = await getOrCreateCart();
  console.log('🗑️ removeFromCart: Got cart:', cart.id);
  
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)
    .eq("product_id", productId);
    
  if (error) {
    console.error('❌ removeFromCart error:', error);
    throw error;
  }
  console.log('✅ removeFromCart: Successfully removed item');
}

export async function updateCartItemQuantity(productId: string, qty: number) {
  console.log('📝 updateCartItemQuantity: Starting for product:', productId, 'qty:', qty);
  const cart = await getOrCreateCart();
  console.log('📝 updateCartItemQuantity: Got cart:', cart.id);
  
  if (qty <= 0) {
    // If quantity is 0 or negative, remove the item
    return removeFromCart(productId);
  }
  
  const { error } = await supabase
    .from("cart_items")
    .update({ qty })
    .eq("cart_id", cart.id)
    .eq("product_id", productId);
    
  if (error) {
    console.error('❌ updateCartItemQuantity error:', error);
    throw error;
  }
  console.log('✅ updateCartItemQuantity: Successfully updated quantity');
}

export async function clearCart() {
  console.log('🗑️ clearCart: Starting...');
  const cart = await getOrCreateCart();
  console.log('🗑️ clearCart: Got cart:', cart.id);
  
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) {
    console.error('❌ clearCart error:', error);
    throw error;
  }
  console.log('✅ clearCart: Successfully cleared cart');
}

/**
 * Remove sold out items from cart
 */
export async function removeSoldItemsFromCart(): Promise<string[]> {
  console.log('🧹 removeSoldItemsFromCart: Starting...');
  
  try {
    const cart = await getOrCreateCart();
    console.log('🧹 removeSoldItemsFromCart: Got cart:', cart.id);
    
    // Get cart items with product stock info
    const cartItems = await listCartItems();
    
    // Find sold out items
    const soldOutItems = cartItems.filter(item => 
      item.products && item.products.stock === 0
    );
    
    if (soldOutItems.length === 0) {
      console.log('🧹 removeSoldItemsFromCart: No sold out items found');
      return [];
    }
    
    console.log('🧹 removeSoldItemsFromCart: Found', soldOutItems.length, 'sold out items');
    
    // Remove sold out items
    const soldOutProductIds = soldOutItems.map(item => item.product_id);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .in("product_id", soldOutProductIds);
    
    if (error) {
      console.error('❌ removeSoldItemsFromCart error:', error);
      throw error;
    }
    
    // Return titles of removed items for user notification
    const removedTitles = soldOutItems.map(item => 
      item.products?.title || 'Unknown Item'
    );
    
    console.log('✅ removeSoldItemsFromCart: Removed items:', removedTitles);
    return removedTitles;
    
  } catch (err) {
    console.error('❌ removeSoldItemsFromCart exception:', err);
    throw err;
  }
}
