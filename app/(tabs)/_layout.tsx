import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '../../components/haptic-tab';
import TabBarBackground from '../../components/ui/tab-bar-background';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useCartItemCount } from '../../src/hooks/useCart';
import { colors, radii, type } from '../../src/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const cartItemCount = useCartItemCount();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: type.meta.fontSize,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
          default: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
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
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={size || 24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name={focused ? 'grid' : 'grid-outline'} 
                size={size || 24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="auctions"
        options={{
          title: 'Auctions',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name={focused ? 'flash' : 'flash-outline'} 
                size={size || 24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={styles.tabIconContainer}>
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
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons 
                name={focused ? 'analytics' : 'analytics-outline'} 
                size={size || 24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});