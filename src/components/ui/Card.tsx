import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../../design/tokens';

export type CardElevation = 'e1' | 'e2' | 'e3';

interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  style?: ViewStyle;
}

export function Card({ children, elevation = 'e1', style }: CardProps) {
  return (
    <View style={[styles.base, styles[elevation], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  e1: {
    ...shadows.e1,
  },
  e2: {
    ...shadows.e2,
  },
  e3: {
    ...shadows.e3,
  },
});
