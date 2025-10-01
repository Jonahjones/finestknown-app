import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductRow } from '../api/products';
import { colors, spacing, typography } from '../design/tokens';
import { Badge, Card, PriceTag } from './ui';

interface ProductCardProps {
  product: ProductRow;
}

export function ProductCard({ product }: ProductCardProps) {
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const isSoldOut = product.stock === 0;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Card elevation="e1" style={[styles.card, isSoldOut && styles.soldCard]}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: product.photos[0] || 'https://via.placeholder.com/200x200/F8F7F4/C9D1D9?text=No+Image' 
            }}
            style={[styles.image, isSoldOut && styles.soldImage]}
            resizeMode="cover"
          />
          
          {/* SOLD Badge */}
          {isSoldOut && (
            <View style={styles.soldBadgeContainer}>
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          
          <PriceTag
            price={product.price_cents}
            size="medium"
            showDiscount={false}
          />
          
          {product.grade && product.grader && (
            <Badge 
              label={`${product.grader} ${product.grade}`}
              variant="outline"
              style={styles.gradeBadge}
            />
          )}
          
          <View style={styles.metaRow}>
            <Text style={styles.stockText}>
              {isSoldOut ? 'Sold Out' : `${product.stock} in stock`}
            </Text>
            <Text style={styles.metalText}>{product.metal}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 16,
  },
  card: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  
  // Image Container (fixed height)
  imageContainer: {
    width: '100%',
    height: 200, // Fixed height instead of aspect ratio
    backgroundColor: colors.platinum,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  image: {
    width: '90%',
    height: '90%',
    backgroundColor: colors.platinum,
  },
  soldCard: {
    opacity: 0.8,
  },
  soldImage: {
    opacity: 0.6,
  },
  soldBadgeContainer: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    zIndex: 1,
  },
  soldBadge: {
    backgroundColor: colors.ivory,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 6,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soldBadgeText: {
    fontSize: typography.caption.size,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    textAlign: 'center',
    letterSpacing: 1,
  },
  
  // Content
  content: {
    flex: 1,
    padding: spacing.m,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.body.size,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    marginBottom: spacing.s,
    lineHeight: typography.body.lineHeight,
  },
  priceTag: {
    fontSize: typography.heading.size,
    fontWeight: typography.heading.weight,
    color: colors.navy,
    marginBottom: spacing.s,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: typography.caption.size,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metalText: {
    fontSize: typography.caption.size,
    color: colors.gold,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});