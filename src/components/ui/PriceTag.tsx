import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../design/tokens';

export type PriceTagSize = 'small' | 'medium' | 'large';

interface PriceTagProps {
  price: number;
  oldPrice?: number;
  currency?: string;
  size?: PriceTagSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showDiscount?: boolean;
}

export function PriceTag({ 
  price, 
  oldPrice,
  currency = '$', 
  size = 'medium',
  style,
  textStyle,
  showDiscount = true
}: PriceTagProps) {
  const formatPrice = (price: number) => {
    // Convert cents to dollars
    const dollars = price / 100;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  };

  const calculateDiscount = () => {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const discount = calculateDiscount();

  return (
    <View style={[styles.container, styles[size], style]}>
      <View style={styles.priceRow}>
        <Text style={[styles.price, styles[`${size}Price`], textStyle]}>
          {currency}{formatPrice(price)}
        </Text>
        {oldPrice && oldPrice > price && (
          <Text style={[styles.oldPrice, styles[`${size}OldPrice`]]}>
            {currency}{formatPrice(oldPrice)}
          </Text>
        )}
      </View>
      {showDiscount && discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discount}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  price: {
    color: colors.text,
    fontWeight: '600',
  },
  oldPrice: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  discountText: {
    color: colors.cardBackground,
    fontSize: 10,
    fontWeight: '700',
  },
  // Size variants
  small: {
    paddingVertical: spacing.xs,
  },
  smallPrice: {
    fontSize: typography.caption.size,
  },
  smallOldPrice: {
    fontSize: 10,
  },
  medium: {
    paddingVertical: spacing.sm,
  },
  mediumPrice: {
    fontSize: typography.body.size,
  },
  mediumOldPrice: {
    fontSize: typography.caption.size,
  },
  large: {
    paddingVertical: spacing.md,
  },
  largePrice: {
    fontSize: typography.heading.size,
  },
  largeOldPrice: {
    fontSize: typography.body.size,
  },
});