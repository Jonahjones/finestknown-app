import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductRow } from '../api/products';
import { colors, radius, shadows, spacing, typography } from '../design/tokens';

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
          {isSoldOut ? (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SOLD</Text>
            </View>
          ) : (
            // Future: Add sale badge here when product has discount
            product.stock < 5 && (
              <View style={[styles.saleBadge, styles.lowStockBadge]}>
                <Text style={styles.saleBadgeText}>LOW STOCK</Text>
              </View>
            )
          )}
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
          
          {/* In Stock indicator */}
          {!isSoldOut && (
            <View style={styles.stockRow}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>In Stock</Text>
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
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  soldCard: {
    opacity: 0.85,
  },
  
  // Image Container with 4:3 aspect ratio
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.bg,
    position: 'relative',
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
    top: spacing.s,
    left: spacing.s,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Sale/Sold badge - top right
  saleBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  lowStockBadge: {
    backgroundColor: colors.warning,
  },
  saleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  
  // Content
  content: {
    padding: spacing.m,
  },
  title: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.s,
    minHeight: 40, // 2 lines minimum
  },
  
  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.s,
  },
  price: {
    fontSize: typography.heading.size,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  oldPrice: {
    fontSize: typography.body.size,
    fontWeight: '500',
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: spacing.s,
  },
  
  // Stock indicator
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  stockText: {
    fontSize: typography.caption.size,
    fontWeight: '500',
    color: colors.success,
  },
  
  // Add to Cart button - pill style
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    gap: 6,
  },
  addToCartText: {
    fontSize: typography.caption.size,
    fontWeight: '600',
    color: colors.surface,
  },
});