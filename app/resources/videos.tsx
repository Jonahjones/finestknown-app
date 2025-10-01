import { listResourceArticles } from '@/src/api/articles';
import { getBestSellingProducts, listProducts } from '@/src/api/products';
import { AppHeader } from '@/src/components/AppHeader';
import { colors, spacing } from '@/src/design/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideosPage() {
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['resource-articles', 'videos'],
    queryFn: () => listResourceArticles('videos'),
  });

  // Fetch latest products (newest by created_at)
  const { data: latestData } = useQuery({
    queryKey: ['latest-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'newest' }),
  });

  // Fetch best selling products (based on actual sales)
  const { data: bestSellingData } = useQuery({
    queryKey: ['best-selling-products'],
    queryFn: () => getBestSellingProducts(4),
  });

  // Fetch top rated products (using rarity_score)
  const { data: topRatedData } = useQuery({
    queryKey: ['top-rated-products'],
    queryFn: () => listProducts({ pageSize: 4, sort: 'rarity' }),
  });

  const latestProducts = latestData?.items || [];
  const bestSellingProducts = Array.isArray(bestSellingData) ? bestSellingData : [];
  const topRatedProducts = topRatedData?.items || [];

  const renderArticle = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoCard}
      onPress={() => router.push(`/learn/${item.slug}` as any)}
    >
      <View style={styles.videoThumbnail}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.thumbnailImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="play-circle" size={64} color={colors.gold} />
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{item.display_date || new Date(item.published_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoExcerpt} numberOfLines={2}>{item.excerpt}</Text>
        <View style={styles.watchButton}>
          <Ionicons name="play" size={16} color={colors.gold} />
          <Text style={styles.watchText}>Watch Video</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => {
    const imageUri = item.photos && item.photos.length > 0 ? item.photos[0] : null;
    const price = item.price_cents ? (item.price_cents / 100).toFixed(2) : '0.00';
    
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}` as any)}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={32} color={colors.platinum} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.productRating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons key={i} name="star" size={12} color={colors.gold} />
            ))}
          </View>
          <Text style={styles.productPrice}>${price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Videos" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>CATEGORY ARCHIVES: VIDEOS</Text>
          <Text style={styles.pageDescription}>
            Watch our collection of educational videos covering rare coins, precious metals, 
            collecting tips, market analysis, and expert insights from the Finest Known team.
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Videos Section */}
          <View style={styles.videosSection}>
            {articlesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.loadingText}>Loading videos...</Text>
              </View>
            ) : articles && articles.length > 0 ? (
              <FlatList
                data={articles}
                renderItem={renderArticle}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="videocam-outline" size={64} color={colors.platinum} />
                <Text style={styles.emptyText}>No videos available yet</Text>
                <Text style={styles.emptySubtext}>Check back soon for educational content!</Text>
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>VIDEO CATEGORIES</Text>
              <View style={styles.categoryList}>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Coin Grading Basics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Market Updates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Authentication Tips</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Investment Strategies</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryItem}>
                  <Text style={styles.categoryText}>Collector Interviews</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>SUBSCRIBE</Text>
              <Text style={styles.sidebarText}>
                Subscribe to our channel to get notified when we post new educational videos 
                about coins, precious metals, and collecting.
              </Text>
              <TouchableOpacity style={styles.subscribeButton}>
                <Ionicons name="notifications" size={20} color={colors.background} />
                <Text style={styles.subscribeButtonText}>Get Notifications</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Featured Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>FEATURED PRODUCTS</Text>
          
          {/* Latest Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>LATEST</Text>
            <FlatList
              data={latestProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          {/* Best Selling Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>BEST SELLING</Text>
            <FlatList
              data={bestSellingProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => `best-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>

          {/* Top Rated Row */}
          <View style={styles.productRow}>
            <Text style={styles.rowTitle}>TOP RATED</Text>
            <FlatList
              data={topRatedProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => `top-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRowContent}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  pageHeader: {
    backgroundColor: colors.ivory,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  pageDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mainContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  videosSection: {
    flex: 2,
    marginRight: spacing.lg,
  },
  videoCard: {
    backgroundColor: colors.ivory,
    borderRadius: 12,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: colors.navy,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.navy,
  },
  videoInfo: {
    padding: spacing.md,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ivory,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  videoExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  watchText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gold,
  },
  sidebar: {
    flex: 1,
  },
  sidebarSection: {
    backgroundColor: colors.ivory,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  sidebarText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  productsSection: {
    backgroundColor: colors.ivory,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  productRow: {
    marginBottom: spacing.xl,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.platinum,
    paddingBottom: spacing.sm,
  },
  productRowContent: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    width: 280,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.platinum,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  placeholderImage: {
    backgroundColor: colors.platinum + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

