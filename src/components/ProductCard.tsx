import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductRow } from '../api/products';
import { colors, radii, shadow, spacing, touchTarget, type } from '../theme';

interface ProductCardProps {
  product: ProductRow;
}

export function ProductCard({ product }: ProductCardProps) {
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const isSoldOut = product.stock === 0;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.9}>
      <View style={[styles.card, isSoldOut && styles.soldCard]}>
        {/* Image Container with 4:3 aspect ratio */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: product.photos[0] || 'https://via.placeholder.com/400x300/F7F6F3/C8A34A?text=No+Image' 
            }}
            style={[styles.image, isSoldOut && styles.soldImage]}
            resizeMode="cover"
          />
          
          {/* Category chip - top left */}
          {product.metal && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{product.metal}</Text>
            </View>
          )}
          
          {/* Sale/Sold Badge - top right */}
          {isSoldOut && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SOLD</Text>
            </View>
          )}
          {/* Future: Add sale badge here when product has discount */}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          
          {/* Price with optional strikethrough */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${(product.price_cents / 100).toFixed(2)}
            </Text>
            {/* Future: Add old price with strikethrough when product has discount */}
          </View>
          
          {/* Stock indicator */}
          {!isSoldOut && (
            <View style={styles.stockRow}>
              <View style={[
                styles.stockDot,
                product.stock < 5 && styles.lowStockDot
              ]} />
              <Text style={[
                styles.stockText,
                product.stock < 5 && styles.lowStockText
              ]}>
                {product.stock < 5 ? 'Low Stock' : 'In Stock'}
              </Text>
            </View>
          )}
          
          {/* Add to Cart Button - pill style */}
          {!isSoldOut && (
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={(e) => {
                e.stopPropagation();
                // This could be enhanced to add directly to cart
                handlePress();
              }}
            >
              <Ionicons name="cart-outline" size={16} color={colors.surface} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadow.card,
  },
  soldCard: {
    opacity: 0.85,
  },
  
  // Image Container with 4:3 aspect ratio
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.border,
    position: 'relative',
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldImage: {
    opacity: 0.5,
  },
  
  // Category chip - top left
  categoryChip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface,
    opacity: 0.9,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  categoryChipText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.text.primary,
  },
  
  // Sale/Sold badge - top right
  saleBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  saleBadgeText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.surface,
  },
  
  // Content
  content: {
    gap: spacing.xs,
  },
  title: {
    ...type.title,
    color: colors.text.primary,
    minHeight: 44, // 2 lines
    marginBottom: spacing.xs,
  },
  
  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...type.title,
    color: colors.text.primary,
    fontWeight: '700',
  },
  oldPrice: {
    ...type.body,
    color: colors.text.muted,
    textDecorationLine: 'line-through',
  },
  
  // Stock indicator
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  lowStockDot: {
    backgroundColor: colors.danger,
  },
  stockText: {
    ...type.meta,
    color: colors.success,
    fontWeight: '700',
  },
  lowStockText: {
    color: colors.danger,
  },
  
  // Add to Cart button - pill style
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    gap: spacing.xs,
    minHeight: touchTarget.minHeight,
  },
  addToCartText: {
    ...type.body,
    fontWeight: '700',
    color: colors.surface,
  },
});