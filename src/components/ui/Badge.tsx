import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';

export type BadgeVariant = 'outline' | 'filled' | 'success' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, variant = 'outline', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.baseText, styles[`${variant}Text`], textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  
  // Variants
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  filled: {
    backgroundColor: colors.gold,
  },
  success: {
    backgroundColor: colors.success,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  info: {
    backgroundColor: colors.info,
  },
  
  // Text styles
  baseText: {
    fontSize: typography.caption.size,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  outlineText: {
    color: colors.gold,
  },
  filledText: {
    color: colors.navy,
  },
  successText: {
    color: colors.ivory,
  },
  dangerText: {
    color: colors.ivory,
  },
  infoText: {
    color: colors.ivory,
  },
});
