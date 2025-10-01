import { addToCart, getOrCreateCart, listCartItems } from '../api/cart';
import { supabase } from '../lib/supabase';

export async function testCartFunctionality() {
  console.log('🧪 Starting cart functionality test...');
  
  try {
    // Test 1: User authentication
    console.log('🔐 Testing user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Auth Error:', authError);
      return { success: false, error: 'User not authenticated. Please sign in.' };
    }
    console.log('✅ Test 1 Passed: User authenticated:', user.id);

    // Test 2: Get or create cart
    console.log('🛒 Testing getOrCreateCart...');
    const cart = await getOrCreateCart();
    if (!cart) {
      return { success: false, error: 'Failed to get or create cart' };
    }
    console.log('✅ Test 2 Passed: Cart exists:', cart.id);

    // Test 3: Check if we have products to test with
    console.log('📦 Testing product availability...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, price_cents')
      .eq('is_active', true)
      .limit(1);
    
    if (productsError || !products || products.length === 0) {
      console.error('❌ Products Error:', productsError);
      return { success: false, error: 'No products available for testing.' };
    }
    
    const testProduct = products[0];
    console.log('✅ Test 3 Passed: Test product found:', testProduct.title);

    // Test 4: Test cart tables access
    console.log('🔗 Testing cart tables access...');
    const { data: testCartQuery, error: cartDbError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (cartDbError) {
      console.error('❌ Cart Database Error:', cartDbError);
      return { 
        success: false, 
        error: `Cart table access failed: ${cartDbError.message}`,
        details: cartDbError
      };
    }
    console.log('✅ Test 4 Passed: Cart table accessible');

    // Test 5: Test cart_items table access
    console.log('🔗 Testing cart_items table access...');
    const { data: testCartItemsQuery, error: cartItemsDbError } = await supabase
      .from('cart_items')
      .select('cart_id')
      .eq('cart_id', cart.id)
      .limit(1);
    
    if (cartItemsDbError) {
      console.error('❌ Cart Items Database Error:', cartItemsDbError);
      return { 
        success: false, 
        error: `Cart items table access failed: ${cartItemsDbError.message}`,
        details: cartItemsDbError
      };
    }
    console.log('✅ Test 5 Passed: Cart items table accessible');

    // Test 6: Try adding an item to cart
    console.log('➕ Testing addToCart...');
    try {
      await addToCart(testProduct.id, 1, testProduct.price_cents);
      console.log('✅ Test 6 Passed: Item added to cart successfully');
    } catch (addError) {
      console.error('❌ Add to Cart Error:', addError);
      return { 
        success: false, 
        error: `Failed to add item to cart: ${addError.message}`,
        details: addError
      };
    }

    // Test 7: List cart items to verify
    console.log('📋 Testing listCartItems...');
    const cartItems = await listCartItems();
    console.log('✅ Test 7 Passed: Cart items retrieved:', cartItems.length);

    console.log('✅ All cart tests passed!');
    return { 
      success: true, 
      results: {
        userId: user.id,
        cartId: cart.id,
        testProduct: testProduct.title,
        cartItemsCount: cartItems.length
      }
    };
    
  } catch (error: any) {
    console.error('❌ Cart Test Exception:', error);
    return { 
      success: false, 
      error: error.message || 'An unexpected error occurred during cart test.' 
    };
  }
}
