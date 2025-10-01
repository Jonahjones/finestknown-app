import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadow, spacing, type } from '../../theme';

interface FlashSaleCardProps {
  imageSource: ImageSourcePropType;
  category?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  countdown?: string;
  onPress: () => void;
  onAddToCart: () => void;
}

export function FlashSaleCard({
  imageSource,
  category,
  title,
  price,
  compareAtPrice,
  countdown,
  onPress,
  onAddToCart,
}: FlashSaleCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        
        {/* Category chip - top left */}
        {category && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
        
        {/* Sale badge - top right */}
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>SALE</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          {compareAtPrice && (
            <Text style={styles.comparePrice}>{compareAtPrice}</Text>
          )}
        </View>
        
        {countdown && (
          <Text style={styles.countdown}>{countdown}</Text>
        )}
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    ...shadow.card,
    marginRight: spacing.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface,
    opacity: 0.9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    ...type.meta,
    color: colors.text.primary,
    fontWeight: '700',
  },
  saleBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  saleText: {
    ...type.meta,
    color: colors.surface,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...type.title,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...type.h2,
    color: colors.text.primary,
  },
  comparePrice: {
    ...type.body,
    color: colors.text.muted,
    textDecorationLine: 'line-through',
  },
  countdown: {
    ...type.meta,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    ...type.body,
    color: colors.surface,
    fontWeight: '700',
  },
});

