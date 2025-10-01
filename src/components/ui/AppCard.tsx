import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../design/tokens';

export type CardVariant = 'tile' | 'row' | 'promo';

interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function AppCard({ 
  children, 
  variant = 'tile', 
  onPress, 
  style, 
  testID 
}: AppCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[styles.base, styles[variant], style]}
      onPress={onPress}
      testID={testID}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.08,
    shadowColor: '#000000',
    elevation: 2,
  },
  tile: {
    padding: spacing.md,
    minHeight: 200,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 80,
  },
  promo: {
    padding: spacing.lg,
    minHeight: 120,
    backgroundColor: colors.background,
  },
});









