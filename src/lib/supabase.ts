import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Updated to correct project
const supabaseUrl = 'https://bsuuskzoqnivjvqjpwnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdXVza3pvcW5pdmp2cWpwd25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIyNDEsImV4cCI6MjA3MzcxODI0MX0.-8LKdAslPQ8VDXmcgZ312OGKJxykz-Cifhj8AKX3KWE';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  throw new Error('Missing Supabase configuration');
}

// Alternative: Use environment variables when available
// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic session refresh
    autoRefreshToken: true,
    // Persist session in localStorage for web, AsyncStorage for mobile
    persistSession: true,
    // Detect session from URL for OAuth flows
    detectSessionInUrl: false,
  },
  global: {
    // Add custom headers and fetch configuration
    headers: {
      'x-my-custom-header': 'finestknown-app',
    },
    fetch: (url, options = {}) => {
      console.log('🌐 Making request to:', url);
      
      // Create timeout controller for React Native compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
});

// Test connection
console.log('🔗 Supabase client initialized with URL:', supabaseUrl);
console.log('🔑 Using anon key:', supabaseAnonKey.substring(0, 20) + '...');

// Test basic connectivity with better error handling
const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test auth endpoint instead of a table
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠️ Auth session check:', error.message);
    } else {
      console.log('✅ Supabase auth connection successful');
    }
    
    // Test if we can reach the database with a real table
    const { data: healthData, error: healthError } = await supabase.from('products').select('id').limit(1);
    if (healthError) {
      console.log('💡 Database connection (products table test failed - this is normal if no products exist)');
    } else {
      console.log('✅ Database connection successful:', healthData);
    }
  } catch (err) {
    console.error('❌ Network connectivity issue:', err);
    console.log('🌐 Check your internet connection and Supabase project status');
  }
};

// Run connection test
testConnection();
