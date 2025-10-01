import { supabase } from '../lib/supabase';

export async function testStripeConfiguration() {
  console.log('🧪 Testing Stripe configuration...');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-stripe-config', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Test function error:', error);
      return { 
        success: false, 
        error: `Test function failed: ${error.message}`,
        details: error
      };
    }
    
    console.log('📋 Environment configuration:', data);
    
    if (data.all_env_vars_present) {
      return {
        success: true,
        message: 'All environment variables are configured correctly!',
        details: data
      };
    } else {
      return {
        success: false,
        error: 'Missing environment variables',
        details: data,
        instructions: `
Missing configuration:
${!data.stripe_configured ? '• STRIPE_SECRET_KEY not set' : ''}
${!data.supabase_url_configured ? '• SUPABASE_URL not set' : ''}
${!data.supabase_anon_key_configured ? '• SUPABASE_ANON_KEY not set' : ''}

Please configure these in your Supabase project settings.
        `.trim()
      };
    }
    
  } catch (error) {
    console.error('💥 Test exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
