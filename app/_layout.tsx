import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// Removed Stripe integration for simplified checkout
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthWrapper } from '@/src/components/AuthWrapper';
import { QueryProvider } from '@/src/providers/QueryProvider';
import { AuthProvider } from '@/src/store/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthWrapper>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="purchase/[id]" options={{ presentation: 'modal', title: 'Purchase' }} />
              <Stack.Screen name="checkout" options={{ presentation: 'modal', title: 'Checkout' }} />
            </Stack>
          </AuthWrapper>
          <StatusBar 
            style={Platform.OS === 'ios' ? 'dark' : 'light'} 
            backgroundColor={colorScheme === 'dark' ? '#000000' : '#1E3A8A'}
            translucent={false}
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
