import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../design/tokens';

const TAB_ICONS = {
  index: 'sparkles',
  catalog: 'grid',
  cart: 'cart',
  learn: 'book',
} as const;

const TAB_LABELS = {
  index: 'Home',
  catalog: 'Catalog',
  cart: 'Cart',
  learn: 'Research',
} as const;

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = TAB_LABELS[route.name as keyof typeof TAB_LABELS] || route.name;
        const icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              isFocused && styles.tabButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <View style={[
              styles.tabContent,
              isFocused && styles.tabContentActive,
            ]}>
              <Ionicons
                name={icon as any}
                size={24}
                color={isFocused ? colors.ivory : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.ivory,
    borderTopWidth: 1,
    borderTopColor: colors.silver,
    paddingTop: spacing.s,
    paddingHorizontal: spacing.s,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xs,
    minHeight: 44, // Ensure 44dp touch target
  },
  tabButtonActive: {
    // Active tab gets special styling
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.md,
    minHeight: 56,
    minWidth: 56,
  },
  tabContentActive: {
    backgroundColor: colors.navy,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.ivory,
    fontWeight: typography.weights.semibold,
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
});
