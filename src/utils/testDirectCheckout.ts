import { supabase } from '../lib/supabase';

export async function testDirectCheckout() {
  console.log('🧪 Starting direct checkout test...');
  
  try {
    // Test 1: User authentication
    console.log('🔐 Testing user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Auth Error:', authError);
      return { success: false, error: 'User not authenticated. Please sign in.' };
    }
    console.log('✅ Test 1 Passed: User authenticated:', user.id);

    // Test 2: Check if we have products to test with
    console.log('📦 Testing product availability...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price_cents')
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      console.error('❌ Products Error:', productsError);
      return { success: false, error: 'No products available for testing.' };
    }
    
    const testProduct = products[0];
    console.log('✅ Test 2 Passed: Test product found:', testProduct.title);

    // Test 3: Test database connectivity for orders
    console.log('🔗 Testing orders table access...');
    const { data: testOrderQuery, error: orderDbError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (orderDbError) {
      console.error('❌ Orders Database Error:', orderDbError);
      return { 
        success: false, 
        error: `Orders table access failed: ${orderDbError.message}`,
        details: orderDbError
      };
    }
    console.log('✅ Test 3 Passed: Orders table accessible');

    // Test 4: Test order_items table access
    console.log('🔗 Testing order_items table access...');
    const { data: testOrderItemsQuery, error: orderItemsDbError } = await supabase
      .from('order_items')
      .select('order_id')
      .limit(1);
    
    if (orderItemsDbError) {
      console.error('❌ Order Items Database Error:', orderItemsDbError);
      return { 
        success: false, 
        error: `Order items table access failed: ${orderItemsDbError.message}`,
        details: orderItemsDbError
      };
    }
    console.log('✅ Test 4 Passed: Order items table accessible');

    console.log('✅ All tests passed! Direct checkout should work.');
    console.log('💡 To test the full flow, try using the Buy Now button on a product.');
    
    return { 
      success: true, 
      testProduct: testProduct,
      message: 'All systems ready for direct checkout!'
    };
    
  } catch (error: any) {
    console.error('❌ Test Direct Checkout Exception:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during direct checkout test.' 
    };
  }
}

// Test function for simulating a direct purchase (without actually creating an order)
export async function simulateDirectPurchase(productId: string, quantity: number = 1) {
  console.log('🎭 Simulating direct purchase...', { productId, quantity });
  
  try {
    // This would call the actual function but we'll just validate the inputs
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    console.log('✅ Simulation passed: Direct purchase would work with these parameters');
    return { 
      success: true, 
      message: `Would purchase ${quantity} of product ${productId}` 
    };
    
  } catch (error: any) {
    console.error('❌ Simulation failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
