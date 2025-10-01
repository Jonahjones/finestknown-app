import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// Removed Stripe integration for simplified checkout
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

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
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="purchase/[id]" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="checkout" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="admin/index" options={{ headerShown: false }} />
              <Stack.Screen name="admin/new" options={{ headerShown: false }} />
              <Stack.Screen name="admin/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="account/index" options={{ headerShown: false }} />
              <Stack.Screen name="account/orders" options={{ headerShown: false }} />
              <Stack.Screen name="account/orders/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="learn/[slug]" options={{ headerShown: false }} />
              <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="support/contact" options={{ headerShown: false }} />
              <Stack.Screen name="resources/about" options={{ headerShown: false }} />
              <Stack.Screen name="resources/caesar-gold-coins" options={{ headerShown: false }} />
              <Stack.Screen name="resources/double-eagles" options={{ headerShown: false }} />
              <Stack.Screen name="resources/goldbacks" options={{ headerShown: false }} />
              <Stack.Screen name="resources/morgan-silver-dollars" options={{ headerShown: false }} />
              <Stack.Screen name="resources/rare-coin-news" options={{ headerShown: false }} />
              <Stack.Screen name="resources/special-reports" options={{ headerShown: false }} />
              <Stack.Screen name="resources/treasure-talk" options={{ headerShown: false }} />
              <Stack.Screen name="resources/videos" options={{ headerShown: false }} />
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
