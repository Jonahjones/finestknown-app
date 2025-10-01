// Test utility to help debug checkout issues
import { supabase } from '../lib/supabase';

export async function testCheckoutSetup() {
  console.log('🧪 Testing checkout setup...');
  
  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Test 1 Failed: User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }
    console.log('✅ Test 1 Passed: User authenticated');

    // Test 2: Check if user has a cart with items
    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!cart) {
      console.log('⚠️ Test 2: No cart found (will be created during checkout)');
    } else {
      console.log('✅ Test 2 Passed: Cart exists');
      
      // Check cart items
      const { data: items } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id);
      
      if (!items || items.length === 0) {
        console.log('❌ Test 3 Failed: Cart is empty');
        return { success: false, error: 'Cart is empty' };
      }
      console.log('✅ Test 3 Passed: Cart has items:', items.length);
    }

    // Test 3: Test database connectivity
    console.log('🔗 Testing database connectivity...');
    const { data: testQuery, error: dbError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database Error:', dbError);
      return { 
        success: false, 
        error: `Database connection failed: ${dbError.message}`,
        details: dbError
      };
    }
    
    console.log('✅ All tests passed! Checkout should work.');
    return { success: true };
    
  } catch (error) {
    console.error('💥 Test Exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
