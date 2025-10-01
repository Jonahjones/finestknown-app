import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { colors, motion, radius, spacing, typography } from '../../design/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'cta';
export type ButtonSize = 'medium' | 'large' | 'xlarge';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const titleStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  if (variant === 'cta') {
    return (
      <TouchableOpacity
        style={[
          styles.base,
          styles[size],
          (disabled || loading) && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={motion.pressScale}
      >
        <LinearGradient
          colors={[colors.brand, colors.brandDark, colors.brand]} // Gold gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientButton, styles[size]]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.ivory}
            />
          ) : (
            <Text style={titleStyle}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={motion.pressScale}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.ivory : colors.navy}
        />
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.brand,
  },
  secondary: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  cta: {
    backgroundColor: colors.gold,
  },
  gradientButton: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Sizes
  medium: {
    height: 44,
    paddingHorizontal: spacing.l,
  },
  large: {
    height: 48,
    paddingHorizontal: spacing.xl,
  },
  xlarge: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  baseText: {
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    fontWeight: typography.body.weight,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.surface,
    fontWeight: typography.weights.semibold,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  ghostText: {
    color: colors.textPrimary,
  },
  ctaText: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  
  // Size-specific text
  mediumText: {
    fontSize: typography.body.size,
  },
  largeText: {
    fontSize: typography.body.size,
    fontWeight: typography.weights.semibold,
  },
  xlargeText: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
  },
  
  disabledText: {
    opacity: 0.7,
  },
});
