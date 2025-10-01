import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listProducts, ProductRow } from '../api/products';
import { colors, radii, shadow, spacing, type } from '../theme';
import { Badge, Card, SkeletonCard } from './ui';

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

  const renderFeaturedItem = ({ item }: { item: ProductRow }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.9}
      style={styles.productCard}
    >
      <Card elevation="e2" style={styles.featuredCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item.photos) }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.badgeContainer}>
              <Badge 
                label="NEW" 
                variant="outline" 
                style={styles.newBadge}
              />
              {item.stock === 0 && (
                <Badge 
                  label="SOLD" 
                  variant="outline" 
                  style={styles.soldBadge}
                />
              )}
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="heart-outline" size={20} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="eye-outline" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.featuredContent}>
          <View style={styles.titleRow}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.stockIndicator}>
              <Ionicons 
                name={item.stock > 0 ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={item.stock > 0 ? colors.success : colors.danger} 
              />
              <Text style={[
                styles.stockText,
                { color: item.stock > 0 ? colors.success : colors.danger }
              ]}>
                {item.stock > 0 ? 'In Stock' : 'Sold Out'}
              </Text>
            </View>
          </View>
          
          <View style={styles.featuredDetails}>
            {item.metal && (
              <View style={styles.metalTag}>
                <Ionicons name="diamond" size={12} color={colors.brand} />
                <Text style={styles.featuredMetal}>
                  {item.metal.charAt(0).toUpperCase() + item.metal.slice(1)}
                </Text>
              </View>
            )}
            {item.year && (
              <View style={styles.yearTag}>
                <Text style={styles.featuredYear}>{item.year}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.featuredPrice}>
              {formatPrice(item.price_cents)}
            </Text>
            {item.grade && item.grader && (
              <View style={styles.gradeContainer}>
                <Text style={styles.featuredGrade}>
                  {item.grader} {item.grade}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/3,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  newBadge: {
    backgroundColor: colors.brand,
  },
  soldBadge: {
    backgroundColor: colors.danger,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'flex-end',
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  featuredTitle: {
    ...type.body,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockText: {
    ...type.meta,
  },
  featuredDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  metalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    gap: spacing.xs,
  },
  featuredMetal: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearTag: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  featuredYear: {
    ...type.meta,
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  featuredPrice: {
    ...type.title,
    color: colors.text.primary,
  },
  gradeContainer: {
    backgroundColor: colors.brand + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  featuredGrade: {
    ...type.meta,
    color: colors.brand,
    fontWeight: '700',
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
