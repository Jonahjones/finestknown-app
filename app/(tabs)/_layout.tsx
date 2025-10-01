import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '../../components/haptic-tab';
import TabBarBackground from '../../components/ui/tab-bar-background';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { colors, radius, typography } from '../../src/design/tokens';
import { useCartItemCount } from '../../src/hooks/useCart';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const cartItemCount = useCartItemCount();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.cardBorder,
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
          default: {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.cardBorder,
            borderTopWidth: 1,
            height: 50 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 4),
            paddingTop: 4,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size || 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? 'grid' : 'grid-outline'} 
              size={size || 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={focused ? 'cart' : 'cart-outline'} 
                size={size || 24} 
                color={color} 
              />
              {cartItemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons 
              name={focused ? 'analytics' : 'analytics-outline'} 
              size={size || 24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.cardBackground,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});