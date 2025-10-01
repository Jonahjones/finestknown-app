import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listProducts, ProductRow } from '../api/products';
import { colors, radii, shadow, spacing, type } from '../theme';
import { SkeletonCard } from './ui';

interface FeaturedDropsProps {
  limit?: number;
}

export function FeaturedDrops({ limit = 6 }: FeaturedDropsProps) {
  // Fetch featured products (newest items, could be filtered by a featured flag in the future)
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => listProducts({ 
      page: 1, 
      pageSize: limit, 
      sort: 'newest' // Show newest items as featured
    }),
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getImageUrl = (photos: string[]) => {
    if (!photos || photos.length === 0) {
      return 'https://via.placeholder.com/200x200/e5e7eb/9ca3af?text=No+Image';
    }
    return photos[0];
  };

  const renderFeaturedItem = ({ item }: { item: ProductRow }) => {
    const isSoldOut = item.stock === 0;
    const isLowStock = item.stock > 0 && item.stock < 5;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/product/${item.id}` as any)}
        activeOpacity={0.9}
        style={styles.productCard}
      >
        <View style={styles.featuredCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(item.photos) }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            
            {/* Category chip - top left */}
            {item.metal && (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.metal}</Text>
              </View>
            )}
            
            {/* Sold Badge - top right */}
            {isSoldOut && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleBadgeText}>SOLD</Text>
              </View>
            )}
          </View>
          
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <Text style={styles.featuredPrice}>
              {formatPrice(item.price_cents)}
            </Text>
            
            {/* Stock indicator */}
            {!isSoldOut && (
              <View style={styles.stockRow}>
                <View style={[
                  styles.stockDot,
                  isLowStock && styles.lowStockDot
                ]} />
                <Text style={[
                  styles.stockText,
                  isLowStock && styles.lowStockText
                ]}>
                  {isLowStock ? 'Low Stock' : 'In Stock'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Featured Drops</Text>
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} style={styles.skeletonCard} />
          ))}
        </View>
      </View>
    );
  }

  if (error || !productsData?.items?.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Featured Drops</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No featured items available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Drops</Text>
        <TouchableOpacity 
          onPress={() => router.push('/catalog' as any)}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={productsData.items}
        renderItem={renderFeaturedItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...type.h2,
    color: colors.text.primary,
  },
  viewAllButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  viewAllText: {
    ...type.body,
    fontWeight: '700',
    color: colors.brand,
  },
  featuredList: {
    paddingLeft: 0,
    paddingRight: spacing.lg,
  },
  productCard: {
    marginRight: spacing.md,
  },
  featuredCard: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.border,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  featuredImage: {
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
  categoryChipText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.text.primary,
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
  saleBadgeText: {
    ...type.meta,
    fontWeight: '700',
    color: colors.surface,
  },
  featuredContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  featuredTitle: {
    ...type.title,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    minHeight: 44, // 2 lines
  },
  featuredPrice: {
    ...type.title,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  skeletonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skeletonCard: {
    width: 200,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...type.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
