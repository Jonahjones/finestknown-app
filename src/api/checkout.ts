import { supabase } from "../lib/supabase";
import { clearCart, listCartItems } from "./cart";
import { getProduct } from "./products";

/**
 * Finalize order by decrementing stock atomically
 */
export async function finalizeOrder(cartItems: any[]): Promise<void> {
  console.log('🔒 finalizeOrder: Starting stock decrement for', cartItems.length, 'items');
  
  try {
    // Prepare items for stock decrement
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      qty: item.qty
    }));

    // Call the database function to atomically decrement stock
    const { error } = await supabase.rpc('checkout_decrement', { 
      _items: items 
    });

    if (error) {
      console.error('❌ finalizeOrder: Stock decrement failed:', error);
      
      // Check if it's an out of stock error
      if (error.message && error.message.includes('OUT_OF_STOCK')) {
        throw new Error('Item sold out');
      }
      
      throw new Error(`Failed to reserve items: ${error.message}`);
    }

    console.log('✅ finalizeOrder: Stock decremented successfully');
  } catch (err) {
    console.error('❌ finalizeOrder: Exception:', err);
    throw err;
  }
}

export async function requestCheckout(): Promise<{ order_id: string; total_cents: number }> {
  console.log('💳 requestCheckout: Starting basic checkout process...');
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Please sign in to complete checkout');
    }
    
    console.log('✅ requestCheckout: User authenticated:', user.id);
    
    // Get cart items
    const cartItems = await listCartItems();
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Your cart is empty. Please add items before checkout.');
    }
    
    console.log('✅ requestCheckout: Cart items found:', cartItems.length);
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.qty * item.price_snapshot_cents), 0);
    const shipping = 0; // Free shipping for now
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + shipping + tax;
    
    console.log('💰 requestCheckout: Totals calculated:', { subtotal, tax, shipping, total });
    
    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'paid', // Mark as paid since we're not using real payment
        subtotal_cents: subtotal,
        tax_cents: tax,
        shipping_cents: shipping,
        total_cents: total,
      })
      .select('*')
      .single();
    
    if (orderError) {
      console.error('❌ requestCheckout: Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    console.log('✅ requestCheckout: Order created:', order.id);
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      title: item.products?.title || 'Unknown Product',
      price_cents: item.price_snapshot_cents,
      qty: item.qty,
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('❌ requestCheckout: Order items error:', itemsError);
      throw new Error(`Failed to save order items: ${itemsError.message}`);
    }
    
    console.log('✅ requestCheckout: Order items created:', orderItems.length);
    
    // Finalize order by decrementing stock
    await finalizeOrder(cartItems);
    console.log('✅ requestCheckout: Stock decremented');
    
    // Clear the cart after successful order
    await clearCart();
    console.log('✅ requestCheckout: Cart cleared');
    
    return {
      order_id: order.id,
      total_cents: total
    };
    
  } catch (err) {
    console.error('❌ requestCheckout: Exception:', err);
    throw err;
  }
}

export async function getUserOrders(): Promise<any[]> {
  console.log('📋 getUserOrders: Fetching user orders...');
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Please sign in to view orders');
    }

    console.log('✅ getUserOrders: User authenticated:', user.id);

    // Fetch orders with order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          title,
          price_cents,
          qty
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ getUserOrders: Orders error:', ordersError);
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    console.log('✅ getUserOrders: Found orders:', orders?.length || 0);
    return orders || [];

  } catch (err) {
    console.error('❌ getUserOrders: Exception:', err);
    throw err;
  }
}

export async function requestDirectPurchase(productId: string, quantity: number): Promise<{ order_id: string; total_cents: number }> {
  console.log('💳 requestDirectPurchase: Starting direct purchase process...', { productId, quantity });
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Please sign in to complete purchase');
    }
    
    console.log('✅ requestDirectPurchase: User authenticated:', user.id);
    
    // Get product details
    const product = await getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    console.log('✅ requestDirectPurchase: Product found:', product.title);
    
    // Calculate totals
    const subtotal = quantity * product.price_cents;
    const shipping = 0; // Free shipping for now
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + shipping + tax;
    
    console.log('💰 requestDirectPurchase: Totals calculated:', { subtotal, tax, shipping, total });
    
    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'paid', // Mark as paid since we're not using real payment
        subtotal_cents: subtotal,
        tax_cents: tax,
        shipping_cents: shipping,
        total_cents: total,
      })
      .select('*')
      .single();
    
    if (orderError) {
      console.error('❌ requestDirectPurchase: Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    console.log('✅ requestDirectPurchase: Order created:', order.id);
    
    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        title: product.title,
        price_cents: product.price_cents,
        qty: quantity,
      });
    
    if (itemError) {
      console.error('❌ requestDirectPurchase: Order item error:', itemError);
      throw new Error(`Failed to save order item: ${itemError.message}`);
    }
    
    console.log('✅ requestDirectPurchase: Order item created');
    
    // Finalize order by decrementing stock for direct purchase
    await finalizeOrder([{
      product_id: product.id,
      qty: quantity
    }]);
    console.log('✅ requestDirectPurchase: Stock decremented');
    
    return {
      order_id: order.id,
      total_cents: total
    };
    
  } catch (err) {
    console.error('❌ requestDirectPurchase: Exception:', err);
    throw err;
  }
}
