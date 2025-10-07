import { listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { FeaturedDrops } from '@/src/components/FeaturedDrops';
import { FinestKnownLogo } from '@/src/components/FinestKnownLogo';
import { FlashSaleCarousel } from '@/src/components/FlashSaleCarousel';
import { ProductCard } from '@/src/components/ProductCard';
import { ProductCardSkeleton } from '@/src/components/ProductCardSkeleton';
import { QuickShopGrid, ResourceItem, SectionHeader } from '@/src/components/home';
import { colors, radii, shadow, spacing, type } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch latest 6 products
  const { data: latestProductsData, isLoading: isLoadingLatest, refetch: refetchLatest } = useQuery({
    queryKey: ['latest-products-home'],
    queryFn: () => listProducts({ 
      page: 1, 
      pageSize: 6, 
      sort: 'newest'
    }),
  });

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await Promise.all([
      refetchLatest(),
      // Add other refetch calls here if needed
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRefreshing(false);
  }, [refetchLatest]);

  // Handle CTA buttons with haptics
  const handleCTA = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  }, []);

  // Toggle favorites
  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  // Render latest products grid
  const renderLatestProducts = () => {
    if (isLoadingLatest) {
      return (
        <View style={styles.latestProductsGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.productCardWrapper}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      );
    }

    if (!latestProductsData?.items?.length) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyText}>No products available yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for new arrivals!</Text>
        </View>
      );
    }

    return (
      <View style={styles.latestProductsGrid}>
        {latestProductsData.items.slice(0, 6).map((product) => (
          <View key={product.id} style={styles.productCardWrapper}>
            <ProductCard 
              product={product}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(product.id)}
              showQuickView={true}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Finest Known" showLivePrices={true} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
          />
        }
      >
        {/* Compact Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <View style={styles.heroContent}>
            <FinestKnownLogo size="medium" showText={false} />
            <Text style={styles.heroTagline}>
              Finest Precious Metals & Rare Coins
            </Text>
            
            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity 
                style={[styles.ctaButton, styles.ctaPrimary]}
                onPress={() => handleCTA('/catalog')}
              >
                <Ionicons name="storefront" size={18} color={colors.surface} />
                <Text style={styles.ctaPrimaryText}>Shop Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.ctaButton, styles.ctaSecondary]}
                onPress={() => handleCTA('/auctions')}
              >
                <Ionicons name="flash" size={18} color={colors.brand} />
                <Text style={styles.ctaSecondaryText}>Live Auctions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Quick Shop Grid - PHASE 1 */}
        <QuickShopGrid />

        {/* Flash Sale Carousel - Enhanced PHASE 2 */}
        <FlashSaleCarousel />

        {/* Featured Drops - Enhanced PHASE 2 */}
        <FeaturedDrops limit={6} />

        {/* Latest Products - PHASE 2 */}
        <View style={styles.section}>
          <SectionHeader 
            title="Latest Arrivals" 
            subtitle="Newest additions to our collection"
            ctaText="View All"
            onCtaPress={() => router.push('/catalog')}
          />
          {renderLatestProducts()}
        </View>

        {/* Resources Section - Enhanced PHASE 2 */}
        <View style={styles.section}>
          <SectionHeader 
            title="Resources" 
            subtitle="Learn about precious metals & coins" 
          />
          
          <ResourceItem 
            title="Investing in Gold" 
            description="Complete guide to building wealth with gold"
            onPress={() => router.push('/resources/about')}
          />
          <ResourceItem 
            title="Coin Grading 101" 
            description="Understanding grades, values, and authenticity"
            onPress={() => router.push('/resources/about')}
          />
          <ResourceItem 
            title="Market News" 
            description="Latest precious metals market updates"
            onPress={() => router.push('/resources/rare-coin-news')}
          />
        </View>

        {/* Trust Badges - PHASE 3 */}
        <View style={styles.trustSection}>
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <Text style={styles.trustText}>Authentic</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={24} color={colors.success} />
              <Text style={styles.trustText}>Secure</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="airplane" size={24} color={colors.success} />
              <Text style={styles.trustText}>Insured Shipping</Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  // Hero Section - Compact Design
  heroSection: {
    backgroundColor: colors.bg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
    alignSelf: 'center',
  },
  heroTagline: {
    ...type.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  
  // CTA Buttons
  ctaContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    minHeight: 48,
  },
  ctaPrimary: {
    backgroundColor: colors.brand,
    ...shadow.card,
  },
  ctaPrimaryText: {
    ...type.body,
    color: colors.surface,
    fontWeight: '700',
  },
  ctaSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brand,
    ...shadow.card,
  },
  ctaSecondaryText: {
    ...type.body,
    color: colors.brand,
    fontWeight: '700',
  },
  
  // Sections
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  // Latest Products Grid
  latestProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productCardWrapper: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },
  
  // Empty State
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...type.title,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...type.body,
    color: colors.text.secondary,
  },
  
  // Trust Section
  trustSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xl,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  trustBadge: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustText: {
    ...type.meta,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  
  // Bottom Padding
  bottomPadding: {
    height: spacing.xl,
  },
});
