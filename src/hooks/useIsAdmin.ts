import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin() {
  console.log('🔐 useIsAdmin: Hook called');
  
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      console.log('🔐 useIsAdmin: Checking admin status...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 useIsAdmin: No user found');
        return false;
      }

      console.log('🔐 useIsAdmin: User ID:', user.id);

      // Check if user has profile with admin flag
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('❌ useIsAdmin error:', error);
        return false;
      }

      const isAdmin = profile?.is_admin || false;
      console.log('✅ useIsAdmin: Admin status:', isAdmin, 'Profile:', profile);
      return isAdmin;
    },
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
    refetchOnWindowFocus: true,
    retry: 3, // Retry on failure
    enabled: true, // Always enabled
  });
}

/**
 * Hook to get current user's profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      console.log('👤 useUserProfile: Fetching profile...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('❌ useUserProfile error:', error);
        return null;
      }

      console.log('✅ useUserProfile: Profile loaded');
      return profile;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
